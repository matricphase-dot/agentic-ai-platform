"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../types/express.d.ts" />
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { name, description, capabilities, systemPrompt, ollama_endpoint } = req.body;
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const agent = await prisma.agents.create({
            data: {
                owner_id: req.user.id,
                name,
                description,
                capabilities: capabilities ? String(capabilities) : null,
                systemPrompt,
                ollama_endpoint,
            }
        });
        res.json(agent);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create agent' });
    }
});
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const agents = await prisma.agents.findMany({
            where: { owner_id: req.user.id }
        });
        res.json(agents);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch agents' });
    }
});
exports.default = router;
