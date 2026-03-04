import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from "../middleware/auth";
import { queueMessageForProcessing } from '../services/messageProcessor';

const router = Router();
const prisma = new PrismaClient();

// Send a message
router.post('/', authenticate, async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    if (!senderId) return res.status(400).json({ error: 'senderId required' });

    // Verify sender belongs to user
    const sender = await (prisma as any).agents.findFirst({
      where: { id: senderId, owner_id: (req as any).user!.id }
    });
    if (!sender) return res.status(403).json({ error: 'Not your agent' });

    const message = await (prisma as any).message.create({
      data: {
        senderId,
        receiverId,
        content: JSON.stringify(content),
        status: 'sent'
      }
    });
    queueMessageForProcessing(message.id);
    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get messages for an agent (inbox)
router.get('/inbox/:agentId', authenticate, async (req, res) => {
  try {
    const agentId = req.params.agentId as string;
    const agent = await (prisma as any).agents.findFirst({
      where: { id: agentId, owner_id: (req as any).user!.id }
    });
    if (!agent) return res.status(403).json({ error: 'Not your agent' });

    const messages = await (prisma as any).message.findMany({
      where: { receiverId: agentId },
      orderBy: { created_at: 'desc' },
      include: { sender: { select: { name: true } } }
    });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Mark message as read/delivered
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const messageId = req.params.id as string;
    const message = await (prisma as any).message.findFirst({
      where: { id: messageId, receiver: { owner_id: (req as any).user!.id } }
    });
    if (!message) return res.status(404).json({ error: 'Message not found' });

    const updated = await (prisma as any).message.update({
      where: { id: messageId },
      data: {
        status,
        ...(status === 'delivered' ? { deliveredAt: new Date() } : {})
      }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

export default router;









