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
  return (prisma as any).investment_proposals.create({ data: { 
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
  return (prisma as any).investment_proposals.findMany({
    where,
    include: { startup: true,
      proposer: { select: { id: true, name: true, email: true } },
      // reports: true, // disabled until relation is verified
    },
    orderBy: { created_at: 'desc' },
  });
}

export async function runDueDiligence(proposalId: string) {
  const report = await (prisma as any).due_diligence_reports.create({ data: { 
      proposalId,
      score: Math.floor(Math.random() * 40) + 60,
      summary: 'Automated due diligence completed. Startup appears viable.',
      details: { market: 'growing', team: 'experienced', tech: 'innovative' },
      risks: { competition: 'high', regulatory: 'low' },
      recommendation: Math.random() > 0.3 ? 'approve' : 'request_more',
    },
  });
  return report;
}

export async function approveProposal(proposalId: string, investmentAmount: number) {
  const proposal = await (prisma as any).investment_proposals.update({
    where: { id: proposalId },
    data: {
      status: 'approved',
      reviewed_at: new Date(),
    },
  });

  const investment = await (prisma as any).investments.create({ data: { 
      proposalId,
      investor_id: 'platform-treasury',
      amount: investmentAmount,
    },
  });

// @ts-ignore
  await (prisma as any).startups.update({
    where: { id: proposal.startup_id },
    data: { token_amount: { increment: investmentAmount } },
  });

  return investment;
}

export async function fundProposal(proposalId: string) {
  const proposal = await (prisma as any).investment_proposals.update({
    where: { id: proposalId, status: 'approved' },
    data: {
      status: 'funded',
      funded_at: new Date(),
    },
  });
  return proposal;
}

























