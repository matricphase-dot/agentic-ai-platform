#!/usr/bin/env python3
"""
Agentic AI Platform - Main Application
Complete AI Agent Platform with 6 Agents, Marketplace, and Dashboard
"""

import sys
import os
from pathlib import Path
import logging
from datetime import datetime

# Add project root to Python path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

# ==================== IMPORTS ====================
from fastapi import FastAPI, Request, WebSocket, Depends, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import json
import asyncio
from typing import List, Dict, Any, Optional

# ==================== LOGGING ====================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== APP INITIALIZATION ====================
app = FastAPI(
    title="Agentic AI Platform",
    description="Complete AI Agent Platform with 6 AI Agents, Task Marketplace, and Real-time Dashboard",
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

# ==================== TEMPLATE FIX ====================
# LAZY LOADING TEMPLATES - Fix for jinja2 import issue
_templates = None
def get_templates():
    global _templates
    if _templates is None:
        templates_dir = project_root / "templates"
        _templates = Jinja2Templates(directory=str(templates_dir))
    return _templates

# ==================== DATABASE ====================
def get_db():
    """Get database connection"""
    db_path = project_root / "database" / "agentic_ai.db"
    # Ensure directory exists
    db_path.parent.mkdir(exist_ok=True)
    
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """Initialize database with required tables"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT 1
            )
        ''')
        
        # Agents table
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
        
        # Tasks table
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
        
        # Marketplace tasks
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS marketplace_tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                bounty REAL DEFAULT 0.0,
                created_by INTEGER,
                status TEXT DEFAULT 'open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users (id)
            )
        ''')
        
        # Analytics table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                metric_name TEXT NOT NULL,
                metric_value REAL NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Insert sample agents if empty
        cursor.execute("SELECT COUNT(*) as count FROM agents")
        if cursor.fetchone()["count"] == 0:
            sample_agents = [
                ("File Organizer Agent", "file_organizer", "Organizes files and folders automatically"),
                ("Student Assistant Agent", "student_assistant", "Helps students with learning and research"),
                ("Email Automation Agent", "email_automation", "Automates email processing and responses"),
                ("Research Assistant Agent", "research_assistant", "Assists with research and data analysis"),
                ("Code Reviewer Agent", "code_reviewer", "Reviews and improves code quality"),
                ("Content Generator Agent", "content_generator", "Generates content for various purposes")
            ]
            cursor.executemany(
                "INSERT INTO agents (name, agent_type, description) VALUES (?, ?, ?)",
                sample_agents
            )
            logger.info("Inserted 6 sample agents")
        
        conn.commit()
        conn.close()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")

# ==================== STATIC FILES ====================
static_dir = project_root / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# ==================== WEB SOCKETS ====================
active_connections = []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Broadcast to all connections
            for connection in active_connections:
                await connection.send_json(data)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        active_connections.remove(websocket)

# ==================== AGENT ENDPOINTS ====================
@app.get("/api/agents")
async def get_agents():
    """Get all available agents"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM agents ORDER BY name")
        agents = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return {"status": "success", "count": len(agents), "agents": agents}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/agents/{agent_type}/execute")
async def execute_agent(agent_type: str, request: Request):
    """Execute a specific agent"""
    try:
        data = await request.json()
        task = data.get("task", "")
        
        # Simulate agent execution based on type
        if agent_type == "file_organizer":
            result = f"File organized: {task}"
        elif agent_type == "student_assistant":
            result = f"Student assisted with: {task}"
        elif agent_type == "email_automation":
            result = f"Email processed: {task}"
        elif agent_type == "research_assistant":
            result = f"Research completed: {task}"
        elif agent_type == "code_reviewer":
            result = f"Code reviewed: {task}"
        elif agent_type == "content_generator":
            result = f"Content generated: {task}"
        else:
            result = f"Agent '{agent_type}' executed task: {task}"
        
        # Save to database
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO tasks (title, description, agent_type, status, result) VALUES (?, ?, ?, ?, ?)",
            (f"{agent_type} task", task, agent_type, "completed", result)
        )
        task_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Broadcast via WebSocket
        for connection in active_connections:
            await connection.send_json({
                "type": "agent_completed",
                "agent": agent_type,
                "task": task,
                "result": result,
                "task_id": task_id
            })
        
        return {"status": "success", "result": result, "task_id": task_id}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ==================== TASK ENDPOINTS ====================
@app.get("/api/tasks")
async def get_tasks(status: Optional[str] = None):
    """Get all tasks, optionally filtered by status"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        if status:
            cursor.execute("SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC", (status,))
        else:
            cursor.execute("SELECT * FROM tasks ORDER BY created_at DESC")
        
        tasks = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return {"status": "success", "count": len(tasks), "tasks": tasks}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/tasks")
async def create_task(request: Request):
    """Create a new task"""
    try:
        data = await request.json()
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO tasks (title, description, agent_type, status) VALUES (?, ?, ?, ?)",
            (data["title"], data.get("description", ""), data["agent_type"], "pending")
        )
        task_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return {"status": "success", "task_id": task_id, "message": "Task created"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ==================== MARKETPLACE ENDPOINTS ====================
@app.get("/api/marketplace")
async def get_marketplace_tasks(status: Optional[str] = "open"):
    """Get marketplace tasks"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM marketplace_tasks WHERE status = ? ORDER BY created_at DESC",
            (status,)
        )
        tasks = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return {"status": "success", "count": len(tasks), "tasks": tasks}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/marketplace/tasks")
