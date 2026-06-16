import * as cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { callLLM } from './llm.service';
import { RAGService } from './rag.service';

const activeJobs = new Map<string, cron.ScheduledTask>();

export const SchedulerService = {

  // Validate cron expression
  isValidCron(expression: string): boolean {
    return cron.validate(expression);
  },

  // Human readable cron presets
  PRESETS: {
    'Every hour': '0 * * * *',
    'Every 6 hours': '0 */6 * * *',
    'Every day at 9am': '0 9 * * *',
    'Every day at midnight': '0 0 * * *',
    'Every Monday': '0 9 * * 1',
    'Every weekday': '0 9 * * 1-5',
    'Every week': '0 9 * * 0',
    'Every month': '0 9 1 * *',
  },

  // Run a single scheduled invocation
  async runSchedule(scheduleId: string): Promise<void> {
    const schedule = await prisma.agentSchedule.findUnique({
      where: { id: scheduleId },
      include: { agent: true },
    });

    if (!schedule || !schedule.isActive) return;

    const startTime = Date.now();
    let status = 'success';
    let output = '';
    let error = '';

    try {
      logger.info('Running scheduled agent', {
        scheduleId,
        agentId: schedule.agentId,
      });

      // Get input
      const input = schedule.inputPayload as any;
      const userInput = input.message || input.prompt || 
        'Run your scheduled task now.';

      // Build system prompt with RAG if enabled
      let systemPrompt = schedule.agent.systemPrompt;
      if (schedule.agent.ragEnabled) {
        const context = await RAGService.buildContext(
          schedule.agentId,
          userInput
        );
        if (context) systemPrompt += context;
      }

      // Call LLM
      const result = await callLLM(
        schedule.agent.modelProvider,
        systemPrompt,
        userInput,
        schedule.agent.modelName,
      );

      output = result.output;

      // Log invocation
      await prisma.invocation.create({
        data: {
          agentId: schedule.agentId,
          userId: schedule.userId,
          input: { message: userInput, source: 'scheduled' },
          output: { text: result.output },
          status: 'SUCCESS',
          latencyMs: result.latencyMs,
          tokensUsed: result.tokensUsed,
        },
      });

    } catch (err: any) {
      status = 'failed';
      error = err.message;
      logger.error('Scheduled run failed', { scheduleId, error: err });
    }

    const latencyMs = Date.now() - startTime;

    // Save run record
    await prisma.scheduleRun.create({
      data: {
        scheduleId,
        status,
        output: output.slice(0, 5000),
        error,
        latencyMs,
      },
    });

    // Update schedule stats
    await prisma.agentSchedule.update({
      where: { id: scheduleId },
      data: {
        lastRunAt: new Date(),
        totalRuns: { increment: 1 },
        failCount: status === 'failed'
          ? { increment: 1 }
          : undefined,
      },
    });
  },

  // Start a schedule
  async startSchedule(scheduleId: string): Promise<void> {
    const schedule = await prisma.agentSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule || !schedule.isActive) return;

    if (activeJobs.has(scheduleId)) {
      activeJobs.get(scheduleId)?.stop();
    }

    const job = cron.schedule(schedule.cronExpression, async () => {
      await SchedulerService.runSchedule(scheduleId);
    });

    activeJobs.set(scheduleId, job);
    logger.info('Schedule started', {
      scheduleId,
      cron: schedule.cronExpression,
    });
  },

  // Stop a schedule
  stopSchedule(scheduleId: string): void {
    const job = activeJobs.get(scheduleId);
    if (job) {
      job.stop();
      activeJobs.delete(scheduleId);
      logger.info('Schedule stopped', { scheduleId });
    }
  },

  // Load all active schedules on startup
  async loadAllSchedules(): Promise<void> {
    const schedules = await prisma.agentSchedule.findMany({
      where: { isActive: true },
    });

    logger.info(`Loading ${schedules.length} scheduled agents`);

    for (const schedule of schedules) {
      await SchedulerService.startSchedule(schedule.id);
    }
  },
};
