import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get user's data requests
router.get('/', authenticate, async (req, res) => {
  try {
    const requests = await (prisma as any).dataRequest.findMany({
      where: { userId: (req as any).user!.id },
      orderBy: { requestedAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Create a new data request
router.post('/', authenticate, async (req, res) => {
  try {
    const { type, notes } = req.body;
    if (!type) return res.status(400).json({ error: 'Type is required' });

    const request = await (prisma as any).dataRequest.create({
      data: {
        userId: (req as any).user!.id,
        type,
        notes,
        status: 'PENDING'
      }
    });
    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// For admins – update request status (we can add admin middleware later)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const request = await (prisma as any).dataRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ error: 'Request not found' });

    // Check if user is admin (simplified – you can enhance)
    if ((req as any).user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await (prisma as any).dataRequest.update({
      where: { id },
      data: {
        status,
        notes,
        completedAt: status === 'COMPLETED' ? new Date() : null
      }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

export default router;

