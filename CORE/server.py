# D:\AGENTIC_AI\CORE\main.py
"""
Agentic AI Platform - Main Server
Founder: Aditya Mehra (2nd Year B.Tech Student)
Version: 4.0.0
"""

import asyncio
import json
import uuid
import time
import logging
import sys
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional, Union
from contextlib import asynccontextmanager

# FastAPI imports
from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field
import uvicorn

# Database
import sqlite3
from sqlite3 import Error as SqliteError

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.append(str(PROJECT_ROOT))

# Try to import SDK
try:
    from agentic_sdk import AgentRegistry, AgentBase, AgentState, AgentMessage
    SDK_AVAILABLE = True
except ImportError:
    SDK_AVAILABLE = False
    print("⚠️ SDK not available, running in core-only mode")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Project paths
project_root = PROJECT_ROOT
static_dir = project_root / "static"
templates_dir = project_root / "templates"
database_dir = project_root / "database"
log_dir = project_root / "logs"
backup_dir = project_root / "backups"

# Ensure directories exist
for directory in [static_dir, templates_dir, database_dir, log_dir, backup_dir]:
    directory.mkdir(exist_ok=True)

# Database setup
def init_database():
    """Initialize SQLite databases"""
    databases = {
        "main": database_dir / "agentic_database.db",
        "marketplace": database_dir / "marketplace.db",
        "demonstrations": database_dir / "demonstrations.db",
        "agent_states": database_dir / "agent_states.db"
    }
    
    for name, path in databases.items():
        if not path.exists():
            conn = sqlite3.connect(str(path))
            logger.info(f"Created database: {name}")
            conn.close()
    
    # Create tables for main database
    conn = sqlite3.connect(str(databases["main"]))
    cursor = conn.cursor()
    
    # Agents table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        agent_type TEXT,
        status TEXT DEFAULT 'idle',
        skills TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP,
        tasks_processed INTEGER DEFAULT 0,
        success_rate REAL DEFAULT 0.0
    )
    ''')
    
    # Tasks table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        assigned_agent TEXT,
        created_by TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        result TEXT,
        error TEXT
    )
    ''')
    
    # Users table (for founder tracking)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
    )
    ''')
    
    conn.commit()
    conn.close()
    
    # Marketplace database
    conn_market = sqlite3.connect(str(databases["marketplace"]))
    cursor_market = conn_market.cursor()
    
    cursor_market.execute('''
    CREATE TABLE IF NOT EXISTS marketplace_tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        bounty INTEGER DEFAULT 100,
        status TEXT DEFAULT 'open',
        created_by TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        claimed_by TEXT,
        completed_at TIMESTAMP,
        result TEXT
    )
    ''')
    
    cursor_market.execute('''
    CREATE TABLE IF NOT EXISTS agent_bids (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id TEXT,
        agent_id TEXT,
        bid_amount INTEGER,
        confidence_score REAL,
        estimated_completion TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES marketplace_tasks (id)
    )
    ''')
    
    conn_market.commit()
    conn_market.close()
    
    logger.info("✅ Databases initialized successfully")

# Initialize database
init_database()

# Models
class AgentCreate(BaseModel):
    name: str
    description: str = ""
    agent_type: str = "general"
    skills: List[str] = []

class TaskCreate(BaseModel):
    title: str
    description: str
    assigned_agent: Optional[str] = None

class MarketplaceTaskCreate(BaseModel):
    title: str
    description: str
    bounty: int = 100

class UserCreate(BaseModel):
    username: str
    email: str
    role: str = "user"

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New WebSocket connection. Total: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

# Initialize manager
manager = ConnectionManager()

# SDK Registry (if available)
if SDK_AVAILABLE:
    sdk_registry = AgentRegistry()
else:
    sdk_registry = None

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events"""
    # Startup
    logger.info("🚀 Starting Agentic AI Platform...")
    logger.info("👨‍💻 Founder: Aditya Mehra (2nd Year B.Tech Student)")
    
    # Load sample data
    await load_sample_data()
    
    # Start background tasks
    task = asyncio.create_task(background_cleanup())
    
    yield
    
    # Shutdown
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass
    logger.info("🛑 Shutting down Agentic AI Platform...")

# Create FastAPI app
app = FastAPI(
    title="Agentic AI Platform",
    description="Universal Agentic Intelligence Operating System | Founder: Aditya Mehra",
    version="4.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Templates
templates = Jinja2Templates(directory=templates_dir)

# Sample data loading
async def load_sample_data():
    """Load sample data into databases"""
    try:
        conn = sqlite3.connect(database_dir / "agentic_database.db")
        cursor = conn.cursor()
        
        # Check if we already have sample agents
        cursor.execute("SELECT COUNT(*) FROM agents")
        count = cursor.fetchone()[0]
        
        if count == 0:
            # Insert founder as first user
            founder_id = str(uuid.uuid4())
            cursor.execute('''
            INSERT INTO users (id, username, email, role, created_at, last_login)
            VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                founder_id,
                "adityamehra",
                "aditya@agentic.ai",
                "founder",
                datetime.now().isoformat(),
                datetime.now().isoformat()
            ))
            
            # Insert sample agents
            sample_agents = [
                (
                    str(uuid.uuid4()),
                    "File Organizer Agent",
                    "Organizes files by type and content automatically",
                    "specialized",
                    "idle",
                    json.dumps(["file_organization", "nlp", "computer_vision"]),
                    datetime.now().isoformat(),
                    datetime.now().isoformat(),
                    0,
                    0.0
                ),
                (
                    str(uuid.uuid4()),
                    "Marketplace Connector",
                    "Automatically bids on marketplace tasks",
                    "utility",
                    "running",
                    json.dumps(["market_analysis", "bidding", "task_evaluation"]),
                    datetime.now().isoformat(),
                    datetime.now().isoformat(),
                    0,
                    0.0
                ),
                (
                    str(uuid.uuid4()),
                    "Web Navigator Agent",
                    "Browses and interacts with websites autonomously",
                    "specialized",
                    "idle",
                    json.dumps(["web_automation", "browser_control", "data_extraction"]),
                    datetime.now().isoformat(),
                    datetime.now().isoformat(),
                    0,
                    0.0
                )
            ]
            
            cursor.executemany('''
            INSERT INTO agents (id, name, description, agent_type, status, skills, created_at, last_active, tasks_processed, success_rate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', sample_agents)
            
            # Insert sample tasks
            sample_tasks = [
                (
                    str(uuid.uuid4()),
                    "Organize downloads folder",
                    "Categorize files in Downloads folder by type and content",
                    "completed",
                    sample_agents[0][0],
                    "system",
                    datetime.now().isoformat(),
                    (datetime.now() + timedelta(minutes=5)).isoformat(),
                    json.dumps({"files_processed": 45, "categories_created": 8}),
                    None
                ),
                (
                    str(uuid.uuid4()),
                    "Research AI trends 2024",
                    "Find latest developments in AI for Q1 2024 report",
                    "in_progress",
                    sample_agents[2][0],
                    "adityamehra",
                    datetime.now().isoformat(),
                    None,
                    None,
                    None
                )
            ]
            
            cursor.executemany('''
            INSERT INTO tasks (id, title, description, status, assigned_agent, created_by, created_at, completed_at, result, error)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', sample_tasks)
            
            conn.commit()
            logger.info("✅ Loaded sample data with founder account")
        
        conn.close()
        
        # Marketplace sample data
        conn_market = sqlite3.connect(database_dir / "marketplace.db")
        cursor_market = conn_market.cursor()
        
        cursor_market.execute("SELECT COUNT(*) FROM marketplace_tasks")
        count_market = cursor_market.fetchone()[0]
        
        if count_market == 0:
            sample_market_tasks = [
                (
                    str(uuid.uuid4()),
                    "Clean up email inbox",
                    "Organize 500+ emails into folders, archive old ones",
                    250,
                    "open",
                    "business@example.com",
                    datetime.now().isoformat(),
                    None,
                    None,
                    None
                ),
                (
                    str(uuid.uuid4()),
                    "Data entry from PDF invoices",
                    "Extract data from 20 PDF invoices into Excel format",
                    150,
                    "claimed",
                    "accounting@example.com",
                    datetime.now().isoformat(),
                    sample_agents[0][0],
                    None,
                    None
                )
            ]
            
            cursor_market.executemany('''
            INSERT INTO marketplace_tasks (id, title, description, bounty, status, created_by, created_at, claimed_by, completed_at, result)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', sample_market_tasks)
            
            conn_market.commit()
            logger.info("✅ Loaded sample marketplace data")
        
        conn_market.close()
        
    except Exception as e:
        logger.error(f"Error loading sample data: {e}")

# Background tasks
async def background_cleanup():
    """Clean up old data and update statistics"""
    while True:
        try:
            # Clean up old tasks (older than 30 days)
            conn = sqlite3.connect(database_dir / "agentic_database.db")
            cursor = conn.cursor()
            
            cutoff = (datetime.now() - timedelta(days=30)).isoformat()
            cursor.execute(
                "DELETE FROM tasks WHERE created_at < ? AND status = 'completed'",
                (cutoff,)
            )
            
            deleted = cursor.rowcount
            if deleted > 0:
                logger.info(f"Cleaned up {deleted} old tasks")
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Background cleanup error: {e}")
        
        await asyncio.sleep(3600)  # Run every hour

# ==================== ROUTES ====================

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Home page with founder info"""
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "founder": {
            "name": "Aditya Mehra",
            "role": "2nd Year B.Tech Student & Founder",
            "contact": "aditya@agentic.ai"
        }
    })

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Main dashboard"""
    conn = sqlite3.connect(database_dir / "agentic_database.db")
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM agents")
    agent_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM tasks")
    task_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM tasks WHERE status = 'completed'")
    completed_tasks = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM tasks WHERE status = 'in_progress'")
    in_progress_tasks = cursor.fetchone()[0]
    
    conn.close()
    
    stats = {
        "agents": agent_count,
        "tasks": task_count,
        "completed_tasks": completed_tasks,
        "in_progress_tasks": in_progress_tasks,
        "success_rate": round((completed_tasks / task_count * 100) if task_count > 0 else 0, 1)
    }
    
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "stats": stats,
        "founder": {
            "name": "Aditya Mehra",
            "role": "2nd Year B.Tech Student & Founder"
        }
    })

# API Endpoints (simplified for brevity)
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "4.0.0",
        "founder": "Aditya Mehra",
        "student_status": "B.Tech 2nd Year"
    }

@app.get("/api/agents")
async def get_agents():
    """Get all agents"""
    conn = sqlite3.connect(database_dir / "agentic_database.db")
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM agents ORDER BY created_at DESC")
    columns = [description[0] for description in cursor.description]
    agents = [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    for agent in agents:
        if agent.get('skills'):
            try:
                agent['skills'] = json.loads(agent['skills'])
            except:
                agent['skills'] = []
    
    conn.close()
    
    return {
        "success": True,
        "count": len(agents),
        "agents": agents
    }

@app.post("/api/agents")
async def create_agent(agent: AgentCreate):
    """Create a new agent"""
    agent_id = str(uuid.uuid4())
    
    conn = sqlite3.connect(database_dir / "agentic_database.db")
    cursor = conn.cursor()
    
    cursor.execute('''
    INSERT INTO agents (id, name, description, agent_type, status, skills, created_at, last_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        agent_id,
        agent.name,
        agent.description,
        agent.agent_type,
        "idle",
        json.dumps(agent.skills),
        datetime.now().isoformat(),
        datetime.now().isoformat()
    ))
    
    conn.commit()
    conn.close()
    
    await manager.broadcast(json.dumps({
        "type": "agent_created",
        "agent_id": agent_id,
        "agent_name": agent.name,
        "timestamp": datetime.now().isoformat()
    }))
    
    return {
        "success": True,
        "message": f"Agent '{agent.name}' created successfully",
        "agent_id": agent_id
    }

# Founder-specific endpoints
@app.get("/api/founder")
async def get_founder_info():
    """Get founder information"""
    return {
        "name": "Aditya Mehra",
        "role": "Founder & CEO",
        "education": "B.Tech Computer Science (2nd Year)",
        "background": "Young entrepreneur passionate about AI and automation",
        "vision": "Democratize AI automation for businesses of all sizes",
        "contact": "aditya@agentic.ai",
        "student_advantage": "Fresh perspective, rapid learning, tech-native mindset"
    }

@app.get("/api/demo/student-founder-pitch")
async def student_founder_pitch():
    """Student founder pitch for investors"""
    return {
        "pitch_title": "The Student Founder Advantage",
        "founder": "Aditya Mehra",
        "education": "2nd Year B.Tech Computer Science",
        "key_points": [
            "Fresh perspective on AI automation",
            "Digital native understanding of modern workflows",
            "Ability to move fast and adapt quickly",
            "Direct understanding of developer needs",
            "Cost-effective execution"
        ],
        "product_status": "92% complete with working MVP",
        "market_timing": "Perfect timing with AI automation boom",
        "ask": "$2M pre-seed at $10M valuation",
        "runway": "18 months to achieve product-market fit",
        "unique_value": "Built by a developer for developers"
    }

if __name__ == "__main__":
    start_time = time.time()
    
    print("\n" + "="*70)
    print("🚀 AGENTIC AI PLATFORM v4.0.0")
    print("="*70)
    print("👨‍💻 Founder: Aditya Mehra (2nd Year B.Tech Student)")
    print("📧 Contact: aditya@agentic.ai")
    print("="*70)
    print(f"📁 Project Root: {project_root}")
    print(f"🌐 Dashboard: http://localhost:8000/dashboard")
    print(f"🤖 API: http://localhost:8000/api/health")
    print(f"📚 Docs: http://localhost:8000/api/docs")
    print("="*70)
    print("Starting server...\n")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )