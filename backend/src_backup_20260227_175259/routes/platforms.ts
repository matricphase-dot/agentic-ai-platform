import prisma from '../lib/prisma';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import {
  addPlatformConnection,
  getPlatformConnections,
  revokePlatformConnection,
  deployAgent,
  recordRevenue,
} from '../services/platformService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prismaClient = new PrismaClient();

// Add a new platform connection
router.post('/connect', authenticateToken, async (req: AuthRequest, res) => {
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
router.get('/connections', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const connections = await getPlatformConnections(req.user.id);
    res.json(connections);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single platform connection by ID
router.get('/connections/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.params.id) return res.status(400).json({ error: 'Connection ID is required' });

    const connection = await prisma.platform_connections.findUnique({
      where: { id: req.params.id, user_id: req.user.id },
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
router.delete('/connections/:id', authenticateToken, async (req: AuthRequest, res) => {
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
router.post('/deploy', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const { agent_id, platform_id, config } = req.body;
    const deployment = await deployAgent(agent_id, platform_id, config);
    res.json(deployment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Deploy a test agent to platform (requires existing agent)
router.post('/deploy-with-agent', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const { platform_id, config } = req.body;

    // Find an existing agent for this user
    const agent = await prisma.agents.findFirst({ where: { owner_id: req.user.id } });
    if (!agent) {
      return res.status(400).json({ error: 'No agent found. Please create an agent first.' });
    }

    const deployment = await prisma.deployments.create({ data: { 
        agent_id: agent.id,
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
router.post('/deployments/:id/deploy-to-cloud', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const deployment = await prisma.deployments.findUnique({
      where: { id: req.params.id },
      include: { agent: true, platform: true },
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
router.post('/deployments/:id/invoke', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const deployment = await prisma.deployments.findUnique({
      where: { id: req.params.id },
      include: { agent: true },
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
router.get('/deployments/:id/logs', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const deployment = await prisma.deployments.findUnique({
      where: { id: req.params.id },
      include: { agent: true },
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
router.delete('/deployments/:id/cloud', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const deployment = await prisma.deployments.findUnique({
      where: { id: req.params.id },
      include: { agent: true },
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
















