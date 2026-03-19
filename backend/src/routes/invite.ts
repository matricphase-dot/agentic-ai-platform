import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import crypto from 'crypto';

const router = express.Router();

// Generate invite codes (admin only – you can add role check)
router.post('/generate', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { count = 1, maxUses = 1, expiresInDays } = req.body;
    
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 86400000) : null;
      const invite = await prisma.inviteCode.create({
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
  } catch (error) {
    console.error('Error generating invite codes:', error);
    res.status(500).json({ error: 'Failed to generate codes' });
  }
});

// Validate an invite code (public endpoint)
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    const invite = await prisma.inviteCode.findUnique({ where: { code } });
    if (!invite) return res.json({ valid: false, reason: 'Code not found' });
    if (!invite.isActive) return res.json({ valid: false, reason: 'Code inactive' });
    if (invite.expiresAt && invite.expiresAt < new Date()) return res.json({ valid: false, reason: 'Code expired' });
    if (invite.uses >= invite.maxUses) return res.json({ valid: false, reason: 'Code used too many times' });
    res.json({ valid: true, invite });
  } catch (error) {
    console.error('Error validating invite code:', error);
    res.status(500).json({ error: 'Failed to validate code' });
  }
});

export default router;
