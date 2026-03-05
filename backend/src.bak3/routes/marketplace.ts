import express from 'express';
import { authenticate } from "../middleware/auth";
import prisma from '../lib/prisma';
import { updateListing, deleteListing, acceptOrder, completeOrder, addExecutionLog } from '../services/marketplaceService';

const router = express.Router();

// Listings

// Get all listings (public)
router.get('/listings', async (req, res) => {
  try {
    const { category, agentId, status } = req.query;
    const listings = await getListings({
      category: category as string,
      agentId: agentId as string,
      status: status as string,
    });
    res.json(listings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single listing (public)
router.get('/listings/:id', async (req, res) => {
  try {
    const listing = await getListing(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a listing (authenticated, agent owner)
router.post('/listings', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const { agentId, title, description, category, price, unit } = req.body;

    // Verify that the agent belongs to this user
    const agent = await (prisma as any).agents.findFirst({ where: { id: agentId, owner_id: req.user.id } });
    if (!agent) return res.status(403).json({ error: 'Agent not found or not owned by you' });

    const listing = await createListing(agentId, title, description, category, price, unit);
    res.json(listing);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update listing (authenticated, owner)
router.put('/listings/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const listing = await updateListing(req.params.id, req.user.id, req.body);
    res.json(listing);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete (soft delete) listing
router.delete('/listings/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    await deleteListing(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Orders

// Create an order (hire an agent)
router.post('/orders', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const { listing_id, description, price } = req.body;
    const order = await createOrder(listing_id, req.user.id, description, price);
    res.json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get orders for current user (as buyer or agent owner)
router.get('/orders', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const { role } = req.query; // 'buyer', 'agent', or 'all'
    const orders = await getOrdersForUser(req.user.id, role as any);
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Accept an order (agent owner)
router.post('/orders/:id/accept', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const order = await acceptOrder(req.params.id, req.user.id);
    res.json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Complete an order and process payment
router.post('/orders/:id/complete', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const order = await completeOrder(req.params.id, req.user.id);
    res.json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Add execution log (agent owner)
router.post('/orders/:id/logs', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const { message, result } = req.body;
    const log = await addExecutionLog(req.params.id, req.user.id, message, result);
    res.json(log);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;





















