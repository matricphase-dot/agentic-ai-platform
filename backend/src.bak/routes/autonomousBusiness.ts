import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from "../middleware/auth";
import { agentAI } from '../services/agentIntelligence';

const router = Router();

// POST /api/business/launch â€“ Launch an autonomous business from an idea
router.post('/launch', authenticate, async (req: AuthRequest, res) => {
  try {
    const { idea, industry = 'ECOMMERCE', initialCapital = 0 } = req.body;

    // 1. AI: Market analysis
    const marketAnalysis = await agentAI.analyzeMarket(idea);

    // 2. AI: Generate business plan (you can add a new method in agentIntelligence)
    // For simplicity, we reuse analyzeMarket and generateMarketingCopy later.
    // In a full version, you'd have a dedicated businessPlan method.

    // 3. Create Business record
    const business = await (prisma as any).businesses.create({ data: { 
        name: `${idea} â€“ Autonomous`,
        description: `AIâ€‘generated business for: ${idea}`,
        business_type: industry as any,
        configuration: {
          idea,
          marketAnalysis,
          status: 'LAUNCHED',
        },
        owner_id: req.user!.id,
      },
    });

    // 4. Find or create a team of agents
    const requiredRoles = ['MARKETING', 'RESEARCH', 'CODING'];
    const team: any[] = [];

    for (const role of requiredRoles) {
      // Try to find an idle agent of this type
      let agent = await (prisma as any).agents.findFirst({
        where: { agent_type: role as any, status: 'IDLE' },
      });

      // If none, create a default agent
      if (!agent) {
        agent = await (prisma as any).agents.create({ data: { 
            name: `Autoâ€‘${role} Agent`,
            description: `Default ${role} agent created for autonomous business`,
            agent_type: role as any,
            hourly_rate: 50,
            specialties: [role.toLowerCase()],
            owner_id: req.user!.id, // The business owner also owns the agent
            status: 'IDLE',
          },
        });
      }

      // Hire the agent to the business
// @ts-ignore
      await (prisma as any).contracts.create({ data: { 
          businessId: business.id,
          agentId: agent.id,
          terms: { role, revenueShare: 0.15 },
          status: 'ACTIVE',
        },
      });

// @ts-ignore
      await (prisma as any).business_agents.create({ data: { 
          businessId: business.id,
          agentId: agent.id,
          role,
        },
      });

      // Update agent status to WORKING
// @ts-ignore
      await (prisma as any).agents.update({
        where: { id: agent.id },
        data: { status: 'WORKING' },
      });

      team.push({ id: agent.id, name: agent.name, role });
    }

    // 5. Generate initial marketing copy (using AI)
    const marketingCopy = await agentAI.generateMarketingCopy(idea, 'early adopters');

    // 6. Return the launched business
    res.status(201).json({
      business,
      team,
      marketingMaterials: marketingCopy,
      nextSteps: [
        'Monitor performance in dashboard',
        'Adjust marketing campaigns based on analytics',
        'Scale with additional agents',
      ],
    });

  } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
    console.error('âŒ Business launch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;





















