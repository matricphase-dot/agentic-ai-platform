"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const stakingService_1 = require("../services/stakingService");
const router = express_1.default.Router();
// Get user's stakes
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const stakes = await prisma_1.prisma.stakes.findMany({
            where: { stakerId: userId },
            include: { agent: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(stakes);
    }
    catch (error) {
        console.error('Error fetching stakes:', error);
        res.status(500).json({ error: 'Failed to fetch stakes' });
    }
});
// Get single stake
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const stake = await prisma_1.prisma.stakes.findFirst({
            where: { id, stakerId: userId },
            include: { agent: true }
        });
        if (!stake) {
            return res.status(404).json({ error: 'Stake not found' });
        }
        res.json(stake);
    }
    catch (error) {
        console.error('Error fetching stake:', error);
        res.status(500).json({ error: 'Failed to fetch stake' });
    }
});
// Create a stake
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { agentId, amount, sharePercentage } = req.body;
        const userId = req.user.id;
        // Verify agent exists
        const agent = await prisma_1.prisma.agents.findFirst({
            where: { id: agentId, ownerId: userId }
        });
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found or not owned by you' });
        }
        const stake = await prisma_1.prisma.stakes.create({
            data: {
                amount,
                sharePercentage: sharePercentage || 0,
                staker: { connect: { id: userId } },
                agent: { connect: { id: agentId } }
            }
        });
        res.status(201).json(stake);
    }
    catch (error) {
        console.error('Error creating stake:', error);
        res.status(500).json({ error: 'Failed to create stake' });
    }
});
// Claim rewards for a stake
router.post('/:id/claim', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const stake = await prisma_1.prisma.stakes.findFirst({
            where: { id, stakerId: userId },
            include: { agent: true }
        });
        if (!stake) {
            return res.status(404).json({ error: 'Stake not found' });
        }
        // Simple reward calculation – you can adjust this logic
        const rate = (0, stakingService_1.calculateRewardRate)(stake.agent);
        const rewardAmount = stake.amount * rate;
        // Create reward record
        const reward = await prisma_1.prisma.reward.create({
            data: {
                stake: { connect: { id: stake.id } },
                amount: rewardAmount
            }
        });
        // Update stake total returns
        await prisma_1.prisma.stakes.update({
            where: { id: stake.id },
            data: { totalReturns: { increment: rewardAmount } }
        });
        res.json(reward);
    }
    catch (error) {
        console.error('Error claiming reward:', error);
        res.status(500).json({ error: 'Failed to claim reward' });
    }
});
exports.default = router;
