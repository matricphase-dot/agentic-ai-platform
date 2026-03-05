import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createProposal(
  proposer_id: string,
  title: string,
  description: string,
  votingDays: number = 7
) {
  const voting_ends = new Date(Date.now() + votingDays * 24 * 60 * 60 * 1000);
  return (prisma as any).proposals.create({ data: { 
      title,
      description,
      proposer_id,
      voting_ends
    }
  });
}

export async function voteOnProposal(proposalId: string, voterId: string, support: boolean) {
  // Check if proposal is active
  const proposal = await (prisma as any).proposals.findUnique({ where: { id: proposalId } });
  if (!proposal) throw new Error('Proposal not found');
  if (proposal.status !== 'active') throw new Error('Proposal not active');
  if (proposal.voting_ends && proposal.voting_ends < new Date()) throw new Error('Voting period ended');

  // Check if already voted
  const existingVote = await (prisma as any).votes.findUnique({
    where: { proposal_id_voter_id: { proposalId, voterId } }
  });
  if (existingVote) throw new Error('Already voted');

  // Calculate voting weight: total active stakes of user
  const totalStaked = await (prisma as any).stakes.aggregate({
    where: { stakerId: voterId, status: 'active' },
    _sum: { amount: true }
  });
  const weight = totalStaked._sum.amount || 0;

  if (weight <= 0) throw new Error('No staked tokens to vote');

  return (prisma as any).votes.create({ data: { 
      proposalId,
      voterId,
      support,
      weight
    }
  });
}

export async function getProposals(status?: string) {
  const where = status ? { status } : {};
  return (prisma as any).proposals.findMany({
    where,
    include: { proposer: { select: { id: true, name: true } },
      votes: { include: { voter: { select: { id: true, name: true } } } }
    },
    orderBy: { created_at: 'desc' }
  });
}

export async function tallyProposal(proposalId: string) {
  const proposal = await (prisma as any).proposals.findUnique({
    where: { id: proposalId },
    include: { votes: true }
  });
  if (!proposal) throw new Error('Proposal not found');

  const forWeight = proposal.votes.filter((v: any) => v.support).reduce((sum: any, v: any) => sum + v.weight, 0);
  const againstWeight = proposal.votes.filter((v: any) => !v.support).reduce((sum: any, v: any) => sum + v.weight, 0);

  return { for: forWeight, against: againstWeight, total: forWeight + againstWeight };
}

export async function closeProposal(proposalId: string) {
  const proposal = await (prisma as any).proposals.findUnique({
    where: { id: proposalId },
    include: { votes: true }
  });
  if (!proposal) throw new Error('Proposal not found');

  const { for: forWeight, against: againstWeight } = await tallyProposal(proposalId);
  const status = forWeight > againstWeight ? 'passed' : 'rejected';

// @ts-ignore
  await (prisma as any).proposals.update({
    where: { id: proposalId },
    data: { status }
  });

  return status;
}

// Auto-close expired proposals (run hourly)
setInterval(async () => {
  const expired = await (prisma as any).proposals.findMany({
    where: {
      status: 'active',
      voting_ends: { lt: new Date() }
    }
  });
  for (const prop of expired) {
    await closeProposal(prop.id);
  }
}, 60 * 60 * 1000);




















