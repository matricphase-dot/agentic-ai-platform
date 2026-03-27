import express from 'express';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/stats', authenticate, async (req, res) => {
  // Return dummy stats for now
  res.json({
    agentsCount: 0,
    totalStaked: 0,
    votes: 0,
    reviews: 0,
    dataRequests: 0,
  });
});

export default router;
