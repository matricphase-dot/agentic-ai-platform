"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const messageProcessor_1 = require("../services/messageProcessor");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Send a message
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { senderId, receiverId, content } = req.body;
        if (!senderId)
            return res.status(400).json({ error: 'senderId required' });
        // Verify sender belongs to user
        const sender = await prisma.agents.findFirst({
            where: { id: senderId, owner_id: req.user.id }
        });
        if (!sender)
            return res.status(403).json({ error: 'Not your agent' });
        const message = await prisma.message.create({
            data: {
                senderId,
                receiverId,
                content: JSON.stringify(content),
                status: 'sent'
            }
        });
        (0, messageProcessor_1.queueMessageForProcessing)(message.id);
        res.json(message);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});
// Get messages for an agent (inbox)
router.get('/inbox/:agentId', auth_1.authenticate, async (req, res) => {
    try {
        const agentId = req.params.agentId;
        const agent = await prisma.agents.findFirst({
            where: { id: agentId, owner_id: req.user.id }
        });
        if (!agent)
            return res.status(403).json({ error: 'Not your agent' });
        const messages = await prisma.message.findMany({
            where: { receiverId: agentId },
            orderBy: { created_at: 'desc' },
            include: { sender: { select: { name: true } } }
        });
        res.json(messages);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});
// Mark message as read/delivered
router.patch('/:id/status', auth_1.authenticate, async (req, res) => {
    try {
        const { status } = req.body;
        const messageId = req.params.id;
        const message = await prisma.message.findFirst({
            where: { id: messageId, receiver: { owner_id: req.user.id } }
        });
        if (!message)
            return res.status(404).json({ error: 'Message not found' });
        const updated = await prisma.message.update({
            where: { id: messageId },
            data: {
                status,
                ...(status === 'delivered' ? { deliveredAt: new Date() } : {})
            }
        });
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update message' });
    }
});
exports.default = router;
