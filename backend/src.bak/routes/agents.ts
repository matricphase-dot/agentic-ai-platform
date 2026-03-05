import express from 'express';
import { authenticate } from "../middleware/auth";
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get agents for the authenticated user
router.get('/my-agents', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const agents = await (prisma as any).agents.findMany({
      where: { owner_id: req.user.id },
    });
    res.json(agents);
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all agents (public)
router.get('/', async (req, res) => {
  try {
    const agents = await (prisma as any).agents.findMany();
    res.json(agents);
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single agent by ID
router.get('/:id', async (req, res) => {
  try {
    const agent = await (prisma as any).agents.findUnique({ where: { id: req.params.id } });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json(agent);
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new agent (authenticated)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const { name, description, agent_type, configuration, hourly_rate, capabilities } = req.body;
    const agent = await (prisma as any).agents.create({ data: { 
        name,
        description,
        agent_type,
        configuration: configuration || {},
        owner_id: req.user.id,
        status: 'IDLE',
        hourly_rate: hourly_rate || 0,
        reputation_score: 1000,
        success_rate: 0.8,
        capabilities: capabilities || [],
        specialties: [],  // kept for backward compatibility
      },
    });
    res.json(agent);
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Update an agent
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const agent = await (prisma as any).agents.findFirst({
      where: { id: req.params.id, owner_id: req.user.id },
    });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    const updated = await (prisma as any).agents.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    res.status(400).json({ error: error.message });
  }
});

// Delete an agent
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const agent = await (prisma as any).agents.findFirst({
      where: { id: req.params.id, owner_id: req.user.id },
    });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

// @ts-ignore
    await (prisma as any).agents.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    res.status(400).json({ error: error.message });
  }
});


// Test agent with a prompt
router.post('/:id/test', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const agent = await (prisma as any).agents.findFirst({
      where: { id: req.params.id, owner_id: req.user.id },
    });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt required' });

    const config = agent.configuration as any;
    if (config?.provider !== 'ollama') {
      return res.status(400).json({ error: 'Only Ollama agents can be tested via this endpoint' });
    }

    // Call Ollama
    const ollamaUrl = config.url || 'http://localhost:11434/api/generate';
    const response = await fetch(ollamaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        prompt: prompt,
        system: config.systemPrompt,
        temperature: config.temperature,
        stream: false,
      }),
    });
    const data = await response.json();
    res.json({ response: data.response });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
export default router;














