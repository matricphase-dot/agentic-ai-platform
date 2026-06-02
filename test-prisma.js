const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const user = await prisma.user.findUnique({ where: { email: 'demo@agenticai.dev' } });
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }
    console.log('User found:', user);
  } catch (error) {
    console.error('CAUGHT ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}
test();
