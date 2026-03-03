# backend/main.py - Fixed version with lifespan
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime
from sqlalchemy.orm import Session

# Import database models
from database import get_db, init_db, test_connection, Agent as AgentModel, Team as TeamModel, User as UserModel, Collaboration

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting Agentic AI Platform...")
    if test_connection():
        init_db()
        print("✅ Database initialized")
    else:
        print("⚠️  Database connection failed - running in memory mode")
    yield
    # Shutdown
    print("👋 Shutting down Agentic AI Platform")

app = FastAPI(
    title="Agentic AI Platform API",
    description="The Operating System for AI-Powered Businesses",
    version="2.2.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        "version": "2.2.0",
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
    except Exception as e:
        db_status = f"disconnected: {str(e)}"
    
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
        user_id="demo_user",
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

# Simple in-memory fallback if database fails
agents_memory = {}
teams_memory = {}

@app.post("/agents/memory")
async def create_agent_memory(agent: AgentCreate):
    """Create agent in memory (fallback)"""
    agent_id = f"agent_mem_{uuid.uuid4().hex[:8]}"
    
    agent_data = {
        "id": agent_id,
        "name": agent.name,
        "type": agent.agent_type,
        "status": "active"
    }
    
    agents_memory[agent_id] = agent_data
    
    return {
        "agent": agent_data,
        "message": "Agent created in memory (database fallback)",
        "warning": "Database connection failed, using memory storage"
    }

@app.get("/agents/memory")
async def list_agents_memory():
    """List agents from memory"""
    return {
        "agents": list(agents_memory.values()),
        "count": len(agents_memory),
        "source": "memory"
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Agentic AI Platform v2.2...")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔗 Health Check: http://localhost:8000/health")
    print("💾 Trying PostgreSQL on Render...")
    uvicorn.run(app, host="0.0.0.0", port=8001)  # Use port 8001 to avoid conflict
