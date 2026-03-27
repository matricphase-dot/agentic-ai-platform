"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.post('/', auth_1.authenticate, async (req, res) => {
    const { agentId, amount } = req.body;
    const userId = req.user.id;
    if (!agentId || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    // Check if agent exists
    const agent = await prisma.agents.findUnique({ where: { id: agentId } });
    if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
    }
    // For now, just a simple share percentage (could be based on total staked)
    const sharePercentage = 1.0; // placeholder
    try {
        const stake = await prisma.stakes.create({
            data: {
                amount: parseFloat(amount),
                sharePercentage,
                stakerId: userId,
                agentId,
            },
        });
        res.status(201).json(stake);
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'You already have a stake on this agent. Update existing stake? (not implemented yet)' });
        }
        console.error('Stake creation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/', auth_1.authenticate, async (req, res) => {
    const userId = req.user.id;
    const stakes = await prisma.stakes.findMany({
        where: { stakerId: userId },
        include: { agent: true },
    });
    res.json(stakes);
});
// Other routes (update, claim, etc.) could be added later
exports.default = router;
