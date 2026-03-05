import { Router } from 'express';
import { authenticate } from "../middleware/auth";
import prisma from '../lib/prisma';
import { generateQuantumKey, signMessage, verifySignature, encryptMessage, decryptMessage } from '../services/quantumCryptoService';
import { sendMessage, receiveMessages, tallyRound } from '../services/a2apService';

const router = Router();

// Generate quantum-resistant key pair for an agent
router.post('/keys', authenticate, async (req: AuthRequest, res) => {
  try {
    const { agentId } = req.body;
    if (!agentId) {
      return res.status(400).json({ error: 'agentId is required' });
    }

    // Check if agent exists and belongs to user
    const agent = await (prisma as any).agents.findFirst({
      where: { id: agentId, owner_id: req.user!.id }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Generate quantum key
    const keyPair = generateQuantumKey();
    
    // Store public key (private key should be stored encrypted in production)
    const key = await (prisma as any).quantum_keys.create({
      data: {
        agentId: agentId,
        public_key: keyPair.public_key
        // private_key is not stored in this example – it's returned to the client once
      }
    });

    res.json({ 
      id: key.id, 
      public_key: key.public_key, 
      private_key: keyPair.private_key, // Only returned once; client must store it securely
      algorithm: 'quantum-resistant' 
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get keys for an agent
router.get('/keys/:agentId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { agentId } = req.params;
    if (!agentId) {
      return res.status(400).json({ error: 'agentId is required' });
    }

    const key = await (prisma as any).quantum_keys.findUnique({
      where: { agentId: agentId }
    });

    if (!key) {
      return res.status(404).json({ error: 'No key found for this agent' });
    }

    // Check if agent belongs to user
    const agent = await (prisma as any).agents.findFirst({
      where: { id: agentId, owner_id: req.user!.id }
    });

    if (!agent) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(key);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Send A2AP message
router.post('/messages/send', authenticate, async (req: AuthRequest, res) => {
  try {
    const { fromAgentId, toAgentId, content } = req.body;
    if (!fromAgentId || !toAgentId || !content) {
      return res.status(400).json({ error: 'fromAgentId, toAgentId, and content are required' });
    }

    // Check if fromAgent belongs to user
    const fromAgent = await (prisma as any).agents.findFirst({
      where: { id: fromAgentId, owner_id: req.user!.id }
    });

    if (!fromAgent) {
      return res.status(404).json({ error: 'Source agent not found' });
    }

    // Get keys
    const fromKey = await (prisma as any).quantum_keys.findUnique({
      where: { agentId: fromAgentId }
    });
    const toKey = await (prisma as any).quantum_keys.findUnique({
      where: { agentId: toAgentId }
    });

    if (!fromKey || !toKey) {
      return res.status(400).json({ error: 'Both agents must have quantum keys' });
    }

    // Sign and send
    const signature = signMessage(content, fromKey.id); // In production, use actual private key
    const encrypted = encryptMessage(content, toKey.public_key);

    const message = await sendMessage(fromAgentId, toAgentId, encrypted);
    res.json(message);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get messages for an agent
router.get('/messages/:agentId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { agentId } = req.params;
    if (!agentId) {
      return res.status(400).json({ error: 'agentId is required' });
    }

    // Check if agent belongs to user
    const agent = await (prisma as any).agents.findFirst({
      where: { id: agentId, owner_id: req.user!.id }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const messages = await receiveMessages(agentId);
    res.json(messages);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Consensus round endpoints
router.post('/consensus/rounds', authenticate, async (req: AuthRequest, res) => {
  try {
    // Only admins or designated agents can create rounds – simplified check
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { round_number } = req.body;
    const round = await (prisma as any).consensus_rounds.create({
      data: {
        round_number: round_number || Math.floor(Math.random() * 1000000)
      }
    });
    res.json(round);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/consensus/vote', authenticate, async (req: AuthRequest, res) => {
  try {
    const { round_id, vote, weight } = req.body;
    const { agentId } = req.body; // agentId should be provided

    if (!round_id || !agentId || vote === undefined || !weight) {
      return res.status(400).json({ error: 'round_id, agentId, vote, weight required' });
    }

    // Check if agent belongs to user
    const agent = await (prisma as any).agents.findFirst({
      where: { id: agentId, owner_id: req.user!.id }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const consensusVote = await (prisma as any).consensus_votes.create({
      data: {
        round_id: round_id,
        agentId: agentId,
        vote,
        weight
      }
    });
    res.json(consensusVote);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/consensus/rounds/:round_id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { round_id } = req.params;
    if (!round_id) {
      return res.status(400).json({ error: 'round_id is required' });
    }

    const round = await (prisma as any).consensus_rounds.findUnique({
      where: { id: round_id },
      include: { votes: true }
    });

    if (!round) {
      return res.status(404).json({ error: 'Round not found' });
    }

    res.json(round);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/consensus/rounds/:round_id/tally', authenticate, async (req: AuthRequest, res) => {
  try {
    const { round_id } = req.params;
    if (!round_id) {
      return res.status(400).json({ error: 'round_id is required' });
    }

    // Only admins can tally
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const result = await tallyRound(round_id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;









