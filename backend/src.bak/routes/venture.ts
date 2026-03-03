import express from 'express';
import { PrismaClient } from '@prisma/client';
import {
  submitProposal,
  getProposals,
  runDueDiligence,
  approveProposal,
  fundProposal,
} from '../services/ventureService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Submit a new investment proposal
router.post('/proposals', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const { startup_id, title, description, ask_amount, equity } = req.body;
    const proposal = await submitProposal(req.user.id, startup_id, title, description, ask_amount, equity);
    res.json(proposal);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// List proposals (optionally filter by status)
router.get('/proposals', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    const proposals = await getProposals(status as string);
    res.json(proposals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Run due diligence on a proposal (only proposer or admin)
router.post('/proposals/:id/due-diligence', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.params.id) return res.status(400).json({ error: 'Proposal ID is required' });

    const proposal = await prisma.investment_proposals.findUnique({
      where: { id: req.params.id },
    });
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
    if (proposal.proposer_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You are not the proposer' });
    }

    const report = await runDueDiligence(req.params.id);
    res.json(report);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Approve a proposal and allocate investment (only proposer)
router.post('/proposals/:id/approve', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.params.id) return res.status(400).json({ error: 'Proposal ID is required' });

    const proposal = await prisma.investment_proposals.findUnique({
      where: { id: req.params.id },
    });
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
    if (proposal.proposer_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You are not the proposer' });
    }

    const { investmentAmount } = req.body;
    const investment = await approveProposal(req.params.id, investmentAmount);
    res.json(investment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Mark a proposal as funded (only proposer)
router.post('/proposals/:id/fund', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.params.id) return res.status(400).json({ error: 'Proposal ID is required' });

    const proposal = await prisma.investment_proposals.findUnique({
      where: { id: req.params.id },
    });
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
    if (proposal.proposer_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You are not the proposer' });
    }

    const funded = await fundProposal(req.params.id);
    res.json(funded);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;














