import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function distributeNodeRewards() {
  // Distribute uptime rewards: e.g., 1 $AGENT per day per online node
  const onlineNodes = await prisma.nodes.findMany({
    where: { status: 'online' },
  });

  for (const node of onlineNodes) {
    const rewardAmount = 1; // base daily reward

    await prisma.nodes.update({
      where: { id: node.id },
      data: { total_earned: { increment: rewardAmount } },
    });

    await prisma.node_rewards.create({ data: { 
        node_id: node.id,
        amount: rewardAmount,
        reason: 'uptime',
        period_start: new Date(Date.now() - 24 * 60 * 60 * 1000),
        period_end: new Date(),
        paid: true,
      },
    });

    // Credit tokens to user
    await prisma.users.update({
      where: { id: node.owner_id },
      data: { token_balance: { increment: rewardAmount } },
    });

    await prisma.token_transactions.create({ data: { 
        to_user_id: node.owner_id,
        amount: rewardAmount,
        type: 'reward',
        
      },
    });
  }
}

// Run daily at midnight
setInterval(distributeNodeRewards, 24 * 60 * 60 * 1000);
















