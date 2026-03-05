
import bcrypt from 'bcryptjs';
import prisma from './lib/prisma';

async function main() {
  console.log('?? Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 12);

  // ? SAFE: Check existence first, then create (no transaction needed)
  let admin = await (prisma as any).users.findUnique({
    where: { email: 'admin@agentic.ai' },
  });

  if (!admin) {
    admin = await (prisma as any).users.create({ data: { 
        email: 'admin@agentic.ai',
        passwordHash: adminPassword,
        name: 'Admin User',
        role: 'ADMIN',
        balance: 10000,
        reputationScore: 2000,
      },
    });
    console.log('?? Admin user created.');
  } else {
    console.log('?? Admin user already exists, skipping.');
  }

  // Agents – same safe pattern
  const agents = [
    {
      name: 'Marketing Pro 5000',
      description: 'AI marketing specialist with 99% success rate',
      agentType: "MARKETING",
      hourlyRate: 75,
      successRate: 0.99,
      owner: { connect: { id: admin.id } },
      reputationScore: 1950,
    },
    {
      name: 'Code Architect X',
      description: 'Full-stack development agent',
      agentType: "CODING",
      hourlyRate: 100,
      successRate: 0.95,
      owner: { connect: { id: admin.id } },
      reputationScore: 1850,
    },
    {
      name: 'Market Research Expert',
      description: 'Deep market analysis',
      agentType: "RESEARCH",
      hourlyRate: 60,
      successRate: 0.92,
      owner: { connect: { id: admin.id } },
      reputationScore: 1750,
    },
  ];

  for (const agent of agents) {
    const exists = await (prisma as any).agents.findFirst({ where: { name: agent.name } });
    if (!exists) {
// @ts-ignore
      await (prisma as any).agents.create({ data: agent });
      console.log(`?? Agent ${agent.name} created.`);
    } else {
      console.log(`?? Agent ${agent.name} already exists, skipping.`);
    }
  }

  // Business
  const businessExists = await (prisma as any).businesses.findFirst({
    where: { name: 'AI Fashion Store' },
  });
  if (!businessExists) {
// @ts-ignore
    await (prisma as any).businesses.create({ data: { 
        name: 'AI Fashion Store',
        description: 'Autonomous e-commerce for sustainable fashion',
        businessType: 'ECOMMERCE',
        owner: { connect: { id: admin.id } },
        revenue: 5000,
        profit: 1500,
        monthly_recurring_revenue: 1200,
      },
    });
    console.log('?? Demo business created.');
  }

  console.log('? Seeding complete');
}

main()
  .catch((e) => {
    console.error('? Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());




















