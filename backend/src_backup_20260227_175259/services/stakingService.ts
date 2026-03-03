import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function stakeTokens(user_id: string, amount: number, agent_id?: string, lockDays: number = 0) {
  // Check user balance
  const user = await prisma.users.findUnique({ where: { id: user_id } });
  if (!user) throw new Error('User not found');
  if (user.token_balance < amount) throw new Error('Insufficient balance');

  // Calculate lock_until if lockDays > 0
  const lock_until = lockDays > 0 ? new Date(Date.now() + lockDays * 24 * 60 * 60 * 1000) : null;

  // Create stake
  const stake = await prisma.stakes.create({ data: { 
      staker_id: user_id,
      agent_id: agent_id || null,
      amount,
      status: 'active',
      lock_until
    }
  });

  // Deduct tokens from user balance
  await prisma.users.update({
    where: { id: user_id },
    data: { token_balance: { decrement: amount } }
  });

  // Record transaction
  await prisma.token_transactions.create({ data: { 
      from_user_id: user_id,
      amount,
      type: 'stake',
      reference_id: stake.id
    }
  });

  return stake;
}

export async function unstakeTokens(stakeId: string) {
  const stake = await prisma.stakes.findUnique({ where: { id: stakeId }, include: { staker: true } });
  if (!stake) throw new Error('Stake not found');
  if (stake.status !== 'active') throw new Error('Stake not active');
  if (stake.lock_until && stake.lock_until > new Date()) throw new Error('Stake is locked until ' + stake.lock_until);

  // Update stake status
  await prisma.stakes.update({
    where: { id: stakeId },
    data: { status: 'unstaked', unstaked_at: new Date() }
  });

  // Return tokens to user
  await prisma.users.update({
    where: { id: stake.staker_id },
    data: { token_balance: { increment: stake.amount } }
  });

  // Record transaction
  await prisma.token_transactions.create({ data: { 
      to_user_id: stake.staker_id,
      amount: stake.amount,
      type: 'unstake',
      reference_id: stakeId
    }
  });

  return { success: true };
}

export async function getUserStakes(user_id: string) {
  return prisma.stakes.findMany({
    where: { staker_id: user_id },
    include: { agent: true }
  });
}

export async function distributeStakingRewards() {
  // Simple reward: 5% APY, distributed daily
  const stakes = await prisma.stakes.findMany({
    where: { status: 'active' }
  });

  for (const stake of stakes) {
    const daysStaked = Math.floor((Date.now() - stake.created_at.getTime()) / (1000 * 60 * 60 * 24));
    if (daysStaked < 1) continue; // only reward after at least one day

    // Approx 5% APY = 0.05/365 per day
    const rewardAmount = stake.amount * 0.05 / 365 * daysStaked;

    // Create reward record
    await prisma.rewards.create({ data: { 
        user_id: stake.staker_id, amount: rewardAmount, type: 'stake_reward', reason: 'staking', reference_id: stake.id
      }
    });

    // Update user balance (optional – could require claiming)
    await prisma.users.update({
      where: { id: stake.staker_id },
      data: { token_balance: { increment: rewardAmount } }
    });

    // Record transaction
    await prisma.token_transactions.create({ data: { 
        to_user_id: stake.staker_id,
        amount: rewardAmount,
        type: 'reward',
        reference_id: stake.id
      }
    });
  }
}

// Run daily at midnight
setInterval(distributeStakingRewards, 24 * 60 * 60 * 1000);


















