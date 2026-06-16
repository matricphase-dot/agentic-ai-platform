import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.middleware';
import { OrchestrationService } from '../services/orchestration.service';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

const router = Router();

const pipelineSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  config: z.object({
    steps: z.array(z.object({
      id: z.string(),
      agentId: z.string(),
      name: z.string(),
      inputTemplate: z.string(),
      outputKey: z.string(),
    })),
    maxSteps: z.number().max(10).optional(),
  }),
});

// GET /api/pipelines
router.get('/pipelines', authMiddleware, async (req: Request, res: Response) => {
  try {
    const pipelines = await prisma.agentPipeline.findMany({
      where: { userId: (req as any).user!.id },
      include: {
        runs: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
        _count: { select: { runs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: pipelines });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed' });
  }
});

// POST /api/pipelines
router.post('/pipelines', authMiddleware, async (req: Request, res: Response) => {
  try {
    const body = pipelineSchema.parse(req.body);
    
    const pipeline = await prisma.agentPipeline.create({
      data: {
        userId: (req as any).user!.id,
        name: body.name,
        description: body.description,
        config: body.config as any,
      },
    });
    
    return res.status(201).json({ success: true, data: pipeline });
  } catch (error: any) {
    logger.error('Create pipeline failed', { error });
    return res.status(500).json({ success: false, message: 'Failed' });
  }
});

// POST /api/pipelines/:id/run
router.post('/pipelines/:id/run', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { input } = req.body;
    if (!input) {
      return res.status(400).json({ success: false, message: 'Input required' });
    }
    
    const pipeline = await prisma.agentPipeline.findFirst({
      where: { id: req.params.id, userId: (req as any).user!.id },
    });
    
    if (!pipeline) {
      return res.status(404).json({ success: false, message: 'Pipeline not found' });
    }
    
    const result = await OrchestrationService.runPipeline(
      pipeline.id,
      input,
      (req as any).user!.id
    );
    
    return res.json({ success: true, data: result });
  } catch (error: any) {
    logger.error('Run pipeline failed', { error });
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/pipelines/:id
router.delete('/pipelines/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const pipeline = await prisma.agentPipeline.findFirst({
      where: { id: req.params.id, userId: (req as any).user!.id },
    });
    
    if (!pipeline) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    
    await prisma.agentPipeline.delete({ where: { id: pipeline.id } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed' });
  }
});

export { router as pipelinesRouter };
