import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL + 
          (process.env.DATABASE_URL?.includes('?') ? '&' : '?') + 
          'connection_limit=10&pool_timeout=20&connect_timeout=10',
      },
    },
  });

// Add connection retry logic for platform reliability
async function connectWithRetry(retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      logger.info("✅ Database connection established");
      return;
    } catch (err) {
      if (i === retries - 1) {
        logger.error("❌ Failed to connect to database after maximum retries");
      } else {
        logger.warn(`⚠️ Database connection failed. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

connectWithRetry();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
