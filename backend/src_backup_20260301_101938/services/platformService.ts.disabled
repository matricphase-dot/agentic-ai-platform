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
  user_id: string,
  platform: string,
  credentials: any
) {
  const encrypted = encrypt(JSON.stringify(credentials));
  return prisma.platform_connections.upsert({
    where: {
      user_id_platform: {
        user_id,
        platform,
      },
    },
    update: {
      credentials: encrypted,
      status: 'active',
    },
    create: {
      user_id,
      platform,
      credentials: encrypted,
      status: 'active',
    },
  });
}

export async function getPlatformConnections(user_id: string) {
  try {
    console.log(`Fetching connections for user ${user_id}`);
    const connections = await prisma.platform_connections.findMany({
      where: { user_id },
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

export async function getPlatformConnection(id: string, user_id?: string) {
  const where: any = { id };
  if (user_id) where.user_id = user_id;
  const conn = await prisma.platform_connections.findUnique({ where });
  if (!conn) return null;
  // Decrypt credentials
  const credentials = JSON.parse(decrypt(conn.credentials as string));
  return { ...conn, credentials };
}

export async function revokePlatformConnection(id: string, user_id: string) {
  return prisma.platform_connections.update({
    where: { id, user_id },
    data: { status: 'revoked' },
  });
}

export async function deployAgent(
  agent_id: string,
  platform_id: string,
  config: any
) {
  // Here you would actually call the external platform's API to deploy the agent.
  // For now, we just record the deployment.
  return prisma.deployments.create({ data: { 
      agent_id,
      platform_id,
      config,
      status: 'running', // assume success for demo
    },
  });
}

export async function recordRevenue(deployment_id: string, amount: number, description?: string) {
  // Record revenue log
  const log = await prisma.revenue_logs.create({ data: { 
      deployment_id,
      amount,
      description: description || null, // convert undefined to null
      settled: true, // assume settled immediately for demo
    },
  });

  // Update deployment total revenue
  await prisma.deployments.update({
    where: { id: deployment_id },
    data: { revenue: { increment: amount } },
  });

  // Find the user who owns the agent and credit tokens (1 $AGENT per 1 USD, or custom rate)
  const deployment = await prisma.deployments.findUnique({
    where: { id: deployment_id },
    include: { agent: true },
  });
  if (deployment?.agent?.owner_id) {
    await prisma.users.update({
      where: { id: deployment.agent.owner_id },
      data: { token_balance: { increment: amount } }, // 1:1 for simplicity
    });

    await prisma.token_transactions.create({ data: { 
        to_user_id: deployment.agent.owner_id,
        amount,
        type: 'revenue',
        
      },
    });
  }

  return log;
}


















