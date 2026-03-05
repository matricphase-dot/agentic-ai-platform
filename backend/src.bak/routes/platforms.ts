import express from 'express';
import { PrismaClient } from '@prisma/client';
import {
  addPlatformConnection,
  getPlatformConnections,
  revokePlatformConnection,
  deployAgent,
  recordRevenue,
} from '../services/platformService';
import { authenticate } from "../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();

// Add a new platform connection
router.post('/connect', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const { platform, credentials } = req.body;
    const conn = await addPlatformConnection(req.user.id, platform, credentials);
    res.json(conn);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// List user's platform connections
router.get('/connections', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const connections = await getPlatformConnections(req.user.id);
    res.json(connections);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single platform connection by ID
router.get('/connections/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.params.id) return res.status(400).json({ error: 'Connection ID is required' });

    const connection = await (prisma as any).platform_connections.findUnique({
      where: { id: req.params.id, userId: req.user.id },
      include: { deployments: true },
    });

    if (!connection) return res.status(404).json({ error: 'Connection not found' });

    // Return without credentials
    const { credentials, ...rest } = connection;
    res.json(rest);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Revoke a connection
router.delete('/connections/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.params.id) return res.status(400).json({ error: 'Connection ID is required' });
    const result = await revokePlatformConnection(req.params.id, req.user.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Deploy an agent to a platform
router.post('/deploy', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const { agentId, platform_id, config } = req.body;
    const deployment = await deployAgent(agentId, platform_id, config);
    res.json(deployment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Deploy a test agent to platform (requires existing agent)
router.post('/deploy-with-agent', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const { platform_id, config } = req.body;

    // Find an existing agent for this user
    const agent = await (prisma as any).agents.findFirst({ where: { owner_id: req.user.id } });
    if (!agent) {
      return res.status(400).json({ error: 'No agent found. Please create an agent first.' });
    }

    const deployment = await (prisma as any).deployments.create({ data: { 
        agentId: agent.id,
        platform_id,
        config: config || {},
        status: 'running',
      },
    });

    res.json(deployment);
  } catch (error: any) {
    console.error('Deploy error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Record revenue (could be called by a webhook from the external platform)
router.post('/revenue', async (req, res) => {
  try {
    const { deployment_id, amount, description } = req.body;
    const log = await recordRevenue(deployment_id, amount, description);
    res.json(log);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});


// Deploy an existing deployment to cloud (after agent is created)
router.post('/deployments/:id/deploy-to-cloud', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const deployment = await (prisma as any).deployments.findUnique({
      where: { id: req.params.id },
      include: { agents: true, platform: true },
    });
    if (!deployment) return res.status(404).json({ error: 'Deployment not found' });
    // Check ownership via agent
    if (deployment.agent.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your agent' });
    }

    const { cloudDeploymentService } = require('../services/cloudDeploymentService');
    const result = await cloudDeploymentService.deployAgentToCloud(
      req.params.id,
      deployment.platform.platform,
      {} // credentials would be fetched from platform connection
    );
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Invoke a deployed cloud agent
router.post('/deployments/:id/invoke', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const deployment = await (prisma as any).deployments.findUnique({
      where: { id: req.params.id },
      include: { agents: true },
    });
    if (!deployment) return res.status(404).json({ error: 'Deployment not found' });
    if (deployment.agent.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your agent' });
    }
    const { cloudDeploymentService } = require('../services/cloudDeploymentService');
    const result = await cloudDeploymentService.invokeCloudAgent(req.params.id, req.body.payload);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get logs for a deployment
router.get('/deployments/:id/logs', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const deployment = await (prisma as any).deployments.findUnique({
      where: { id: req.params.id },
      include: { agents: true },
    });
    if (!deployment) return res.status(404).json({ error: 'Deployment not found' });
    if (deployment.agent.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your agent' });
    }
    const { cloudDeploymentService } = require('../services/cloudDeploymentService');
    const logs = await cloudDeploymentService.getCloudDeploymentLogs(req.params.id);
    res.json(logs);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Remove deployment from cloud
router.delete('/deployments/:id/cloud', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const deployment = await (prisma as any).deployments.findUnique({
      where: { id: req.params.id },
      include: { agents: true },
    });
    if (!deployment) return res.status(404).json({ error: 'Deployment not found' });
    if (deployment.agent.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your agent' });
    }
    const { cloudDeploymentService } = require('../services/cloudDeploymentService');
    const success = await cloudDeploymentService.removeCloudDeployment(req.params.id);
    res.json({ success });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
export default router;

























