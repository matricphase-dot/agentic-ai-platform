import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get user's consents
router.get('/', authenticate, async (req, res) => {
  try {
    const consents = await (prisma as any).consent.findMany({
      where: { userId: req.user!.id }
    });
    res.json(consents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch consents' });
  }
});

// Set consent for a purpose
router.post('/', authenticate, async (req, res) => {
  try {
    const { purpose, granted } = req.body;
    if (!purpose) return res.status(400).json({ error: 'Purpose is required' });

    const existing = await (prisma as any).consent.findUnique({
      where: {
        userId_purpose: {
          userId: req.user!.id,
          purpose
        }
      }
    });

    if (existing) {
      // Update
      const updated = await (prisma as any).consent.update({
        where: { id: existing.id },
        data: {
          granted,
          grantedAt: granted ? new Date() : null,
          revokedAt: granted ? null : new Date()
        }
      });
      res.json(updated);
    } else {
      // Create
      const consent = await (prisma as any).consent.create({
        data: {
          userId: req.user!.id,
          purpose,
          granted,
          grantedAt: granted ? new Date() : null
        }
      });
      res.status(201).json(consent);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update consent' });
  }
});

export default router;
