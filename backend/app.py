# backend/app.py - Clean working version
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uuid
from datetime import datetime
import os

app = FastAPI(
    title="Agentic AI Platform API",
    description="AWS for AI Agents",
    version="3.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class AgentCreate(BaseModel):
    name: str
    agent_type: str = "researcher"

class TeamCreate(BaseModel):
    name: str
    agent_ids: List[str]

# Storage
agents_db = []
teams_db = []

# API endpoints
@app.get("/")
def root():
    return {
        "message": "Agentic AI Platform API",
        "version": "3.0.0",
        "status": "running",
        "database": "memory (use /init-db for PostgreSQL)"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "agents": len(agents_db)
    }

@app.get("/agents")
def list_agents():
    return {"agents": agents_db, "count": len(agents_db)}

@app.post("/agents")
def create_agent(agent: AgentCreate):
    agent_id = f"agent_{uuid.uuid4().hex[:8]}"
    
    agent_data = {
        "id": agent_id,
        "name": agent.name,
        "type": agent.agent_type,
        "status": "active",
        "created_at": datetime.now().isoformat()
    }
    
    agents_db.append(agent_data)
    
    return {
        "agent": agent_data,
        "message": "Agent created",
        "database": "memory"
    }

@app.get("/database/status")
def database_status():
    """Check if we can connect to Render PostgreSQL"""
    try:
        db_url = os.getenv("DATABASE_URL", "")
        if "postgresql://" in db_url:
            import psycopg2
            # Test connection
            conn = psycopg2.connect(db_url)
            conn.close()
            return {
                "status": "connected",
                "database": "PostgreSQL (Render)",
                "message": "Database connection successful"
            }
        else:
            return {
                "status": "using_sqlite",
                "database": "SQLite (local)",
                "message": "Using local SQLite for development"
            }
    except Exception as e:
        return {
            "status": "error",
            "database": "connection_failed",
            "error": str(e),
            "message": "Check your DATABASE_URL in .env file"
        }

if __name__ == "__main__":
    import uvicorn
    print("Starting Agentic AI Platform v3.0...")
    print("API: http://localhost:8000")
    print("Docs: http://localhost:8000/docs")
    print("Health: http://localhost:8000/health")
    uvicorn.run(app, host="0.0.0.0", port=8000)
