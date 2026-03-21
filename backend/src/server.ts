// // import * as Sentry from '@sentry/node';
import inviteRoutes from './routes/invite';
// // import { initSentry } from './sentry';
import inviteRoutes from './routes/invite';
import teamsRoute from './routes/teams';
import inviteRoutes from './routes/invite';

import messagesRoute from './routes/messages';
import inviteRoutes from './routes/invite';
import agentVersionsRoute from './routes/agentVersions';
import inviteRoutes from './routes/invite';
import testRoute from './routes/test';
import inviteRoutes from './routes/invite';
import cors from 'cors';
import inviteRoutes from './routes/invite';
import dotenv from 'dotenv';
import inviteRoutes from './routes/invite';
import templatesRoute from './routes/templates';
import inviteRoutes from './routes/invite';
import stakingRoute from './routes/staking';
import inviteRoutes from './routes/invite';
import documentsRoute from './routes/documents';
import inviteRoutes from './routes/invite';
import express from 'express';
import inviteRoutes from './routes/invite';
import recordingsRoute from './routes/recordings';
import inviteRoutes from './routes/invite';
import nodeRoute from './routes/nodes';
import inviteRoutes from './routes/invite';
import authRoutes from './routes/auth';
import inviteRoutes from './routes/invite';
import agentsRoute from './routes/agents';
import inviteRoutes from './routes/invite';
import governanceRoute from './routes/governance';
import inviteRoutes from './routes/invite';
import aiqRoutes from './routes/aiq';
import inviteRoutes from './routes/invite';
import { PrismaClient } from '@prisma/client';
import inviteRoutes from './routes/invite';
import auditLogsRoute from './routes/auditLogs';
import inviteRoutes from './routes/invite';
import reviewsRoute from './routes/reviews';
import inviteRoutes from './routes/invite';
import webhooksRoute from './routes/webhooks';
import inviteRoutes from './routes/invite';
import settingsRoute from './routes/settings';
import inviteRoutes from './routes/invite';

import webhooksRoutes from './routes/webhooks';
import inviteRoutes from './routes/invite';
dotenv.config();

const app = express();
// Simple health check for Render
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// // initSentry(app);
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://agentic-ai-platform-rouge.vercel.app'],
  credentials: true,
}));
const port = process.env.PORT || 5000;
const prisma = new PrismaClient();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentsRoute);
app.use('/api/settings', settingsRoute);
app.use('/api/webhooks', webhooksRoute);
app.use('/api/reviews', reviewsRoute);
app.use('/api/audit-logs', auditLogsRoute);
app.use('/api/messages', messagesRoute);
app.use('/api/documents', documentsRoute);
app.use('/api/recordings', recordingsRoute);
app.use('/api/aiq', aiqRoutes);
app.use('/api/templates', templatesRoute);
app.use('/api/staking', stakingRoute);
app.use('/api/governance', governanceRoute);
app.use('/api/nodes', nodeRoute);
app.use('/api/teams', teamsRoute);
app.use('/api/agent-versions', agentVersionsRoute);
app.use('/api/test', testRoute);

// Database connection
prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Database connection failed:', err));

app.use('/api/webhooks', webhooksRoutes);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Routes registered:');
  console.log('- /api/auth');
  console.log('- /api/agents');
  console.log('- /api/messages');
  console.log('- /api/documents');
  console.log('- /api/recordings');
  console.log('- /api/aiq');
  console.log('- /api/templates');
  console.log('- /api/staking');
  console.log('- /api/governance');
  console.log('- /api/nodes');
  console.log('- /api/teams');
  console.log('- /api/agent-versions');
  console.log('- /api/test');
});

export default app;














// Sentry error handler must be before any other error middleware
// if (process.env.SENTRY_DSN) // app.use(Sentry.Handlers.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err: any, req: any, res: any, next: any) {
  console.error(err);
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});





// Force redeploy at 2026-03-21 15:30:55

// Force redeploy at 2026-03-21 17:38:24
