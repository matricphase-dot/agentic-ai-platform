import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let currentRoundNumber = 0;

export async function startConsensusRound(topic: string, data: any) {
  const round = await prisma.consensus_rounds.create({ data: { 
      round_number: ++currentRoundNumber,
      topic,
      data,
      status: 'voting',
    },
  });
  return round;
}

export async function castVote(round_id: string, voter_id: string, vote: boolean, weight: number = 1) {
  // Check if already voted
  const existing = await prisma.consensus_votes.findUnique({
    where: { roundId_voterId: { round_id, voter_id } },
  });
  if (existing) throw new Error('Already voted');

  return prisma.consensus_votes.create({ data: { 
      round_id,
      voter_id,
      vote,
      weight,
    },
  });
}

export async function tallyRound(round_id: string) {
  const round = await prisma.consensus_rounds.findUnique({
    where: { id: round_id },
    include: { votes: true },
  });
  if (!round) throw new Error('Round not found');

  const forWeight = round.votes.filter((v: any) => v.vote).reduce((sum: any, v: any) => sum + v.weight, 0);
  const againstWeight = round.votes.filter((v: any) => !v.vote).reduce((sum: any, v: any) => sum + v.weight, 0);

  const result = { for: forWeight, against: againstWeight };
  const status = forWeight > againstWeight ? 'accepted' : 'rejected';

  await prisma.consensus_rounds.update({
    where: { id: round_id },
    data: { status, result, completed_at: new Date() },
  });

  return { status, result };
}






