import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import crypto from 'crypto';

const router = express.Router();

// Get all webhooks for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const webhooks = await (prisma as any).webhooks.findMany({
      where: { userId: (req as any).user!.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(webhooks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch webhooks' });
  }
});

// Create a new webhook
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, url, secret, events } = req.body;
    if (!name || !url || !events) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const webhook = await (prisma as any).webhooks.create({
      data: {
        name,
        url,
        secret,
        events,
        userId: (req as any).user!.id,
        isActive: true,
      }
    });
    res.status(201).json(webhook);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create webhook' });
  }
});

// Update a webhook
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, secret, events, isActive } = req.body;
    const webhook = await (prisma as any).webhooks.findUnique({ where: { id } });
    if (!webhook) return res.status(404).json({ error: 'Not found' });
    if (webhook.userId !== (req as any).user!.id) return res.status(403).json({ error: 'Not authorized' });
    const updated = await (prisma as any).webhooks.update({
      where: { id },
      data: { name, url, secret, events, isActive }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update webhook' });
  }
});

// Delete a webhook
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const webhook = await (prisma as any).webhooks.findUnique({ where: { id } });
    if (!webhook) return res.status(404).json({ error: 'Not found' });
    if (webhook.userId !== (req as any).user!.id) return res.status(403).json({ error: 'Not authorized' });
    await (prisma as any).webhooks.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete webhook' });
  }
});

// Test a webhook (simulate a ping)
router.post('/:id/test', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const webhook = await (prisma as any).webhooks.findUnique({ where: { id } });
    if (!webhook) return res.status(404).json({ error: 'Not found' });
    if (webhook.userId !== (req as any).user!.id) return res.status(403).json({ error: 'Not authorized' });

    const payload = { event: 'test', timestamp: new Date().toISOString() };
    const signature = webhook.secret
      ? crypto.createHmac('sha256', webhook.secret).update(JSON.stringify(payload)).digest('hex')
      : undefined;

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(signature && { 'X-Webhook-Signature': signature }),
      },
      body: JSON.stringify(payload),
    });

    res.json({ status: response.status, ok: response.ok });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Test failed' });
  }
});

export default router;

