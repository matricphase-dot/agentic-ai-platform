import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get all webhooks for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const webhooks = await prisma.webhook.findMany({
      where: { userId }
    });
    res.json(webhooks);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    res.status(500).json({ error: 'Failed to fetch webhooks' });
  }
});


// Create a new webhook
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { name, url, events, secret } = req.body;
    
    const webhook = await prisma.webhook.create({
      data: {
        name,
        url,
        events,
        secret,
        isActive: true,
        user: { connect: { id: userId } }
      }
    });
    res.status(201).json(webhook);
  } catch (error) {
    console.error('Error creating webhook:', error);
    res.status(500).json({ error: 'Failed to create webhook' });
  }
});

// Delete a webhook
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    await prisma.webhook.deleteMany({
      where: { id: id as string, userId }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({ error: 'Failed to delete webhook' });
  }
});
export default router;




