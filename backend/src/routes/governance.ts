import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Helper to finalize expired proposals
const finalizeProposalIfNeeded = async (proposal: any) => {
  if (proposal.status !== 'active') return proposal;
  const now = new Date();
  if (now > proposal.endDate) {
    // Calculate results
    const votes = await prisma.votes.findMany({ where: { proposalId: proposal.id } });
    const results = (proposal.options as string[]).reduce((acc: any, opt: string) => {
      acc[opt] = votes.filter(v => v.option === opt).reduce((sum, v) => sum + v.weight, 0);
      return acc;
    }, {});
    const totalWeight = votes.reduce((sum, v) => sum + v.weight, 0);
    let winningOption = null;
    let maxWeight = 0;
    for (const opt in results) {
      if (results[opt] > maxWeight) {
        maxWeight = results[opt];
        winningOption = opt;
      }
    }
    const status = maxWeight > totalWeight / 2 ? 'passed' : 'rejected';
    return await prisma.proposals.update({
      where: { id: proposal.id },
      data: { status }
    });
  }
  return proposal;
};

// GET /api/governance – return all proposals
router.get('/', async (req, res) => {
  try {
    let proposals = await prisma.proposals.findMany({
      include: {
        votes: true,
        creator: { select: { email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    // Auto-finalize expired ones
    proposals = await Promise.all(proposals.map(p => finalizeProposalIfNeeded(p)));
    res.json(proposals);
  } catch (error) {
    console.error('Fetch proposals error:', error);
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
});

// POST /api/governance – create a proposal (admin only)
router.post('/', async (req, res) => {
  try {
    const { title, description, options, endDate } = req.body;
    if (!title || !description || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'Title, description, and at least 2 options required' });
    }
    if (!endDate || new Date(endDate) <= new Date()) {
      return res.status(400).json({ error: 'End date must be in the future' });
    }

    const proposal = await prisma.proposals.create({
      data: {
        title,
        description,
        options,
        endDate: new Date(endDate),
        createdById: (req as any).user.id,
        status: 'active'
      }
    });
    res.json(proposal);
  } catch (error) {
    console.error('Create proposal error:', error);
    res.status(500).json({ error: 'Failed to create proposal' });
  }
});

// GET /api/governance/:id – single proposal
router.get('/:id', async (req, res) => {
  try {
    let proposal = await prisma.proposals.findUnique({
      where: { id: req.params.id },
      include: {
        votes: {
          include: { user: { select: { email: true } } },
          orderBy: { createdAt: 'desc' }
        },
        creator: { select: { email: true } }
      }
    });
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });

    proposal = await finalizeProposalIfNeeded(proposal);

    const results = (proposal.options as string[]).reduce((acc: any, opt: string) => {
      acc[opt] = proposal.votes.filter(v => v.option === opt).reduce((sum, v) => sum + v.weight, 0);
      return acc;
    }, {});
    const totalWeight = proposal.votes.reduce((sum, v) => sum + v.weight, 0);

    res.json({ ...proposal, results, totalWeight });
  } catch (error) {
    console.error('Fetch proposal error:', error);
    res.status(500).json({ error: 'Failed to fetch proposal' });
  }
});

// POST /api/governance/:id/vote – vote on a proposal
router.post('/:id/vote', async (req, res) => {
  try {
    const { option } = req.body;
    if (!option) return res.status(400).json({ error: 'Option required' });

    let proposal = await prisma.proposals.findUnique({
      where: { id: req.params.id }
    });
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });

    proposal = await finalizeProposalIfNeeded(proposal);
    if (proposal.status !== 'active') {
      return res.status(400).json({ error: 'Voting period has ended' });
    }

    // Check if already voted
    const existing = await prisma.votes.findUnique({
      where: {
        proposalId_userId: {
          proposalId: proposal.id,
          userId: (req as any).user.id
        }
      }
    });
    if (existing) return res.status(400).json({ error: 'Already voted' });

    // Verify option is valid
    if (!(proposal.options as string[]).includes(option)) {
      return res.status(400).json({ error: 'Invalid option' });
    }

    // Calculate vote weight based on user's total active stake
    const stakes = await prisma.stakes.aggregate({
      where: { stakerId: (req as any).user.id },
      _sum: { amount: true }
    });
    const weight = stakes._sum.amount || 0;

    const vote = await prisma.votes.create({
      data: {
        proposalId: proposal.id,
        userId: (req as any).user.id,
        option,
        weight
      }
    });
    res.json(vote);
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Failed to vote' });
  }
});

export default router;
