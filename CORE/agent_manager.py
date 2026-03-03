"""
Agent Manager - Manages AI agents lifecycle
"""
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class AgentManager:
    def __init__(self):
        self.agents = {}
        self.agent_stats = {}
        logger.info("Agent Manager initialized")
    
    def register_agent(self, agent_id: str, agent_instance):
        """Register an agent"""
        self.agents[agent_id] = agent_instance
        self.agent_stats[agent_id] = {
            "executions": 0,
            "successes": 0,
            "failures": 0,
            "avg_time": 0
        }
        logger.info(f"Agent registered: {agent_id}")
    
    def get_agent(self, agent_id: str):
        """Get agent instance"""
        return self.agents.get(agent_id)
    
    def list_agents(self) -> List[Dict[str, Any]]:
        """List all registered agents"""
        agents_list = []
        for agent_id, agent in self.agents.items():
            agents_list.append({
                "id": agent_id,
                "name": getattr(agent, "name", agent_id),
                "description": getattr(agent, "description", "No description"),
                "capabilities": getattr(agent, "capabilities", []),
                "status": "active"
            })
        return agents_list
    
    def update_stats(self, agent_id: str, success: bool, execution_time: float):
        """Update agent statistics"""
        if agent_id in self.agent_stats:
            stats = self.agent_stats[agent_id]
            stats["executions"] += 1
            if success:
                stats["successes"] += 1
            else:
                stats["failures"] += 1
            
            # Update average time
            total_time = stats["avg_time"] * (stats["executions"] - 1) + execution_time
            stats["avg_time"] = total_time / stats["executions"]