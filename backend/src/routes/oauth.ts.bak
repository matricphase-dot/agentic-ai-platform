import express from 'express';
import axios from 'axios';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Callback endpoint for OAuth providers
router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;
  if (error) {
    return res.redirect(/integrations?error=Exception calling "WriteAllText" with "3" argument(s): "Could not find a part of the path 'C:\Windows\system32\prisma\schema.prisma'." Exception calling "ReadAllBytes" with "1" argument(s): "Could not find a part of the path 'C:\Windows\system32\prisma\schema.prisma'." Exception calling "WriteAllText" with "3" argument(s): "Could not find a part of the path 'C:\Windows\system32\prisma\schema.prisma'." Exception calling "ReadAllBytes" with "1" argument(s): "Could not find a part of the path 'C:\Windows\system32\prisma\schema.prisma'." Cannot find path 'D:\AGENTIC_AI\backend\prisma\migrations\20260306174721_init_postgres\migration.sql' because it does not exist. Could not find a part of the path 'D:\AGENTIC_AI\backend\prisma\migrations\20260306174721_init_postgres\migration.sql'.);
  }

  // Retrieve the stored state from a temporary store (in production, use Redis or DB)
  // For simplicity, we'll assume state contains the connectorId and userId encoded
  // This is a simplified example; you should implement proper state validation.

  // For now, we'll redirect back to frontend with the code and let frontend call a separate endpoint to complete.
  // Alternative: frontend sends code to a backend endpoint that exchanges it.
  // Let's implement the exchange endpoint.

  res.redirect(/integrations?code=&state=);
});

// Exchange code for token and create integration
router.post('/exchange', async (req, res) => {
  try {
    const { connectorId, code, redirectUri } = req.body;
    const connector = await (prisma as any).connector.findUnique({ where: { id: connectorId } });
    if (!connector) return res.status(404).json({ error: 'Connector not found' });

    // Exchange code for token (implementation depends on provider)
    // This is a generic example; you may need provider-specific logic.
    const tokenResponse = await axios.post(connector.authConfig.tokenUrl, {
      client_id: process.env[${connector.name}_CLIENT_ID],
      client_secret: process.env[${connector.name}_CLIENT_SECRET],
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Store integration
    const integration = await (prisma as any).integration.create({
      data: {
        userId: (req as any).user!.id, // need auth middleware – we'll add later
        connectorId,
        accessToken: access_token, // should be encrypted
        refreshToken: refresh_token,
        tokenExpiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : null,
        status: 'active',
        config: {}
      }
    });
    res.json(integration);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'OAuth exchange failed' });
  }
});

export default router;

