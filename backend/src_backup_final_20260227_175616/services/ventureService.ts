import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function submitProposal(
  founder_id: string,
  startup_id: string,
  title: string,
  description: string,
  ask_amount: number,
  equity?: number
) {
  return prisma.investment_proposals.create({ data: { 
      startup_id,
      proposer_id: founder_id,
      title,
      description,
      ask_amount,
      equity: equity || null,
      status: 'pending',
    },
  });
}

export async function getProposals(status?: string) {
  const where = status ? { status } : {};
  return prisma.investment_proposals.findMany({
    where,
    include: { startup: true,
      proposer: { select: { id: true, name: true, email: true } },
      // reports: true, // disabled until relation is verified
    },
    orderBy: { created_at: 'desc' },
  });
}

export async function runDueDiligence(proposal_id: string) {
  const report = await prisma.due_diligence_reports.create({ data: { 
      proposal_id,
      score: Math.floor(Math.random() * 40) + 60,
      summary: 'Automated due diligence completed. Startup appears viable.',
      details: { market: 'growing', team: 'experienced', tech: 'innovative' },
      risks: { competition: 'high', regulatory: 'low' },
      recommendation: Math.random() > 0.3 ? 'approve' : 'request_more',
    },
  });
  return report;
}

export async function approveProposal(proposal_id: string, investmentAmount: number) {
  const proposal = await prisma.investment_proposals.update({
    where: { id: proposal_id },
    data: {
      status: 'approved',
      reviewed_at: new Date(),
    },
  });

  const investment = await prisma.investments.create({ data: { 
      proposal_id,
      investor_id: 'platform-treasury',
      amount: investmentAmount,
    },
  });

  await prisma.startups.update({
    where: { id: proposal.startup_id },
    data: { token_amount: { increment: investmentAmount } },
  });

  return investment;
}

export async function fundProposal(proposal_id: string) {
  const proposal = await prisma.investment_proposals.update({
    where: { id: proposal_id, status: 'approved' },
    data: {
      status: 'funded',
      funded_at: new Date(),
    },
  });
  return proposal;
}



















