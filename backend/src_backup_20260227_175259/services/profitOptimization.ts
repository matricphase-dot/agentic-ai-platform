import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function updatePricing() {
  // Get all agent types
  const agent_types = await (prisma as any).agents.groupBy({
    by: ['agent_type'],
  });

  for (const { agent_type } of agent_types) {
    // Count active deployments as demand metric
    const activeDeployments = await (prisma as any).deployments.count({
      where: {
        agent: { agent_type },
        status: 'running',
      },
    });

    // Get or create pricing rule
    let rule = await (prisma as any).pricing_rules.findUnique({
      where: { agent_type },
    });
    if (!rule) {
      rule = await (prisma as any).pricing_rules.create({ data: { 
          agent_type,
          basePrice: 10.0,
          demand: 1.0,
          multiplier: 1.0,
        },
      });
    }

    const demand = activeDeployments / 10 || 0.1;
    const multiplier = 1 + (demand - 0.5);

// @ts-ignore
    await (prisma as any).pricing_rules.update({
      where: { id: rule.id },
      data: {
        demand,
        multiplier,
        updated_at: new Date(),
      },
    });

    // Agent price update disabled (field missing)
  }
}

// Run every 15 minutes
setInterval(updatePricing, 15 * 60 * 1000);















