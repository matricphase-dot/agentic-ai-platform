import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { RazorpayService } from '../services/razorpay.service';

const router = Router();

// POST /api/webhooks/razorpay
router.post('/razorpay', async (req: Request, res: Response) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    logger.error('RAZORPAY_WEBHOOK_SECRET is not configured');
    return res.status(500).send('Webhook configuration error');
  }
  const signature = req.headers['x-razorpay-signature'] as string;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (expectedSignature !== signature) {
    return res.status(400).send('Invalid signature');
  }

  const event = req.body.event;
  if (event === 'payment.captured') {
    const payment = req.body.payload.payment.entity;
    const paymentId = payment.id;
    const userId = payment.notes.userId; // Assuming we pass userId in notes
    const amountINR = payment.amount / 100;

    // Idempotent check
    const existing = await prisma.transaction.findFirst({
      where: { metadata: { path: ['paymentId'], equals: paymentId } as any }
    });

    if (!existing && userId) {
      await RazorpayService.addCreditsAfterPayment(userId, amountINR, paymentId);
      logger.info('Razorpay webhook: credits added', { userId, paymentId });
    }
  }

  return res.status(200).send('OK');
});

// PayPal route removed as it was disabled in the frontend

export { router as billingWebhookRouter };
