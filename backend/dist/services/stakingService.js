"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRewardRate = calculateRewardRate;
exports.distributeRevenueShare = distributeRevenueShare;
// Calculate dynamic reward rate based on agent performance
function calculateRewardRate(agent) {
    const baseRate = 0.01; // 1% daily base
    const successBonus = agent.successRate ? (agent.successRate - 0.85) * 0.1 : 0; // extra up to 1.5%
    const reputationBonus = agent.reputationScore ? (agent.reputationScore - 1000) / 10000 : 0; // max +1%
    return Math.min(baseRate + successBonus + reputationBonus, 0.05); // cap at 5%
}
// Distribute revenue share for an agent's earnings (temporarily simplified)
async function distributeRevenueShare(agentId, earningAmount) {
    // This feature is currently under development
    console.log(`Revenue share for agent ${agentId} of amount ${earningAmount} would be distributed here.`);
    return;
}
