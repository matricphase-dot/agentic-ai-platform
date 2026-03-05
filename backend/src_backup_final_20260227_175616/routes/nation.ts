import express from 'express';
import {
  createNation,
  getNations,
  getNation,
  joinNation,
  leaveNation,
  createProposal,
  getProposals,
  voteOnProposal,
  tallyProposal,
  closeProposal,
} from '../services/nationService';
import { authenticate } from "../middleware/auth";
const router = express.Router();
// Nations
// Get all nations (public) – optionally filter by user's membership
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const nations = await getNations({ userId: userId as string });
    res.json(nations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
// Get single nation (public)
router.get('/:id', async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ error: 'Nation ID required' });
    const nation = await getNation(req.params.id);
    if (!nation) return res.status(404).json({ error: 'Nation not found' });
    res.json(nation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
// Create a nation (authenticated)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const { name, description } = req.body;
    const nation = await createNation(req.user.id, name, description);
    res.json(nation);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
// Join a nation (authenticated)
router.post('/:id/join', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.params.id) return res.status(400).json({ error: 'Nation ID required' });
        if (!req.params.id) return res.status(400).json({ error: 'Nation ID required' });
    const citizen = await joinNation(req.user.id, req.params.id);
    res.json(citizen);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
// Leave a nation (authenticated)
router.post('/:id/leave', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.params.id) return res.status(400).json({ error: 'Nation ID required' });
        if (!req.params.id) return res.status(400).json({ error: 'Nation ID required' });
    const result = await leaveNation(req.user.id, req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
// Proposals
// Get proposals for a nation
router.get('/:id/proposals', async (req, res) => {
  try {
    const { status } = req.query;
    const proposals = await getProposals(req.params.id, status as string);
    res.json(proposals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
// Create a proposal in a nation (authenticated, must be citizen)
router.post('/:id/proposals', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const { title, description, votingDays } = req.body;
    if (!req.params.id) return res.status(400).json({ error: 'Nation ID required' });
        if (!req.params.id) return res.status(400).json({ error: 'Nation ID required' });
    const proposal = await createProposal(req.params.id, req.user.id, title, description, votingDays);
    res.json(proposal);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
// Vote on a proposal
router.post('/proposals/:proposalId/vote', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const { support } = req.body;
    if (!req.params.proposalId) return res.status(400).json({ error: 'Proposal ID required' });
        if (!req.params.proposalId) return res.status(400).json({ error: 'Proposal ID required' });
    const vote = await voteOnProposal(req.params.proposalId, req.user.id, support);
    res.json(vote);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
// Get tally for a proposal
router.get('/proposals/:proposalId/tally', async (req, res) => {
  try {
    const tally = await tallyProposal(req.params.proposalId);
    res.json(tally);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
// Close a proposal (admin or proposer)
router.post('/proposals/:proposalId/close', authenticate, async (req: AuthRequest, res) => {
  try {
    // In a real app, you'd check permissions
    if (!req.params.proposalId) return res.status(400).json({ error: 'Proposal ID required' });
        if (!req.params.proposalId) return res.status(400).json({ error: 'Proposal ID required' });
    const status = await closeProposal(req.params.proposalId);
    res.json({ status });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
export default router;













