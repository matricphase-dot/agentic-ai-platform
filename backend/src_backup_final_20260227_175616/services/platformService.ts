import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Simple encryption for credentials (use a proper encryption method in production)
const ENCRYPTION_KEY = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY || 'your-encryption-key-32-chars-long!!').digest();
const ALGORITHM = 'aes-256-cbc';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  const parts = text.split(':');
  if (parts.length !== 2) throw new Error('Invalid encrypted format');
  const ivHex = parts[0];
  const encrypted = parts[1];
  if (!ivHex || !encrypted) throw new Error('Invalid encrypted format');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export async function addPlatformConnection(
  userId: string,
  platform: string,
  credentials: any
) {
  const encrypted = encrypt(JSON.stringify(credentials));
  return (prisma as any).platform_connections.upsert({
    where: {
      user_id_platform: {
        userId,
        platform,
      },
    },
    update: {
      credentials: encrypted,
      status: 'active',
    },
    create: {
      userId,
      platform,
      credentials: encrypted,
      status: 'active',
    },
  });
}

export async function getPlatformConnections(userId: string) {
  try {
    console.log(`Fetching connections for user ${userId}`);
    const connections = await (prisma as any).platform_connections.findMany({
      where: { userId },
      include: { deployments: true },
    });
    console.log(`Found ${connections.length} connections`);
    // Return without credentials for security
    return connections.map(({ credentials, ...rest }: { credentials: any }) => rest);
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error in getPlatformConnections:', error);
    throw error;
  }
}

export async function getPlatformConnection(id: string, userId?: string) {
  const where: any = { id };
  if (userId) where.userId = userId;
  const conn = await (prisma as any).platform_connections.findUnique({ where });
  if (!conn) return null;
  // Decrypt credentials
  const credentials = JSON.parse(decrypt(conn.credentials as string));
  return { ...conn, credentials };
}

export async function revokePlatformConnection(id: string, userId: string) {
  return (prisma as any).platform_connections.update({
    where: { id, userId },
    data: { status: 'revoked' },
  });
}

export async function deployAgent(
  agentId: string,
  platform_id: string,
  config: any
) {
  // Here you would actually call the external platform's API to deploy the agent.
  // For now, we just record the deployment.
  return (prisma as any).deployments.create({ data: { 
      agentId,
      platform_id,
      config,
      status: 'running', // assume success for demo
    },
  });
}

export async function recordRevenue(deployment_id: string, amount: number, description?: string) {
  // Record revenue log
  const log = await (prisma as any).revenue_logs.create({ data: { 
      deployment_id,
      amount,
      description: description || null, // convert undefined to null
      settled: true, // assume settled immediately for demo
    },
  });

  // Update deployment total revenue
// @ts-ignore
  await (prisma as any).deployments.update({
    where: { id: deployment_id },
    data: { revenue: { increment: amount } },
  });

  // Find the user who owns the agent and credit tokens (1 $AGENT per 1 USD, or custom rate)
  const deployment = await (prisma as any).deployments.findUnique({
    where: { id: deployment_id },
    include: { agents: true },
  });
  if (deployment?.agent?.owner_id) {
// @ts-ignore
    await (prisma as any).users.update({
      where: { id: deployment.agent.owner_id },
      data: { token_balance: { increment: amount } }, // 1:1 for simplicity
    });

// @ts-ignore
    await (prisma as any).token_transactions.create({ data: { 
        to_user_id: deployment.agent.owner_id,
        amount,
        type: 'revenue',
        
      },
    });
  }

  return log;
}
