async def create_marketplace_task(request: Request):
    """Create a new marketplace task"""
    try:
        data = await request.json()
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute(
            """INSERT INTO marketplace_tasks 
               (title, description, bounty, created_by, status) 
               VALUES (?, ?, ?, ?, ?)""",
            (data["title"], data.get("description", ""), 
             data.get("bounty", 0.0), data.get("created_by", 1), "open")
        )
        task_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return {"status": "success", "task_id": task_id, "message": "Marketplace task created"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ==================== ANALYTICS ENDPOINTS ====================
@app.get("/api/analytics")
async def get_analytics():
    """Get platform analytics"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Get counts
        cursor.execute("SELECT COUNT(*) as count FROM agents")
        agent_count = cursor.fetchone()["count"]
        
        cursor.execute("SELECT COUNT(*) as count FROM tasks")
        task_count = cursor.fetchone()["count"]
        
        cursor.execute("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'")
        completed_count = cursor.fetchone()["count"]
        
        cursor.execute("SELECT COUNT(*) as count FROM marketplace_tasks")
        marketplace_count = cursor.fetchone()["count"]
        
        # Get recent activity
        cursor.execute("""
            SELECT agent_type, COUNT(*) as count 
            FROM tasks 
            WHERE created_at >= datetime('now', '-7 days')
            GROUP BY agent_type
        """)
        agent_activity = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        analytics = {
            "agents": agent_count,
            "total_tasks": task_count,
            "completed_tasks": completed_count,
            "marketplace_tasks": marketplace_count,
            "agent_activity": agent_activity,
            "active_connections": len(active_connections),
            "uptime": datetime.now().isoformat()
        }
        
        return {"status": "success", "analytics": analytics}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/analytics/daily")
async def get_daily_analytics():
    """Get daily analytics"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT date(created_at) as date, 
                   COUNT(*) as task_count,
                   SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count
            FROM tasks
            GROUP BY date(created_at)
            ORDER BY date DESC
            LIMIT 30
        """)
        daily_stats = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {"status": "success", "daily_stats": daily_stats}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ==================== USER ENDPOINTS ====================
@app.get("/api/users")
async def get_users():
    """Get all users"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, email, created_at FROM users ORDER BY created_at DESC")
        users = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return {"status": "success", "count": len(users), "users": users}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/users/register")
async def register_user(request: Request):
    """Register a new user"""
    try:
        data = await request.json()
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            (data["username"], data["email"], "hashed_" + data["password"])  # In production, use proper hashing
        )
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return {"status": "success", "user_id": user_id, "message": "User registered"}
    except sqlite3.IntegrityError:
        return {"status": "error", "message": "Username or email already exists"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/users/login")
async def login_user(request: Request):
    """Login user"""
    try:
        data = await request.json()
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, username, email FROM users WHERE username = ? AND password_hash = ?",
            (data["username"], "hashed_" + data["password"])
        )
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return {"status": "success", "user": dict(user), "token": "dummy_token"}
        else:
            return {"status": "error", "message": "Invalid credentials"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ==================== DESKTOP AUTOMATION ENDPOINTS ====================
@app.get("/api/desktop/status")
async def get_desktop_status():
    """Get desktop automation status"""
    try:
        return {
            "status": "success",
            "desktop_automation": {
                "available": False,  # PyAutoGUI doesn't work on Render
                "message": "Desktop automation only works on local machines with display",
                "supported_actions": ["screenshot", "mouse_control", "keyboard_input"]
            }
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ==================== CORE ROUTES ====================
@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    """Root endpoint - redirects to dashboard"""
    return RedirectResponse(url="/dashboard")

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Dashboard page"""
    try:
        templates = get_templates()
        return templates.TemplateResponse(
            "dashboard.html", 
            {"request": request, "title": "Agentic AI Dashboard", "version": "5.2.0"}
        )
    except Exception as e:
        return HTMLResponse(f"""
        <html>
            <head><title>Agentic AI Platform</title></head>
            <body>
                <h1>Agentic AI Platform Dashboard</h1>
                <p>Version 5.2.0 - All systems operational</p>
                <p><a href="/api/docs">API Documentation</a></p>
                <p><a href="/api/agents">View Agents</a></p>
                <p><a href="/api/marketplace">Task Marketplace</a></p>
            </body>
        </html>
        """)

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "agentic-ai-platform",
        "version": "5.2.0",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "agents": "/api/agents",
            "tasks": "/api/tasks",
            "marketplace": "/api/marketplace",
            "analytics": "/api/analytics",
            "users": "/api/users",
            "docs": "/api/docs",
            "websocket": "/ws"
        }
    }

@app.get("/api/status")
async def system_status():
    """System status endpoint"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) as count FROM agents")
        agent_count = cursor.fetchone()["count"]
        
        cursor.execute("SELECT COUNT(*) as count FROM tasks")
        task_count = cursor.fetchone()["count"]
        
        cursor.execute("SELECT COUNT(*) as count FROM marketplace_tasks WHERE status = 'open'")
        open_marketplace = cursor.fetchone()["count"]
        
        conn.close()
        
        return {
            "status": "operational",
            "agents": agent_count,
            "tasks": task_count,
            "open_marketplace_tasks": open_marketplace,
            "active_websocket_connections": len(active_connections),
            "database": "connected",
            "web_server": "running",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"status": "degraded", "error": str(e)}

# ==================== STARTUP EVENT ====================
@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    logger.info("Starting Agentic AI Platform v5.2.0")
    init_database()
    logger.info("Platform ready - waiting for requests")

# ==================== MAIN ENTRY POINT ====================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8080,
        log_level="info"
    )