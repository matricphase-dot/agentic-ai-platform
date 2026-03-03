import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { createBlueprint, getBlueprints, getBlueprint, purchaseBlueprint, getUserFranchises, recordRoyaltyPayment } from '../services/franchiseService';

const router = Router();

// Create a new blueprint
router.post('/blueprints', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, description, agent_id, price, royalty_rate } = req.body;
    if (!name || !agent_id || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const blueprint = await createBlueprint(agent_id, req.user!.id, price, royalty_rate || 5);
    res.json(blueprint);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get all blueprints (optionally filter by creator)
router.get('/blueprints', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { creator_id } = req.query;
    const filter: any = {};
    if (creator_id) filter.creator_id = creator_id as string;
    const blueprints = await getBlueprints(filter);
    res.json(blueprints);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get a specific blueprint
router.get('/blueprints/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ error: 'Blueprint ID required' });
    if (!req.params.id) return res.status(400).json({ error: "Blueprint ID required" });
    const blueprint = await getBlueprint(req.params.id);
    if (!blueprint) return res.status(404).json({ error: 'Blueprint not found' });
    res.json(blueprint);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Purchase a blueprint
router.post('/purchase', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { blueprint_id } = req.body;
    if (!blueprint_id) return res.status(400).json({ error: 'blueprint_id required' });

    const franchise = await purchaseBlueprint(blueprint_id, req.user!.id);
    res.json(franchise);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get my franchises (as owner)
router.get('/my-franchises', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const franchises = await getUserFranchises(req.user!.id);
    res.json(franchises);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Record a royalty payment (for the platform, or automated)
router.post('/royalty', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { franchise_id, amount } = req.body;
    if (!franchise_id || !amount) return res.status(400).json({ error: 'franchise_id and amount required' });

    const payment = await recordRoyaltyPayment(franchise_id, amount);
    res.json(payment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;







