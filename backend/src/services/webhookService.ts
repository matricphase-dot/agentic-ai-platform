import axios from 'axios';
import { prisma } from '../lib/prisma';

interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
}

export async function triggerWebhooks(event: string, data: any) {
  try {
    // Fetch all active webhooks (we'll filter events in JS since SQLite JSON filtering is limited)
    const webhooks = await prisma.webhook.findMany({
      where: { isActive: true },
    });

    // Filter those that include the event
    const matching = webhooks.filter(wh => {
      const events = wh.events as string[]; // assume it's stored as JSON array
      return Array.isArray(events) && events.includes(event);
    });

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    matching.forEach(webhook => {
      const headers: any = { 'Content-Type': 'application/json' };
      if (webhook.secret) {
        headers['X-Webhook-Secret'] = webhook.secret;
      }

      axios.post(webhook.url, payload, { headers })
        .then(() => console.log(`Webhook sent to ${webhook.url}`))
        .catch(err => console.error(`Webhook failed for ${webhook.url}:`, err.message));
    });
  } catch (error) {
    console.error('Error triggering webhooks:', error);
  }
}
