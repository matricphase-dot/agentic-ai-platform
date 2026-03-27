import express from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Get all teams for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const teams = await prisma.teams.findMany({
      where: { userId },
      include: {
        team_agents: {
          include: { agent: true }
        }
      }
    });
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Get a specific team by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const team = await prisma.teams.findFirst({
      where: { id: id as string, userId },
      include: {
        team_agents: {
          include: { agent: true }
        }
      }
    });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// Create a new team
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, agentIds } = req.body;
    const userId = (req as any).user.id;

    // Validate that all agents exist and belong to the user
    if (agentIds && agentIds.length > 0) {
      const agents = await prisma.agents.findMany({
        where: {
          id: { in: agentIds },
          ownerId: userId
        }
      });
      if (agents.length !== agentIds.length) {
        return res.status(400).json({ error: 'Some agents not found or not owned by you' });
      }
    }

    const team = await prisma.teams.create({
      data: {
        name,
        description,
        userId,
        team_agents: agentIds ? {
          create: agentIds.map((agentId: string) => ({ agentId }))
        } : undefined
      },
      include: {
        team_agents: {
          include: { agent: true }
        }
      }
    });
    res.status(201).json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Update a team
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, agentIds } = req.body;
    const userId = (req as any).user.id;

    // Verify team ownership
    const existingTeam = await prisma.teams.findFirst({
      where: { id: id as string, userId }
    });
    if (!existingTeam) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Validate agents if provided
    if (agentIds) {
      const agents = await prisma.agents.findMany({
        where: {
          id: { in: agentIds },
          ownerId: userId
        }
      });
      if (agents.length !== agentIds.length) {
        return res.status(400).json({ error: 'Some agents not found or not owned by you' });
      }
    }

    // Update team and its agents
    const updatedTeam = await prisma.teams.update({
      where: { id: id as string },
      data: {
        name,
        description,
        team_agents: agentIds ? {
          deleteMany: {},
          create: agentIds.map((agentId: string) => ({ agentId }))
        } : undefined
      },
      include: {
        team_agents: {
          include: { agent: true }
        }
      }
    });
    res.json(updatedTeam);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// Delete a team
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // Verify team ownership
    const existingTeam = await prisma.teams.findFirst({
      where: { id: id as string, userId }
    });
    if (!existingTeam) {
      return res.status(404).json({ error: 'Team not found' });
    }

    await prisma.teams.delete({
      where: { id: id as string }
    });
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

export default router;

