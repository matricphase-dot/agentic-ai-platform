/// <reference path="../types/express.d.ts" />
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, capabilities, systemPrompt, ollama_endpoint } = req.body;
    if (!(req as any).user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const agent = await (prisma as any).agents.create({
      data: {
        owner_id: (req as any).user.id,
        name,
        description,
        capabilities: capabilities ? String(capabilities) : null,
        systemPrompt,
        ollama_endpoint,
      }
    });
    res.json(agent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    if (!(req as any).user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const agents = await (prisma as any).agents.findMany({
      where: { owner_id: (req as any).user.id }
    });
    res.json(agents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

export default router;










