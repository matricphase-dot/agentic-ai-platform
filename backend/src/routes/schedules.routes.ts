import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.middleware';
import { SchedulerService } from '../services/scheduler.service';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

const router = Router();

const scheduleSchema = z.object({
  name: z.string().min(1).max(100),
  cronExpression: z.string(),
  inputPayload: z.record(z.any()).optional().default({}),
  isActive: z.boolean().optional().default(true),
});

// GET /api/agents/:agentId/schedules
router.get(
  '/agents/:agentId/schedules',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const schedules = await prisma.agentSchedule.findMany({
        where: {
          agentId: req.params.agentId,
          userId: (req as any).user!.id,
        },
        include: {
          runs: {
            orderBy: { ranAt: 'desc' },
            take: 5,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ success: true, data: schedules });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed' });
    }
  }
);

// POST /api/agents/:agentId/schedules
router.post(
  '/agents/:agentId/schedules',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const body = scheduleSchema.parse(req.body);

      if (!SchedulerService.isValidCron(body.cronExpression)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid cron expression',
        });
      }

      const agent = await prisma.agent.findFirst({
        where: { id: req.params.agentId, userId: (req as any).user!.id },
      });

      if (!agent) {
        return res.status(404).json({ success: false, message: 'Agent not found' });
      }

      const schedule = await prisma.agentSchedule.create({
        data: {
          agentId: req.params.agentId,
          userId: (req as any).user!.id,
          name: body.name,
          cronExpression: body.cronExpression,
          inputPayload: body.inputPayload,
          isActive: body.isActive,
        },
      });

      if (schedule.isActive) {
        await SchedulerService.startSchedule(schedule.id);
      }

      return res.status(201).json({ success: true, data: schedule });
    } catch (error: any) {
      logger.error('Create schedule failed', { error });
      return res.status(500).json({ success: false, message: 'Failed' });
    }
  }
);

// PUT /api/schedules/:id/toggle
router.put(
  '/schedules/:id/toggle',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const schedule = await prisma.agentSchedule.findFirst({
        where: { id: req.params.id, userId: (req as any).user!.id },
      });

      if (!schedule) {
        return res.status(404).json({ success: false, message: 'Not found' });
      }

      const updated = await prisma.agentSchedule.update({
        where: { id: schedule.id },
        data: { isActive: !schedule.isActive },
      });

      if (updated.isActive) {
        await SchedulerService.startSchedule(schedule.id);
      } else {
        SchedulerService.stopSchedule(schedule.id);
      }

      return res.json({ success: true, data: updated });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed' });
    }
  }
);

// POST /api/schedules/:id/run-now
router.post(
  '/schedules/:id/run-now',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const schedule = await prisma.agentSchedule.findFirst({
        where: { id: req.params.id, userId: (req as any).user!.id },
      });

      if (!schedule) {
        return res.status(404).json({ success: false, message: 'Not found' });
      }

      await SchedulerService.runSchedule(schedule.id);

      return res.json({ success: true, message: 'Schedule run triggered' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed' });
    }
  }
);

// DELETE /api/schedules/:id
router.delete(
  '/schedules/:id',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const schedule = await prisma.agentSchedule.findFirst({
        where: { id: req.params.id, userId: (req as any).user!.id },
      });

      if (!schedule) {
        return res.status(404).json({ success: false, message: 'Not found' });
      }

      SchedulerService.stopSchedule(schedule.id);
      await prisma.agentSchedule.delete({ where: { id: schedule.id } });

      return res.json({ success: true, message: 'Schedule deleted' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed' });
    }
  }
);

export { router as schedulesRouter };
