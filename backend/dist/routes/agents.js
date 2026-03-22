"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const webhookService_1 = require("../services/webhookService");
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
// Get all public agents (visible to everyone) – MUST be before /:id
router.get('/public', async (req, res) => {
    try {
        const publicAgents = await prisma_1.prisma.agents.findMany({
            where: { status: 'active' },
            select: {
                id: true,
                name: true,
                description: true,
                agentType: true,
                capabilities: true,
                system_prompt: true,
                model_provider: true,
                model_name: true,
                reputationScore: true,
                totalEarnings: true,
                ownerId: true,
            }
        });
        res.json(publicAgents);
    }
    catch (error) {
        console.error('Error fetching public agents:', error);
        res.status(500).json({ error: 'Failed to fetch public agents' });
    }
});
// Get all agents for authenticated user
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const agents = await prisma_1.prisma.agents.findMany({
            where: { ownerId: userId }
        });
        res.json(agents);
    }
    catch (error) {
        console.error('Error fetching agents:', error);
        res.status(500).json({ error: 'Failed to fetch agents' });
    }
});
// Get single agent
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const agent = await prisma_1.prisma.agents.findFirst({
            where: { id, ownerId: userId }
        });
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        res.json(agent);
    }
    catch (error) {
        console.error('Error fetching agent:', error);
        res.status(500).json({ error: 'Failed to fetch agent' });
    }
});
// Create new agent
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { name, description, capabilities, systemPrompt, modelProvider, modelName, status } = req.body;
        const userId = req.user.id;
        // Convert capabilities array to string if needed
        const capabilitiesStr = Array.isArray(capabilities) ? capabilities.join(', ') : capabilities;
        const agent = await prisma_1.prisma.agents.create({
            data: {
                name,
                description,
                capabilities: capabilitiesStr,
                system_prompt: systemPrompt,
                model_provider: modelProvider || 'ollama-local',
                model_name: modelName || 'llama2',
                status: status || 'inactive',
                agentType: 'CUSTOM',
                specialties: [],
                configuration: {},
                owner: { connect: { id: userId } }
            }
        });
        // Trigger webhook
        await (0, webhookService_1.triggerWebhooks)('agent.created', agent);
        res.status(201).json(agent);
    }
    catch (error) {
        console.error('Error creating agent:', error);
        res.status(500).json({ error: 'Failed to create agent' });
    }
});
// Update agent
router.put('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const existing = await prisma_1.prisma.agents.findFirst({
            where: { id, ownerId: userId }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Agent not found or not owned by you' });
        }
        const updated = await prisma_1.prisma.agents.update({
            where: { id },
            data: req.body
        });
        res.json(updated);
    }
    catch (error) {
        console.error('Error updating agent:', error);
        res.status(500).json({ error: 'Failed to update agent' });
    }
});
// Delete agent
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const existing = await prisma_1.prisma.agents.findFirst({
            where: { id, ownerId: userId }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Agent not found or not owned by you' });
        }
        await prisma_1.prisma.agents.delete({
            where: { id }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting agent:', error);
        res.status(500).json({ error: 'Failed to delete agent' });
    }
});
exports.default = router;
