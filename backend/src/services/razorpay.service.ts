import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_SlC9oFgIO6E4iy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'luBbo7eVnVFJTHBuYAkzxIUk',
});

export const RazorpayService = {
  createOrder: async (amount: number, userId: string, currency: string = 'INR') => {
    const options = {
      amount: Math.round(amount * 100), // in paise or cents
      currency: currency,
      receipt: `rcpt_${userId.slice(-10)}_${Date.now()}`,
    };

    try {
      const order = await razorpay.orders.create(options);
      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      };
    } catch (error: any) {
      logger.error('Razorpay order creation failed', { userId, error });
      throw new Error('Razorpay Error: ' + (error.error?.description || error.message || JSON.stringify(error)));
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

  addCreditsAfterPayment: async (userId: string, amount: number, paymentId: string, currency: string = 'INR') => {
    // 1 USD = 100 credits, 1 INR = 1 credit
    const creditsToAdd = currency === 'USD' ? amount * 100 : amount;

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
            currency,
            amountPaid: amount
          },
        },
      });

      return balance;
    });
  }
};
