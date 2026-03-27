import express from 'express';
import { authenticate } from '../middleware/auth';
import { triggerWebhooks } from '../services/webhookService';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Get all public agents (visible to everyone) – MUST be before /:id
router.get('/public', async (req, res) => {
  try {
    const publicAgents = await prisma.agents.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        name: true,
        description: true,
        agentType: true,
        capabilities: true,
        system_prompt: true,
        model_provider: true,
        model_name: true,
        reputationScore: true,
        totalEarnings: true,
        ownerId: true,
      }
    });
    res.json(publicAgents);
  } catch (error) {
    console.error('Error fetching public agents:', error);
    res.status(500).json({ error: 'Failed to fetch public agents' });
  }
});

// Get all agents for authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const agents = await prisma.agents.findMany({
      where: { ownerId: userId }
    });
    res.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Get single agent
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const agent = await prisma.agents.findFirst({
      where: { id: id as string, ownerId: userId }
    });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(agent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

// Create new agent
router.post('/', authenticate, async (req, res) => {
  console.log('Agent creation request:', req.body);
  try {
    const { name, description, capabilities, systemPrompt, modelProvider, modelName, status } = req.body;
    const userId = (req as any).user.id;

    // Convert capabilities array to string if needed
    const capabilitiesStr = Array.isArray(capabilities) ? capabilities.join(', ') : capabilities;

    const agent = await prisma.agents.create({
      data: {
        name,
        description,
        capabilities: capabilitiesStr,
        system_prompt: systemPrompt,
        model_provider: modelProvider || 'ollama-local',
        model_name: modelName || 'llama2',
        status: status || 'inactive',
        agentType: 'CUSTOM',
        specialties: [],
        configuration: {},
        owner: { connect: { id: userId } }
      }
    });
    // Trigger webhook
    await triggerWebhooks('agent.created', agent);

    res.status(201).json(agent);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// Update agent
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const existing = await prisma.agents.findFirst({
      where: { id: id as string, ownerId: userId }
    });
    if (!existing) {
      return res.status(404).json({ error: 'Agent not found or not owned by you' });
    }

    const updated = await prisma.agents.update({
      where: { id: id as string },
      data: req.body
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

// Delete agent
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const existing = await prisma.agents.findFirst({
      where: { id: id as string, ownerId: userId }
    });
    if (!existing) {
      return res.status(404).json({ error: 'Agent not found or not owned by you' });
    }

    await prisma.agents.delete({
      where: { id: id as string }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

export default router;




