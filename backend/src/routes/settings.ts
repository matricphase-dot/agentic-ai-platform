import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get current user's settings (public, returns default if none)
router.get('/', async (req, res) => {
  try {
    // If no user, return default settings
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.json({ primaryColor: '#6366f1', logoUrl: '', theme: 'light' });
    }
    const settings = await prisma.userSettings.findUnique({
      where: { userId }
    });
    res.json(settings || { primaryColor: '#6366f1', logoUrl: '', theme: 'light' } as any);
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Return default on error
    res.json({ primaryColor: '#6366f1', logoUrl: '', theme: 'light' } as any);
  }
});

// Get appearance settings for current user
router.get('/appearance', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    let settings = await prisma.userSettings.findUnique({
      where: { userId }
    });
    if (!settings) {
      settings = { primaryColor: '#6366f1', logoUrl: '', theme: 'light' } as any;
    }
    res.json(settings);
  } catch (error) {
    console.error('Error fetching appearance settings:', error);
    res.status(500).json({ error: 'Failed to fetch appearance settings' });
  }
});

export default router;