"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get all reviews (with agent and user)
router.get('/', async (req, res) => {
    try {
        const reviews = await prisma.reviews.findMany({
            include: {
                template: true,
                user: true,
                agents: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(reviews);
    }
    catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});
// Create a new review
router.post('/', async (req, res) => {
    const { agentId, rating, comment } = req.body;
    const userId = req.user.id;
    if (!agentId || !rating) {
        return res.status(400).json({ error: 'Agent ID and rating are required' });
    }
    try {
        // 1. Fetch the agent to ensure it exists and to find its template
        const agent = await prisma.agents.findUnique({
            where: { id: agentId },
            include: { templates: true }, // templates relation (one-to-many)
        });
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        // 2. Get the template associated with this agent (assume first one)
        const template = agent.templates?.[0];
        if (!template) {
            return res.status(404).json({ error: 'No template found for this agent' });
        }
        // 3. Check if user already reviewed this template (unique constraint on [userId, templateId])
        const existing = await prisma.reviews.findUnique({
            where: {
                userId_templateId: {
                    userId,
                    templateId: template.id,
                },
            },
        });
        if (existing) {
            return res.status(400).json({ error: 'You have already reviewed this agent (template)' });
        }
        // 4. Create the review
        const review = await prisma.reviews.create({
            data: {
                userId,
                templateId: template.id,
                agentsId: agentId, // link to the specific agent instance
                rating,
                comment,
            },
            include: { template: true, agents: true, user: true },
        });
        res.json(review);
    }
    catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Failed to create review' });
    }
});
exports.default = router;
