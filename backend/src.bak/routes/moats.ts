import express from 'express';
import { sendMessage, receiveMessages } from '../services/a2apService';
import { startConsensusRound, castVote, tallyRound } from '../services/consensusService';
import { generateKeyPair } from '../services/quantumCrypto';
import { authenticate } from "../middleware/auth";
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Quantum key management
router.post('/keys/generate', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const { agentId, algorithm } = req.body;
    // Check agent ownership
    const agent = await (prisma as any).agents.findFirst({ where: { id: agentId, owner_id: req.user.id } });
    if (!agent) return res.status(403).json({ error: 'Agent not found or not yours' });

    const keyPair = await generateKeyPair(algorithm);
    const key = await (prisma as any).quantum_keys.create({ data: { 
        agentId,
        public_key: keyPair.public_key,
        private_key: keyPair.private_key, // In production, encrypt this!
        algorithm,
      },
    });
    res.json({ id: key.id, public_key: key.public_key, algorithm });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// A2AP Messaging
router.post('/messages', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const { fromAgentId, toAgentId, content } = req.body;
    // Verify both agents belong to the user? Possibly not – any agent can message any other.
    const message = await sendMessage(fromAgentId, toAgentId, content);
    res.json(message);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/messages/:agentId', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    // Check agent ownership
    const agent = await (prisma as any).agents.findFirst({ where: { id: req.params.agentId, owner_id: req.user.id } });
    if (!agent) return res.status(403).json({ error: 'Agent not yours' });

    const messages = await receiveMessages(req.params.agentId);
    res.json(messages);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Consensus
router.post('/consensus/start', authenticate, async (req: AuthRequest, res) => {
  try {
    const { topic, data } = req.body;
    const round = await startConsensusRound(topic, data);
    res.json(round);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/consensus/vote', authenticate, async (req: AuthRequest, res) => {
  try {
    const { round_id, voterId, vote, weight } = req.body;
    const result = await castVote(round_id, voterId, vote, weight);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/consensus/tally/:round_id', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await tallyRound(req.params.round_id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;













