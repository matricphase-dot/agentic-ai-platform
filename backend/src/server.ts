import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import route modules
import authRoutes from './routes/auth';
import agentsRoute from './routes/agents';
import messagesRoute from './routes/messages';
import documentsRoute from './routes/documents';
import recordingsRoute from './routes/recordings';
import aiqRoutes from './routes/aiq';
import templatesRoute from './routes/templates';
import stakingRoute from './routes/staking';
import governanceRoute from './routes/governance';
import nodesRoute from './routes/nodes';
import teamsRoute from './routes/teams';
import agentVersionsRoute from './routes/agent-versions';
import testRoute from './routes/test';
import dashboardRoutes from './routes/dashboard';
import inviteRoutes from './routes/invite';
import webhooksRoute from './routes/webhooks';
import reviewsRoute from './routes/reviews';
import auditLogsRoute from './routes/audit-logs';
import settingsRoute from './routes/settings';
import chatRoutes from './routes/chat'; // new

import { authenticate } from './middleware/auth';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoute);

// Protected routes (require authentication)
app.use('/api/agents', authenticate, agentsRoute);
app.use('/api/messages', authenticate, messagesRoute);
app.use('/api/documents', authenticate, documentsRoute);
app.use('/api/recordings', authenticate, recordingsRoute);
app.use('/api/aiq', authenticate, aiqRoutes);
app.use('/api/templates', authenticate, templatesRoute);
app.use('/api/staking', authenticate, stakingRoute);
app.use('/api/governance', authenticate, governanceRoute);
app.use('/api/nodes', authenticate, nodesRoute);
app.use('/api/teams', authenticate, teamsRoute);
app.use('/api/agent-versions', authenticate, agentVersionsRoute);
app.use('/api/dashboard', authenticate, dashboardRoutes);
app.use('/api/invite', authenticate, inviteRoutes);
app.use('/api/webhooks', authenticate, webhooksRoute);
app.use('/api/reviews', authenticate, reviewsRoute);

app.use('/api/reviews', authenticate, reviewsRoute);

app.use('/api/audit-logs', authenticate, auditLogsRoute);

// New chat routes
app.use('/api/agents', authenticate, chatRoutes); // This will handle /api/agents/:agentId/chat

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


