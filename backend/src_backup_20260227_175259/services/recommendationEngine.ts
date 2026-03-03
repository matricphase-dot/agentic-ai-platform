import prisma from '../lib/prisma';

export class RecommendationEngine {
  // Generate recommendations for a specific user
  static async generateForUser(user_id: string): Promise<void> {
    const user = await prisma.users.findUnique({
      where: { id: user_id },
      include: {
        agents: true,
        businesses: { include: { agents: true } },
        stakes: { include: { agent: true } },
      },
    });
    if (!user) return;

    const recommendations = [];

    // Rule 1: If an agent's reputation is high and no one has staked recently, suggest staking
    for (const agent of user.agents) {
      if (agent.reputation_score > 1500) {
        const recentStakes = await prisma.stakes.count({
          where: { agent_id: agent.id, created_at: { gte: new Date(Date.now() - 7*24*60*60*1000) } },
        });
        if (recentStakes === 0) {
          recommendations.push({
            type: 'stake',
            title: 'High-reputation agent available',
            description: `${agent.name} has a reputation of ${agent.reputation_score}. Consider staking to earn rewards.`,
            priority: 3,
            metadata: { agent_id: agent.id },
          });
        }
      }
    }

    // Rule 2: If a business's revenue dropped month-over-month, suggest hiring a marketing agent
    for (const business of user.businesses) {
      // Simplified: check if revenue is less than average? We'll use a placeholder.
      if (business.revenue < 1000) { // arbitrary threshold
        recommendations.push({
          type: 'hire',
          title: 'Boost your business revenue',
          description: `${business.name} revenue is low. Hire a marketing agent from the marketplace.`,
          priority: 4,
          metadata: { businessId: business.id },
        });
      }
    }

    // Rule 3: If user has no businesses, suggest launching one
    if (user.businesses.length === 0) {
      recommendations.push({
        type: 'launch',
        title: 'Start your first AI business',
        description: 'Launch an autonomous business with our zero-code builder.',
        priority: 5,
        metadata: {},
      });
    }

    // Rule 4: If an agent's earnings are high, suggest creating a blueprint
    for (const agent of user.agents) {
      if (agent.totalEarnings > 500) {
        recommendations.push({
          type: 'blueprint',
          title: 'Monetize your successful agent',
          description: `${agent.name} earned $${agent.totalEarnings}. Create a blueprint to sell copies.`,
          priority: 4,
          metadata: { agent_id: agent.id },
        });
      }
    }

    // Save recommendations (replace old ones)
    await prisma.recommendations.deleteMany({ where: { user_id } });
    for (const rec of recommendations) {
      await prisma.recommendations.create({ data: { 
          user_id,
          type: rec.type,
          title: rec.title,
          description: rec.description,
          priority: rec.priority,
          metadata: rec.metadata,
        },
      });
    }
  }

  // Generate for all users (could be run periodically)
  static async generateForAllUsers(): Promise<void> {
    const users = await prisma.users.findMany({ select: { id: true } });
    for (const user of users) {
      await this.generateForUser(user.id);
    }
  }
}













