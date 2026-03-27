import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all audit logs
router.get('/', async (req, res) => {
  try {
    const logs = await prisma.audit_logs.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Create a new audit log
router.post('/', async (req, res) => {
  const { action, entity, entityId, oldData, newData, ipAddress, userAgent } = req.body;
  const userId = (req as any).user?.id;

  try {
    const log = await prisma.audit_logs.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        oldData,
        newData,
        ipAddress,
        userAgent,
      },
    });
    res.json(log);
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({ error: 'Failed to create log' });
  }
});

export default router;
