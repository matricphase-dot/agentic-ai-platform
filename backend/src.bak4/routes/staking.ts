import express from 'express';
import { stakeTokens, unstakeTokens, getUserStakes } from '../services/stakingService';
import { authenticate } from "../middleware/auth";

const router = express.Router();

// Stake tokens
router.post('/stake', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { amount, agentId, lockDays } = req.body;
    const stake = await stakeTokens(req.user.id, amount, agentId, lockDays);
    res.json(stake);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Unstake tokens
router.post('/unstake/:stakeId', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.params.stakeId) {
      return res.status(400).json({ error: 'Stake ID is required' });
    }
    const result = await unstakeTokens(req.params.stakeId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get user stakes
router.get('/my-stakes', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const stakes = await getUserStakes(req.user.id);
    res.json(stakes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;















