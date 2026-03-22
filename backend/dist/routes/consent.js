"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get user's consents
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const consents = await prisma_1.prisma.consent.findMany({
            where: { userId: req.user.id }
        });
        res.json(consents);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch consents' });
    }
});
// Set consent for a purpose
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { purpose, granted } = req.body;
        if (!purpose)
            return res.status(400).json({ error: 'Purpose is required' });
        const existing = await prisma_1.prisma.consent.findUnique({
            where: {
                userId_purpose: {
                    userId: req.user.id,
                    purpose
                }
            }
        });
        if (existing) {
            // Update
            const updated = await prisma_1.prisma.consent.update({
                where: { id: existing.id },
                data: {
                    granted,
                    grantedAt: granted ? new Date() : null,
                    revokedAt: granted ? null : new Date()
                }
            });
            res.json(updated);
        }
        else {
            // Create
            const consent = await prisma_1.prisma.consent.create({
                data: {
                    userId: req.user.id,
                    purpose,
                    granted,
                    grantedAt: granted ? new Date() : null
                }
            });
            res.status(201).json(consent);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update consent' });
    }
});
exports.default = router;
