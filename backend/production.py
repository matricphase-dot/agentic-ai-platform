# backend/production.py - Production-ready with auto-database selection
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, String, JSON, DateTime, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import sys

load_dotenv()

# ===== DATABASE SETUP =====
Base = declarative_base()

class AgentDB(Base):
    __tablename__ = "agents"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    type = Column(String)
    config = Column(JSON)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

class TeamDB(Base):
    __tablename__ = "teams"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    agent_ids = Column(JSON)
    workflow_config = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

# Get database URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./agentic_prod.db")

# Create engine with appropriate settings
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    print("💾 Using SQLite database (development)")
else:
    engine = create_engine(DATABASE_URL)
    print("🌐 Using PostgreSQL database (production)")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ===== FASTAPI APP =====
app = FastAPI(
    title="Agentic AI Platform API",
    description="The Operating System for AI-Powered Businesses",
    version="4.0.0"
)

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
    system_prompt: Optional[str] = ""

class TeamCreate(BaseModel):
    name: str
    agent_ids: List[str]
    workflow_type: str = "sequential"

# ===== API ENDPOINTS =====
@app.get("/")
def root():
    db_type = "SQLite" if "sqlite" in DATABASE_URL else "PostgreSQL"
    return {
        "platform": "Agentic AI Platform",
        "version": "4.0.0",
        "database": db_type,
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
        agents_count = db.query(AgentDB).count()
    except Exception as e:
        db_status = f"error: {str(e)[:50]}"
        agents_count = 0
    
    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "agents_count": agents_count,
        "timestamp": datetime.now().isoformat(),
        "database_type": "PostgreSQL" if "postgresql" in DATABASE_URL else "SQLite"
    }

@app.get("/agents")
def list_agents(db: Session = Depends(get_db)):
    agents = db.query(AgentDB).order_by(AgentDB.created_at.desc()).all()
    return {
        "agents": [
            {
                "id": a.id,
                "name": a.name,
                "type": a.type,
                "status": a.status,
                "created_at": a.created_at.isoformat()
            } for a in agents
        ],
        "count": len(agents),
        "database": "PostgreSQL" if "postgresql" in DATABASE_URL else "SQLite"
    }

@app.post("/agents")
def create_agent(agent: AgentCreate, db: Session = Depends(get_db)):
    agent_id = f"agent_{uuid.uuid4().hex[:8]}"
    
    db_agent = AgentDB(
        id=agent_id,
        name=agent.name,
        type=agent.agent_type,
        config={"system_prompt": agent.system_prompt},
        status="active"
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
        "message": "Agent created successfully",
        "database": "PostgreSQL" if "postgresql" in DATABASE_URL else "SQLite"
    }

@app.post("/teams")
def create_team(team: TeamCreate, db: Session = Depends(get_db)):
    # Validate agents exist
    for agent_id in team.agent_ids:
        if not db.query(AgentDB).filter(AgentDB.id == agent_id).first():
            raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")
    
    team_id = f"team_{uuid.uuid4().hex[:8]}"
    
    db_team = TeamDB(
        id=team_id,
        name=team.name,
        agent_ids=team.agent_ids,
        workflow_config={"type": team.workflow_type}
    )
    
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    
    return {
        "team": {
            "id": db_team.id,
            "name": db_team.name,
            "agent_ids": team.agent_ids,
            "created_at": db_team.created_at.isoformat()
        },
        "message": "Team created successfully"
    }

@app.get("/database/info")
def database_info():
    """Get database connection details"""
    db_type = "PostgreSQL" if "postgresql" in DATABASE_URL else "SQLite"
    safe_url = DATABASE_URL
    
    # Hide password for security
    if "@" in safe_url and "postgresql" in safe_url:
        parts = safe_url.split("@")
        if ":" in parts[0]:
            user_pass = parts[0].split(":")
            if len(user_pass) > 1:
                safe_url = f"postgresql://{user_pass[0]}:****@{parts[1]}"
    
    return {
        "type": db_type,
        "url_safe": safe_url,
        "status": "configured"
    }

if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("🚀 AGENTIC AI PLATFORM - PRODUCTION READY")
    print("=" * 60)
    print(f"Database: {'PostgreSQL (Render)' if 'postgresql' in DATABASE_URL else 'SQLite (Local)'}")
    print(f"API URL: http://localhost:8000")
    print(f"Docs: http://localhost:8000/docs")
    print(f"Health: http://localhost:8000/health")
    print("=" * 60)
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
