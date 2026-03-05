import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function distributeNodeRewards() {
  // Distribute uptime rewards: e.g., 1 $AGENT per day per online node
  const onlineNodes = await (prisma as any).nodes.findMany({
    where: { status: 'online' },
  });

  for (const node of onlineNodes) {
    const rewardAmount = 1; // base daily reward

// @ts-ignore
    await (prisma as any).nodes.update({
      where: { id: node.id },
      data: { total_earned: { increment: rewardAmount } },
    });

// @ts-ignore
    await (prisma as any).node_rewards.create({ data: { 
        nodeId: node.id,
        amount: rewardAmount,
        reason: 'uptime',
        period_start: new Date(Date.now() - 24 * 60 * 60 * 1000),
        period_end: new Date(),
        paid: true,
      },
    });

    // Credit tokens to user
// @ts-ignore
    await (prisma as any).users.update({
      where: { id: node.owner_id },
      data: { token_balance: { increment: rewardAmount } },
    });

// @ts-ignore
    await (prisma as any).token_transactions.create({ data: { 
        to_user_id: node.owner_id,
        amount: rewardAmount,
        type: 'reward',
        
      },
    });
  }
}

// Run daily at midnight
setInterval(distributeNodeRewards, 24 * 60 * 60 * 1000);



















