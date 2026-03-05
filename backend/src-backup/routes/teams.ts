import express from 'express';
import { authenticate } from "../middleware/auth";
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// All team routes require authentication
router.use(authenticate);

// Create a team
router.post('/', async (req, res) => {
  try {
    const { name, description, agentIds } = req.body;
    if (!name || !agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
      return res.status(400).json({ error: 'Name and at least one agent ID required' });
    }

    // Verify agents belong to user
    const agents = await (prisma as any).agents.findMany({
      where: {
        id: { in: agentIds },
        owner_id: req.user!.id
      }
    });
    if (agents.length !== agentIds.length) {
      return res.status(400).json({ error: 'Some agents not found or not owned by you' });
    }

    const team = await (prisma as any).team.create({
      data: {
        name,
        description,
        userId: req.user!.id,
        agents: {
          create: agentIds.map((agentId: string) => ({ agentId }))
        }
      },
      include: { agents: { include: { agents: true } } }
    });
    res.json(team);
  } catch (error) {
    console.error('Team creation error:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Get all teams for user
router.get('/', async (req, res) => {
  try {
    const teams = await (prisma as any).team.findMany({
      where: { userId: req.user!.id },
      include: { agents: { include: { agents: true } } },
      orderBy: { created_at: 'desc' }
    });
    res.json(teams);
  } catch (error) {
    console.error('Fetch teams error:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Get single team
router.get('/:id', async (req, res) => {
  try {
    const team = await (prisma as any).team.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { agents: { include: { agents: true } } }
    });
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  } catch (error) {
    console.error('Fetch team error:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// Update team
router.put('/:id', async (req, res) => {
  try {
    const { name, description, agentIds } = req.body;
    const team = await (prisma as any).team.findFirst({
      where: { id: req.params.id, userId: req.user!.id }
    });
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    if (agentIds !== undefined) {
      if (!Array.isArray(agentIds) || agentIds.length === 0) {
        return res.status(400).json({ error: 'agentIds must be a non-empty array' });
      }
      const agents = await (prisma as any).agents.findMany({
        where: { id: { in: agentIds }, owner_id: req.user!.id }
      });
      if (agents.length !== agentIds.length) {
        return res.status(400).json({ error: 'Some agents not found or not owned by you' });
      }
      updateData.agents = {
        deleteMany: {},
        create: agentIds.map((agentId: string) => ({ agentId }))
      };
    }

    const updated = await (prisma as any).team.update({
      where: { id: req.params.id },
      data: updateData,
      include: { agents: { include: { agents: true } } }
    });
    res.json(updated);
  } catch (error) {
    console.error('Team update error:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// Delete team
router.delete('/:id', async (req, res) => {
  try {
// @ts-ignore
    await (prisma as any).team.deleteMany({
      where: { id: req.params.id, userId: req.user!.id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Team delete error:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

// Send message to team
router.post('/:id/messages', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Message content required' });

    const team = await (prisma as any).team.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { agents: { include: { agents: true } } }
    });
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const messages = await prisma.$transaction(
      team.agents.map((tag: { agentId: string }) =>
// @ts-ignore
        (prisma as any).message.create({
          data: {
            content,
            senderId: req.user!.id,
            receiverId: tag.agentId,
            status: 'sent'
          }
        })
      )
    );

    res.json({ messages, teamId: team.id, count: messages.length });
  } catch (error) {
    console.error('Team message error:', error);
    res.status(500).json({ error: 'Failed to send message to team' });
  }
});

export default router;





