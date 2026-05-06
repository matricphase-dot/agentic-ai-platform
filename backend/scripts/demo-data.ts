import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function createDemoData() {
  console.log('Creating rich demo data...');

  const hash = await bcrypt.hash('Demo@1234', 12);

  // Create 10 demo users
  const users = [];
  const names = [
    'Sarah Chen', 'Marcus Johnson', 'Priya Patel', 'Alex Rodriguez',
    'Emma Wilson', 'David Kim', 'Lisa Thompson', 'Ryan O\'Brien',
    'Aisha Mohammed', 'Carlos Garcia'
  ];

  for (let i = 0; i < names.length; i++) {
    const email = `user${i+1}@agenticai.dev`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: names[i],
        passwordHash: hash,
        emailVerified: true,
      }
    });
    await prisma.balance.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        credits: Math.floor(Math.random() * 5000) + 500,
        tokenBalance: Math.floor(Math.random() * 2000) + 100,
      }
    });
    users.push(user);
  }
  console.log(`Created ${users.length} demo users`);

  // Create 10 diverse agents
  const agentData = [
    {
      name: 'LegalEagle AI',
      slug: 'legaleagle-ai',
      description: 'AI legal assistant that helps with contract review, legal research, and compliance checks. Trained on thousands of legal documents.',
      category: 'LEGAL',
      pricingModel: 'PER_INVOCATION',
      pricePerCall: 0.10,
      tags: ['legal', 'contracts', 'compliance'],
      invocations: 342, earnings: 34.20, rating: 4.6, stakers: 15, staked: 8500,
    },
    {
      name: 'MarketMind',
      slug: 'marketmind',
      description: 'Real-time market analysis agent. Analyzes trends, competitor data, and consumer sentiment to generate actionable marketing insights.',
      category: 'DATA_ANALYST',
      pricingModel: 'PER_INVOCATION',
      pricePerCall: 0.08,
      tags: ['marketing', 'analytics', 'market-research'],
      invocations: 891, earnings: 71.28, rating: 4.8, stakers: 23, staked: 12000,
    },
    {
      name: 'FinanceGuru',
      slug: 'financeguru',
      description: 'Personal finance advisor that analyzes spending patterns, suggests investment strategies, and helps with budgeting and financial planning.',
      category: 'FINANCE',
      pricingModel: 'FREE',
      pricePerCall: 0,
      tags: ['finance', 'investing', 'budgeting'],
      invocations: 2341, earnings: 0, rating: 4.5, stakers: 31, staked: 15000,
    },
    {
      name: 'DevOps Assistant',
      slug: 'devops-assistant',
      description: 'Expert DevOps agent for CI/CD pipelines, Docker configurations, Kubernetes deployments, and infrastructure-as-code.',
      category: 'CODE_ASSISTANT',
      pricingModel: 'PER_TOKEN',
      pricePerToken: 0.00008,
      tags: ['devops', 'docker', 'kubernetes', 'cicd'],
      invocations: 567, earnings: 45.36, rating: 4.9, stakers: 18, staked: 9800,
    },
    {
      name: 'ContentCreator Pro',
      slug: 'contentcreator-pro',
      description: 'AI content strategist that creates SEO-optimized blog posts, social media content, email campaigns, and marketing copy.',
      category: 'AUTOMATION',
      pricingModel: 'PER_INVOCATION',
      pricePerCall: 0.05,
      tags: ['content', 'seo', 'marketing', 'writing'],
      invocations: 1823, earnings: 91.15, rating: 4.7, stakers: 29, staked: 18000,
    },
  ];

  const alice = await prisma.user.findUnique({ where: { email: 'alice@agenticai.dev' }});
  if (!alice) { console.log('Alice not found - run reseed first'); return; }

  for (const data of agentData) {
    const existing = await prisma.agent.findUnique({ where: { slug: data.slug }});
    if (!existing) {
      const agent = await prisma.agent.create({
        data: {
          userId: alice.id,
          name: data.name,
          slug: data.slug,
          description: data.description,
          modelProvider: 'groq',
          modelName: 'llama3-8b-8192',
          systemPrompt: `You are ${data.name}, an expert AI assistant. Always provide helpful, accurate, and concise responses.`,
          category: data.category as any,
          pricingModel: data.pricingModel as any,
          pricePerCall: data.pricePerCall || 0,
          pricePerToken: data.pricePerToken || 0,
          isPublic: true,
          status: 'PUBLISHED',
          currentVersion: '1.0.0',
          tags: data.tags,
        }
      });

      await prisma.agentAnalytics.create({
        data: {
          agentId: agent.id,
          totalInvocations: data.invocations,
          successCount: Math.floor(data.invocations * 0.96),
          failureCount: Math.floor(data.invocations * 0.04),
          avgLatencyMs: Math.floor(Math.random() * 1500) + 500,
          totalEarnings: data.earnings,
          stakerCount: data.stakers,
          totalStaked: data.staked,
          avgRating: data.rating,
          reviewCount: Math.floor(data.stakers * 1.5),
        }
      });

      // Add stakes from random users
      for (let i = 0; i < Math.min(3, users.length); i++) {
        const stakeAmount = Math.floor(Math.random() * 500) + 100;
        await prisma.stake.create({
          data: {
            userId: users[i].id,
            agentId: agent.id,
            amount: stakeAmount,
            lockedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: 'ACTIVE',
          }
        }).catch(() => {});
      }

      // Add reviews
      for (let i = 0; i < 3; i++) {
        await prisma.review.create({
          data: {
            agentId: agent.id,
            userId: users[i].id,
            rating: Math.floor(Math.random() * 2) + 4,
            comment: [
              'Incredibly useful agent. Saves me hours every week.',
              'Best AI agent I have used. Highly recommend to everyone.',
              'Excellent results. The accuracy is impressive.',
              'Game changer for my workflow. Worth every credit.',
              'Outstanding quality. Will definitely use again.',
            ][i % 5],
          }
        }).catch(() => {});
      }

      console.log(`Created agent: ${data.name}`);
    }
  }

  // Create more governance proposals
  const proposalCount = await prisma.proposal.count();
  if (proposalCount < 15) {
    await prisma.proposal.create({
      data: {
        title: 'Add Hinglish Language Support',
        description: 'Enable agents to generate content in Hinglish to serve 500M+ Indian users.',
        type: 'FEATURE',
        proposerId: users[0].id,
        status: 'PASSED',
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        forVotes: 28900,
        againstVotes: 1100,
        abstainVotes: 2000,
      }
    }).catch(() => {});

    await prisma.proposal.create({
      data: {
        title: 'Increase Staker Reward from 30% to 35%',
        description: 'Proposal to increase staker rewards to attract more liquidity.',
        type: 'FEE_CHANGE',
        proposerId: users[1].id,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        forVotes: 8500,
        againstVotes: 4200,
        abstainVotes: 1200,
      }
    }).catch(() => {});
  }

  // Update stats
  const finalStats = await prisma.agent.count({ where: { isPublic: true }});
  const finalUsers = await prisma.user.count();
  const finalInvocations = await prisma.invocation.count();

  console.log('\n✅ Demo data created successfully');
  console.log(`📊 Platform stats: ${finalUsers} users, ${finalStats} public agents, ${finalInvocations} invocations`);
}

createDemoData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
