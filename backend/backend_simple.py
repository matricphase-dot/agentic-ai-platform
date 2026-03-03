# backend/backend_simple.py - Simple working backend
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uuid
from datetime import datetime

app = FastAPI(
    title="Agentic AI Platform API",
    description="The Operating System for AI-Powered Businesses",
    version="2.3.0"
)

# CORS - Allow all for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== DATA MODELS =====
class AgentCreate(BaseModel):
    name: str
    agent_type: str = "researcher"

class TeamCreate(BaseModel):
    name: str
    agent_ids: List[str]

# Simple in-memory storage (we'll add DB later)
agents_storage = []
teams_storage = []

# ===== API ENDPOINTS =====

@app.get("/")
async def root():
    return {"message": "🚀 Agentic AI Platform API", "status": "running"}

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "agents_count": len(agents_storage),
        "version": "2.3.0"
    }

@app.get("/agents")
async def list_agents():
    return {
        "agents": agents_storage,
        "count": len(agents_storage),
        "source": "memory"
    }

@app.post("/agents")
async def create_agent(agent: AgentCreate):
    agent_id = f"agent_{uuid.uuid4().hex[:8]}"
    
    agent_data = {
        "id": agent_id,
        "name": agent.name,
        "type": agent.agent_type,
        "status": "active",
        "created_at": datetime.now().isoformat()
    }
    
    agents_storage.append(agent_data)
    
    return {
        "agent": agent_data,
        "message": "Agent created successfully",
        "database": "memory (SQLite coming soon)"
    }

@app.post("/teams")
async def create_team(team: TeamCreate):
    team_id = f"team_{uuid.uuid4().hex[:8]}"
    
    team_data = {
        "id": team_id,
        "name": team.name,
        "agent_ids": team.agent_ids,
        "created_at": datetime.now().isoformat()
    }
    
    teams_storage.append(team_data)
    
    return {
        "team": team_data,
        "message": "Team created successfully"
    }

@app.get("/teams")
async def list_teams():
    return {
        "teams": teams_storage,
        "count": len(teams_storage)
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Agentic AI Platform v2.3...")
    print("📚 API Docs: http://localhost:8000/docs")
    print("🔗 Health: http://localhost:8000/health")
    print("🎯 Frontend: http://localhost:3000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
