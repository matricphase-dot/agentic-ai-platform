import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = express.Router({ mergeParams: true });

// Get all versions for an agent
router.get('/agents/:agentId/versions', authenticate, async (req, res) => {
  try {
    const { agentId } = req.params;
    // Check agent ownership
    const agent = await prisma.agents.findUnique({
      where: { id: agentId },
      select: { ownerId: true }
    });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    if (agent.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const versions = await prisma.agentVersion.findMany({
      where: { agentId },
      orderBy: { version: 'desc' },
      select: {
        id: true,
        version: true,
        name: true,
        description: true,
        createdAt: true,
        createdBy: true
      }
    });
    res.json(versions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

// Get specific version details
router.get('/agents/versions/:versionId', authenticate, async (req, res) => {
  try {
    const { versionId } = req.params;
    const version = await prisma.agentVersion.findUnique({
      where: { id: versionId },
      include: { agent: { select: { ownerId: true } } }
    });
    if (!version) return res.status(404).json({ error: 'Version not found' });
    if (version.agent.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    // Remove sensitive agent data
    const { agent, ...versionData } = version;
    res.json(versionData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch version' });
  }
});

// Restore an agent to a previous version (creates a new version)
router.post('/agents/:agentId/restore/:versionId', authenticate, async (req, res) => {
  try {
    const { agentId, versionId } = req.params;

    // Verify agent ownership and version existence
    const agent = await prisma.agents.findUnique({
      where: { id: agentId },
      include: { owner: { select: { id: true } } }
    });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    if (agent.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const version = await prisma.agentVersion.findUnique({
      where: { id: versionId }
    });
    if (!version) return res.status(404).json({ error: 'Version not found' });
    if (version.agentId !== agentId) {
      return res.status(400).json({ error: 'Version does not belong to this agent' });
    }

    // Determine next version number
    const lastVersion = await prisma.agentVersion.findFirst({
      where: { agentId },
      orderBy: { version: 'desc' }
    });
    const nextVersion = (lastVersion?.version || 0) + 1;

    // Create a new version with the restored config
    const restored = await prisma.agentVersion.create({
      data: {
        agentId,
        version: nextVersion,
        name: `Restored from v${version.version}`,
        description: `Restored version from ${new Date(version.createdAt).toLocaleString()}`,
        config: version.config, // copy the config
        createdBy: req.user!.id
      }
    });

    // Also update the current agent with the restored config
    const updatedAgent = await prisma.agents.update({
      where: { id: agentId },
      data: version.config as any // cast to any because config is Json, but we know it matches agent fields
    });

    res.json({ message: 'Agent restored', version: restored, agent: updatedAgent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to restore version' });
  }
});

// Delete a version (optional)
router.delete('/agents/versions/:versionId', authenticate, async (req, res) => {
  try {
    const { versionId } = req.params;
    const version = await prisma.agentVersion.findUnique({
      where: { id: versionId },
      include: { agent: { select: { ownerId: true } } }
    });
    if (!version) return res.status(404).json({ error: 'Version not found' });
    if (version.agent.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await prisma.agentVersion.delete({ where: { id: versionId } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete version' });
  }
});

export default router;
