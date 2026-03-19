import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// OAuth endpoints – placeholder to fix build
router.get('/authorize', authenticate, (req, res) => {
  res.json({ message: 'OAuth authorize endpoint' });
});

router.post('/token', authenticate, (req, res) => {
  res.json({ message: 'OAuth token endpoint' });
});

export default router;
