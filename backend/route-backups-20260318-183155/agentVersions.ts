import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get all versions for an agent
router.get('/agent/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const versions = await (prisma as any).agentVersion.findMany({
      where: { agentId },
      orderBy: { versionNumber: 'desc' }
    });
    res.json(versions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

// Get a specific version
router.get('/:versionId', async (req, res) => {
  try {
    const { versionId } = req.params;
    const version = await (prisma as any).agentVersion.findUnique({
      where: { id: versionId }
    });
    if (!version) return res.status(404).json({ error: 'Version not found' });
    res.json(version);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch version' });
  }
});

// Create a new version (automatically happens when agent is updated, but we can provide manual endpoint)
router.post('/', authenticate, async (req, res) => {
  try {
    const { agentId, data, description } = req.body;
    // Get the latest version number for this agent
    const lastVersion = await (prisma as any).agentVersion.findFirst({
      where: { agentId },
      orderBy: { versionNumber: 'desc' }
    });
    const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;
    const version = await (prisma as any).agentVersion.create({
      data: {
        agentId,
        versionNumber,
        data,
        description,
        createdById: (req as any).user!.id
      }
    });
    res.status(201).json(version);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create version' });
  }
});

// Restore a version (copy its data to the current agent)
router.post('/:versionId/restore', authenticate, async (req, res) => {
  try {
    const { versionId } = req.params;
    const version = await (prisma as any).agentVersion.findUnique({
      where: { id: versionId },
      include: { agent: true }
    });
    if (!version) return res.status(404).json({ error: 'Version not found' });
    // Ensure the user owns the agent
    if (version.agent.ownerId !== (req as any).user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    // Update the agent with version data
    const updated = await (prisma as any).agents.update({
      where: { id: version.agentId },
      data: version.data
    });
    // Optionally create a new version snapshot of the current state before overwriting?
    // For simplicity, we'll just return success.
    res.json({ message: 'Agent restored to version', versionNumber: version.versionNumber });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to restore version' });
  }
});

export default router;



