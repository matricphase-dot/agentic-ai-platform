import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const adminUser = await prisma.users.findUnique({ where: { email: 'admin@example.com' } });
  if (!adminUser) throw new Error('Admin user not found');

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7); // ends in 7 days

  await prisma.proposals.upsert({
    where: { id: 'proposal-1' },
    update: {},
    create: {
      id: 'proposal-1',
      title: 'Increase Agent Revenue Share',
      description: 'Should we increase the default revenue share for agents from 10% to 15%?',
      options: ['Yes', 'No', 'Abstain'],
      endDate,
      createdById: adminUser.id,
      status: 'active'
    }
  });

  await prisma.proposals.upsert({
    where: { id: 'proposal-2' },
    update: {},
    create: {
      id: 'proposal-2',
      title: 'Add New Staking Rewards Pool',
      description: 'Create a new rewards pool for long-term stakers.',
      options: ['Yes', 'No'],
      endDate,
      createdById: adminUser.id,
      status: 'active'
    }
  });

  console.log('Proposals seeded.');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
