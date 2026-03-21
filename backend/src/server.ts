// // import * as Sentry from '@sentry/node';
// // import { initSentry } from './sentry';
import teamsRoute from './routes/teams';
import inviteRoutes from './routes/invite';
import messagesRoute from './routes/messages';
import agentVersionsRoute from './routes/agentVersions';
import testRoute from './routes/test';
import cors from 'cors';
import dotenv from 'dotenv';
import templatesRoute from './routes/templates';
import stakingRoute from './routes/staking';
import documentsRoute from './routes/documents';
import express from 'express';
import recordingsRoute from './routes/recordings';
import nodeRoute from './routes/nodes';
import authRoutes from './routes/auth';
import agentsRoute from './routes/agents';
import governanceRoute from './routes/governance';
import aiqRoutes from './routes/aiq';
import { PrismaClient } from '@prisma/client';
import auditLogsRoute from './routes/auditLogs';
import reviewsRoute from './routes/reviews';
import webhooksRoute from './routes/webhooks';
import settingsRoute from './routes/settings';

import webhooksRoutes from './routes/webhooks';
dotenv.config();

const app = express();
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
