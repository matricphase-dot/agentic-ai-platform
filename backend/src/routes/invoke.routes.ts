import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { apiKeyMiddleware, authMiddleware } from '../middleware/auth.middleware';
import { InvocationService } from '../services/invocation.service';
import { logger } from '../lib/logger';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redis } from '../lib/redis';
import { prisma } from '../lib/prisma';

const router = Router();

// Rate limit invocations: 10 per minute per API key/User
const invokeLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:invoke',
  points: 10,
  duration: 60,
});

const agentInvokeLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:agent',
  points: 20, // Default, but we'll override per consume
  duration: 60,
  blockDuration: 10, // smooth bursts
});

// POST /invoke/:agentId
// Accepts both cookie auth (sandbox) AND API key auth (programmatic)
router.post('/:agentId', async (req: Request, res: Response) => {
  const agentId = req.params.agentId;

  // Fetch Agent to check rate limits
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { maxInvocationsPerMinute: true },
  });

  if (!agent) {
    return res.status(404).json({ success: false, message: 'Agent not found' });
  }

  // Determine auth method
  const hasApiKey = !!req.headers['x-api-key'];
  const hasCookie = !!req.cookies?.jwt_token;

  if (!hasApiKey && !hasCookie) {
    return res.status(401).json({
      success: false,
      code: 'AUTH_REQUIRED',
      message: 'API key (X-API-Key header) or session required',
    });
  }

  // Apply appropriate auth
  const authFn = hasApiKey ? apiKeyMiddleware : authMiddleware;

  return new Promise<void>((resolve) => {
    authFn(req, res, async () => {
      try {
        const limitKey = req.user!.id;
        
        try {
          await Promise.all([
            invokeLimiter.consume(limitKey),
            agentInvokeLimiter.consume(agentId, 1, { points: agent.maxInvocationsPerMinute }),
          ]);
        } catch (rejRes: any) {
          const isAgentLimit = rejRes?.keyPrefix?.includes('rl:agent');
          
          if (isAgentLimit) {
            // Log throttled request for creator visibility
            await prisma.agentAnalytics.update({
              where: { agentId },
              data: { throttledRequests: { increment: 1 } }
            }).catch(e => logger.error('Failed to update throttledRequests', e));
          }

          res.status(429).json({
            success: false,
            code: isAgentLimit ? 'AGENT_RATE_LIMITED' : 'RATE_LIMIT_EXCEEDED',
            message: isAgentLimit
              ? 'This agent is receiving high traffic right now. Please retry in a few seconds.'
              : 'Too many invocations. Limit: 10/minute.',
            retryAfter: rejRes?.msBeforeNext ? Math.round(rejRes.msBeforeNext / 1000) : 10,
          });
          resolve();
          return;
        }

        // Validate input
        const inputSchema = z.object({}).passthrough();
        let input: Record<string, unknown>;
        
        try {
          input = inputSchema.parse(req.body);
        } catch {
          input = { message: req.body };
        }

        const result = await InvocationService.invoke({
          agentId,
          callerId: req.user!.id,
          callerApiKeyId: (req as any).apiKeyId,
          input,
          ipAddress: req.ip,
        });

        res.json({
          success: true,
          data: {
            invocationId: result.invocationId,
            output: result.output,
            errorMessage: result.errorMessage,
            latencyMs: result.latencyMs,
            tokensUsed: result.tokensUsed,
            cost: result.cost,
            status: result.status,
            provider: result.provider,
          },
        });

        resolve();
      } catch (error: any) {
        logger.error('Invocation failed', {
          route: `/invoke/${agentId}`,
          userId: req.user?.id,
          error,
        });

        const status = error.status || 500;
        const code = error.code || 'INVOCATION_FAILED';
        
        res.status(status).json({
          success: false,
          code,
          message: error.message || 'Invocation failed',
        });
        resolve();
      }
    });
  });
});

// GET /invoke/:agentId/logs — list recent invocations for this agent
router.get('/:agentId/logs', authMiddleware, async (req, res) => {
  try {
    const { page = '1', limit = '20', status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      agentId: req.params.agentId,
      userId: req.user!.id,
    };
    if (status) where.status = status;

    const [invocations, total] = await Promise.all([
      prisma.invocation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip,
        select: {
          id: true,
          status: true,
          latencyMs: true,
          tokensUsed: true,
          cost: true,
          errorMessage: true,
          createdAt: true,
          input: true,
          output: true,
        },
      }),
      prisma.invocation.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        invocations,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Get invocation logs failed', { error });
    return res.status(500).json({ 
      success: false, 
      code: 'FETCH_FAILED',
      message: 'Failed to fetch logs' 
    });
  }
});

export { router as invokeRouter };
