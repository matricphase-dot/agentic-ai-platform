import express from 'express';
import { authenticate } from "../middleware/auth";
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Helper to finalize expired proposals
const finalizeProposalIfNeeded = async (proposal: any) => {
  if (proposal.status !== 'active') return proposal;
  const now = new Date();
  if (now > proposal.endDate) {
    // Calculate results
    const votes = await (prisma as any).votes.findMany({ where: { proposalId: proposal.id } });
    const results = proposal.options.reduce((acc: any, opt: string) => {
      acc[opt] = votes.filter(v => v.option === opt).reduce((sum, v) => sum + v.weight, 0);
      return acc;
    }, {});
    const totalWeight = votes.reduce((sum, v) => sum + v.weight, 0);
    // Find winning option (simple majority)
    let winningOption = null;
    let maxWeight = 0;
    for (const opt in results) {
      if (results[opt] > maxWeight) {
        maxWeight = results[opt];
        winningOption = opt;
      }
    }
    const status = maxWeight > totalWeight / 2 ? 'passed' : 'rejected';
    return await (prisma as any).proposals.update({
      where: { id: proposal.id },
      data: { status }
    });
  }
  return proposal;
};

// Create a proposal
router.post('/proposals', async (req, res) => {
  try {
    const { title, description, options, endDate } = req.body;
    if (!title || !description || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'Title, description, and at least 2 options required' });
    }
    if (!endDate || new Date(endDate) <= new Date()) {
      return res.status(400).json({ error: 'End date must be in the future' });
    }

    const proposal = await (prisma as any).proposals.create({
      data: {
        title,
        description,
        options,
        endDate: new Date(endDate),
        createdById: req.user!.id,
        status: 'active'
      }
    });
    res.json(proposal);
  } catch (error) {
    console.error('Create proposal error:', error);
    res.status(500).json({ error: 'Failed to create proposal' });
  }
});

// Get all proposals (auto-finalize expired ones)
router.get('/proposals', async (req, res) => {
  try {
    let proposals = await (prisma as any).proposals.findMany({
      include: {
        _count: { select: { votes: true } },
        createdBy: { select: { email: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    // Finalize any expired proposals
    proposals = await Promise.all(proposals.map(p => finalizeProposalIfNeeded(p)));
    res.json(proposals);
  } catch (error) {
    console.error('Fetch proposals error:', error);
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
});

// Get single proposal with votes and results
router.get('/proposals/:id', async (req, res) => {
  try {
    let proposal = await (prisma as any).proposals.findUnique({
      where: { id: req.params.id },
      include: {
        votes: {
          include: { user: { select: { email: true } } },
          orderBy: { created_at: 'desc' }
        },
        createdBy: { select: { email: true } }
      }
    });
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });

    // Finalize if needed
    proposal = await finalizeProposalIfNeeded(proposal);

    // Calculate results
    const results = proposal.options.reduce((acc: any, opt: string) => {
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

// Vote on a proposal
router.post('/proposals/:id/vote', async (req, res) => {
  try {
    const { option } = req.body;
    if (!option) return res.status(400).json({ error: 'Option required' });

    let proposal = await (prisma as any).proposals.findUnique({
      where: { id: req.params.id }
    });
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
    
    // Auto-finalize if expired
    proposal = await finalizeProposalIfNeeded(proposal);
    if (proposal.status !== 'active') {
      return res.status(400).json({ error: 'Voting period has ended' });
    }

    // Check if already voted
    const existing = await (prisma as any).votes.findUnique({
      where: {
        proposalId_userId: {
          proposalId: proposal.id,
          userId: req.user!.id
        }
      }
    });
    if (existing) return res.status(400).json({ error: 'Already voted' });

    // Verify option is valid
    if (!proposal.options.includes(option)) {
      return res.status(400).json({ error: 'Invalid option' });
    }

    // Calculate vote weight based on user's total active stake
    const stakes = await (prisma as any).stakes.aggregate({
      where: { userId: req.user!.id, status: 'active' },
      _sum: { amount: true }
    });
    const weight = stakes._sum.amount || 0;

    const vote = await (prisma as any).votes.create({
      data: {
        proposalId: proposal.id,
        userId: req.user!.id,
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

// Manually finalize a proposal (optional)
router.post('/proposals/:id/finalize', async (req, res) => {
  try {
    let proposal = await (prisma as any).proposals.findUnique({
      where: { id: req.params.id }
    });
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
    if (proposal.status !== 'active') {
      return res.status(400).json({ error: 'Proposal already finalized' });
    }
    proposal = await finalizeProposalIfNeeded(proposal);
    res.json(proposal);
  } catch (error) {
    console.error('Finalize error:', error);
    res.status(500).json({ error: 'Failed to finalize proposal' });
  }
});

export default router;





