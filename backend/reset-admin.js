const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('admin123', 10);
  const admin = await prisma.users.upsert({
    where: { email: 'admin@example.com' },
    update: { passwordHash: hashed },
    create: {
      email: 'admin@example.com',
      passwordHash: hashed,
      name: 'Admin',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin ready: admin@example.com / admin123');
}

main().finally(() => prisma.$disconnect());
