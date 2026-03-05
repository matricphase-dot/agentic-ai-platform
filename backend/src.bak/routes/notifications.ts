import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from "../middleware/auth";

const router = Router();

// GET /api/notifications – get user's notifications
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const notifications = await (prisma as any).notifications.findMany({
      where: { userId: req.user!.id },
      orderBy: { created_at: 'desc' },
      take: 50,
    });
    res.json({ notifications });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/notifications/:id/read – mark as read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as { id: string }; // ? Assert string

    // First verify the notification belongs to the user
    const notification = await (prisma as any).notifications.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Update using unique id (we already verified ownership)
// @ts-ignore
    await (prisma as any).notifications.update({
      where: { id }, // id is now string, not undefined
      data: { read: true },
    });

    res.json({ success: true });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/notifications/read-all – mark all as read
router.patch('/read-all', authenticate, async (req: AuthRequest, res) => {
  try {
// @ts-ignore
    await (prisma as any).notifications.updateMany({
      where: { userId: req.user!.id, read: false },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


















