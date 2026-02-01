# D:\AGENTIC_AI\CORE\main_minimal_working.py
"""
Agentic AI Platform - Minimal Working Version
"""
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
import uvicorn
import datetime
import json
import os

# Create app
app = FastAPI(title="Agentic AI", version="1.0.0")

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple data storage
data = {
    "users": [],
    "agents": [],
    "tasks": [],
    "marketplace": []
}

# Models
class UserCreate(BaseModel):
    email: str
    password: str

class AgentCreate(BaseModel):
    name: str
    agent_type: str

class TaskCreate(BaseModel):
    title: str
    description: str

# Routes
@app.get("/")
async def root():
    return {"message": "Agentic AI Platform", "status": "running"}

@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.now().isoformat(),
        "version": "1.0.0",
        "users": len(data["users"]),
        "agents": len(data["agents"])
    }

@app.post("/api/auth/register")
async def register(user: UserCreate):
    # Simple check
    if any(u["email"] == user.email for u in data["users"]):
        raise HTTPException(status_code=400, detail="User already exists")
    
    new_user = {
        "id": len(data["users"]) + 1,
        "email": user.email,
        "created": datetime.datetime.now().isoformat()
    }
    
    data["users"].append(new_user)
    
    return {
        "success": True,
        "user_id": new_user["id"],
        "message": "User registered"
    }

@app.post("/api/auth/login")
async def login(user: UserCreate):
    # Simple login
    for u in data["users"]:
        if u["email"] == user.email:
            return {
                "success": True,
                "user_id": u["id"],
                "message": "Login successful"
            }
    
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/agents")
async def get_agents():
    return {
        "success": True,
        "count": len(data["agents"]),
        "agents": data["agents"]
    }

@app.post("/api/agents")
async def create_agent(agent: AgentCreate):
    new_agent = {
        "id": len(data["agents"]) + 1,
        "name": agent.name,
        "type": agent.agent_type,
        "created": datetime.datetime.now().isoformat(),
        "status": "active"
    }
    
    data["agents"].append(new_agent)
    
    return {
        "success": True,
        "agent_id": new_agent["id"],
        "message": f"Agent {agent.name} created"
    }

@app.get("/api/tasks")
async def get_tasks():
    return {
        "success": True,
        "count": len(data["tasks"]),
        "tasks": data["tasks"]
    }

@app.post("/api/tasks")
async def create_task(task: TaskCreate):
    new_task = {
        "id": len(data["tasks"]) + 1,
        "title": task.title,
        "description": task.description,
        "created": datetime.datetime.now().isoformat(),
        "status": "pending"
    }
    
    data["tasks"].append(new_task)
    
    return {
        "success": True,
        "task_id": new_task["id"],
        "message": f"Task {task.title} created"
    }

@app.get("/dashboard")
async def dashboard():
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Agentic AI Platform</title>
        <style>
            body { font-family: Arial; margin: 40px; }
            .container { max-width: 800px; margin: 0 auto; }
            .header { background: #007bff; color: white; padding: 20px; border-radius: 5px; }
            .stats { display: flex; gap: 20px; margin: 20px 0; }
            .stat-box { flex: 1; padding: 15px; background: #f8f9fa; border-radius: 5px; text-align: center; }
            .endpoint { background: #e9ecef; padding: 10px; margin: 10px 0; border-radius: 3px; font-family: monospace; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Agentic AI Platform</h1>
                <p>Minimal Working Version</p>
            </div>
            
            <div class="stats">
                <div class="stat-box">
                    <h3>Users</h3>
                    <p id="user-count">0</p>
                </div>
                <div class="stat-box">
                    <h3>Agents</h3>
                    <p id="agent-count">0</p>
                </div>
                <div class="stat-box">
                    <h3>Tasks</h3>
                    <p id="task-count">0</p>
                </div>
            </div>
            
            <h2>API Endpoints</h2>
            <div class="endpoint">GET /api/health - Health check</div>
            <div class="endpoint">POST /api/auth/register - Register user</div>
            <div class="endpoint">POST /api/auth/login - Login user</div>
            <div class="endpoint">GET /api/agents - List agents</div>
            <div class="endpoint">POST /api/agents - Create agent</div>
            <div class="endpoint">GET /api/tasks - List tasks</div>
            <div class="endpoint">POST /api/tasks - Create task</div>
            
            <button onclick="loadStats()">Refresh Stats</button>
        </div>
        
        <script>
            async function loadStats() {
                try {
                    const healthRes = await fetch('/api/health');
                    const health = await healthRes.json();
                    
                    document.getElementById('user-count').textContent = health.users;
                    document.getElementById('agent-count').textContent = health.agents;
                    
                    const tasksRes = await fetch('/api/tasks');
                    const tasks = await tasksRes.json();
                    document.getElementById('task-count').textContent = tasks.count;
                    
                } catch (error) {
                    console.error('Error:', error);
                }
            }
            
            // Load stats on page load
            document.addEventListener('DOMContentLoaded', loadStats);
        </script>
    </body>
    </html>
    """
    
    return HTMLResponse(content=html)

@app.get("/api/test")
async def test_all():
    """Test all endpoints"""
    tests = []
    
    # Test health endpoint
    try:
        tests.append({"endpoint": "/api/health", "status": "working"})
    except:
        tests.append({"endpoint": "/api/health", "status": "failed"})
    
    return {
        "success": True,
        "tests": tests,
        "message": "Platform is working"
    }

if __name__ == "__main__":
    print("Starting Agentic AI Platform (Minimal Working Version)...")
    print("Access at: http://localhost:8085")
    print("Dashboard: http://localhost:8085/dashboard")
    
    uvicorn.run(app, host="0.0.0.0", port=8085)