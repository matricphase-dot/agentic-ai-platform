const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.users.findUnique({ where: { email: 'admin@example.com' } });
  if (!admin) {
    console.error('Admin user not found');
    return;
  }
  // Check if invite model exists
  if (!prisma.inviteCode) {
    console.error('InviteCode model not available in Prisma client. Run prisma generate first.');
    return;
  }
  const existing = await prisma.inviteCode.findUnique({ where: { code: 'INVITE123' } });
  if (!existing) {
    await prisma.inviteCode.create({
      data: {
        code: 'INVITE123',
        createdBy: admin.id,
      },
    });
    console.log('✅ Test invite code created: INVITE123');
  } else {
    console.log('ℹ️ Test invite code already exists.');
  }
}

main().finally(() => prisma.$disconnect());
