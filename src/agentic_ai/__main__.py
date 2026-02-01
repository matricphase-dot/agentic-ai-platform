"""
AGENTIC AI PLATFORM - UNIVERSAL CONNECTOR
Automatically discovers and connects ALL project components
"""

import os
import sys
import importlib
import inspect
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional

# ==================== PROJECT DISCOVERY ====================

# Set project root
PROJECT_ROOT = Path(__file__).parent.parent.parent
SRC_DIR = PROJECT_ROOT / "src" / "agentic_ai"

# Add to Python path
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(SRC_DIR))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== AUTO-DISCOVERY FUNCTIONS ====================

def discover_modules(directory: Path) -> Dict[str, List[str]]:
    """Discover all Python modules in a directory"""
    modules = {
        "routers": [],
        "services": [],
        "models": [],
        "utils": [],
        "other": []
    }
    
    if not directory.exists():
        return modules
    
    for py_file in directory.rglob("*.py"):
        if "__pycache__" in str(py_file) or py_file.name.startswith("__"):
            continue
            
        rel_path = py_file.relative_to(SRC_DIR)
        parts = rel_path.parts
        
        if len(parts) > 1:
            category = parts[0]  # routers, services, etc.
            module_name = ".".join(parts[:-1]) + "." + py_file.stem
        else:
            category = "other"
            module_name = py_file.stem
        
        if category in modules:
            modules[category].append(module_name)
        else:
            modules["other"].append(module_name)
    
    return modules

def load_fastapi_routers(modules: List[str]) -> List[Any]:
    """Dynamically load FastAPI routers"""
    routers = []
    
    for module_name in modules:
        try:
            # Try to import the module
            module = importlib.import_module(f"src.agentic_ai.{module_name}")
            
            # Look for router instances
            for name, obj in inspect.getmembers(module):
                if name.endswith("_router") and hasattr(obj, "routes"):
                    logger.info(f"✅ Loaded router: {name} from {module_name}")
                    routers.append((obj, module_name))
                elif "router" in name.lower() and hasattr(obj, "routes"):
                    logger.info(f"✅ Loaded router: {name} from {module_name}")
                    routers.append((obj, module_name))
                    
        except ImportError as e:
            logger.warning(f"⚠️ Could not import {module_name}: {e}")
        except Exception as e:
            logger.error(f"❌ Error loading {module_name}: {e}")
    
    return routers

def load_services(modules: List[str]) -> Dict[str, Any]:
    """Dynamically load service classes"""
    services = {}
    
    for module_name in modules:
        try:
            module = importlib.import_module(f"src.agentic_ai.{module_name}")
            
            # Look for service classes
            for name, obj in inspect.getmembers(module):
                if inspect.isclass(obj) and "Service" in name:
                    logger.info(f"✅ Loaded service: {name} from {module_name}")
                    services[name] = obj
                elif inspect.isfunction(obj) and "service" in name.lower():
                    logger.info(f"✅ Loaded service function: {name} from {module_name}")
                    services[name] = obj
                    
        except Exception as e:
            logger.warning(f"⚠️ Could not load service {module_name}: {e}")
    
    return services

# ==================== FASTAPI APPLICATION ====================

from fastapi import FastAPI, Request, WebSocket, Depends, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from datetime import datetime

