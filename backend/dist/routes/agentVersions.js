"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all versions for an agent
router.get('/agent/:agentId', async (req, res) => {
    try {
        const { agentId } = req.params;
        const versions = await prisma_1.prisma.agentVersion.findMany({
            where: { agentId },
            orderBy: { versionNumber: 'desc' }
        });
        res.json(versions);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch versions' });
    }
});
// Get a specific version
router.get('/:versionId', async (req, res) => {
    try {
        const { versionId } = req.params;
        const version = await prisma_1.prisma.agentVersion.findUnique({
            where: { id: versionId }
        });
        if (!version)
            return res.status(404).json({ error: 'Version not found' });
        res.json(version);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch version' });
    }
});
// Create a new version (automatically happens when agent is updated, but we can provide manual endpoint)
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { agentId, data, description } = req.body;
        // Get the latest version number for this agent
        const lastVersion = await prisma_1.prisma.agentVersion.findFirst({
            where: { agentId },
            orderBy: { versionNumber: 'desc' }
        });
        const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;
        const version = await prisma_1.prisma.agentVersion.create({
            data: {
                agentId,
                versionNumber,
                data,
                description,
                createdById: req.user.id
            }
        });
        res.status(201).json(version);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create version' });
    }
});
// Restore a version (copy its data to the current agent)
router.post('/:versionId/restore', auth_1.authenticate, async (req, res) => {
    try {
        const { versionId } = req.params;
        const version = await prisma_1.prisma.agentVersion.findUnique({
            where: { id: versionId },
            include: { agent: true }
        });
        if (!version)
            return res.status(404).json({ error: 'Version not found' });
        // Ensure the user owns the agent
        if (version.agent.ownerId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        // Update the agent with version data
        const updated = await prisma_1.prisma.agents.update({
            where: { id: version.agentId },
            data: version.data
        });
        // Optionally create a new version snapshot of the current state before overwriting?
        // For simplicity, we'll just return success.
        res.json({ message: 'Agent restored to version', versionNumber: version.versionNumber });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to restore version' });
    }
});
exports.default = router;
