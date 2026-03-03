import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createBlueprint(
  agent_id: string,
  creator_id: string,
  price: number,
  royalty_rate: number
) {
  // Verify agent exists and belongs to creator
  const agent = await prisma.agents.findUnique({
    where: { id: agent_id }
  });

  if (!agent) throw new Error('Agent not found');
  if (agent.owner_id !== creator_id) throw new Error('You can only blueprint your own agents');

  // Create blueprint
  const blueprint = await prisma.agent_blueprints.create({
    data: {
      name: agent.name,
      description: agent.description,
      agent_type: agent.agent_type,
      configuration: agent.configuration as any, // cast
      specialties: agent.capabilities as any, // cast
      price,
      royalty_rate,
      creator_id,
      status: 'active'
    }
  });

  return blueprint;
}

export async function getBlueprints(filter?: { creator_id?: string; status?: string }) {
  const where: any = { status: 'active' };
  if (filter?.creator_id) where.creator_id = filter.creator_id;

  return prisma.agent_blueprints.findMany({
    where,
    include: { creator: { select: { id: true, name: true } }
    },
    orderBy: { created_at: 'desc' }
  });
}

export async function getBlueprint(id: string) {
  return prisma.agent_blueprints.findUnique({
    where: { id },
    include: { creator: { select: { id: true, name: true } }
    }
  });
}

export async function purchaseBlueprint(
  blueprint_id: string,
  buyer_id: string
) {
  // Get blueprint
  const blueprint = await prisma.agent_blueprints.findUnique({
    where: { id: blueprint_id }
  });

  if (!blueprint) throw new Error('Blueprint not found');
  if (blueprint.status !== 'active') throw new Error('Blueprint is not active');

  // Check buyer balance
  const buyer = await prisma.users.findUnique({
    where: { id: buyer_id }
  });

  if (!buyer) throw new Error('Buyer not found');
  if (buyer.token_balance < blueprint.price) throw new Error('Insufficient balance');

  // Create agent from blueprint
  const agent = await prisma.agents.create({
    data: {
      name: blueprint.name,
      description: blueprint.description,
      agent_type: blueprint.agent_type,
      configuration: blueprint.configuration as any, // cast
      capabilities: blueprint.specialties as any, // cast
      hourly_rate: 10,
      success_rate: 0.85,
      reputation_score: 1000,
      owner_id: buyer_id,
      status: 'active'
    }
  });

  // Create franchise record
  const franchise = await prisma.franchises.create({
    data: {
      blueprint_id,
      owner_id: buyer_id,
      agent_id: agent.id,
      purchase_price: blueprint.price,
      status: 'active'
    }
  });

  // Deduct balance from buyer
  await prisma.users.update({
    where: { id: buyer_id },
    data: { token_balance: { decrement: blueprint.price } }
  });

  // Add balance to creator
  await prisma.users.update({
    where: { id: blueprint.creator_id },
    data: { token_balance: { increment: blueprint.price } }
  });

  // Record transaction
  await prisma.token_transactions.create({
    data: {
      from_user_id: buyer_id,
      to_user_id: blueprint.creator_id,
      amount: blueprint.price,
      type: 'blueprint_purchase',
      description: `Purchase of blueprint: ${blueprint.name}`,
      status: 'completed'
    }
  });

  return franchise;
}

export async function getUserBlueprints(creator_id: string) {
  const blueprints = await prisma.agent_blueprints.findMany({
    where: { creator_id }
  });
  return blueprints;
}

export async function getUserFranchises(owner_id: string) {
  return prisma.franchises.findMany({
    where: { owner_id },
    include: { blueprint: { include: { creator: { select: { name: true } } } }
    },
    orderBy: { created_at: 'desc' }
  });
}

export async function recordRoyaltyPayment(
  franchise_id: string,
  amount: number
) {
  const franchise = await prisma.franchises.findUnique({
    where: { id: franchise_id },
    include: { blueprint: true }
  });

  if (!franchise) throw new Error('Franchise not found');

  const royaltyAmount = (amount * franchise.blueprint.royalty_rate) / 100;

  const payment = await prisma.royalty_payments.create({
    data: {
      franchise_id,
      amount: royaltyAmount,
      period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      period_end: new Date(),
      status: 'pending'
    }
  });

  // Update franchise total
  await prisma.franchises.update({
    where: { id: franchise_id },
    data: { total_royalty_paid: { increment: royaltyAmount } }
  });

  // Mark payment as paid and transfer tokens (simplified)
  await prisma.$transaction([
    prisma.royalty_payments.update({
      where: { id: payment.id },
      data: { status: 'paid', paid_at: new Date() }
    }),
    prisma.users.update({
      where: { id: franchise.owner_id },
      data: { token_balance: { increment: royaltyAmount } }
    }),
    prisma.token_transactions.create({
      data: {
        from_user_id: franchise.owner_id, // in reality would be from platform treasury
        to_user_id: franchise.blueprint.creator_id,
        amount: royaltyAmount,
        type: 'royalty',
        description: `Royalty payment for franchise ${franchise.id}`,
        status: 'completed'
      }
    })
  ]);

  return payment;
}



