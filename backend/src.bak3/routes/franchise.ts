import express from 'express';
import {
  createBlueprint,
  getBlueprints,
  getBlueprint,
  purchaseBlueprint,
  getUserFranchises,
  getMyBlueprintsFranchises,
  recordRoyaltyPayment,
} from '../services/franchiseService';
import { authenticate } from "../middleware/auth";

const router = express.Router();

// Blueprints

// List all active blueprints (public)
router.get('/blueprints', async (req, res) => {
  try {
    const { creator_id } = req.query;
    const blueprints = await getBlueprints({ creator_id: creator_id as string });
    res.json(blueprints);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single blueprint (public)
router.get('/blueprints/:id', async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ error: 'Blueprint ID required' });
    const blueprint = await getBlueprint(req.params.id);
    if (!blueprint) return res.status(404).json({ error: 'Blueprint not found' });
    res.json(blueprint);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a blueprint (authenticated)
router.post('/blueprints', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const { name, description, agentId, price, royalty_rate } = req.body;
    const blueprint = await createBlueprint(req.user.id, name, description, agentId, price, royalty_rate);
    res.json(blueprint);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Franchises

// Purchase a blueprint (authenticated)
router.post('/purchase', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const { blueprint_id } = req.body;
    const franchise = await purchaseBlueprint(blueprint_id, req.user.id);
    res.json(franchise);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get user's purchased franchises (authenticated)
router.get('/my-franchises', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const franchises = await getUserFranchises(req.user.id);
    res.json(franchises);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get franchises sold from user's blueprints (authenticated)
router.get('/my-sales', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const sales = await getMyBlueprintsFranchises(req.user.id);
    res.json(sales);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Record a royalty payment (could be called internally or via webhook)
router.post('/royalty', authenticate, async (req: AuthRequest, res) => {
  try {
    const { franchise_id, amount, period_start, period_end } = req.body;
    if (!franchise_id || !amount || !period_start || !period_end) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const payment = await recordRoyaltyPayment(franchise_id, amount, new Date(period_start), new Date(period_end));
    res.json(payment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;













