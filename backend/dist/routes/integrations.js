"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all available connectors
router.get('/connectors', async (req, res) => {
    try {
        const connectors = await prisma_1.prisma.connector.findMany({
            where: { isEnabled: true },
            orderBy: { name: 'asc' }
        });
        res.json(connectors);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch connectors' });
    }
});
// Get user's integrations
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const integrations = await prisma_1.prisma.integration.findMany({
            where: { userId: req.user.id },
            include: { connector: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(integrations);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch integrations' });
    }
});
// Create a new integration (connect a connector)
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { connectorId, name, config } = req.body;
        if (!connectorId)
            return res.status(400).json({ error: 'connectorId required' });
        const connector = await prisma_1.prisma.connector.findUnique({ where: { id: connectorId } });
        if (!connector)
            return res.status(404).json({ error: 'Connector not found' });
        // Check if already exists
        const existing = await prisma_1.prisma.integration.findUnique({
            where: {
                userId_connectorId: {
                    userId: req.user.id,
                    connectorId
                }
            }
        });
        if (existing)
            return res.status(400).json({ error: 'Integration already exists for this connector' });
        const integration = await prisma_1.prisma.integration.create({
            data: {
                userId: req.user.id,
                connectorId,
                name: name || connector.name,
                config: config || {},
                status: 'active'
            },
            include: { connector: true }
        });
        res.status(201).json(integration);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create integration' });
    }
});
// Update an integration (e.g., change config, disable)
router.put('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, config, status } = req.body;
        const integration = await prisma_1.prisma.integration.findFirst({
            where: { id, userId: req.user.id }
        });
        if (!integration)
            return res.status(404).json({ error: 'Integration not found' });
        const updated = await prisma_1.prisma.integration.update({
            where: { id },
            data: {
                name,
                config,
                status,
                updatedAt: new Date()
            },
            include: { connector: true }
        });
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update integration' });
    }
});
// Delete an integration (disconnect)
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const integration = await prisma_1.prisma.integration.findFirst({
            where: { id, userId: req.user.id }
        });
        if (!integration)
            return res.status(404).json({ error: 'Integration not found' });
        await prisma_1.prisma.integration.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete integration' });
    }
});
exports.default = router;
