import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: '\\\$...'  // Replace with a bcrypt hash of your password
    }
  })
  console.log('Seeded:', user)
}
main().catch(console.error).finally(() => prisma.\())