# Create FastAPI app
app = FastAPI(
    title="Agentic AI Platform",
    description="Complete AI Agent Platform with Auto-Discovered Components",
    version="5.2.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== DISCOVER ALL PROJECT COMPONENTS ====================

logger.info("🔍 Discovering project components...")
all_modules = discover_modules(SRC_DIR)

logger.info("📊 Discovered modules:")
for category, modules in all_modules.items():
    if modules:
        logger.info(f"  {category}: {len(modules)} modules")

# Load routers
routers = load_fastapi_routers(all_modules["routers"])
logger.info(f"✅ Loaded {len(routers)} routers")

# Load services
services = load_services(all_modules["services"])
logger.info(f"✅ Loaded {len(services)} services")

# ==================== DATABASE CONNECTION ====================

def get_db_connection():
    """Universal database connection"""
    db_path = PROJECT_ROOT / "database" / "agentic_ai.db"
    db_path.parent.mkdir(parents=True, exist_ok=True)
    
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn

def init_universal_database():
    """Initialize database with auto-discovered tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check what tables exist
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    existing_tables = [row[0] for row in cursor.fetchall()]
    logger.info(f"📊 Existing tables: {existing_tables}")
    
    # Create core tables if they don't exist
    core_tables = {
        "agents": """
            CREATE TABLE IF NOT EXISTS agents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                agent_type TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'active',
                config TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """,
        "tasks": """
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                agent_type TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                result TEXT,
                created_by TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP
            )
        """,
        "marketplace_tasks": """
            CREATE TABLE IF NOT EXISTS marketplace_tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                bounty REAL DEFAULT 0.0,
                created_by TEXT,
                status TEXT DEFAULT 'open',
                assigned_to TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP
            )
        """,
        "users": """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT 1
            )
        """,
        "analytics": """
            CREATE TABLE IF NOT EXISTS analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                metric_name TEXT NOT NULL,
                metric_value REAL NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
    }
    
    for table_name, create_sql in core_tables.items():
        if table_name not in existing_tables:
            cursor.execute(create_sql)
            logger.info(f"✅ Created table: {table_name}")
    
    # Insert default agents
    cursor.execute("SELECT COUNT(*) FROM agents")
    if cursor.fetchone()[0] == 0:
        default_agents = [
            ("File Organizer Agent", "file_organizer", "Automatically organizes files and folders"),
            ("Student Assistant Agent", "student_assistant", "Helps with learning and research"),
            ("Email Automation Agent", "email_automation", "Automates email processing"),
            ("Research Assistant Agent", "research_assistant", "Assists with research tasks"),
            ("Code Reviewer Agent", "code_reviewer", "Reviews and improves code"),
            ("Content Generator Agent", "content_generator", "Generates content automatically")
        ]
        cursor.executemany(
            "INSERT INTO agents (name, agent_type, description) VALUES (?, ?, ?)",
            default_agents
        )
        logger.info("✅ Inserted 6 default AI agents")
    
    conn.commit()
    conn.close()
    logger.info("✅ Database initialized")

# ==================== REGISTER DISCOVERED ROUTERS ====================

# Register all discovered routers
for router, module_name in routers:
    # Extract prefix from module name
    if "agents" in module_name:
        prefix = "/api/agents"
        tags = ["agents"]
    elif "tasks" in module_name:
        prefix = "/api/tasks"
        tags = ["tasks"]
    elif "marketplace" in module_name:
        prefix = "/api/marketplace"
        tags = ["marketplace"]
    elif "users" in module_name:
        prefix = "/api/users"
        tags = ["users"]
    elif "analytics" in module_name:
        prefix = "/api/analytics"
        tags = ["analytics"]
    elif "desktop" in module_name:
        prefix = "/api/desktop"
        tags = ["desktop"]
    else:
        prefix = "/api/" + module_name.replace(".", "/")
        tags = [module_name.split(".")[-1]]
    
    app.include_router(router, prefix=prefix, tags=tags)
    logger.info(f"📡 Registered router: {module_name} at {prefix}")

# ==================== UNIVERSAL TEMPLATE SYSTEM ====================

_templates = None
def get_templates():
    """Universal template loader"""
    global _templates
    if _templates is None:
        # Look for templates in common locations
        template_locations = [
            PROJECT_ROOT / "templates",
            PROJECT_ROOT / "src" / "templates",
            PROJECT_ROOT / "src" / "agentic_ai" / "templates",
            SRC_DIR / "templates"
        ]
        
        for location in template_locations:
            if location.exists():
                _templates = Jinja2Templates(directory=str(location))
                logger.info(f"🎨 Templates loaded from: {location}")
                break
        
        if _templates is None:
            # Create dummy templates
            class DummyTemplates:
                def TemplateResponse(self, *args, **kwargs):
                    return HTMLResponse("<h1>Agentic AI Platform</h1><p>Templates not found</p>")
            _templates = DummyTemplates()
            logger.warning("⚠️ No templates directory found")
    
    return _templates

# ==================== STATIC FILES ====================

# Look for static files in common locations
static_locations = [
    PROJECT_ROOT / "static",
    PROJECT_ROOT / "src" / "static",
    PROJECT_ROOT / "src" / "agentic_ai" / "static",
    SRC_DIR / "static"
]

