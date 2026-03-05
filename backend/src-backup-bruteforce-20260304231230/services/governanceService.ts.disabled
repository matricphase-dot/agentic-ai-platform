import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createProposal(
  proposer_id: string,
  title: string,
  description: string,
  votingDays: number = 7
) {
  const voting_ends = new Date(Date.now() + votingDays * 24 * 60 * 60 * 1000);
  return prisma.proposals.create({ data: { 
      title,
      description,
      proposer_id,
      voting_ends
    }
  });
}

export async function voteOnProposal(proposal_id: string, voter_id: string, support: boolean) {
  // Check if proposal is active
  const proposal = await prisma.proposals.findUnique({ where: { id: proposal_id } });
  if (!proposal) throw new Error('Proposal not found');
  if (proposal.status !== 'active') throw new Error('Proposal not active');
  if (proposal.voting_ends && proposal.voting_ends < new Date()) throw new Error('Voting period ended');

  // Check if already voted
  const existingVote = await prisma.votes.findUnique({
    where: { proposal_id_voter_id: { proposal_id, voter_id } }
  });
  if (existingVote) throw new Error('Already voted');

  // Calculate voting weight: total active stakes of user
  const totalStaked = await prisma.stakes.aggregate({
    where: { staker_id: voter_id, status: 'active' },
    _sum: { amount: true }
  });
  const weight = totalStaked._sum.amount || 0;

  if (weight <= 0) throw new Error('No staked tokens to vote');

  return prisma.votes.create({ data: { 
      proposal_id,
      voter_id,
      support,
      weight
    }
  });
}

export async function getProposals(status?: string) {
  const where = status ? { status } : {};
  return prisma.proposals.findMany({
    where,
    include: { proposer: { select: { id: true, name: true } },
      votes: { include: { voter: { select: { id: true, name: true } } } }
    },
    orderBy: { created_at: 'desc' }
  });
}

export async function tallyProposal(proposal_id: string) {
  const proposal = await prisma.proposals.findUnique({
    where: { id: proposal_id },
    include: { votes: true }
  });
  if (!proposal) throw new Error('Proposal not found');

  const forWeight = proposal.votes.filter((v: any) => v.support).reduce((sum: any, v: any) => sum + v.weight, 0);
  const againstWeight = proposal.votes.filter((v: any) => !v.support).reduce((sum: any, v: any) => sum + v.weight, 0);

  return { for: forWeight, against: againstWeight, total: forWeight + againstWeight };
}

export async function closeProposal(proposal_id: string) {
  const proposal = await prisma.proposals.findUnique({
    where: { id: proposal_id },
    include: { votes: true }
  });
  if (!proposal) throw new Error('Proposal not found');

  const { for: forWeight, against: againstWeight } = await tallyProposal(proposal_id);
  const status = forWeight > againstWeight ? 'passed' : 'rejected';

  await prisma.proposals.update({
    where: { id: proposal_id },
    data: { status }
  });

  return status;
}

// Auto-close expired proposals (run hourly)
setInterval(async () => {
  const expired = await prisma.proposals.findMany({
    where: {
      status: 'active',
      voting_ends: { lt: new Date() }
    }
  });
  for (const prop of expired) {
    await closeProposal(prop.id);
  }
}, 60 * 60 * 1000);


















