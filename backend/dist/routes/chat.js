"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const axios_1 = __importDefault(require("axios"));
const router = (0, express_1.Router)();
router.post('/:agentId/chat', auth_1.authenticate, async (req, res) => {
    const { agentId } = req.params;
    const { message } = req.body;
    const user = req.user;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }
    try {
        // Attempt to use Ollama (assumes it's running on localhost:11434)
        let responseText = '';
        try {
            const ollamaRes = await axios_1.default.post('http://localhost:11434/api/generate', {
                model: 'llama2', // you can change this to your preferred model
                prompt: message,
                stream: false,
            });
            responseText = ollamaRes.data.response;
        }
        catch (ollamaError) {
            console.warn('Ollama not available, falling back to echo mock:', ollamaError.message);
            // Fallback to echo mock
            responseText = `Echo from agent ${agentId}: ${message}`;
        }
        // Optionally store the message in the database (if you have a messages table for user-agent chat)
        // await prisma.message.create({ data: { ... } });
        res.json({ response: responseText });
    }
    catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Failed to process chat' });
    }
});
exports.default = router;
