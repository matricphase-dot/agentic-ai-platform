
import bcrypt from 'bcryptjs';
import prisma from './lib/prisma';

async function main() {
  console.log('?? Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 12);

  // ? SAFE: Check existence first, then create (no transaction needed)
  let admin = await prisma.users.findUnique({
    where: { email: 'admin@agentic.ai' },
  });

  if (!admin) {
    admin = await prisma.users.create({ data: { 
        email: 'admin@agentic.ai',
        passwordHash: adminPassword,
        name: 'Admin User',
        role: 'ADMIN',
        balance: 10000,
        reputation_score: 2000,
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
      agent_type: agent_type.MARKETING,
      hourly_rate: 75,
      success_rate: 0.99,
      specialties: ['marketing', 'advertising', 'social_media'],
      owner_id: admin.id,
      reputation_score: 1950,
    },
    {
      name: 'Code Architect X',
      description: 'Full-stack development agent',
      agent_type: agent_type.CODING,
      hourly_rate: 100,
      success_rate: 0.95,
      specialties: ['coding', 'web_dev', 'api_integration'],
      owner_id: admin.id,
      reputation_score: 1850,
    },
    {
      name: 'Market Research Expert',
      description: 'Deep market analysis',
      agent_type: agent_type.RESEARCH,
      hourly_rate: 60,
      success_rate: 0.92,
      specialties: ['research', 'analysis', 'trends'],
      owner_id: admin.id,
      reputation_score: 1750,
    },
  ];

  for (const agent of agents) {
    const exists = await prisma.agents.findFirst({ where: { name: agent.name } });
    if (!exists) {
      await prisma.agents.create({ data: agent });
      console.log(`?? Agent ${agent.name} created.`);
    } else {
      console.log(`?? Agent ${agent.name} already exists, skipping.`);
    }
  }

  // Business
  const businessExists = await prisma.businesses.findFirst({
    where: { name: 'AI Fashion Store' },
  });
  if (!businessExists) {
    await prisma.businesses.create({ data: { 
        name: 'AI Fashion Store',
        description: 'Autonomous e-commerce for sustainable fashion',
        business_type: 'ECOMMERCE',
        owner_id: admin.id,
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












