import express from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Send a message
router.post('/', authenticate, async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    const userId = (req as any).user.id;

    const senderAgent = await prisma.agents.findFirst({
      where: { id: senderId, ownerId: userId }
    });
    if (!senderAgent) return res.status(403).json({ error: 'Sender agent not owned by you' });

    const receiverAgent = await prisma.agents.findUnique({ where: { id: receiverId } });
    if (!receiverAgent) return res.status(404).json({ error: 'Receiver agent not found' });

    const message = await prisma.messages.create({
      data: {
        senderId,
        receiverId,
        content: JSON.stringify(content),
        status: 'sent'
      }
    });
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get messages for an agent
router.get('/:agentId', authenticate, async (req, res) => {
  try {
    const { agentId } = req.params;
    const userId = (req as any).user.id;

    const agent = await prisma.agents.findFirst({
      where: { id: agentId, ownerId: userId }
    });
    if (!agent) return res.status(403).json({ error: 'Agent not found' });

    const messages = await prisma.messages.findMany({
      where: { OR: [{ receiverId: agentId }, { senderId: agentId }] },
      orderBy: { createdAt: 'desc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get inbox
router.get('/inbox', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const userAgents = await prisma.agents.findMany({ where: { ownerId: userId }, select: { id: true } });
    const agentIds = userAgents.map(a => a.id);
    const messages = await prisma.messages.findMany({
      where: { receiverId: { in: agentIds } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inbox' });
  }
});

// Update message status
router.patch('/:messageId', authenticate, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;
    const userId = (req as any).user.id;

    const message = await prisma.messages.findFirst({
      where: { id: messageId, receiver: { ownerId: userId } }
    });
    if (!message) return res.status(404).json({ error: 'Message not found' });

    const updated = await prisma.messages.update({
      where: { id: messageId },
      data: { status, ...(status === 'delivered' ? { deliveredAt: new Date() } : {}) }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update message' });
  }
});

export default router;
