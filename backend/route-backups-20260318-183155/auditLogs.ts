import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get audit logs for the current user
router.get('/', authenticate, async (req, res) => {
  try {
    const logs = await (prisma as any).audit_logs.findMany({
      where: { userId: (req as any).user!.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;

