import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Routes
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
import agentVersionsRoute from './routes/agentVersions';
import testRoute from './routes/test';
import inviteRoutes from './routes/invite';
import webhooksRoute from './routes/webhooks';
import reviewsRoute from './routes/reviews';
import auditLogsRoute from './routes/auditLogs';
import settingsRoute from './routes/settings';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const prisma = new PrismaClient();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://agentic-ai-platform-rouge.vercel.app'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentsRoute);
app.use('/api/messages', messagesRoute);
app.use('/api/documents', documentsRoute);
app.use('/api/recordings', recordingsRoute);
app.use('/api/aiq', aiqRoutes);
app.use('/api/templates', templatesRoute);
app.use('/api/staking', stakingRoute);
app.use('/api/governance', governanceRoute);
app.use('/api/nodes', nodesRoute);
app.use('/api/teams', teamsRoute);
app.use('/api/agent-versions', agentVersionsRoute);
app.use('/api/test', testRoute);
app.use('/api/invite', inviteRoutes);
app.use('/api/webhooks', webhooksRoute);
app.use('/api/reviews', reviewsRoute);
app.use('/api/audit-logs', auditLogsRoute);
app.use('/api/settings', settingsRoute);

// Database connection
prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Database connection failed:', err));

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
  console.log('- /api/invite');
  console.log('- /api/webhooks');
  console.log('- /api/reviews');
  console.log('- /api/audit-logs');
  console.log('- /api/settings');
});

export default app;