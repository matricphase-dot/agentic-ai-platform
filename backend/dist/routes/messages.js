"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
// Send a message
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { senderId, receiverId, content } = req.body;
        const userId = req.user.id;
        const senderAgent = await prisma_1.prisma.agents.findFirst({
            where: { id: senderId, ownerId: userId }
        });
        if (!senderAgent)
            return res.status(403).json({ error: 'Sender agent not owned by you' });
        const receiverAgent = await prisma_1.prisma.agents.findUnique({ where: { id: receiverId } });
        if (!receiverAgent)
            return res.status(404).json({ error: 'Receiver agent not found' });
        const message = await prisma_1.prisma.messages.create({
            data: {
                senderId,
                receiverId,
                content: JSON.stringify(content),
                status: 'sent'
            }
        });
        res.json(message);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});
// Get messages for an agent
router.get('/:agentId', auth_1.authenticate, async (req, res) => {
    try {
        const { agentId } = req.params;
        const userId = req.user.id;
        const agent = await prisma_1.prisma.agents.findFirst({
            where: { id: agentId, ownerId: userId }
        });
        if (!agent)
            return res.status(403).json({ error: 'Agent not found' });
        const messages = await prisma_1.prisma.messages.findMany({
            where: { OR: [{ receiverId: agentId }, { senderId: agentId }] },
            orderBy: { createdAt: 'desc' }
        });
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});
// Get inbox
router.get('/inbox', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const userAgents = await prisma_1.prisma.agents.findMany({ where: { ownerId: userId }, select: { id: true } });
        const agentIds = userAgents.map(a => a.id);
        const messages = await prisma_1.prisma.messages.findMany({
            where: { receiverId: { in: agentIds } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch inbox' });
    }
});
// Update message status
router.patch('/:messageId', auth_1.authenticate, async (req, res) => {
    try {
        const { messageId } = req.params;
        const { status } = req.body;
        const userId = req.user.id;
        const message = await prisma_1.prisma.messages.findFirst({
            where: { id: messageId, receiver: { ownerId: userId } }
        });
        if (!message)
            return res.status(404).json({ error: 'Message not found' });
        const updated = await prisma_1.prisma.messages.update({
            where: { id: messageId },
            data: { status, ...(status === 'delivered' ? { deliveredAt: new Date() } : {}) }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update message' });
    }
});
exports.default = router;
