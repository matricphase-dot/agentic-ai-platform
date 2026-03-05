import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Nation CRUD
export async function createNation(
  founder_id: string,
  name: string,
  description: string
) {
  // Check if nation name already exists
  const existing = await prisma.nations.findUnique({ where: { name } });
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
        user_id: founder_id,
        nation_id: nation.id,
        role: 'founder',
      },
    });
    return nation;
  });
}

export async function getNations(filter?: { user_id?: string }) {
  const where: any = {};
  if (filter?.user_id) {
    // Nations where user is a citizen
    where.citizens = { some: { user_id: filter.user_id } };
  }
  return prisma.nations.findMany({
    where,
    include: { founder: { select: { id: true, name: true } },
      citizens: { include: { user: { select: { id: true, name: true } } } },
    },
  });
}

export async function getNation(id: string) {
  return prisma.nations.findUnique({
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
export async function joinNation(user_id: string, nation_id: string) {
  // Check if already a citizen
  const existing = await prisma.citizens.findUnique({
    where: { user_id_nation_id: { user_id, nation_id } },
  });
  if (existing) throw new Error('Already a citizen');

  return prisma.citizens.create({ data: { 
      user_id,
      nation_id,
      role: 'citizen',
    },
  });
}

export async function leaveNation(user_id: string, nation_id: string) {
  // Founder cannot leave (must transfer ownership or disband)
  const citizen = await prisma.citizens.findUnique({
    where: { user_id_nation_id: { user_id, nation_id } },
  });
  if (!citizen) throw new Error('Not a citizen');
  // if (citizen.role === 'founder') throw new Error('Founder cannot leave; transfer ownership first');

  return prisma.citizens.delete({
    where: { user_id_nation_id: { user_id, nation_id } },
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
  const citizen = await prisma.citizens.findUnique({
    where: { user_id_nation_id: { user_id: proposer_id, nation_id } },
  });
  if (!citizen) throw new Error('You must be a citizen to create a proposal');

  const voting_ends = new Date(Date.now() + votingDays * 24 * 60 * 60 * 1000);
  return prisma.nation_proposals.create({ data: { 
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
  return prisma.nation_proposals.findMany({
    where,
    include: { proposer: { select: { user: { select: { name: true } } } },
      votes: true,
    },
    orderBy: { created_at: 'desc' },
  });
}

export async function voteOnProposal(
  proposal_id: string,
  voter_id: string,
  support: boolean
) {
  const proposal = await prisma.nation_proposals.findUnique({
    where: { id: proposal_id },
  });
  if (!proposal) throw new Error('Proposal not found');
  if (proposal.status !== 'active') throw new Error('Proposal not active');
  if (proposal.voting_ends && proposal.voting_ends < new Date()) throw new Error('Voting period ended');

  // Check if already voted
  const existingVote = await prisma.nation_votes.findUnique({
    where: { proposal_id_voter_id: { proposal_id, voter_id } },
  });
  if (existingVote) throw new Error('Already voted');

  // Verify voter is a citizen of the nation
  const citizen = await prisma.citizens.findUnique({
    where: { user_id_nation_id: { user_id: voter_id, nation_id: proposal.nation_id } },
  });
  if (!citizen) throw new Error('You must be a citizen to vote');

  // Calculate voting weight: could be based on staked tokens or citizenship duration
  // Simple: each citizen gets weight 1
  const weight = 1;

  return prisma.nation_votes.create({ data: { 
      proposal_id,
      voter_id,
      support,
      weight,
    },
  });
}

export async function tallyProposal(proposal_id: string) {
  const proposal = await prisma.nation_proposals.findUnique({
    where: { id: proposal_id },
    include: { votes: true },
  });
  if (!proposal) throw new Error('Proposal not found');

  const forWeight = proposal.votes.filter((v: any) => v.support).reduce((sum: any, v: any) => sum + v.weight, 0);
  const againstWeight = proposal.votes.filter((v: any) => !v.support).reduce((sum: any, v: any) => sum + v.weight, 0);

  return { for: forWeight, against: againstWeight, total: forWeight + againstWeight };
}

export async function closeProposal(proposal_id: string) {
  const proposal = await prisma.nation_proposals.findUnique({
    where: { id: proposal_id },
    include: { votes: true },
  });
  if (!proposal) throw new Error('Proposal not found');

  const { for: forWeight, against: againstWeight } = await tallyProposal(proposal_id);
  const status = forWeight > againstWeight ? 'passed' : 'rejected';

  await prisma.nation_proposals.update({
    where: { id: proposal_id },
    data: { status },
  });

  return status;
}













