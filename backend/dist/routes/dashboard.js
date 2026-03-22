"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get dashboard statistics
router.get('/stats', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        // Parallel queries for performance
        const [agentCount, totalStaked, proposalCount, reviewCount, integrationCount, auditLogCount, consentCount, dataRequestCount, recentStakes, recentProposals, recentReviews] = await Promise.all([
            // Agents owned by user
            prisma_1.prisma.agents.count({ where: { ownerId: userId } }),
            // Total amount staked by user
            prisma_1.prisma.stakes.aggregate({
                where: { userId, status: 'active' },
                _sum: { amount: true }
            }).then(r => r._sum.amount || 0),
            // Proposals created by user
            prisma_1.prisma.proposals.count({ where: { createdById: userId } }),
            // Reviews written by user
            prisma_1.prisma.reviews.count({ where: { userId } }),
            // Integrations connected by user
            prisma_1.prisma.integrations.count({ where: { userId } }),
            // Audit logs for user's actions
            prisma_1.prisma.audit_logs.count({ where: { userId } }),
            // Consents set by user
            prisma_1.prisma.consents.count({ where: { userId } }),
            // Data requests made by user
            prisma_1.prisma.data_requests.count({ where: { userId } }),
            // Recent stakes (last 5)
            prisma_1.prisma.stakes.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: { agent: { select: { name: true } } }
            }),
            // Recent proposals (last 5)
            prisma_1.prisma.proposals.findMany({
                where: { createdById: userId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { id: true, title: true, status: true, createdAt: true }
            }),
            // Recent reviews (last 5)
            prisma_1.prisma.reviews.findMany({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});
exports.default = router;
