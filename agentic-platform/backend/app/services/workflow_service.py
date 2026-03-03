# backend/app/services/workflow_service.py
from typing import List, Dict, Any
import asyncio
from app.models.agent import Agent

class WorkflowService:
    def __init__(self, db):
        self.db = db
    
    async def execute_workflow(self, workflow_config: Dict, user_input: str):
        """
        Execute a sequence of agents as a workflow
        
        Example workflow_config:
        {
            "name": "Content Creation Workflow",
            "agents": [
                {"id": 1, "input_template": "{input}"},
                {"id": 2, "input_template": "{step1_output}"},
                {"id": 3, "input_template": "Combine: {step1_output} and {step2_output}"}
            ]
        }
        """
        results = {}
        
        for i, agent_step in enumerate(workflow_config["agents"]):
            agent = self.db.query(Agent).get(agent_step["id"])
            
            if not agent:
                raise ValueError(f"Agent {agent_step['id']} not found")
            
            # Prepare input with previous results
            input_text = agent_step["input_template"]
            for key, value in results.items():
                input_text = input_text.replace(f"{{{key}}}", value)
            
            # Execute agent
            from app.services.openai_service import OpenAIService
            openai_service = OpenAIService()
            result = await openai_service.execute_agent(
                agent=agent,
                user_input=input_text
            )
            
            results[f"step{i+1}_output"] = result
            results[f"step{i+1}_agent"] = agent.name
        
        return {
            "workflow_name": workflow_config.get("name", "Unnamed Workflow"),
            "final_output": results.get(f"step{len(workflow_config['agents'])}_output", ""),
            "step_results": results,
            "total_steps": len(workflow_config["agents"])
        }