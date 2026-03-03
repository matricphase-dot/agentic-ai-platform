# simple_backend.py - Working backend (no database issues)
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Agentic AI Platform - Simple",
    description="Working version without database issues",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("=" * 60)
print("🚀 AGENTIC AI - SIMPLE WORKING VERSION")
print("=" * 60)
print("No database - In-memory storage")
print("URL: http://localhost:8000")
print("=" * 60)

# In-memory storage
users_db = []
agents_db = []

class UserRegister(BaseModel):
    email: str
    password: str
    company: Optional[str] = ""
    plan: str = "free"

class AgentCreate(BaseModel):
    name: str
    agent_type: str = "researcher"
    system_prompt: Optional[str] = ""

@app.get("/")
def root():
    return {
        "platform": "Agentic AI Platform",
        "version": "1.0.0",
        "status": "working",
        "storage": "in-memory",
        "users": len(users_db),
        "agents": len(agents_db)
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "database": "in-memory (no connection needed)"
    }

@app.post("/auth/register")
def register_user(user: UserRegister):
    """Simple registration - works without database"""
    # Check if email exists
    if any(u["email"] == user.email for u in users_db):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    api_key = f"ak_{uuid.uuid4().hex[:16]}"
    
    user_data = {
        "id": user_id,
        "email": user.email,
        "password": user.password,  # Note: In production, hash this!
        "company": user.company,
        "plan": user.plan,
        "api_key": api_key,
        "created_at": datetime.now().isoformat(),
        "credits": 100.00
    }
    
    users_db.append(user_data)
    
    # Generate simple token
    token = f"token_{uuid.uuid4().hex[:32]}"
    
    return {
        "user": {
            "id": user_id,
            "email": user.email,
            "plan": user.plan,
            "api_key": api_key,
            "credits": 100.00
        },
        "access_token": token,
        "token_type": "bearer",
        "message": "User registered successfully"
    }

@app.post("/agents")
def create_agent(agent: AgentCreate):
    """Create agent - works without database"""
    agent_id = f"agent_{uuid.uuid4().hex[:8]}"
    
    agent_data = {
        "id": agent_id,
        "name": agent.name,
        "type": agent.agent_type,
        "system_prompt": agent.system_prompt,
        "created_at": datetime.now().isoformat(),
        "status": "active"
    }
    
    agents_db.append(agent_data)
    
    return {
        "agent": agent_data,
        "message": "Agent created successfully",
        "agent_id": agent_id
    }

@app.get("/agents")
def list_agents():
    """List all agents"""
    return {
        "agents": agents_db,
        "count": len(agents_db)
    }

@app.get("/test/users")
def test_users():
    """Test endpoint to see all users"""
    return {
        "users": users_db,
        "count": len(users_db)
    }

if __name__ == "__main__":
    import uvicorn
    print("\n✨ Endpoints available:")
    print("   GET  /              - Platform info")
    print("   GET  /health        - Health check")
    print("   POST /auth/register - Register user")
    print("   POST /agents        - Create agent")
    print("   GET  /agents        - List agents")
    print("   GET  /test/users    - See all users (for testing)")
    print("\n🚀 Starting simple backend...")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
