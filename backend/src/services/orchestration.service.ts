import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { callLLM } from './llm.service';
import { RAGService } from './rag.service';

interface PipelineStep {
  id: string;
  agentId: string;
  name: string;
  inputTemplate: string;
  outputKey: string;
  condition?: string;
}

interface PipelineConfig {
  steps: PipelineStep[];
  maxSteps?: number;
}

interface StepResult {
  stepId: string;
  agentName: string;
  input: string;
  output: string;
  latencyMs: number;
  status: 'success' | 'failed';
  error?: string;
}

export const OrchestrationService = {

  // Replace template variables with context values
  resolveTemplate(template: string, context: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return context[key] !== undefined ? String(context[key]) : match;
    });
  },

  // Run a multi-agent pipeline
  async runPipeline(
    pipelineId: string,
    userInput: string,
    userId: string
  ): Promise<{ output: string; steps: StepResult[] }> {
    const pipeline = await prisma.agentPipeline.findUnique({
      where: { id: pipelineId },
    });

    if (!pipeline) throw new Error('Pipeline not found');

    const config = pipeline.config as unknown as PipelineConfig;
    const steps = config.steps || [];
    const maxSteps = config.maxSteps || 10;

    const context: Record<string, any> = {
      userInput,
      input: userInput,
    };

    const stepResults: StepResult[] = [];
    let finalOutput = '';

    // Create run record
    const run = await prisma.pipelineRun.create({
      data: {
        pipelineId,
        input: { userInput },
        status: 'running',
      },
    });

    try {
      for (let i = 0; i < Math.min(steps.length, maxSteps); i++) {
        const step = steps[i];
        const startTime = Date.now();

        // Get agent
        const agent = await prisma.agent.findUnique({
          where: { id: step.agentId },
        });

        if (!agent) {
          stepResults.push({
            stepId: step.id,
            agentName: step.name,
            input: '',
            output: '',
            latencyMs: 0,
            status: 'failed',
            error: `Agent ${step.agentId} not found`,
          });
          continue;
        }

        // Resolve input template
        const resolvedInput = OrchestrationService.resolveTemplate(
          step.inputTemplate || '{{userInput}}',
          context
        );

        try {
          // Build system prompt with RAG
          let systemPrompt = agent.systemPrompt;
          if (agent.ragEnabled) {
            const ragContext = await RAGService.buildContext(
              agent.id,
              resolvedInput
            );
            if (ragContext) systemPrompt += ragContext;
          }

          // Call the agent
          const result = await callLLM(
            agent.modelProvider,
            systemPrompt,
            resolvedInput,
            agent.modelName,
          );

          const latencyMs = Date.now() - startTime;

          // Store output in context for next steps
          context[step.outputKey] = result.output;
          context[`step_${i}_output`] = result.output;
          finalOutput = result.output;

          stepResults.push({
            stepId: step.id,
            agentName: agent.name,
            input: resolvedInput,
            output: result.output,
            latencyMs,
            status: 'success',
          });

          logger.info('Pipeline step completed', {
            pipelineId,
            stepIndex: i,
            agentName: agent.name,
          });

        } catch (stepError: any) {
          stepResults.push({
            stepId: step.id,
            agentName: agent.name,
            input: resolvedInput,
            output: '',
            latencyMs: Date.now() - startTime,
            status: 'failed',
            error: stepError.message,
          });

          logger.error('Pipeline step failed', {
            pipelineId,
            stepIndex: i,
            error: stepError,
          });
        }
      }

      // Update run as completed
      await prisma.pipelineRun.update({
        where: { id: run.id },
        data: {
          output: { result: finalOutput },
          steps: stepResults as any,
          status: 'completed',
          latencyMs: stepResults.reduce((s, r) => s + r.latencyMs, 0),
        },
      });

      // Update pipeline stats
      await prisma.agentPipeline.update({
        where: { id: pipelineId },
        data: { totalRuns: { increment: 1 } },
      });

      return { output: finalOutput, steps: stepResults };

    } catch (error: any) {
      await prisma.pipelineRun.update({
        where: { id: run.id },
        data: { status: 'failed', steps: stepResults as any },
      });
      throw error;
    }
  },
};
