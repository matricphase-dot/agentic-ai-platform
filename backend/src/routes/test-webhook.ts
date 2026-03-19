import express from 'express';
import { triggerWebhooks } from '../services/webhookService';

const router = express.Router();

// POST /api/test-webhook – manually trigger a test webhook
router.post('/', async (req, res) => {
  try {
    const { event, data } = req.body;
    if (!event) {
      return res.status(400).json({ error: 'event is required' });
    }
    await triggerWebhooks(event, data || { test: true });
    res.json({ message: 'Webhook triggered' });
  } catch (error) {
    console.error('Error in test webhook:', error);
    res.status(500).json({ error: 'Failed to trigger webhook' });
  }
});

export default router;
