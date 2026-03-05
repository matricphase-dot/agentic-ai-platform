import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function stakeTokens(userId: string, amount: number, agentId?: string, lockDays: number = 0) {
  // Check user balance
  const user = await (prisma as any).users.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  if (user.token_balance < amount) throw new Error('Insufficient balance');

  // Calculate lock_until if lockDays > 0
  const lock_until = lockDays > 0 ? new Date(Date.now() + lockDays * 24 * 60 * 60 * 1000) : null;

  // Create stake
  const stake = await (prisma as any).stakes.create({ data: { 
      stakerId: userId,
      agentId: agentId || null,
      amount,
      status: 'active',
      lock_until
    }
  });

  // Deduct tokens from user balance
// @ts-ignore
  await (prisma as any).users.update({
    where: { id: userId },
    data: { token_balance: { decrement: amount } }
  });

  // Record transaction
// @ts-ignore
  await (prisma as any).token_transactions.create({ data: { 
      from_user_id: userId,
      amount,
      type: 'stake'
    }
  });

  return stake;
}

export async function unstakeTokens(stakeId: string) {
  const stake = await (prisma as any).stakes.findUnique({ where: { id: stakeId }, include: { staker: true } });
  if (!stake) throw new Error('Stake not found');
  if (stake.status !== 'active') throw new Error('Stake not active');
  if (stake.lock_until && stake.lock_until > new Date()) throw new Error('Stake is locked until ' + stake.lock_until);

  // Update stake status
// @ts-ignore
  await (prisma as any).stakes.update({
    where: { id: stakeId },
    data: { status: 'unstaked', unstaked_at: new Date() }
  });

  // Return tokens to user
// @ts-ignore
  await (prisma as any).users.update({
    where: { id: stake.stakerId },
    data: { token_balance: { increment: stake.amount } }
  });

  // Record transaction
// @ts-ignore
  await (prisma as any).token_transactions.create({ data: { 
      to_user_id: stake.stakerId,
      amount: stake.amount,
      type: 'unstake'
    }
  });

  return { success: true };
}

export async function getUserStakes(userId: string) {
  return (prisma as any).stakes.findMany({
    where: { stakerId: userId },
    include: { agents: true }
  });
}

export async function distributeStakingRewards() {
  // Simple reward: 5% APY, distributed daily
  const stakes = await (prisma as any).stakes.findMany({
    where: { status: 'active' }
  });

  for (const stake of stakes) {
    const daysStaked = Math.floor((Date.now() - stake.created_at.getTime()) / (1000 * 60 * 60 * 24));
    if (daysStaked < 1) continue; // only reward after at least one day

    // Approx 5% APY = 0.05/365 per day
    const rewardAmount = stake.amount * 0.05 / 365 * daysStaked;

    // Create reward record
// @ts-ignore
    await (prisma as any).rewards.create({ data: { 
        userId: stake.stakerId,
        amount: rewardAmount,
        reason: 'staking'
      }
    });

    // Update user balance (optional – could require claiming)
// @ts-ignore
    await (prisma as any).users.update({
      where: { id: stake.stakerId },
      data: { token_balance: { increment: rewardAmount } }
    });

    // Record transaction
// @ts-ignore
    await (prisma as any).token_transactions.create({ data: { 
        to_user_id: stake.stakerId,
        amount: rewardAmount,
        type: 'reward'
      }
    });
  }
}

// Run daily at midnight
setInterval(distributeStakingRewards, 24 * 60 * 60 * 1000);


