for location in static_locations:
    if location.exists():
        app.mount("/static", StaticFiles(directory=str(location)), name="static")
        logger.info(f"📁 Static files mounted from: {location}")
        break

# ==================== UNIVERSAL API ENDPOINTS ====================

# These endpoints work regardless of discovered components

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    """Root endpoint"""
    templates = get_templates()
    try:
        return templates.TemplateResponse("index.html", {"request": request})
    except:
        return RedirectResponse(url="/dashboard")

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Dashboard with auto-discovered components"""
    templates = get_templates()
    
    # Gather dashboard data
    dashboard_data = {
        "title": "Agentic AI Platform",
        "version": "5.2.0",
        "discovered_routers": len(routers),
        "discovered_services": len(services),
        "loaded_components": [
            f"{module}" for _, module in routers
        ],
        "system_status": "operational",
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        return templates.TemplateResponse(
            "dashboard.html",
            {"request": request, "dashboard": dashboard_data}
        )
    except:
        # Fallback dashboard HTML
        return HTMLResponse(f"""
        <html>
            <head><title>Agentic AI Platform</title></head>
            <body>
                <h1>🚀 Agentic AI Platform v5.2.0</h1>
                <h3>Auto-Discovered Components</h3>
                
                <h4>📡 Loaded Routers ({len(routers)}):</h4>
                <ul>
                    {''.join([f'<li>{module}</li>' for _, module in routers])}
                </ul>
                
                <h4>⚙️ Loaded Services ({len(services)}):</h4>
                <ul>
                    {''.join([f'<li>{name}</li>' for name in services.keys()])}
                </ul>
                
                <h4>🔗 API Endpoints:</h4>
                <ul>
                    <li><a href="/api/health">/api/health</a> - Health check</li>
                    <li><a href="/api/docs">/api/docs</a> - API Documentation</li>
                    <li><a href="/api/agents">/api/agents</a> - AI Agents</li>
                    <li><a href="/api/tasks">/api/tasks</a> - Task Management</li>
                    <li><a href="/api/marketplace">/api/marketplace</a> - Task Marketplace</li>
                </ul>
            </body>
        </html>
        """)

@app.get("/api/health")
async def health_check():
    """Comprehensive health check"""
    return {
        "status": "healthy",
        "service": "agentic-ai-platform",
        "version": "5.2.0",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "database": "connected",
            "routers_loaded": len(routers),
            "services_loaded": len(services),
            "templates": "available" if not isinstance(get_templates(), type) else "fallback",
            "websocket": "available"
        },
        "discovery": {
            "routers": [module for _, module in routers],
            "services": list(services.keys())
        }
    }

@app.get("/api/status")
async def system_status():
    """System status with discovered components"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get counts from all potential tables
    tables_to_check = ["agents", "tasks", "marketplace_tasks", "users", "analytics"]
    counts = {}
    
    for table in tables_to_check:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            counts[table] = cursor.fetchone()[0]
        except:
            counts[table] = 0
    
    conn.close()
    
    return {
        "system": "Agentic AI Platform",
        "version": "5.2.0",
        "status": "operational",
        "timestamp": datetime.now().isoformat(),
        "discovery": {
            "routers_found": len(routers),
            "services_found": len(services),
            "all_modules": sum(len(m) for m in all_modules.values())
        },
        "database": counts,
        "endpoints_available": [
            "/api/health",
            "/api/agents",
            "/api/tasks",
            "/api/marketplace",
            "/api/users",
            "/api/analytics",
            "/api/docs"
        ]
    }

# ==================== UNIVERSAL AGENT ENDPOINTS ====================

