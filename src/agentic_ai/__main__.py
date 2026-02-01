"""
Agentic AI Platform - Complete Working Version
All 6 AI Agents, Marketplace, Dashboard, and API Endpoints
"""

import os
import sys
import sqlite3
import json
from pathlib import Path
from datetime import datetime
from typing import List, Optional

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

# FastAPI imports
from fastapi import FastAPI, Request, WebSocket, HTTPException, Depends
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware

# ==================== APP INITIALIZATION ====================
app = FastAPI(
    title="Agentic AI Platform",
    description="Complete AI Agent Platform with 6 AI Agents & Task Marketplace",
    version="5.2.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== DATABASE ====================
def get_db_connection():
    """Get SQLite database connection"""
    db_path = project_root / "database" / "agentic_ai.db"
    db_path.parent.mkdir(parents=True, exist_ok=True)
    
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """Initialize database tables and sample data"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS agents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            agent_type TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            agent_type TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            result TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS marketplace (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            bounty REAL DEFAULT 0.0,
            status TEXT DEFAULT 'open',
            created_by TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Insert default agents if table is empty
    cursor.execute("SELECT COUNT(*) FROM agents")
    if cursor.fetchone()[0] == 0:
        agents = [
            ("File Organizer Agent", "file_organizer", "Organizes files and folders automatically"),
            ("Student Assistant Agent", "student_assistant", "Helps students with learning and research"),
            ("Email Automation Agent", "email_automation", "Automates email processing and responses"),
            ("Research Assistant Agent", "research_assistant", "Assists with research and data analysis"),
            ("Code Reviewer Agent", "code_reviewer", "Reviews and improves code quality"),
            ("Content Generator Agent", "content_generator", "Generates content for various purposes")
        ]
        cursor.executemany(
            "INSERT INTO agents (name, agent_type, description) VALUES (?, ?, ?)",
            agents
        )
    
    conn.commit()
    conn.close()
    print("✅ Database initialized")

# ==================== TEMPLATES ====================
# Lazy loading to avoid jinja2 import issues
_templates = None
def get_templates():
    global _templates
    if _templates is None:
        templates_dir = project_root / "templates"
        _templates = Jinja2Templates(directory=str(templates_dir))
    return _templates

# ==================== STATIC FILES ====================
static_dir = project_root / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# ==================== WEBSOCKET ====================
active_connections = []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Echo back
            await websocket.send_json({
                "type": "echo",
                "message": "Received your message",
                "your_data": data,
                "timestamp": datetime.now().isoformat()
            })
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        if websocket in active_connections:
            active_connections.remove(websocket)

# ==================== API ENDPOINTS ====================
@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return RedirectResponse(url="/dashboard")

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    templates = get_templates()
    return templates.TemplateResponse(
        "dashboard.html",
        {"request": request, "title": "Agentic AI Dashboard"}
    )

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "agentic-ai-platform",
        "version": "5.2.0",
        "timestamp": datetime.now().isoformat(),
        "endpoints": ["/api/agents", "/api/tasks", "/api/marketplace", "/api/analytics"]
    }

@app.get("/api/status")
async def system_status():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM agents")
    agent_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM tasks")
    task_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM marketplace")
    marketplace_count = cursor.fetchone()[0]
    
    conn.close()
    
    return {
        "status": "operational",
        "agents": agent_count,
        "tasks": task_count,
        "marketplace_tasks": marketplace_count,
        "websocket_connections": len(active_connections),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/agents")
async def get_agents():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM agents ORDER BY name")
    agents = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return {
        "status": "success",
        "count": len(agents),
        "agents": agents
    }

@app.get("/api/agents/{agent_type}")
async def get_agent(agent_type: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM agents WHERE agent_type = ?", (agent_type,))
    agent = cursor.fetchone()
    conn.close()
    
    if agent:
        return {"status": "success", "agent": dict(agent)}
    else:
        raise HTTPException(status_code=404, detail="Agent not found")

@app.post("/api/agents/{agent_type}/execute")
async def execute_agent(agent_type: str, request: Request):
    data = await request.json()
    task = data.get("task", "No task provided")
    
    # Simulate agent execution
    results = {
        "file_organizer": f"📁 Organized files: {task}",
        "student_assistant": f"📚 Assisted student: {task}",
        "email_automation": f"📧 Processed emails: {task}",
        "research_assistant": f"🔍 Researched: {task}",
        "code_reviewer": f"💻 Reviewed code: {task}",
        "content_generator": f"📝 Generated content: {task}"
    }
    
    result = results.get(agent_type, f"Agent '{agent_type}' executed: {task}")
    
    # Save to database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO tasks (title, description, agent_type, status, result) VALUES (?, ?, ?, ?, ?)",
        (f"Task for {agent_type}", task, agent_type, "completed", result)
    )
    conn.commit()
    conn.close()
    
    return {
        "status": "success",
        "agent": agent_type,
        "task": task,
        "result": result,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/tasks")
async def get_tasks(status: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if status:
        cursor.execute("SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC", (status,))
    else:
        cursor.execute("SELECT * FROM tasks ORDER BY created_at DESC")
    
    tasks = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return {"status": "success", "count": len(tasks), "tasks": tasks}

@app.post("/api/tasks")
async def create_task(request: Request):
    data = await request.json()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO tasks (title, description, agent_type, status) VALUES (?, ?, ?, ?)",
        (data.get("title", "New Task"), data.get("description", ""), 
         data.get("agent_type", "general"), "pending")
    )
    task_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {"status": "success", "task_id": task_id, "message": "Task created"}

@app.get("/api/marketplace")
async def get_marketplace(status: Optional[str] = "open"):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM marketplace WHERE status = ? ORDER BY created_at DESC",
        (status,)
    )
    tasks = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return {"status": "success", "count": len(tasks), "tasks": tasks}

@app.post("/api/marketplace")
async def create_marketplace_task(request: Request):
    data = await request.json()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO marketplace (title, description, bounty, created_by, status) VALUES (?, ?, ?, ?, ?)",
        (data.get("title", "New Marketplace Task"), data.get("description", ""),
         data.get("bounty", 0.0), data.get("created_by", "system"), "open")
    )
    task_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {"status": "success", "task_id": task_id, "message": "Marketplace task created"}

@app.get("/api/analytics")
async def get_analytics():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM agents")
    agent_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM tasks")
    task_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM tasks WHERE status = 'completed'")
    completed_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM marketplace")
    marketplace_count = cursor.fetchone()[0]
    
    # Agent usage statistics
    cursor.execute("""
        SELECT agent_type, COUNT(*) as count 
        FROM tasks 
        GROUP BY agent_type 
        ORDER BY count DESC
    """)
    agent_stats = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    
    return {
        "status": "success",
        "analytics": {
            "total_agents": agent_count,
            "total_tasks": task_count,
            "completed_tasks": completed_count,
            "marketplace_tasks": marketplace_count,
            "agent_usage": agent_stats,
            "active_websockets": len(active_connections)
        }
    }

@app.get("/api/users")
async def get_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email, created_at FROM users ORDER BY created_at DESC")
    users = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return {"status": "success", "count": len(users), "users": users}

@app.post("/api/users/register")
async def register_user(request: Request):
    data = await request.json()
    
    # In production, hash the password!
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            (data["username"], data["email"], f"hashed_{data['password']}")
        )
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return {"status": "success", "user_id": user_id, "message": "User registered"}
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Username or email already exists")

@app.post("/api/users/login")
async def login_user(request: Request):
    data = await request.json()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, username, email FROM users WHERE username = ? AND password_hash = ?",
        (data["username"], f"hashed_{data['password']}")
    )
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return {
            "status": "success",
            "user": dict(user),
            "token": "sample_jwt_token_here"
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/desktop/status")
async def desktop_status():
    return {
        "status": "info",
        "message": "Desktop automation requires local environment with display",
        "supported_on_cloud": False,
        "available_actions": ["info_only"]
    }

# ==================== STARTUP ====================
@app.on_event("startup")
async def startup_event():
    print("🚀 Starting Agentic AI Platform v5.2.0")
    init_database()
    print("✅ Platform initialized and ready")

# ==================== MAIN ====================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)