@'
# backend/production_ai.py - With real AI integration
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, Column, String, JSON, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Import AI integration
from ai_integration import ai_router

load_dotenv()

# Database setup
Base = declarative_base()

class Agent(Base):
    __tablename__ = "agents"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    type = Column(String)
    system_prompt = Column(Text)
    config = Column(JSON)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

class Team(Base):
    __tablename__ = "teams"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    agent_ids = Column(JSON)
    workflow_config = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class Collaboration(Base):
    __tablename__ = "collaborations"
    id = Column(String, primary_key=True, index=True)
    team_id = Column(String)
    task = Column(Text)
    steps = Column(JSON)
    result = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./agentic_ai.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(bind=engine)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Agentic AI Platform API",
    description="AWS for AI Agents",
    version="5.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Data models
class AgentCreate(BaseModel):
    name: str
    agent_type: str = "researcher"
    system_prompt: Optional[str] = ""
    model: str = "gpt-4"

class TeamCreate(BaseModel):
    name: str
    agent_ids: List[str]
    workflow_type: str = "sequential"

class TaskExecute(BaseModel):
    task: str
    workflow_type: str = "sequential"

class AgentQuery(BaseModel):
    query: str
    agent_id: str

# API endpoints
@app.get("/")
def root():
    return {
        "platform": "Agentic AI Platform",
        "version": "5.0.0",
        "ai_available": os.getenv("OPENAI_API_KEY") is not None or os.getenv("ANTHROPIC_API_KEY") is not None,
        "database": "PostgreSQL" if "postgresql" in DATABASE_URL else "SQLite"
    }

@app.get("/health")
def health(db: Session = Depends(get_db)):
    agents_count = db.query(Agent).count()
    return {
        "status": "healthy",
        "agents": agents_count,
        "ai_status": "ready" if (os.getenv("OPENAI_API_KEY") or os.getenv("ANTHROPIC_API_KEY")) else "mock",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/agents")
def list_agents(db: Session = Depends(get_db)):
    agents = db.query(Agent).all()
    return {
        "agents": [
            {
                "id": a.id,
                "name": a.name,
                "type": a.type,
                "system_prompt": a.system_prompt,
                "status": a.status
            } for a in agents
        ],
        "count": len(agents)
    }

@app.post("/agents")
def create_agent(agent: AgentCreate, db: Session = Depends(get_db)):
    agent_id = f"agent_{uuid.uuid4().hex[:8]}"
    
    db_agent = Agent(
        id=agent_id,
        name=agent.name,
        type=agent.agent_type,
        system_prompt=agent.system_prompt,
        config={"model": agent.model}
    )
    
    db.add(db_agent)
    db.commit()
    
    return {
        "agent": {
            "id": db_agent.id,
            "name": db_agent.name,
            "type": db_agent.type,
            "system_prompt": db_agent.system_prompt
        },
        "message": "AI Agent created successfully"
    }

@app.post("/agents/{agent_id}/query")
def query_agent(agent_id: str, query: AgentQuery, db: Session = Depends(get_db)):
    """Query a specific AI agent"""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Get AI response
    ai_response = ai_router.generate_response(
        agent_type=agent.type,
        task=query.query,
        system_prompt=agent.system_prompt or f"You are a {agent.type} AI assistant."
    )
    
    return {
        "agent": agent.name,
        "type": agent.type,
        "query": query.query,
        "response": ai_response["content"],
        "ai_model": ai_response["model"],
        "success": ai_response["success"]
    }

@app.post("/teams/{team_id}/execute")
def execute_team_task(team_id: str, task: TaskExecute, db: Session = Depends(get_db)):
    """Execute a task with a team of agents"""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    steps = []
    results = []
    
    # Execute workflow based on type
    if task.workflow_type == "sequential":
        for agent_id in team.agent_ids:
            agent = db.query(Agent).filter(Agent.id == agent_id).first()
            if agent:
                # Get AI response
                ai_response = ai_router.generate_response(
                    agent_type=agent.type,
                    task=task.task,
                    system_prompt=agent.system_prompt or f"You are a {agent.type} AI assistant."
                )
                
                step = {
                    "agent": agent.name,
                    "type": agent.type,
                    "input": task.task,
                    "output": ai_response["content"],
                    "model": ai_response["model"],
                    "success": ai_response["success"]
                }
                steps.append(step)
                results.append(ai_response["content"])
    
    # Save collaboration
    collab_id = f"collab_{uuid.uuid4().hex[:8]}"
    db_collab = Collaboration(
        id=collab_id,
        team_id=team_id,
        task=task.task,
        steps=steps,
        result="\n\n".join(results)
    )
    db.add(db_collab)
    db.commit()
    
    return {
        "collaboration_id": collab_id,
        "team": team.name,
        "task": task.task,
        "workflow": task.workflow_type,
        "steps": steps,
        "final_result": "\n\n".join(results),
        "agents_used": len(steps)
    }

if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("🤖 AGENTIC AI PLATFORM v5.0 - REAL AI INTEGRATION")
    print("=" * 60)
    print("AI Status:", "Ready (API keys found)" if (os.getenv("OPENAI_API_KEY") or os.getenv("ANTHROPIC_API_KEY")) else "Mock (add API keys)")
    print("Database:", "PostgreSQL" if "postgresql" in DATABASE_URL else "SQLite")
    print("URL: http://localhost:8000")
    print("Docs: http://localhost:8000/docs")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8000)
'@ | Set-Content -Path "backend/production_ai.py" -Encoding UTF8