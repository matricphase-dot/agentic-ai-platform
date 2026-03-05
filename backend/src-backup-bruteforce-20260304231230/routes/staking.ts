import express from 'express';
import { authenticate } from "../middleware/auth";
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Stake tokens on an agent
router.post('/stake', async (req, res) => {
  try {
    const { agentId, amount } = req.body;
    if (!agentId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Agent ID and positive amount required' });
    }

    const agent = await (prisma as any).agents.findUnique({ where: { id: agentId } });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    const existing = await (prisma as any).stakes.findFirst({
      where: { userId: req.user!.id, agentId, status: 'active' }
    });
    if (existing) {
      const updated = await (prisma as any).stakes.update({
        where: { id: existing.id },
        data: { amount: existing.amount + amount }
      });
      return res.json(updated);
    }

    const stake = await (prisma as any).stakes.create({
      data: {
        userId: req.user!.id,
        agentId,
        amount,
        status: 'active'
      }
    });
    res.json(stake);
  } catch (error) {
    console.error('Stake error:', error);
    res.status(500).json({ error: 'Failed to stake' });
  }
});

// Unstake (withdraw) from an agent
router.post('/unstake/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const stake = await (prisma as any).stakes.findFirst({
      where: { userId: req.user!.id, agentId, status: 'active' }
    });
    if (!stake) return res.status(404).json({ error: 'No active stake found' });

    const updated = await (prisma as any).stakes.update({
      where: { id: stake.id },
      data: { status: 'unstaked' }
    });
    res.json(updated);
  } catch (error) {
    console.error('Unstake error:', error);
    res.status(500).json({ error: 'Failed to unstake' });
  }
});

// Get user's stakes with pending rewards
router.get('/my-stakes', async (req, res) => {
  try {
    const stakes = await (prisma as any).stakes.findMany({
      where: { userId: req.user!.id },
      include: { agents: true, rewards: true }
    });
    // Calculate pending rewards for each active stake (simple 1% per day simulation)
    const now = new Date();
    const stakesWithRewards = stakes.map(stake => {
      if (stake.status !== 'active') return { ...stake, pendingRewards: 0 };
      // const lastClaim = stake.lastRewardClaim || stake.created_at;
      const daysDiff = (now.getTime() - new Date(lastClaim).getTime()) / (1000 * 60 * 60 * 24);
      const pending = Math.floor(stake.amount * 0.01 * daysDiff * 100) / 100; // 1% per day, rounded
      return { ...stake, pendingRewards: pending };
    });
    res.json(stakesWithRewards);
  } catch (error) {
    console.error('Fetch stakes error:', error);
    res.status(500).json({ error: 'Failed to fetch stakes' });
  }
});

// Claim rewards for a specific stake
router.post('/claim/:stakeId', async (req, res) => {
  try {
    const { stakeId } = req.params;
    const stake = await (prisma as any).stakes.findFirst({
      where: { id: stakeId, userId: req.user!.id }
    });
    if (!stake) return res.status(404).json({ error: 'Stake not found' });
    if (stake.status !== 'active') return res.status(400).json({ error: 'Stake is not active' });

    const now = new Date();
    // const lastClaim = stake.lastRewardClaim || stake.created_at;
    const daysDiff = (now.getTime() - new Date(lastClaim).getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff < 0.01) return res.status(400).json({ error: 'No rewards to claim yet' });

    const rewardAmount = Math.floor(stake.amount * 0.01 * daysDiff * 100) / 100; // 1% per day

    // Create reward record and update lastRewardClaim
    const [reward] = await prisma.$transaction([
// @ts-ignore
      (prisma as any).rewards.create({
        data: {
          stakeId: stake.id,
          amount: rewardAmount
        }
      }),
// @ts-ignore
      (prisma as any).stakes.update({
        where: { id: stake.id },
        data: { }
      })
    ]);

    res.json({ reward, claimedAmount: rewardAmount });
  } catch (error) {
    console.error('Claim error:', error);
    res.status(500).json({ error: 'Failed to claim rewards' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const stakes = await (prisma as any).stakes.groupBy({
      by: ['agentId'],
      _sum: { amount: true },
      where: { status: 'active' },
      orderBy: { _sum: { amount: 'desc' } },
      take: 10
    });
    const leaderboard = await Promise.all(
      stakes.map(async (s) => {
        const agent = await (prisma as any).agents.findUnique({ where: { id: s.agentId } });
        return { agent, totalStaked: s._sum.amount };
      })
    );
    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;







