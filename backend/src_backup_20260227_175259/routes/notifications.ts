import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/notifications – get user's notifications
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const notifications = await prisma.notifications.findMany({
      where: { user_id: req.user!.id },
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
router.patch('/:id/read', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as { id: string }; // ? Assert string

    // First verify the notification belongs to the user
    const notification = await prisma.notifications.findFirst({
      where: { id, user_id: req.user!.id },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Update using unique id (we already verified ownership)
    await prisma.notifications.update({
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
router.patch('/read-all', authenticateToken, async (req: AuthRequest, res) => {
  try {
    await prisma.notifications.updateMany({
      where: { user_id: req.user!.id, read: false },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;









