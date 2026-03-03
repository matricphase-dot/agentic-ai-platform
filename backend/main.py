# backend/main.py - Updated with database integration
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime
from sqlalchemy.orm import Session

# Import database models
from database import get_db, init_db, test_connection, Agent as AgentModel, Team as TeamModel, User as UserModel
import database

app = FastAPI(
    title="Agentic AI Platform API",
    description="The Operating System for AI-Powered Businesses",
    version="2.1.0"  # Updated version
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3003"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    print("🚀 Starting Agentic AI Platform...")
    if test_connection():
        init_db()
        print("✅ Database initialized")
    else:
        print("⚠️  Database connection failed - running in memory mode")

# ===== DATA MODELS =====
class AgentCreate(BaseModel):
    name: str
    agent_type: str = "researcher"
    system_prompt: str = ""
    model: str = "gpt-4"

class TeamCreate(BaseModel):
    name: str
    agent_ids: List[str]
    workflow_type: str = "sequential"

class TaskExecute(BaseModel):
    task: str
    workflow_type: str = "sequential"

# ===== API ENDPOINTS =====

@app.get("/")
async def root():
    return {
        "message": "🚀 Agentic AI Platform API",
        "version": "2.1.0",
        "database": "PostgreSQL (Render)",
        "status": "operational"
    }

@app.get("/health")
async def health(db: Session = Depends(get_db)):
    """Check database connection and app health"""
    try:
        # Test database connection
        db.execute("SELECT 1")
        db_status = "connected"
    except:
        db_status = "disconnected"
    
    return {
        "status": "healthy",
        "database": db_status,
        "timestamp": datetime.now().isoformat(),
        "service": "agent-orchestrator"
    }

@app.get("/agents")
async def list_agents(db: Session = Depends(get_db)):
    """List all AI agents from database"""
    agents = db.query(AgentModel).all()
    
    return {
        "agents": [
            {
                "id": agent.id,
                "name": agent.name,
                "type": agent.type,
                "status": agent.status,
                "created_at": agent.created_at.isoformat() if agent.created_at else None
            }
            for agent in agents
        ],
        "count": len(agents),
        "source": "database"
    }

@app.post("/agents")
async def create_agent(agent: AgentCreate, db: Session = Depends(get_db)):
    """Create a new AI agent in database"""
    agent_id = f"agent_{uuid.uuid4().hex[:8]}"
    
    # Create agent in database
    db_agent = AgentModel(
        id=agent_id,
        user_id="demo_user",  # Replace with actual user ID from auth
        name=agent.name,
        type=agent.agent_type,
        config_json={
            "system_prompt": agent.system_prompt,
            "model": agent.model,
            "created_via": "api"
        },
        status="active",
        metrics_json={}
    )
    
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    
    return {
        "agent": {
            "id": db_agent.id,
            "name": db_agent.name,
            "type": db_agent.type,
            "status": db_agent.status
        },
        "message": "Agent created and saved to database",
        "database_id": db_agent.id
    }

@app.post("/teams")
async def create_team(team: TeamCreate, db: Session = Depends(get_db)):
    """Create a team of agents in database"""
    # Validate all agents exist
    for agent_id in team.agent_ids:
        agent = db.query(AgentModel).filter(AgentModel.id == agent_id).first()
        if not agent:
            raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")
    
    team_id = f"team_{uuid.uuid4().hex[:8]}"
    
    # Create team in database
    db_team = TeamModel(
        id=team_id,
        user_id="demo_user",  # Replace with actual user ID from auth
        name=team.name,
        agent_ids_json=team.agent_ids,
        workflow_config={
            "type": team.workflow_type,
            "created_at": datetime.now().isoformat()
        }
    )
    
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    
    return {
        "team": {
            "id": db_team.id,
            "name": db_team.name,
            "agent_ids": team.agent_ids,
            "workflow_type": team.workflow_type,
            "created_at": db_team.created_at.isoformat() if db_team.created_at else None
        },
        "message": "Team created and saved to database"
    }

@app.get("/teams")
async def list_teams(db: Session = Depends(get_db)):
    """List all teams from database"""
    teams = db.query(TeamModel).all()
    
    return {
        "teams": [
            {
                "id": team.id,
                "name": team.name,
                "agent_count": len(team.agent_ids_json) if team.agent_ids_json else 0,
                "created_at": team.created_at.isoformat() if team.created_at else None
            }
            for team in teams
        ],
        "count": len(teams)
    }

@app.post("/teams/{team_id}/execute")
async def execute_task(team_id: str, task: TaskExecute, db: Session = Depends(get_db)):
    """Execute a task with a team and save collaboration to database"""
    # Find team
    team = db.query(TeamModel).filter(TeamModel.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Find agents
    agents = []
    for agent_id in team.agent_ids_json:
        agent = db.query(AgentModel).filter(AgentModel.id == agent_id).first()
        if agent:
            agents.append(agent)
    
    # Simulate collaboration
    results = []
    for i, agent in enumerate(agents):
        results.append({
            "agent_id": agent.id,
            "agent_name": agent.name,
            "agent_type": agent.type,
            "step": i + 1,
            "action": f"Processed: '{task.task[:50]}...'",
            "status": "completed",
            "timestamp": datetime.now().isoformat()
        })
    
    # Save collaboration to database
    collaboration_id = f"collab_{uuid.uuid4().hex[:8]}"
    from database import Collaboration
    
    db_collab = Collaboration(
        id=collaboration_id,
        team_id=team_id,
        workflow_type=task.workflow_type,
        steps_json=results,
        result=f"Task completed by {len(agents)} agents",
    )
    
    db.add(db_collab)
    db.commit()
    
    return {
        "team": team.name,
        "task": task.task,
        "workflow": task.workflow_type,
        "results": results,
        "summary": f"Task completed by {len(agents)} specialized agents",
        "collaboration_id": collaboration_id,
        "saved_to_database": True,
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Agentic AI Platform (Database Edition)...")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔗 Health Check: http://localhost:8000/health")
    print("💾 Database: PostgreSQL on Render")
    uvicorn.run(app, host="0.0.0.0", port=8000)
