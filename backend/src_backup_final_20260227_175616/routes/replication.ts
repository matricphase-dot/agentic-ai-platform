import prisma from '../lib/prisma';
import { Router } from 'express';
import { authenticate } from "../middleware/auth";

const router = Router();

// GET /api/replication/blueprints – list available blueprints (for cloning)
router.get('/blueprints', authenticate, async (req: AuthRequest, res) => {
  try {
    const blueprints = await (prisma as any).agent_blueprints.findMany({
      where: { status: "active" },
      include: { owner: { select: { id: true, name: true } } },
      orderBy: { created_at: 'desc' },
    });
    res.json({ blueprints });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/replication/my-blueprints – list user's own blueprints
router.get('/my-blueprints', authenticate, async (req: AuthRequest, res) => {
  try {
    const blueprints = await (prisma as any).agent_blueprints.findMany({
      where: { owner_id: req.user!.id },
      include: { clones: { include: { buyer: { select: { name: true } } } } },
    });
    res.json({ blueprints });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/replication/blueprints – create a blueprint from an existing agent
router.post('/blueprints', authenticate, async (req: AuthRequest, res) => {
  try {
    const { agentId, name, description, price, royalty_rate } = req.body;

    // Fetch agent and verify ownership
    const agent = await (prisma as any).agents.findUnique({
      where: { id: agentId, owner_id: req.user!.id },
    });
    if (!agent) return res.status(404).json({ error: 'Agent not found or not owned by you' });

    // Cast JSON fields to any to bypass type issues (prismaClient expects InputJsonValue)
    const configuration = agent.configuration as any;
    const specialties = agent.specialties as any;

    // Create blueprint
    const blueprint = await (prisma as any).agent_blueprints.create({ data: { 
        name: name || agent.name,
        description: description || agent.description,
        agent_type: agent.agent_type,
        configuration,
        specialties,
        price,
        royalty_rate,
        owner_id: req.user!.id,
      },
    });
    res.status(201).json(blueprint);
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/replication/blueprints/:id/clone – clone a blueprint (buyer)
router.post('/blueprints/:id/clone', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as { id: string };
    const blueprint = await (prisma as any).agent_blueprints.findUnique({
      where: { id, status: "active" },
      include: { owner: true },
    });
    if (!blueprint) return res.status(404).json({ error: 'Blueprint not found' });

    // Check buyer balance
    const buyer = await (prisma as any).users.findUnique({ where: { id: req.user!.id } });
    if (!buyer || buyer.balance < blueprint.price) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Deduct price and transfer to owner (or hold in escrow)
// @ts-ignore
    await (prisma as any).users.update({
      where: { id: req.user!.id },
      data: { balance: { decrement: blueprint.price } },
    });
// @ts-ignore
    await (prisma as any).users.update({
      where: { id: blueprint.owner_id },
      data: { balance: { increment: blueprint.price } },
    });
    // Record transaction
// @ts-ignore
    await (prisma as any).token_transactions.create({ data: { 
        type: 'AGENT_PAYMENT',
        amount: blueprint.price,
        from_user_id: req.user!.id,
        to_user_id: blueprint.owner_id,
        description: `Cloned agent blueprint: ${blueprint.name}`,
        status: 'COMPLETED',
      },
    });

    // Cast JSON fields to any
    const configuration = blueprint.configuration as any;
    const specialties = blueprint.specialties as any;

    // Create a new agent based on blueprint
    const newAgent = await (prisma as any).agents.create({ data: { 
        name: blueprint.name,
        description: blueprint.description,
        agent_type: blueprint.agent_type,
        configuration,
        specialties,
        owner_id: req.user!.id,
        status: 'IDLE',
      },
    });

    // Record the clone
    const clone = await (prisma as any).agent_clones.create({ data: { 
        blueprint_id: id,
        agentId: newAgent.id,
        buyer_id: req.user!.id,
        purchase_price: blueprint.price,
      },
    });

    res.status(201).json({ agent: newAgent, clone });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/replication/royalties – (future) distribute royalties from cloned agent earnings
// For now, we'll handle manually or as part of revenue distribution logic.

export default router;
























