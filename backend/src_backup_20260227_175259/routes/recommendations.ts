import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from "../middleware/auth";
import { RecommendationEngine } from '../services/recommendationEngine';

const router = Router();

// GET /api/recommendations – get current user's recommendations
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    // Optionally refresh recommendations on demand (can be heavy, so maybe limit)
    // await RecommendationEngine.generateForUser(req.user!.id);

    const recs = await (prisma as any).recommendations.findMany({
      where: { userId: req.user!.id, isRead: false },
      orderBy: { priority: 'desc' },
      take: 10,
    });
    res.json({ recommendations: recs });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/recommendations/:id/read – mark as read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as { id: string };
// @ts-ignore
    await (prisma as any).recommendations.updateMany({
      where: { id, userId: req.user!.id },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/recommendations/refresh – manually trigger generation (can be rate-limited)
router.post('/refresh', authenticate, async (req: AuthRequest, res) => {
  try {
    await RecommendationEngine.generateForUser(req.user!.id);
    res.json({ success: true });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: generate for all users (optional)
router.post('/generate-all', authenticate, async (req: AuthRequest, res) => {
  if (req.user!.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  try {
    await RecommendationEngine.generateForAllUsers();
    res.json({ success: true });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;













