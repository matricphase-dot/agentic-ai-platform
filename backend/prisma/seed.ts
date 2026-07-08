import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Synchronizing database tables and migrations...');
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  } catch (err: any) {
    console.warn('Note: prisma migrate deploy warning:', err.message || err);
  }

  console.log('🚀 Starting database seed...');

  const passwordHash = await bcrypt.hash('Demo@1234', 12);

  // --- 1. USERS ---
  console.log('👥 Creating users...');
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@agenticai.dev' },
    update: {},
    create: {
      email: 'demo@agenticai.dev',
      name: 'Demo User',
      role: 'ADMIN',
      emailVerified: true,
      passwordHash,
      balance: {
        create: {
          credits: 1000.00,
          tokenBalance: 500.00
        }
      }
    }
  });

  const alice = await prisma.user.upsert({
    where: { email: 'alice@agenticai.dev' },
    update: {},
    create: {
      id: 'alice-fixed-id-123',
      email: 'alice@agenticai.dev',
      name: 'Alice Chen',
      role: 'USER',
      emailVerified: true,
      passwordHash,
      balance: {
        create: {
          credits: 1000.00,
          tokenBalance: 500.00
        }
      }
    }
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@agenticai.dev' },
    update: {},
    create: {
      id: 'bob-fixed-id-456',
      email: 'bob@agenticai.dev',
      name: 'Bob Patel',
      role: 'USER',
      emailVerified: true,
      passwordHash,
      balance: {
        create: {
          credits: 1000.00,
          tokenBalance: 500.00
        }
      }
    }
  });

  // --- 2. AGENTS ---
  console.log('🤖 Creating agents...');
  
  const agent1 = await prisma.agent.upsert({
    where: { slug: 'datamind-pro' },
    update: {},
    create: {
      userId: alice.id,
      name: 'DataMind Pro',
      slug: 'datamind-pro',
      description: 'Advanced data analysis agent that processes CSV, JSON, and database outputs to generate actionable business insights.',
      modelProvider: 'groq',
      modelName: 'llama3-8b-8192',
      systemPrompt: 'You are DataMind, an expert data analyst.',
      category: 'DATA_ANALYST',
      pricingModel: 'PER_INVOCATION',
      pricePerCall: 0.05,
      isPublic: true,
      status: 'PUBLISHED',
      currentVersion: '1.2.0',
      tags: JSON.stringify(['data', 'analytics', 'insights']),
      analytics: {
        create: {
          totalInvocations: 1247,
          successCount: 1198,
          failureCount: 49,
          avgLatencyMs: 1823,
          totalEarnings: 62.35,
          stakerCount: 8,
          totalStaked: 4200.0
        }
      }
    }
  });

  console.log('✨ Database seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
