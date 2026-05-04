import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redis } from '../lib/redis';
import { logger } from '../lib/logger';

function getIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() 
    || req.socket.remoteAddress 
    || 'unknown'
  );
}

// Global IP limiter - prevents DDoS
export const globalLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:global',
  points: 200,        // 200 requests
  duration: 60,       // per minute
  blockDuration: 300, // block 5 min
});

// Public endpoints - generous but protected
const publicLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:public',
  points: 60,        // 60 requests
  duration: 60,      // per minute
  blockDuration: 60, // block 1 min if exceeded
});

// Auth endpoints - strict
const authLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:auth',
  points: 10,
  duration: 60,
  blockDuration: 300,
});

// Invocation endpoint - per API key
const invocationLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:invoke',
  points: 20,         // 20 invocations
  duration: 60,       // per minute
  blockDuration: 60,
});

export const globalRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await globalLimiter.consume(getIp(req));
    next();
  } catch {
    res.status(429).json({
      success: false,
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests. Please slow down.',
    });
  }
};

export const publicRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await publicLimiter.consume(getIp(req));
    next();
  } catch {
    res.status(429).json({
      success: false,
      message: 'Too many requests to public endpoints'
    });
  }
};

export const authRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authLimiter.consume(getIp(req));
    next();
  } catch {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please wait 5 minutes.'
    });
  }
};

export const invocationRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  const key = apiKey || getIp(req);

  try {
    await invocationLimiter.consume(key);
    next();
  } catch {
    res.status(429).json({
      success: false,
      message: 'Invocation rate limit exceeded'
    });
  }
};

// Keep old names for compatibility if needed, or update where used
export const marketplaceRateLimit = publicRateLimit;
export const statsRateLimit = publicRateLimit;
