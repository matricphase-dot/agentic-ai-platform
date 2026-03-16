import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { calculateRewardRate } from '../services/stakingService';

const router = express.Router();

// Get user's stakes
router.get('/', authenticate, async (req, res) => {
  try {
    const stakes = await (prisma as any).stakes.findMany({
      where: { userId: req.user!.id },
      include: { agent: true, rewards: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(stakes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stakes' });
  }
});

// Stake on an agent
router.post('/stake', authenticate, async (req, res) => {
  try {
    const { agentId, amount } = req.body;
    if (!agentId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid agent or amount' });
    }

    // Check agent exists
    const agent = await (prisma as any).agents.findUnique({ where: { id: agentId } });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    // Create stake
    const stake = await (prisma as any).stakes.create({
      data: {
        userId: req.user!.id,
        agentId,
        amount,
        status: 'active'
      },
      include: { agent: true }
    });
    res.status(201).json(stake);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to stake' });
  }
});

// Unstake (withdraw)
router.post('/unstake/:stakeId', authenticate, async (req, res) => {
  try {
    const { stakeId } = req.params;
    const stake = await (prisma as any).stakes.findFirst({
      where: { id: stakeId, userId: req.user!.id, status: 'active' }
    });
    if (!stake) return res.status(404).json({ error: 'Active stake not found' });

    // Update stake status
    const updated = await (prisma as any).stakes.update({
      where: { id: stakeId },
      data: { status: 'unstaked' }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to unstake' });
  }
});

// Claim rewards (daily)
router.post('/claim', authenticate, async (req, res) => {
  try {
    const { stakeId } = req.body;
    if (!stakeId) return res.status(400).json({ error: 'stakeId required' });

    const stake = await (prisma as any).stakes.findFirst({
      where: { id: stakeId, userId: req.user!.id, status: 'active' },
      include: { agent: true, rewards: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });
    if (!stake) return res.status(404).json({ error: 'Active stake not found' });

    // Check last claim time (simple – you can improve)
    const lastReward = stake.rewards[0];
    const now = new Date();
    if (lastReward) {
      const daysDiff = (now.getTime() - new Date(lastReward.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff < 1) {
        return res.status(400).json({ error: 'Can only claim once per day' });
      }
    }

    // Calculate reward using dynamic rate
    const rate = calculateRewardRate(stake.agent);
    const rewardAmount = stake.amount * rate;

    // Create reward
    const reward = await (prisma as any).reward.create({
      data: {
        stakeId: stake.id,
        amount: rewardAmount,
        createdAt: now
      }
    });

    res.json(reward);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to claim rewards' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await (prisma as any).stakes.groupBy({
      by: ['agentId'],
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 10
    });

    // Enrich with agent details
    const enriched = await Promise.all(leaderboard.map(async (entry: any) => {
      const agent = await (prisma as any).agents.findUnique({
        where: { id: entry.agentId },
        select: { id: true, name: true, description: true }
      });
      return { ...entry, agent };
    }));
    res.json(enriched);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
