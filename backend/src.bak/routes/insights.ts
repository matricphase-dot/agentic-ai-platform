import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/competitor', async (req, res) => {
  const insights = await (prisma as any).competitor_insights.findMany({
    orderBy: { created_at: 'desc' }
  });
  res.json(insights);
});

export default router;















