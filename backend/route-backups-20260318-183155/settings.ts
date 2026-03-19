import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get current user's settings
router.get('/', authenticate, async (req, res) => {
  try {
    // Try using the model name as defined (PascalCase) – adjust if you have @@map
    let settings = await (prisma as any).user_settings.findUnique({
      where: { userId: (req as any).user!.id }
    });
    if (!settings) {
      // Create default settings if none exist
      settings = await (prisma as any).user_settings.create({
        data: {
          userId: (req as any).user!.id,
          primaryColor: '#6366f1',
          theme: 'light',
        }
      });
    }
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings
router.put('/', authenticate, async (req, res) => {
  try {
    const { primaryColor, logoUrl, theme } = req.body;
    const settings = await (prisma as any).user_settings.upsert({
      where: { userId: (req as any).user!.id },
      update: { primaryColor, logoUrl, theme },
      create: {
        userId: (req as any).user!.id,
        primaryColor,
        logoUrl,
        theme,
      }
    });
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;


