import express from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Register a new compute node
router.post('/register', authenticate, async (req, res) => {
  try {
    const { name, endpoint, specs, location, version } = req.body;
    const userId = (req as any).user.id;

    const node = await prisma.nodes.create({
      data: {
        name,
        endpoint,
        specs: specs || {},
        location,
        version: version || '1.0.0',
        ownerId: userId,
        status: 'offline',
        lastPing: new Date()
      }
    });
    res.json(node);
  } catch (error) {
    console.error('Error registering node:', error);
    res.status(500).json({ error: 'Failed to register node' });
  }
});

// Get all nodes for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const nodes = await prisma.nodes.findMany({
      where: { ownerId: userId },
      include: { node_tasks: true, node_rewards: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(nodes);
  } catch (error) {
    console.error('Error fetching nodes:', error);
    res.status(500).json({ error: 'Failed to fetch nodes' });
  }
});

// Get a specific node by ID
router.get('/:nodeId', authenticate, async (req, res) => {
  try {
    const { nodeId } = req.params;
    const userId = (req as any).user.id;

    const node = await prisma.nodes.findFirst({
      where: { id: nodeId as string, ownerId: userId },
      include: { node_tasks: true, node_rewards: true }
    });
    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }
    res.json(node);
  } catch (error) {
    console.error('Error fetching node:', error);
    res.status(500).json({ error: 'Failed to fetch node' });
  }
});

// Update node information
router.put('/:nodeId', authenticate, async (req, res) => {
  try {
    const { nodeId } = req.params;
    const { name, endpoint, status, specs, location, version } = req.body;
    const userId = (req as any).user.id;

    // Verify ownership
    const existing = await prisma.nodes.findFirst({
      where: { id: nodeId as string, ownerId: userId }
    });
    if (!existing) {
      return res.status(404).json({ error: 'Node not found' });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (endpoint !== undefined) updateData.endpoint = endpoint;
    if (status !== undefined) updateData.status = status;
    if (specs !== undefined) updateData.specs = specs;
    if (location !== undefined) updateData.location = location;
    if (version !== undefined) updateData.version = version;

    const updated = await prisma.nodes.update({
      where: { id: nodeId as string },
      data: updateData
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating node:', error);
    res.status(500).json({ error: 'Failed to update node' });
  }
});

// Update node heartbeat (ping)
router.post('/:nodeId/ping', authenticate, async (req, res) => {
  try {
    const { nodeId } = req.params;
    const userId = (req as any).user.id;

    const node = await prisma.nodes.findFirst({
      where: { id: nodeId as string, ownerId: userId }
    });
    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    const updated = await prisma.nodes.update({
      where: { id: nodeId as string },
      data: { lastPing: new Date() }
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating node ping:', error);
    res.status(500).json({ error: 'Failed to update node ping' });
  }
});

// Get tasks assigned to a node
router.get('/:nodeId/tasks', authenticate, async (req, res) => {
  try {
    const { nodeId } = req.params;
    const userId = (req as any).user.id;

    const node = await prisma.nodes.findFirst({
      where: { id: nodeId as string, ownerId: userId }
    });
    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    const tasks = await prisma.node_tasks.findMany({
      where: { nodeId: nodeId as string },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching node tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Claim a task (assign to this node)
router.post('/:nodeId/tasks/:taskId/claim', authenticate, async (req, res) => {
  try {
    const { nodeId, taskId } = req.params;
    const userId = (req as any).user.id;

    // Verify node ownership
    const node = await prisma.nodes.findFirst({
      where: { id: nodeId as string, ownerId: userId }
    });
    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    // Check task exists and not already claimed
    const task = await prisma.node_tasks.findUnique({
      where: { id: taskId as string }
    });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    if (task.nodeId) {
      return res.status(400).json({ error: 'Task already assigned' });
    }

    const updated = await prisma.node_tasks.update({
      where: { id: taskId as string },
      data: { nodeId: nodeId as string,
        status: 'assigned',
        startedAt: new Date()
      }
    });
    res.json(updated);
  } catch (error) {
    console.error('Error claiming task:', error);
    res.status(500).json({ error: 'Failed to claim task' });
  }
});

// Complete a task (submit result)
router.post('/tasks/:taskId/complete', authenticate, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { output, reward } = req.body;
    const userId = (req as any).user.id;

    // Verify node ownership through the node associated with the task
    const task = await prisma.node_tasks.findFirst({
      where: { id: taskId as string,
        node: { ownerId: userId }
      },
      include: { node: true }
    });
    if (!task) {
      return res.status(404).json({ error: 'Task not found or not assigned to your node' });
    }
    if (task.status === 'completed') {
      return res.status(400).json({ error: 'Task already completed' });
    }

    // Update task
    const completed = await prisma.node_tasks.update({
      where: { id: taskId as string },
      data: {
        output,
        status: 'completed',
        completedAt: new Date(),
        reward: reward || 0
      }
    });

    // Create reward record
    if (reward && reward > 0) {
      await prisma.node_rewards.create({
        data: {
          nodeId: task.nodeId!,
          amount: reward,
          reason: 'Task completion',
          taskId: task.id
        }
      });
    }

    res.json(completed);
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

// Get earnings (rewards) for a node
router.get('/:nodeId/earnings', authenticate, async (req, res) => {
  try {
    const { nodeId } = req.params;
    const userId = (req as any).user.id;

    const node = await prisma.nodes.findFirst({
      where: { id: nodeId as string, ownerId: userId }
    });
    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    const rewards = await prisma.node_rewards.findMany({
      where: { nodeId: nodeId as string },
      orderBy: { createdAt: 'desc' }
    });
    const total = rewards.reduce((sum, r) => sum + r.amount, 0);
    res.json({ rewards, total });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
});

export default router;


