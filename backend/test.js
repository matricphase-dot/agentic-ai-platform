const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.$connect();
    console.log('✅ Database reachable');
  } catch (e) {
    console.error('❌ Database connection failed:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
