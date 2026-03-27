"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all webhooks for current user
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const webhooks = await prisma_1.prisma.webhook.findMany({
            where: { userId }
        });
        res.json(webhooks);
    }
    catch (error) {
        console.error('Error fetching webhooks:', error);
        res.status(500).json({ error: 'Failed to fetch webhooks' });
    }
});
// Create a new webhook
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, url, events, secret } = req.body;
        const webhook = await prisma_1.prisma.webhook.create({
            data: {
                name,
                url,
                events,
                secret,
                isActive: true,
                user: { connect: { id: userId } }
            }
        });
        res.status(201).json(webhook);
    }
    catch (error) {
        console.error('Error creating webhook:', error);
        res.status(500).json({ error: 'Failed to create webhook' });
    }
});
// Delete a webhook
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        await prisma_1.prisma.webhook.deleteMany({
            where: { id: id, userId }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting webhook:', error);
        res.status(500).json({ error: 'Failed to delete webhook' });
    }
});
exports.default = router;
