import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import agentsRoutes from './routes/agents';
import stakingRoutes from './routes/staking';
// import governanceRoutes from './routes/governance';
// // import nodesRoutes from './routes/nodes';
// import platformsRoutes from './routes/platforms';
// import ventureRoutes from './routes/venture';
// import marketplaceRoutes from './routes/marketplace';
// import franchiseRoutes from './routes/franchise';
// import replicationRoutes from './routes/replication';
// import learningRoutes from './routes/learning';
// import connectorsRoutes from './routes/connectors';
// import derivativesRoutes from './routes/derivatives';
// import insightsRoutes from './routes/insights';
// import nationRoutes from './routes/nation';
// import moatsRoutes from './routes/moats';
// import notificationsRoutes from './routes/notifications';
// import templatesRoutes from './routes/templates';
// import aiMarketplaceRoutes from './routes/aiMarketplace';
// import autonomousBusinessRoutes from './routes/autonomousBusiness';

const app = express();
const prisma = new PrismaClient();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/staking', stakingRoutes);
// app.use('/api/governance', governanceRoutes);
// // app.use('/api/nodes', nodesRoutes);
// // app.use('/api/platforms', platformsRoutes);
// // app.use('/api/venture', ventureRoutes);
// app.use('/api/marketplace', marketplaceRoutes);
// app.use('/api/franchise', franchiseRoutes);
// // app.use('/api/replication', replicationRoutes);
// // app.use('/api/learning', learningRoutes);
// // app.use('/api/connectors', connectorsRoutes);
// // app.use('/api/derivatives', derivativesRoutes);
// // app.use('/api/insights', insightsRoutes);
// app.use('/api/nation', nationRoutes);
// app.use('/api/moats', moatsRoutes);
// // app.use('/api/notifications', notificationsRoutes);
// // app.use('/api/templates', templatesRoutes);
app.use('/api/ai-marketplace', aiMarketplaceRoutes);
app.use('/api/autonomous-business', autonomousBusinessRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Database connected');
});








