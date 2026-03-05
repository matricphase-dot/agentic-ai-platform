import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', async (req, res) => {
  const diagnostics = await (prisma as any).system_diagnostics.findMany({
    orderBy: { timestamp: 'desc' },
    take: 50
  });
  res.json(diagnostics);
});

export default router;












