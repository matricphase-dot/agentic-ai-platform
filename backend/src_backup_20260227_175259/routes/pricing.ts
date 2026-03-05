import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', async (req, res) => {
  const rules = await (prisma as any).pricing_rules.findMany();
  res.json(rules);
});

export default router;









