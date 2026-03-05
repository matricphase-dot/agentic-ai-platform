import ventureRoutes from './routes/venture';
import moatsRoutes from './routes/moats';
import nationRoutes from './routes/nation';
import franchiseRoutes from './routes/franchise';
import agentsRoutes from './routes/agents';
import marketplaceRoutes from './routes/marketplace';
import express from 'express';
import platformRoutes from './routes/platforms';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import stakingRoutes from './routes/staking';
import governanceRoutes from './routes/governance';
import nodeRoutes from './routes/nodes';
dotenv.config();
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});
// Mount routes
app.use('/api/staking', stakingRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/venture', ventureRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/franchise', franchiseRoutes);
app.use('/api/nation', nationRoutes);
app.use('/api/moats', moatsRoutes);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});