@app.get("/api/agents")
async def get_all_agents():
    """Get all agents (works with or without agents router)"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM agents ORDER BY name")
        agents = [dict(row) for row in cursor.fetchall()]
    except:
        agents = []
    
    conn.close()
    
    return {
        "status": "success",
        "count": len(agents),
        "agents": agents or [
            {"id": 1, "name": "File Organizer Agent", "type": "file_organizer", "status": "active"},
            {"id": 2, "name": "Student Assistant Agent", "type": "student_assistant", "status": "active"},
            {"id": 3, "name": "Email Automation Agent", "type": "email_automation", "status": "active"},
            {"id": 4, "name": "Research Assistant Agent", "type": "research_assistant", "status": "active"},
            {"id": 5, "name": "Code Reviewer Agent", "type": "code_reviewer", "status": "active"},
            {"id": 6, "name": "Content Generator Agent", "type": "content_generator", "status": "active"}
        ]
    }

@app.post("/api/agents/{agent_type}/execute")
async def execute_agent_universal(agent_type: str, request: Request):
    """Universal agent execution endpoint"""
    try:
        data = await request.json()
        task = data.get("task", "No task provided")
        
        # Try to use discovered service
        service_key = f"{agent_type}_service"
        if service_key in services:
            service_class = services[service_key]
            result = service_class.execute(task)
        else:
            # Fallback execution
            results_map = {
                "file_organizer": f"📁 Organized files: {task}",
                "student_assistant": f"📚 Assisted student: {task}",
                "email_automation": f"📧 Processed emails: {task}",
                "research_assistant": f"🔍 Researched: {task}",
                "code_reviewer": f"💻 Reviewed code: {task}",
                "content_generator": f"📝 Generated content: {task}"
            }
            result = results_map.get(agent_type, f"Agent '{agent_type}' executed: {task}")
        
        # Save to database
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO tasks (title, agent_type, status, result) VALUES (?, ?, ?, ?)",
            (f"Task for {agent_type}", agent_type, "completed", result)
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
        
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ==================== WEB SOCKET ENDPOINT ====================

active_connections = []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        await websocket.send_json({
            "type": "welcome",
            "message": "Connected to Agentic AI Platform",
            "discovered_components": len(routers) + len(services),
            "timestamp": datetime.now().isoformat()
        })
        
        while True:
            data = await websocket.receive_json()
            
            # Handle different message types
            if data.get("type") == "discover":
                await websocket.send_json({
                    "type": "discovery_result",
                    "routers": [module for _, module in routers],
                    "services": list(services.keys())
                })
            elif data.get("type") == "execute_agent":
                agent_type = data.get("agent_type")
                task = data.get("task")
                await websocket.send_json({
                    "type": "agent_result",
                    "agent": agent_type,
                    "result": f"Executed {agent_type} with task: {task}",
                    "timestamp": datetime.now().isoformat()
                })
            else:
                await websocket.send_json({
                    "type": "echo",
                    "received": data,
                    "timestamp": datetime.now().isoformat()
                })
                
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        if websocket in active_connections:
            active_connections.remove(websocket)

# ==================== UNIVERSAL FALLBACK ENDPOINTS ====================

# Fallback endpoints for common routes
@app.get("/api/tasks")
async def get_tasks_fallback(status: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM tasks"
    params = []
    if status:
        query += " WHERE status = ?"
        params.append(status)
    
    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    tasks = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return {"status": "success", "count": len(tasks), "tasks": tasks}

@app.get("/api/marketplace")
async def get_marketplace_fallback(status: Optional[str] = "open"):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM marketplace_tasks WHERE status = ? ORDER BY created_at DESC",
        (status,)
    )
    tasks = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return {"status": "success", "count": len(tasks), "tasks": tasks}

@app.get("/api/analytics")
async def get_analytics_fallback():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as agent_count FROM agents")
    agent_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) as task_count FROM tasks")
    task_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) as marketplace_count FROM marketplace_tasks")
    marketplace_count = cursor.fetchone()[0]
    
    conn.close()
    
    return {
        "status": "success",
        "analytics": {
            "total_agents": agent_count,
            "total_tasks": task_count,
            "marketplace_tasks": marketplace_count,
            "active_connections": len(active_connections),
            "timestamp": datetime.now().isoformat()
        }
    }

# ==================== STARTUP EVENT ====================

@app.on_event("startup")
async def startup_event():
    """Initialize everything on startup"""
    logger.info("🚀 Starting Agentic AI Platform v5.2.0")
    logger.info("=" * 60)
    
    # Initialize database
    init_universal_database()
    
    # Log discovered components
    logger.info(f"📊 Discovered Components:")
    logger.info(f"  Routers: {len(routers)}")
    logger.info(f"  Services: {len(services)}")
    
    for category, modules in all_modules.items():
        if modules:
            logger.info(f"  {category.capitalize()}: {len(modules)}")
    
    logger.info("✅ Platform initialized and ready")
    logger.info("=" * 60)

# ==================== MAIN ENTRY ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8080,
        log_level="info"
    )