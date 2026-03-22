"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const crypto_1 = __importDefault(require("crypto"));
const router = express_1.default.Router();
// Test endpoint to verify router is mounted
router.get('/ping', (req, res) => {
    res.json({ status: 'ok', message: 'Invite router is alive' });
});
// Generate invite codes (admin only)
router.post('/generate', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { count = 1, maxUses = 1, expiresInDays } = req.body;
        const codes = [];
        for (let i = 0; i < count; i++) {
            const code = crypto_1.default.randomBytes(4).toString('hex').toUpperCase();
            const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 86400000) : null;
            const invite = await prisma_1.prisma.inviteCode.create({
                data: {
                    code,
                    createdBy: userId,
                    maxUses,
                    expiresAt,
                },
            });
            codes.push(invite.code);
        }
        res.json({ codes });
    }
    catch (error) {
        console.error('Error generating invite codes:', error);
        res.status(500).json({ error: 'Failed to generate codes' });
    }
});
// Validate an invite code (public endpoint)
router.post('/validate', async (req, res) => {
    try {
        const { code } = req.body;
        const invite = await prisma_1.prisma.inviteCode.findUnique({ where: { code } });
        if (!invite)
            return res.json({ valid: false, reason: 'Code not found' });
        if (!invite.isActive)
            return res.json({ valid: false, reason: 'Code inactive' });
        if (invite.expiresAt && invite.expiresAt < new Date())
            return res.json({ valid: false, reason: 'Code expired' });
        if (invite.uses >= invite.maxUses)
            return res.json({ valid: false, reason: 'Code used too many times' });
        res.json({ valid: true, invite });
    }
    catch (error) {
        console.error('Error validating invite code:', error);
        res.status(500).json({ error: 'Failed to validate code' });
    }
});
exports.default = router;
