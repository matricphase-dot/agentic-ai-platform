import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from "../middleware/auth";

const router = Router();

// GET /api/connectors – list all available connectors
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const connectors = await (prisma as any).connectors.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ connectors });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/connectors – create a new connector (admin only – we'll skip admin check for now)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, description, logoUrl, authType, authConfig, baseUrl, endpoints } = req.body;
    const connector = await (prisma as any).connectors.create({ data: { name, description, logoUrl, authType, authConfig, baseUrl, endpoints },
    });
    res.status(201).json(connector);
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/connectors/:id/connect – create a user connection for a connector
router.post('/:id/connect', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as { id: string };
    const { credentials } = req.body; // e.g., { apiKey, apiSecret } or oauth tokens

    // Check if connector exists
    const connector = await (prisma as any).connectors.findUnique({ where: { id } });
    if (!connector) return res.status(404).json({ error: 'Connector not found' });

    // Create or update connection
    const connection = await (prisma as any).user_connections.upsert({
      where: { userId_connectorId: { userId: req.user!.id, connector_id: id } },
      update: { credentials, status: 'active', lastUsed: new Date() },
      create: { userId: req.user!.id, connector_id: id, credentials, status: 'active' },
    });
    res.json(connection);
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/connectors/my – get user's connections
router.get('/my', authenticate, async (req: AuthRequest, res) => {
  try {
    const connections = await (prisma as any).user_connections.findMany({
      where: { userId: req.user!.id },
      include: { connector: true },
    });
    res.json({ connections });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/connectors/my/:connection_id – revoke a connection
router.delete('/my/:connection_id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { connection_id } = req.params as { connection_id: string };
// @ts-ignore
    await (prisma as any).user_connections.delete({
      where: { id: connection_id, userId: req.user!.id },
    });
    res.json({ success: true });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/connectors/my/:connection_id/bind – bind an agent to a connection
router.post('/my/:connection_id/bind', authenticate, async (req: AuthRequest, res) => {
  try {
    const { connection_id } = req.params as { connection_id: string };
    const { agentId, permissions } = req.body;

    // Verify connection belongs to user
    const connection = await (prisma as any).user_connections.findFirst({
      where: { id: connection_id, userId: req.user!.id },
    });
    if (!connection) return res.status(404).json({ error: 'Connection not found' });

    // Verify agent belongs to user
    const agent = await (prisma as any).agents.findFirst({
      where: { id: agentId, owner_id: req.user!.id },
    });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    // Create binding
    const binding = await (prisma as any).agent_service_bindings.upsert({
      where: { agentId_connectionId: { agentId, connection_id } },
      update: { permissions },
      create: { agentId, connection_id, permissions },
    });
    res.json(binding);
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/connectors/execute – agent executes an action (internal, called by agents)
// This would be secured with agent token, but for now we'll use user token.
router.post('/execute', authenticate, async (req: AuthRequest, res) => {
  try {
    const { agentId, connection_id, action, parameters } = req.body;

    // Verify binding exists
    const binding = await (prisma as any).agent_service_bindings.findFirst({
      where: { agentId, connection_id },
      include: { connection: { include: { connector: true } } },
    });
    if (!binding) return res.status(403).json({ error: 'Agent not bound to this connection' });

    // Here you would actually call the external API using the credentials.
    // For now, we'll simulate a response and log it.
    const log = await (prisma as any).integration_logs.create({ data: { 
        agentId,
        connection_id,
        action,
        request: parameters,
        response: { message: 'Simulated response' },
        status: 'success',
      },
    });

    res.json({ success: true, logId: log.id, response: log.response });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/connectors/logs – get integration logs for user's agents
router.get('/logs', authenticate, async (req: AuthRequest, res) => {
  try {
    const logs = await (prisma as any).integration_logs.findMany({
      where: { agent: { owner_id: req.user!.id } },
      include: { agent: { select: { name: true } }, connection: { include: { connector: { select: { name: true } } } } },
      orderBy: { created_at: 'desc' },
      take: 50,
    });
    res.json({ logs });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
























