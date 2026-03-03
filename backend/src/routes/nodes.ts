import express from 'express';
import { authenticate } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Register a new node
router.post('/register', async (req, res) => {
  try {
    const { name, description, specs, location, version } = req.body;
    if (!name || !specs) {
      return res.status(400).json({ error: 'Name and specs required' });
    }
    const node = await prisma.node.create({
      data: {
        ownerId: req.user!.id,
        name,
        description,
        specs,
        location,
        version,
        status: 'offline'
      }
    });
    res.json(node);
  } catch (error) {
    console.error('Node registration error:', error);
    res.status(500).json({ error: 'Failed to register node' });
  }
});

// Get all nodes for the authenticated user
router.get('/my-nodes', async (req, res) => {
  try {
    const nodes = await prisma.node.findMany({
      where: { ownerId: req.user!.id },
      include: {
        _count: { select: { tasks: true, rewards: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(nodes);
  } catch (error) {
    console.error('Fetch nodes error:', error);
    res.status(500).json({ error: 'Failed to fetch nodes' });
  }
});

// Update node status (called by node software)
router.post('/:nodeId/heartbeat', async (req, res) => {
  try {
    const { nodeId } = req.params;
    const { status, version } = req.body;
    const node = await prisma.node.findFirst({
      where: { id: nodeId, ownerId: req.user!.id }
    });
    if (!node) return res.status(404).json({ error: 'Node not found' });

    const updateData: any = { lastPing: new Date() };
    if (status) updateData.status = status;
    if (version) updateData.version = version;

    const updated = await prisma.node.update({
      where: { id: nodeId },
      data: updateData
    });
    res.json(updated);
  } catch (error) {
    console.error('Heartbeat error:', error);
    res.status(500).json({ error: 'Failed to update node' });
  }
});

// Get available tasks for a node (polling endpoint)
router.get('/:nodeId/tasks/available', async (req, res) => {
  try {
    const { nodeId } = req.params;
    const node = await prisma.node.findFirst({
      where: { id: nodeId, ownerId: req.user!.id }
    });
    if (!node) return res.status(404).json({ error: 'Node not found' });

    // Find pending tasks not assigned to any node yet
    const tasks = await prisma.nodeTask.findMany({
      where: { status: 'pending' },
      take: 5,
      orderBy: { createdAt: 'asc' }
    });
    res.json(tasks);
  } catch (error) {
    console.error('Fetch available tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Claim a task (node accepts it)
router.post('/tasks/:taskId/claim', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { nodeId } = req.body;
    if (!nodeId) return res.status(400).json({ error: 'nodeId required' });

    const node = await prisma.node.findFirst({
      where: { id: nodeId, ownerId: req.user!.id }
    });
    if (!node) return res.status(404).json({ error: 'Node not found' });

    const task = await prisma.nodeTask.findUnique({
      where: { id: taskId }
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.status !== 'pending') {
      return res.status(400).json({ error: 'Task already assigned' });
    }

    const updated = await prisma.nodeTask.update({
      where: { id: taskId },
      data: {
        nodeId,
        status: 'assigned',
        startedAt: new Date()
      }
    });
    // Update node status to busy
    await prisma.node.update({
      where: { id: nodeId },
      data: { status: 'busy' }
    });
    res.json(updated);
  } catch (error) {
    console.error('Claim task error:', error);
    res.status(500).json({ error: 'Failed to claim task' });
  }
});

// Submit task result
router.post('/tasks/:taskId/complete', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { output, reward } = req.body; // reward in AGIX
    const task = await prisma.nodeTask.findFirst({
      where: { id: taskId, node: { ownerId: req.user!.id } }
    });
    if (!task) return res.status(404).json({ error: 'Task not found or not assigned to your node' });

    const completed = await prisma.nodeTask.update({
      where: { id: taskId },
      data: {
        status: 'completed',
        output,
        completedAt: new Date(),
        reward
      }
    });

    // Create reward record
    if (reward) {
      await prisma.nodeReward.create({
        data: {
          nodeId: task.nodeId!,
          amount: reward,
          reason: 'task_completion',
          taskId
        }
      });
    }

    // Mark node as online again
    await prisma.node.update({
      where: { id: task.nodeId! },
      data: { status: 'online' }
    });

    res.json(completed);
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

// Get node earnings
router.get('/earnings', async (req, res) => {
  try {
    const rewards = await prisma.nodeReward.findMany({
      where: { node: { ownerId: req.user!.id } },
      include: { node: true, task: true },
      orderBy: { createdAt: 'desc' }
    });
    const total = rewards.reduce((sum, r) => sum + r.amount, 0);
    res.json({ rewards, total });
  } catch (error) {
    console.error('Fetch earnings error:', error);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
});

export default router;
