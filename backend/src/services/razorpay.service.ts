import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder',
});

export const RazorpayService = {
  createOrder: async (amountINR: number, userId: string) => {
    const options = {
      amount: Math.round(amountINR * 100), // in paise
      currency: "INR",
      receipt: `receipt_${userId}_${Date.now()}`,
    };

    try {
      const order = await razorpay.orders.create(options);
      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      };
    } catch (error) {
      logger.error('Razorpay order creation failed', { userId, error });
      throw new Error('Failed to create Razorpay order');
    }
  },

  verifyPayment: (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): boolean => {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return false;

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === razorpaySignature;
  },

  addCreditsAfterPayment: async (userId: string, amountINR: number, paymentId: string) => {
    const creditsToAdd = amountINR; // 1 INR = 1 credit

    return await prisma.$transaction(async (tx) => {
      // 1. Update balance
      const balance = await tx.balance.upsert({
        where: { userId },
        create: { userId, credits: creditsToAdd },
        update: { credits: { increment: creditsToAdd } },
      });

      // 2. Create transaction record
      await tx.transaction.create({
        data: {
          userId,
          type: 'TOPUP',
          amount: creditsToAdd,
          description: `Razorpay payment ${paymentId}`,
          metadata: { 
            paymentId, 
            gateway: 'razorpay',
            currency: 'INR',
            amountPaid: amountINR
          },
        },
      });

      return balance;
    });
  }
};
