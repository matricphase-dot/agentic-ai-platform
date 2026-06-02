import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'ATzN4HypBBqHLV-gTUdguwwmoeejltZ8dmm-SJN-HrGymtsKdul2oaoYF8z8fOkdDkYHap-DQy00qUt1';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'EE5mDYyD2yZ9eYzH5UWfMMmAwHEJXWepAwMwosoTohhepNL3jobgJedG8TRujNRY78vl0FwFzWAAalnT';
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';

const BASE_URL = PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json() as any;
  return data.access_token;
}

export const PaypalService = {
  createOrder: async (amountUSD: number, userId: string) => {
    try {
      const accessToken = await getAccessToken();
      const response = await fetch(`${BASE_URL}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: 'USD',
              value: amountUSD.toString(),
            },
            description: `Credit Top-up for ${userId}`,
          }],
        }),
      });

      const order = await response.json() as any;
      const approveUrl = order.links.find((l: any) => l.rel === 'approve')?.href;

      return {
        orderId: order.id,
        approveUrl,
      };
    } catch (error) {
      logger.error('PayPal order creation failed', { userId, error });
      throw new Error('Failed to create PayPal order');
    }
  },

  captureOrder: async (orderId: string, userId: string) => {
    try {
      const accessToken = await getAccessToken();
      const response = await fetch(`${BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json() as any;
      if (data.status !== 'COMPLETED') {
        throw new Error(`PayPal payment not completed: ${data.status}`);
      }

      const amountUSD = parseFloat(data.purchase_units[0].payments.captures[0].amount.value);
      const creditsToAdd = amountUSD * 100; // 1 USD = 100 credits

      const balance = await prisma.$transaction(async (tx) => {
        const updated = await tx.balance.upsert({
          where: { userId },
          create: { userId, credits: creditsToAdd },
          update: { credits: { increment: creditsToAdd } },
        });

        await tx.transaction.create({
          data: {
            userId,
            type: 'TOPUP',
            amount: creditsToAdd,
            description: `PayPal payment ${orderId}`,
            metadata: { 
              orderId, 
              gateway: 'paypal',
              currency: 'USD',
              amountPaid: amountUSD
            },
          },
        });

        return updated;
      });

      return {
        success: true,
        credits: creditsToAdd,
        balance: balance.credits,
      };
    } catch (error) {
      logger.error('PayPal capture failed', { userId, orderId, error });
      throw new Error('Failed to capture PayPal order');
    }
  }
};
