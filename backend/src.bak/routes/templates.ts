import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { agentAI } from '../services/agentIntelligence';

const router = Router();

// GET /api/templates – list all active templates
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const templates = await prisma.businessTemplate.findMany({
      where: { status: "active" },
      orderBy: { name: 'asc' },
    });
    res.json({ templates });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/templates/:id/launch – launch a business from template
router.post('/:id/launch', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as { id: string };
    const { customizations } = req.body; // optional overrides

    // Fetch template
    const template = await prisma.businessTemplate.findUnique({
      where: { id },
    });
    if (!template) return res.status(404).json({ error: 'Template not found' });

    // Merge template configuration with customizations
    const config = { ...(template.configuration as any), ...customizations };

    // Create business
    const business = await prisma.businesses.create({ data: { 
        name: config.name || template.name,
        description: config.description || template.description,
        business_type: template.industry,
        configuration: config,
        owner_id: req.user!.id,
      },
    });

    // Optionally create default agents based on template config
    if (config.agents) {
      for (const agentDef of config.agents) {
        const agent = await prisma.agents.create({ data: { 
            name: agentDef.name,
            agent_type: agentDef.type,
            hourly_rate: agentDef.hourly_rate || 50,
            specialties: agentDef.specialties || [],
            owner_id: req.user!.id,
          },
        });
        // Hire the agent to the business
        await prisma.contracts.create({ data: { 
            businessId: business.id,
            agent_id: agent.id,
            terms: { role: agentDef.role },
            status: 'ACTIVE',
          },
        });
        await prisma.business_agents.create({ data: { businessId: business.id, agent_id: agent.id, role: agentDef.role },
        });
      }
    }

    // Generate marketing copy using AI (optional)
    let marketing = null;
    if (config.generateMarketing) {
      marketing = await agentAI.generateMarketingCopy(business.name, 'target audience');
    }

    res.status(201).json({
      business,
      marketing,
      message: 'Business launched from template',
    });
  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin endpoints (optional) – create/update templates
// We'll skip for now; you can add via direct DB or later.

export default router;
















