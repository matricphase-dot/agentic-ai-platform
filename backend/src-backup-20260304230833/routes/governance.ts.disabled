import express from 'express';
import { createProposal, voteOnProposal, getProposals, tallyProposal } from '../services/governanceService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Create proposal
router.post('/proposals', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { title, description, votingDays } = req.body;
    const proposal = await createProposal(req.user.id, title, description, votingDays);
    res.json(proposal);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get all proposals
router.get('/proposals', async (req, res) => {
  try {
    const { status } = req.query;
    const proposals = await getProposals(status as string);
    res.json(proposals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vote on proposal
router.post('/proposals/:proposal_id/vote', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!req.params.proposal_id) {
      return res.status(400).json({ error: 'Proposal ID is required' });
    }
    const { support } = req.body;
    const vote = await voteOnProposal(req.params.proposal_id, req.user.id, support);
    res.json(vote);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get proposal tally
router.get('/proposals/:proposal_id/tally', async (req, res) => {
  try {
    if (!req.params.proposal_id) {
      return res.status(400).json({ error: 'Proposal ID is required' });
    }
    const tally = await tallyProposal(req.params.proposal_id);
    res.json(tally);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;







