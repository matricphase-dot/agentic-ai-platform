import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from "../middleware/auth";

const router = Router();

// GET /api/learning/current – get current active learning round
router.get('/current', authenticate, async (req: AuthRequest, res) => {
  try {
    const current = await (prisma as any).learning_rounds.findFirst({
      where: { status: 'active' },
      orderBy: { round_number: 'desc' },
    });
    res.json({ round: current });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/learning/rounds – start a new round (admin only – we'll skip check for now)
router.post('/rounds', authenticate, async (req: AuthRequest, res) => {
  try {
    const { globalModel } = req.body;
    const lastRound = await (prisma as any).learning_rounds.findFirst({
      orderBy: { round_number: 'desc' },
    });
    const round_number = (lastRound?.round_number || 0) + 1;
    const round = await (prisma as any).learning_rounds.create({ data: { 
        round_number,
        globalModel,
        status: 'active',
      },
    });
    res.status(201).json(round);
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/learning/rounds/:round_id/contribute – agent submits update
router.post('/rounds/:round_id/contribute', authenticate, async (req: AuthRequest, res) => {
  try {
    const { round_id } = req.params as { round_id: string };
    const { agentId, modelDelta } = req.body;

    // Verify agent belongs to user
    const agent = await (prisma as any).agents.findFirst({
      where: { id: agentId, owner_id: req.user!.id },
    });
    if (!agent) return res.status(404).json({ error: 'Agent not found or not owned by you' });

    // Check round exists and is active
    const round = await (prisma as any).learning_rounds.findUnique({
      where: { id: round_id },
    });
    if (!round || round.status !== 'active') {
      return res.status(400).json({ error: 'No active learning round' });
    }

    // Upsert contribution
    const contribution = await (prisma as any).contributions.upsert({
      where: { roundId_agentId: { round_id, agentId } },
      update: { modelDelta, submittedAt: new Date() },
      create: { round_id, agentId, modelDelta },
    });

    // Update contribution count on round
// @ts-ignore
    await (prisma as any).learning_rounds.update({
      where: { id: round_id },
      data: { contributionCount: { increment: 1 } },
    });

    // Optionally reward agent with reputation
// @ts-ignore
    await (prisma as any).agents.update({
      where: { id: agentId },
      data: { reputation_score: { increment: 5 } },
    });

    res.json(contribution);
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/learning/rounds/:round_id/complete – end round and aggregate
router.post('/rounds/:round_id/complete', authenticate, async (req: AuthRequest, res) => {
  try {
    const { round_id } = req.params as { round_id: string };
    const { aggregatedModel } = req.body;

    const round = await (prisma as any).learning_rounds.update({
      where: { id: round_id },
      data: {
        globalModel: aggregatedModel,
        status: 'completed',
        completed_at: new Date(),
      },
    });
    res.json(round);
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/learning/contributions/my – get user's agent contributions
router.get('/contributions/my', authenticate, async (req: AuthRequest, res) => {
  try {
    const contributions = await (prisma as any).contributions.findMany({
      where: { agent: { owner_id: req.user!.id } },
      include: { round: { select: { round_number: true, status: true } } },
      orderBy: { submittedAt: 'desc' },
    });
    res.json({ contributions });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;























