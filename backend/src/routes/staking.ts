import express from 'express';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes temporarily return static data
router.get('/stakes', authenticate, (req, res) => {
  res.json([{ id: '1', amount: 100, status: 'active', agent: { id: 'a1', name: 'Agent 1' } }]);
});

router.post('/stake', authenticate, (req, res) => {
  res.status(201).json({ id: 'new-stake', amount: req.body.amount, status: 'active' });
});

router.post('/unstake/:stakeId', authenticate, (req, res) => {
  res.json({ id: req.params.stakeId, status: 'unstaked' });
});

router.get('/leaderboard', (req, res) => {
  res.json([{ agent: { id: 'a1', name: 'Agent 1' }, _sum: { amount: 500 } }]);
});

router.post('/claim', authenticate, (req, res) => {
  res.status(501).json({ error: 'Reward claiming is currently disabled' });
});

export default router;
