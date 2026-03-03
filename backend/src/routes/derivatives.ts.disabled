import prisma from '../lib/prisma';
import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Helper: Calculate option premium (simple Black-Scholes would be overkill; use reputation-based)
function calculatePremium(agent: any, strike: number, expiryDays: number, type: string): number {
  // Simplified: premium = base * (reputation/1000) * sqrt(expiryDays) * (volatility factor)
  const base = type === 'CALL_OPTION' ? 10 : 8;
  const repFactor = agent.reputation_score / 1000;
  const timeFactor = Math.sqrt(expiryDays);
  return Math.round(base * repFactor * timeFactor * 100) / 100;
}

// GET /api/derivatives/contracts – list open contracts with filters
router.get('/contracts', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { type, agent_id, status = 'OPEN' } = req.query;
    const where: any = { status };
    if (type) where.contractType = type;
    if (agent_id) where.agent_id = agent_id;

    const contracts = await prisma.derivative_contracts.findMany({
      where,
      include: { agent: { select: { id: true, name: true, reputation_score: true, totalEarnings: true } },
        seller: { select: { id: true, name: true } },
        buyer: { select: { id: true, name: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    res.json({ contracts });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/derivatives/contracts – create a new contract
router.post('/contracts', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { contractType, agent_id, strike_price, quantity, expiry_date, settlement_metric } = req.body;

    const agent = await prisma.agents.findUnique({ where: { id: agent_id } });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    // Calculate premium for options
    let premium = null;
    if (contractType === 'CALL_OPTION' || contractType === 'PUT_OPTION' || contractType === 'INSURANCE') {
      const expiry = new Date(expiry_date);
      const days = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (days <= 0) return res.status(400).json({ error: 'Expiry must be in the future' });
      premium = calculatePremium(agent, strike_price, days, contractType);
    }

    const contract = await prisma.derivative_contracts.create({ data: { 
        contractType,
        agent_id,
        seller_id: req.user!.id,
        strike_price,
        quantity,
        expiry_date: new Date(expiry_date),
        settlement_metric: settlement_metric || 'reputation',
        premium,
        status: 'OPEN',
      },
    });

    // Also create a position for the seller (short)
    await prisma.positions.create({ data: { 
        user_id: req.user!.id,
        contract_id: contract.id,
        side: 'short',
        quantity,
      },
    });

    res.status(201).json(contract);
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/derivatives/contracts/:id/buy – buy a contract
router.post('/contracts/:id/buy', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as { id: string };
    const contract = await prisma.derivative_contracts.findUnique({
      where: { id },
      include: { seller: true },
    });
    if (!contract) return res.status(404).json({ error: 'Contract not found' });
    if (contract.status !== 'OPEN') return res.status(400).json({ error: 'Contract not available' });
    if (contract.seller_id === req.user!.id) return res.status(400).json({ error: 'Cannot buy your own contract' });

    // For options, buyer must pay premium (here we deduct from balance)
    if (contract.premium) {
      const buyer = await prisma.users.findUnique({ where: { id: req.user!.id } });
      if (!buyer || buyer.balance < contract.premium * contract.quantity) {
        return res.status(400).json({ error: 'Insufficient balance to pay premium' });
      }
      // Transfer premium from buyer to seller (or hold in escrow)
      await prisma.users.update({
        where: { id: req.user!.id },
        data: { balance: { decrement: contract.premium * contract.quantity } },
      });
      await prisma.users.update({
        where: { id: contract.seller_id },
        data: { balance: { increment: contract.premium * contract.quantity } },
      });
      // Record transaction
      await prisma.token_transactions.create({ data: { 
          type: 'STAKE_PURCHASE', // or a new type 'PREMIUM_PAYMENT'
          amount: contract.premium * contract.quantity,
          from_user_id: req.user!.id,
          to_user_id: contract.seller_id,
          description: `Premium for ${contract.contractType} on agent ${contract.agent_id}`,
          status: 'COMPLETED',
        },
      });
    }

    // Update contract
    const updated = await prisma.derivative_contracts.update({
      where: { id },
      data: {
        buyer_id: req.user!.id,
        status: 'FILLED',
      },
    });

    // Create position for buyer (long)
    await prisma.positions.create({ data: { 
        user_id: req.user!.id,
        contract_id: id,
        side: 'long',
        quantity: contract.quantity,
      },
    });

    res.json(updated);
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/derivatives/contracts/:id/settle – settle an expired contract
router.post('/contracts/:id/settle', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as { id: string };
    const contract = await prisma.derivative_contracts.findUnique({
      where: { id },
      include: { agent: true, buyer: true, seller: true },
    });
    if (!contract) return res.status(404).json({ error: 'Contract not found' });
    if (contract.status !== 'FILLED') return res.status(400).json({ error: 'Contract not filled' });
    if (new Date() < contract.expiry_date) return res.status(400).json({ error: 'Contract not yet expired' });

    // Determine agent metric at expiry
    let agent_metric: number;
    switch (contract.settlement_metric) {
      case 'reputation':
        agent_metric = contract.agent.reputation_score;
        break;
      case 'earnings':
        agent_metric = contract.agent.totalEarnings;
        break;
      case 'tasks':
        agent_metric = contract.agent.tasks_completed;
        break;
      default:
        agent_metric = contract.agent.reputation_score;
    }

    // Calculate payout based on contract type
    let payout = 0;
    if (contract.contractType === 'FUTURE') {
      // Future: buyer pays strike_price * quantity at expiry (simplified: difference between current value and strike)
      // For now, we'll treat as a bet on reputation: if agent reputation > strike, buyer wins difference * quantity
      // This is a simplified model.
      payout = (agent_metric - contract.strike_price) * contract.quantity;
      if (payout < 0) payout = 0; // buyer loses premium? Actually futures have no premium, but settlement based on difference.
    } else if (contract.contractType === 'CALL_OPTION') {
      // Call: buyer profits if agent_metric > strike_price
      payout = Math.max(0, agent_metric - contract.strike_price) * contract.quantity;
    } else if (contract.contractType === 'PUT_OPTION' || contract.contractType === 'INSURANCE') {
      // Put/Insurance: buyer profits if agent_metric < strike_price
      payout = Math.max(0, contract.strike_price - agent_metric) * contract.quantity;
    }

    // Transfer payout from seller to buyer (if positive)
    if (payout > 0) {
      // In a real system, you'd have escrow. For now, deduct from seller's balance.
      const seller = await prisma.users.findUnique({ where: { id: contract.seller_id } });
      if (seller && seller.balance >= payout) {
        await prisma.users.update({
          where: { id: contract.seller_id },
          data: { balance: { decrement: payout } },
        });
        await prisma.users.update({
          where: { id: contract.buyer_id! },
          data: { balance: { increment: payout } },
        });
        // Record transaction
        await prisma.token_transactions.create({ data: { 
            type: 'DIVIDEND_PAYOUT',
            amount: payout,
            from_user_id: contract.seller_id,
            to_user_id: contract.buyer_id!,
            description: `Settlement of ${contract.contractType} on agent ${contract.agent.name}`,
            status: 'COMPLETED',
          },
        });
      } else {
        // Handle insolvency – for now, mark as failed
        await prisma.derivative_contracts.update({
          where: { id },
          data: { status: 'EXPIRED' },
        });
        return res.status(400).json({ error: 'Seller has insufficient funds for payout' });
      }
    }

    // Update contract
    const updated = await prisma.derivative_contracts.update({
      where: { id },
      data: {
        settlementValue: agent_metric,
        payout,
        status: 'SETTLED',
      },
    });

    // Log settlement
    await prisma.settlement_logs.create({ data: { 
        contract_id: id,
        agent_metric,
        payout,
      },
    });

    res.json(updated);
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/derivatives/positions – get current user's positions
router.get('/positions', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const positions = await prisma.positions.findMany({
      where: { user_id: req.user!.id },
      include: { contract: {
          include: { agent: { select: { id: true, name: true, reputation_score: true } } },
        },
      },
      orderBy: { created_at: 'desc' },
    });
    res.json({ positions });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/derivatives/insurance/products – list available insurance products (i.e., open put options)
router.get('/insurance/products', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const products = await prisma.derivative_contracts.findMany({
      where: {
        contractType: { in: ['PUT_OPTION', 'INSURANCE'] },
        status: 'OPEN',
      },
      include: { agent: { select: { id: true, name: true, reputation_score: true, totalEarnings: true } },
        seller: { select: { id: true, name: true } },
      },
    });
    res.json({ products });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;




















