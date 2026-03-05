import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createBlueprint(
  creator_id: string,
  name: string,
  description: string,
  agentId: string,
  price: number,
  royalty_rate: number
) {
  const agent = await (prisma as any).agents.findUnique({
    where: { id: agentId },
    include: { owner: true }
  });
  if (!agent) throw new Error('Agent not found');
  if (agent.owner_id !== creator_id) throw new Error('You can only blueprint your own agents');

  const blueprint = await (prisma as any).agent_blueprints.create({ data: { 
      name,
      description,
      agent_type: agent.agent_type,
      configuration: agent.configuration || {},
      price,
      royalty_rate,
      creator_id,
    },
  });
  return blueprint;
}

export async function getBlueprints(filter?: { creator_id?: string }) {
  const where: any = { status: 'active' };
  if (filter?.creator_id) where.creator_id = filter.creator_id;
  return (prisma as any).agent_blueprints.findMany({
    where,
    include: { creator: { select: { id: true, name: true } } },
    orderBy: { created_at: 'desc' },
  });
}

export async function getBlueprint(id: string) {
  return (prisma as any).agent_blueprints.findUnique({
    where: { id },
    include: { creator: { select: { id: true, name: true } } },
  });
}

export async function purchaseBlueprint(
  blueprint_id: string,
  buyer_id: string
) {
  const blueprint = await (prisma as any).agent_blueprints.findUnique({
    where: { id: blueprint_id },
  });
  if (!blueprint) throw new Error('Blueprint not found');
  if (blueprint.status !== 'active') throw new Error('Blueprint is not active');

  const buyer = await (prisma as any).users.findUnique({ where: { id: buyer_id } });
  if (!buyer) throw new Error('Buyer not found');
  if (buyer.token_balance < blueprint.price) throw new Error('Insufficient balance');

  // Create new agent from blueprint
  const agent = await (prisma as any).agents.create({ data: { 
      name: `${blueprint.name} (Franchise)`,
      description: blueprint.description,
      agent_type: blueprint.agent_type,
      configuration: blueprint.configuration,
      owner_id: buyer_id,
      status: 'IDLE',
      hourly_rate: 10,
      reputation_score: 1000,
      success_rate: 0.85,
    },
  });

  const franchise = await (prisma as any).franchises.create({ data: { 
      blueprint_id,
      owner_id: buyer_id,
      agentId: agent.id,
      purchase_price: blueprint.price,
      status: 'active',
    },
  });

  // Deduct from buyer
// @ts-ignore
  await (prisma as any).users.update({
    where: { id: buyer_id },
    data: { token_balance: { decrement: blueprint.price } },
  });

  // Add to creator
// @ts-ignore
  await (prisma as any).users.update({
    where: { id: blueprint.creator_id },
    data: { token_balance: { increment: blueprint.price } },
  });

// @ts-ignore
  await (prisma as any).token_transactions.create({ data: { 
      from_user_id: buyer_id,
      to_user_id: blueprint.creator_id,
      amount: blueprint.price,
      type: 'franchise_purchase',
      
    },
  });

  return franchise;
}

export async function getUserFranchises(userId: string) {
  return (prisma as any).franchises.findMany({
    where: { owner_id: userId },
    include: { blueprint: { include: { creator: { select: { name: true } } } },
      agents: true,
    },
    orderBy: { created_at: 'desc' },
  });
}

export async function getMyBlueprintsFranchises(creator_id: string) {
  const blueprints = await (prisma as any).agent_blueprints.findMany({
    where: { creator_id },
    select: { id: true },
  });
  const blueprintIds = blueprints.map((b: any) => b.id);
  return (prisma as any).franchises.findMany({
    where: { blueprint_id: { in: blueprintIds } },
    include: { blueprint: true,
      owner: { select: { name: true } },
      agents: true,
    },
    orderBy: { created_at: 'desc' },
  });
}

export async function recordRoyaltyPayment(
  franchise_id: string,
  amount: number,
  period_start: Date,
  period_end: Date
) {
  const franchise = await (prisma as any).franchises.findUnique({
    where: { id: franchise_id },
    include: { blueprint: true },
  });
  if (!franchise) throw new Error('Franchise not found');

  const royaltyAmount = (amount * franchise.blueprint.royalty_rate) / 100;

  const payment = await (prisma as any).royalty_payments.create({ data: { 
      franchise_id,
      amount: royaltyAmount,
      period_start,
      period_end,
      status: 'pending',
    },
  });

  // Immediately mark as paid and transfer
// @ts-ignore
  await prisma.$transaction([
// @ts-ignore
    (prisma as any).royalty_payments.update({
      where: { id: payment.id },
      data: { status: 'paid', paid_at: new Date() },
    }),
// @ts-ignore
    (prisma as any).users.update({
      where: { id: franchise.blueprint.creator_id },
      data: { token_balance: { increment: royaltyAmount } },
    }),
// @ts-ignore
    (prisma as any).token_transactions.create({ data: { 
        to_user_id: franchise.blueprint.creator_id,
        amount: royaltyAmount,
        type: 'royalty',
        
      },
    }),
  ]);

// @ts-ignore
  await (prisma as any).franchises.update({
    where: { id: franchise_id },
    data: { total_royalty_paid: { increment: royaltyAmount } },
  });

  return payment;
}

















