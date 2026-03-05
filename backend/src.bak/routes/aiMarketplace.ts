import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from "../middleware/auth";

const router = Router();

// ---------- Listings ----------
// GET /api/ai-marketplace/listings – list active listings
router.get('/listings', authenticate, async (req: AuthRequest, res) => {
  try {
    const { type, status = 'ACTIVE' } = req.query;
    const where: any = { status };
    if (type) where.serviceType = type;

    const listings = await (prisma as any).service_listings.findMany({
      where,
      include: { agent: { select: { id: true, name: true, reputation_score: true, owner: { select: { name: true } } } },
      },
      orderBy: { created_at: 'desc' },
    });
    res.json({ listings });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/ai-marketplace/listings – create a new listing
router.post('/listings', authenticate, async (req: AuthRequest, res) => {
  try {
    const { agentId, title, description, serviceType, pricingType, price, currency } = req.body;

    // Verify agent belongs to user
    const agent = await (prisma as any).agents.findFirst({
      where: { id: agentId, owner_id: req.user!.id },
    });
    if (!agent) return res.status(404).json({ error: 'Agent not found or not owned by you' });

    const listing = await (prisma as any).service_listings.create({ data: { 
        agentId,
        title,
        description,
        serviceType,
        pricingType,
        price,
        currency: currency || 'USD',
      },
    });
    res.status(201).json(listing);
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/ai-marketplace/listings/:id – update listing (owner only)
router.patch('/listings/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as { id: string };
    const { title, description, price, status } = req.body;

    // Verify ownership
    const listing = await (prisma as any).service_listings.findUnique({
      where: { id },
      include: { agents: true },
    });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.agent.owner_id !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await (prisma as any).service_listings.update({
      where: { id },
      data: { title, description, price, status },
    });
    res.json(updated);
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------- Hiring ----------
// POST /api/ai-marketplace/listings/:id/hire – hire an agent from a listing
router.post('/listings/:id/hire', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as { id: string };
    const { terms, totalValue, revenueShare } = req.body;

    // Get listing
    const listing = await (prisma as any).service_listings.findUnique({
      where: { id, status: 'ACTIVE' },
      include: { agents: true },
    });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    // Hiring agent (the user's agent) must be specified – for now, assume user wants to use one of their agents as the hiring agent.
    // We'll need a hiringAgentId in request. For simplicity, we'll require it.
    const { hiringAgentId } = req.body;
    const hiringAgent = await (prisma as any).agents.findFirst({
      where: { id: hiringAgentId, owner_id: req.user!.id },
    });
    if (!hiringAgent) return res.status(404).json({ error: 'Hiring agent not found or not owned by you' });

    // Prevent hiring own agent
    if (hiringAgent.id === listing.agentId) {
      return res.status(400).json({ error: 'Cannot hire your own agent' });
    }

    // Create agreement
    const agreement = await (prisma as any).agent_hire_agreements.create({ data: { 
        listing_id: id,
        hiringAgentId: hiringAgent.id,
        hiredAgentId: listing.agentId,
        terms,
        totalValue,
        revenueShare,
        status: 'PENDING',
      },
    });
    res.status(201).json(agreement);
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/ai-marketplace/agreements – list user's agreements (as hiring or hired)
router.get('/agreements', authenticate, async (req: AuthRequest, res) => {
  try {
    // Get all agents owned by user
    const userAgents = await (prisma as any).agents.findMany({
      where: { owner_id: req.user!.id },
      select: { id: true },
    });
    const agentIds = userAgents.map((a: any) => a.id);

    const agreements = await (prisma as any).agent_hire_agreements.findMany({
      where: {
        OR: [
          { hiringAgentId: { in: agentIds } },
          { hiredAgentId: { in: agentIds } },
        ],
      },
      include: { listing: true,
        hiringAgent: { select: { id: true, name: true } },
        hiredAgent: { select: { id: true, name: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    res.json({ agreements });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/ai-marketplace/agreements/:id/accept – accept a pending agreement (hired agent's owner)
router.patch('/agreements/:id/accept', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as { id: string };
    const agreement = await (prisma as any).agent_hire_agreements.findUnique({
      where: { id },
      include: { hired_agent: true },
    });
    if (!agreement) return res.status(404).json({ error: 'Agreement not found' });
    if (agreement.hiredAgent.owner_id !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (agreement.status !== 'PENDING') return res.status(400).json({ error: 'Agreement not pending' });

    const updated = await (prisma as any).agent_hire_agreements.update({
      where: { id },
      data: { status: 'ACTIVE', started_at: new Date() },
    });
    res.json(updated);
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/ai-marketplace/agreements/:id/execute – record work done
router.post('/agreements/:id/execute', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as { id: string };
    const { description, hoursWorked, amount } = req.body;

    const agreement = await (prisma as any).agent_hire_agreements.findUnique({
      where: { id },
      include: { hired_agent: true, hiringAgent: true },
    });
    if (!agreement) return res.status(404).json({ error: 'Agreement not found' });
    // Either hiring or hired agent's owner can record execution? For simplicity, allow both.
    if (agreement.hiringAgent.owner_id !== req.user!.id && agreement.hiredAgent.owner_id !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (agreement.status !== 'ACTIVE') return res.status(400).json({ error: 'Agreement not active' });

    const execution = await (prisma as any).service_execution_logs.create({ data: { 
        agreementId: id,
        description,
        hoursWorked,
        amount,
        status: 'COMPLETED',
        completed_at: new Date(),
      },
    });

    // Optionally, update agreement's total value or track payments.
    // For now, just log it.

    res.status(201).json(execution);
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;























