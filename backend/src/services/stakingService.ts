import { prisma } from '../lib/prisma';

// Calculate dynamic reward rate based on agent performance
export function calculateRewardRate(agent: any): number {
  const baseRate = 0.01; // 1% daily base
  const successBonus = agent.successRate ? (agent.successRate - 0.85) * 0.1 : 0; // extra up to 1.5%
  const reputationBonus = agent.reputationScore ? (agent.reputationScore - 1000) / 10000 : 0; // max +1%
  return Math.min(baseRate + successBonus + reputationBonus, 0.05); // cap at 5%
}

// Distribute revenue share for an agent's earnings (temporarily simplified)
export async function distributeRevenueShare(agentId: string, earningAmount: number) {
  // This feature is currently under development
  console.log(`Revenue share for agent ${agentId} of amount ${earningAmount} would be distributed here.`);
  return;
}

