import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Nation CRUD
export async function createNation(
  founder_id: string,
  name: string,
  description: string
) {
  // Check if nation name already exists
  const existing = await (prisma as any).nations.findUnique({ where: { name } });
  if (existing) throw new Error('Nation name already taken');

  return prisma.$transaction(async (tx) => {
    const nation = await tx.nations.create({
      data: {
        name,
        description,
        founder_id,
      },
    });
    // Make founder a citizen with role 'founder'
    await tx.citizens.create({
      data: {
        userId: founder_id,
        nation_id: nation.id,
        role: 'founder',
      },
    });
    return nation;
  });
}

export async function getNations(filter?: { userId?: string }) {
  const where: any = {};
  if (filter?.userId) {
    // Nations where user is a citizen
    where.citizens = { some: { userId: filter.userId } };
  }
  return (prisma as any).nations.findMany({
    where,
    include: { founder: { select: { id: true, name: true } },
      citizens: { include: { user: { select: { id: true, name: true } } } },
    },
  });
}

export async function getNation(id: string) {
  return (prisma as any).nations.findUnique({
    where: { id },
    include: { founder: { select: { id: true, name: true } },
      citizens: { include: { user: { select: { id: true, name: true } } } },
      proposals: {
        where: { status: 'active' },
        orderBy: { created_at: 'desc' },
        take: 10,
      },
    },
  });
}

// Citizenship
export async function joinNation(userId: string, nation_id: string) {
  // Check if already a citizen
  const existing = await (prisma as any).citizens.findUnique({
    where: { user_id_nation_id: { userId, nation_id } },
  });
  if (existing) throw new Error('Already a citizen');

  return (prisma as any).citizens.create({ data: { 
      userId,
      nation_id,
      role: 'citizen',
    },
  });
}

export async function leaveNation(userId: string, nation_id: string) {
  // Founder cannot leave (must transfer ownership or disband)
  const citizen = await (prisma as any).citizens.findUnique({
    where: { user_id_nation_id: { userId, nation_id } },
  });
  if (!citizen) throw new Error('Not a citizen');
  // if (citizen.role === 'founder') throw new Error('Founder cannot leave; transfer ownership first');

  return (prisma as any).citizens.delete({
    where: { user_id_nation_id: { userId, nation_id } },
  });
}

// Proposals
export async function createProposal(
  nation_id: string,
  proposer_id: string,
  title: string,
  description: string,
  votingDays: number = 7
) {
  // Verify proposer is a citizen
  const citizen = await (prisma as any).citizens.findUnique({
    where: { user_id_nation_id: { userId: proposer_id, nation_id } },
  });
  if (!citizen) throw new Error('You must be a citizen to create a proposal');

  const voting_ends = new Date(Date.now() + votingDays * 24 * 60 * 60 * 1000);
  return (prisma as any).nation_proposals.create({ data: { 
      nation_id,
      title,
      description,
      proposer_id,
      voting_ends,
    },
  });
}

export async function getProposals(nation_id: string, status?: string) {
  const where: any = { nation_id };
  if (status) where.status = status;
  return (prisma as any).nation_proposals.findMany({
    where,
    include: { proposer: { select: { user: { select: { name: true } } } },
      votes: true,
    },
    orderBy: { created_at: 'desc' },
  });
}

export async function voteOnProposal(
  proposalId: string,
  voterId: string,
  support: boolean
) {
  const proposal = await (prisma as any).nation_proposals.findUnique({
    where: { id: proposalId },
  });
  if (!proposal) throw new Error('Proposal not found');
  if (proposal.status !== 'active') throw new Error('Proposal not active');
  if (proposal.voting_ends && proposal.voting_ends < new Date()) throw new Error('Voting period ended');

  // Check if already voted
  const existingVote = await (prisma as any).nation_votes.findUnique({
    where: { proposal_id_voter_id: { proposalId, voterId } },
  });
  if (existingVote) throw new Error('Already voted');

  // Verify voter is a citizen of the nation
  const citizen = await (prisma as any).citizens.findUnique({
    where: { user_id_nation_id: { userId: voterId, nation_id: proposal.nation_id } },
  });
  if (!citizen) throw new Error('You must be a citizen to vote');

  // Calculate voting weight: could be based on staked tokens or citizenship duration
  // Simple: each citizen gets weight 1
  const weight = 1;

  return (prisma as any).nation_votes.create({ data: { 
      proposalId,
      voterId,
      support,
      weight,
    },
  });
}

export async function tallyProposal(proposalId: string) {
  const proposal = await (prisma as any).nation_proposals.findUnique({
    where: { id: proposalId },
    include: { votes: true },
  });
  if (!proposal) throw new Error('Proposal not found');

  const forWeight = proposal.votes.filter((v: any) => v.support).reduce((sum: any, v: any) => sum + v.weight, 0);
  const againstWeight = proposal.votes.filter((v: any) => !v.support).reduce((sum: any, v: any) => sum + v.weight, 0);

  return { for: forWeight, against: againstWeight, total: forWeight + againstWeight };
}

export async function closeProposal(proposalId: string) {
  const proposal = await (prisma as any).nation_proposals.findUnique({
    where: { id: proposalId },
    include: { votes: true },
  });
  if (!proposal) throw new Error('Proposal not found');

  const { for: forWeight, against: againstWeight } = await tallyProposal(proposalId);
  const status = forWeight > againstWeight ? 'passed' : 'rejected';

// @ts-ignore
  await (prisma as any).nation_proposals.update({
    where: { id: proposalId },
    data: { status },
  });

  return status;
}















