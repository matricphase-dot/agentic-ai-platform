# backend/app/services/agent_container.py
import docker
import uuid
import json
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional
from docker.errors import DockerException
import logging

logger = logging.getLogger(__name__)

class AgentContainerService:
    def __init__(self):
        self.client = docker.from_env()
        self.containers = {}
        
    def create_agent_container(self, agent_config: Dict[str, Any]) -> str:
        """
        Create a Docker container for an AI agent
        """
        try:
            # Generate unique container name
            container_id = f"agent-{uuid.uuid4().hex[:8]}"
            
            # Prepare environment variables
            env_vars = {
                "AGENT_ID": container_id,
                "AGENT_NAME": agent_config.get("name", "unnamed"),
                "OPENAI_API_KEY": agent_config.get("openai_api_key", ""),
                "MODEL": agent_config.get("model", "gpt-3.5-turbo"),
                "TEMPERATURE": str(agent_config.get("temperature", 0.7)),
                "MAX_TOKENS": str(agent_config.get("max_tokens", 1000)),
            }
            
            # Create container
            container = self.client.containers.run(
                image="python:3.11-slim",  # Base image for agents
                name=container_id,
                environment=env_vars,
                command="python /app/agent_runner.py",  # Will be our agent runner script
                volumes={
                    f"/tmp/agent-{container_id}": {"bind": "/app", "mode": "rw"}
                },
                mem_limit="512m",  # 512MB memory limit
                cpu_period=100000,  # CPU limits
                cpu_quota=50000,    # 0.5 CPU cores
                detach=True,
                auto_remove=True,
                network_mode="bridge",
                labels={
                    "type": "ai-agent",
                    "agent_id": container_id,
                    "user_id": str(agent_config.get("user_id", ""))
                }
            )
            
            # Copy agent code to container
            agent_code = agent_config.get("code", "")
            self._copy_agent_code(container, agent_code)
            
            self.containers[container_id] = {
                "container": container,
                "config": agent_config,
                "created_at": datetime.utcnow(),
                "status": "created"
            }
            
            return container_id
            
        except DockerException as e:
            logger.error(f"Failed to create agent container: {e}")
            raise
    
    def start_agent(self, container_id: str) -> bool:
        """Start an agent container"""
        if container_id not in self.containers:
            return False
        
        try:
            container_data = self.containers[container_id]
            container_data["container"].start()
            container_data["status"] = "running"
            container_data["started_at"] = datetime.utcnow()
            return True
        except Exception as e:
            logger.error(f"Failed to start agent {container_id}: {e}")
            return False
    
    def stop_agent(self, container_id: str) -> bool:
        """Stop an agent container"""
        if container_id not in self.containers:
            return False
        
        try:
            container_data = self.containers[container_id]
            container_data["container"].stop(timeout=10)
            container_data["status"] = "stopped"
            container_data["stopped_at"] = datetime.utcnow()
            return True
        except Exception as e:
            logger.error(f"Failed to stop agent {container_id}: {e}")
            return False
    
    def get_agent_status(self, container_id: str) -> Dict[str, Any]:
        """Get agent container status"""
        if container_id not in self.containers:
            return {"status": "not_found"}
        
        container_data = self.containers[container_id]
        container = container_data["container"]
        
        try:
            container.reload()
            return {
                "status": container.status,
                "created_at": container_data["created_at"].isoformat(),
                "started_at": container_data.get("started_at", ""),
                "config": container_data["config"]
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    def list_agents(self, user_id: Optional[str] = None) -> list:
        """List all agent containers"""
        if user_id:
            return [cid for cid, data in self.containers.items() 
                   if data["config"].get("user_id") == user_id]
        return list(self.containers.keys())
    
    def _copy_agent_code(self, container, code: str):
        """Copy agent code into container"""
        # This is a simplified version
        # In production, we'd use container.put_archive()
        pass
    
    def create_agent_runner_script(self):
        """Create the base agent runner script"""
        agent_runner = '''
import os
import json
import asyncio
from openai import AsyncOpenAI
from fastapi import FastAPI, HTTPException
import uvicorn

# Initialize OpenAI client
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Agent configuration
AGENT_ID = os.getenv("AGENT_ID")
MODEL = os.getenv("MODEL", "gpt-3.5-turbo")
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.7"))
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "1000"))

app = FastAPI(title=f"AI Agent - {AGENT_ID}")

class AIAgent:
    def __init__(self):
        self.memory = []
        self.capabilities = []
        
    async def process(self, input_text: str, context: dict = None) -> str:
        """Process input and generate response"""
        try:
            # Prepare messages
            messages = [
                {"role": "system", "content": "You are a helpful AI assistant."},
                {"role": "user", "content": input_text}
            ]
            
            # Add context if provided
            if context:
                messages.insert(1, {"role": "system", "content": f"Context: {json.dumps(context)}"})
            
            # Call OpenAI API
            response = await client.chat.completions.create(
                model=MODEL,
                messages=messages,
                temperature=TEMPERATURE,
                max_tokens=MAX_TOKENS
            )
            
            result = response.choices[0].message.content
            
            # Store in memory
            self.memory.append({
                "input": input_text,
                "response": result,
                "timestamp": asyncio.get_event_loop().time()
            })
            
            return result
            
        except Exception as e:
            return f"Error: {str(e)}"

# Create agent instance
agent = AIAgent()

@app.get("/health")
async def health():
    return {"status": "healthy", "agent_id": AGENT_ID}

@app.post("/process")
async def process_input(data: dict):
    input_text = data.get("input", "")
    context = data.get("context", {})
    
    if not input_text:
        raise HTTPException(status_code=400, detail="Input text is required")
    
    result = await agent.process(input_text, context)
    return {"result": result, "agent_id": AGENT_ID}

@app.get("/memory")
async def get_memory():
    return {"memory": agent.memory}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
'''
        return agent_runner