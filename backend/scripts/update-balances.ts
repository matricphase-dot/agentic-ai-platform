import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to DB to airdrop tokens...');
  
  const balances = await prisma.balance.updateMany({
    where: {
      tokenBalance: {
        lt: 1000
      }
    },
    data: {
      tokenBalance: 1000,
      credits: 1000
    }
  });

  console.log(`Updated ${balances.count} users with 1000 tokens & credits!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
