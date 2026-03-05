import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalFor(prisma as any).prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalFor(prisma as any).prisma = prisma;

export default prisma;









