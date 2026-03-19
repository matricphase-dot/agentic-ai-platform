import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user!.id;

    // Parallel queries for performance
    const [
      agentCount,
      totalStaked,
      proposalCount,
      reviewCount,
      integrationCount,
      auditLogCount,
      consentCount,
      dataRequestCount,
      recentStakes,
      recentProposals,
      recentReviews
    ] = await Promise.all([
      // Agents owned by user
      (prisma as any).agents.count({ where: { ownerId: userId } }),

      // Total amount staked by user
      (prisma as any).stakes.aggregate({
        where: { userId, status: 'active' },
        _sum: { amount: true }
      }).then(r => r._sum.amount || 0),

      // Proposals created by user
      (prisma as any).proposals.count({ where: { createdById: userId } }),

      // Reviews written by user
      (prisma as any).reviews.count({ where: { userId } }),

      // Integrations connected by user
      (prisma as any).integrations.count({ where: { userId } }),

      // Audit logs for user's actions
      (prisma as any).audit_logs.count({ where: { userId } }),

      // Consents set by user
      (prisma as any).consents.count({ where: { userId } }),

      // Data requests made by user
      (prisma as any).data_requests.count({ where: { userId } }),

      // Recent stakes (last 5)
      (prisma as any).stakes.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { agent: { select: { name: true } } }
      }),

      // Recent proposals (last 5)
      (prisma as any).proposals.findMany({
        where: { createdById: userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, status: true, createdAt: true }
      }),

      // Recent reviews (last 5)
      (prisma as any).reviews.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { template: { select: { name: true } } }
      })
    ]);

    res.json({
      counts: {
        agents: agentCount,
        staked: totalStaked,
        proposals: proposalCount,
        reviews: reviewCount,
        integrations: integrationCount,
        auditLogs: auditLogCount,
        consents: consentCount,
        dataRequests: dataRequestCount
      },
      recent: {
        stakes: recentStakes,
        proposals: recentProposals,
        reviews: recentReviews
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;

