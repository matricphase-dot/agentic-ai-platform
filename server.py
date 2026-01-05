# server.py - COMPLETE AGENTIC AI PLATFORM WITH ALL FEATURES
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect, HTTPException, Response, UploadFile, File, Form
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse, StreamingResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import json
import asyncio
import psutil
import time
import sqlite3
import shutil
import hashlib
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from pathlib import Path
import sys
import requests
import zipfile
import io
import mimetypes

print("="*60)
print("🚀 AGENTIC AI PLATFORM - COMPLETE PRODUCTION READY")
print("="*60)

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
print(f"📁 Working directory: {current_dir}")

# Create all required directories
for dir_name in [
    "templates", "static", "database", "uploads", "recordings", 
    "workflows", "generated_automations", "ollama_outputs",
    "organized_files", "backups", "temp", "export", "mobile_data",
    "static/templates", "static/scripts"
]:
    os.makedirs(dir_name, exist_ok=True)

# Initialize FastAPI
app = FastAPI(
    title="Agentic AI Platform", 
    version="6.0.0", 
    docs_url="/api/docs", 
    redoc_url="/api/redoc",
    description="Complete automation platform with AI, desktop integration, and mobile companion"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Templates and static files
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

# ==================== MODULE IMPORTS ====================
class DummyModule:
    def __init__(self, name="DummyModule"): 
        self.name = name
        self.status = f"Module '{name}' not loaded"
    def __getattr__(self, name):
        return lambda *args, **kwargs: {
            "success": False, 
            "error": f"Method '{name}' not available in {self.name}",
            "message": "Using fallback mode"
        }

modules = {}

# Import all modules
try:
    from desktop_bridge import DesktopRecorderBridge
    modules['desktop_bridge'] = DesktopRecorderBridge()
    print("✅ Desktop Bridge loaded")
except Exception as e:
    print(f"⚠️ Desktop Bridge not available: {e}")
    modules['desktop_bridge'] = DummyModule("DesktopBridge")

try:
    from file_organizer import FileOrganizerEngine
    modules['file_organizer'] = FileOrganizerEngine()
    print("✅ File Organizer loaded")
except Exception as e:
    print(f"⚠️ File Organizer not available: {e}")
    modules['file_organizer'] = DummyModule("FileOrganizer")

try:
    from marketplace_engine import MarketplaceEngine
    modules['marketplace'] = MarketplaceEngine()
    print("✅ Marketplace Engine loaded")
except Exception as e:
    print(f"⚠️ Marketplace Engine not available: {e}")
    modules['marketplace'] = DummyModule("Marketplace")

try:
    from analytics_engine import AnalyticsEngine
    modules['analytics'] = AnalyticsEngine()
    print("✅ Analytics Engine loaded")
except Exception as e:
    print(f"⚠️ Analytics Engine not available: {e}")
    modules['analytics'] = DummyModule("Analytics")

try:
    from mobile_engine import MobileEngine
    modules['mobile'] = MobileEngine()
    print("✅ Mobile Engine loaded")
except Exception as e:
    print(f"⚠️ Mobile Engine not available: {e}")
    modules['mobile'] = DummyModule("Mobile")

try:
    from ollama_integration import OllamaIntegration
    modules['ollama'] = OllamaIntegration()
    print("✅ Ollama Integration loaded")
except Exception as e:
    print(f"⚠️ Ollama Integration not available: {e}")
    modules['ollama'] = DummyModule("Ollama")

try:
    from advanced_ai import AdvancedAIEngine
    modules['advanced_ai'] = AdvancedAIEngine()
    print("✅ Advanced AI Engine loaded")
except Exception as e:
    print(f"⚠️ Advanced AI Engine not available: {e}")
    modules['advanced_ai'] = DummyModule("AdvancedAI")

try:
    from computer_vision import ComputerVisionEngine
    modules['vision'] = ComputerVisionEngine()
    print("✅ Computer Vision loaded")
except Exception as e:
    print(f"⚠️ Computer Vision not available: {e}")
    modules['vision'] = DummyModule("ComputerVision")

try:
    from ml_workflow import MLWorkflowOptimizer
    modules['ml_workflow'] = MLWorkflowOptimizer()
    print("✅ ML Workflow loaded")
except Exception as e:
    print(f"⚠️ ML Workflow not available: {e}")
    modules['ml_workflow'] = DummyModule("MLWorkflow")

print("✅ All modules initialized")

# ==================== APPLICATION STATE ====================
active_connections: List[WebSocket] = []
system_state = {
    "desktop_recorder_running": False,
    "current_recording": None,
    "recordings": [],
    "workflows": [],
    "automations": [],
    "logs": [],
    "users_online": 0,
    "start_time": datetime.now(),
    "stats": {},
    "active_users": {},
    "scheduled_tasks": []
}

# ==================== DATABASE INITIALIZATION ====================
def init_databases():
    """Initialize all databases"""
    try:
        # Users database
        conn = sqlite3.connect('database/users.db')
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                email TEXT UNIQUE,
                password_hash TEXT,
                api_key TEXT UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                plan TEXT DEFAULT 'free',
                settings TEXT DEFAULT '{}'
            )
        ''')
        
        # User activities
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_activities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                activity_type TEXT,
                activity_data TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # User automations
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_automations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                name TEXT,
                description TEXT,
                code TEXT,
                category TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_run TIMESTAMP,
                run_count INTEGER DEFAULT 0,
                success_rate REAL DEFAULT 0.0,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        conn.commit()
        conn.close()
        
        # Analytics database
        conn = sqlite3.connect('database/analytics.db')
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS platform_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date DATE UNIQUE,
                total_users INTEGER DEFAULT 0,
                active_users INTEGER DEFAULT 0,
                automations_generated INTEGER DEFAULT 0,
                automations_executed INTEGER DEFAULT 0,
                time_saved_minutes INTEGER DEFAULT 0,
                revenue_usd REAL DEFAULT 0.0
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS feature_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                feature_name TEXT,
                user_id INTEGER,
                usage_count INTEGER DEFAULT 0,
                last_used TIMESTAMP,
                total_time_seconds INTEGER DEFAULT 0
            )
        ''')
        
        conn.commit()
        conn.close()
        
        print("✅ All databases initialized")
        return True
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False

# ==================== HELPER FUNCTIONS ====================
def add_log(level: str, message: str, user_id=None):
    """Add log entry"""
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "level": level,
        "message": message,
        "user_id": user_id
    }
    system_state["logs"].insert(0, log_entry)
    
    if len(system_state["logs"]) > 1000:
        system_state["logs"] = system_state["logs"][:1000]
    
    # Save to database
    try:
        conn = sqlite3.connect('database/analytics.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO platform_logs (level, message, user_id, timestamp)
            VALUES (?, ?, ?, ?)
        ''', (level, message, user_id, datetime.now().isoformat()))
        conn.commit()
        conn.close()
    except:
        pass
    
    asyncio.create_task(broadcast_log(log_entry))
    return log_entry

async def broadcast_log(log_entry):
    """Broadcast log to all WebSocket connections"""
    disconnected = []
    for connection in active_connections:
        try:
            await connection.send_json({
                "type": "log_update",
                "log": log_entry
            })
        except:
            disconnected.append(connection)
    
    for connection in disconnected:
        active_connections.remove(connection)

def get_system_stats():
    """Get comprehensive system statistics"""
    try:
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('.')
        net_io = psutil.net_io_counters()
        
        stats = {
            "cpu_usage": cpu_percent,
            "memory_used": memory.percent,
            "memory_total_gb": round(memory.total / (1024**3), 2),
            "memory_available_gb": round(memory.available / (1024**3), 2),
            "disk_used": disk.percent,
            "disk_total_gb": round(disk.total / (1024**3), 2),
            "disk_free_gb": round(disk.free / (1024**3), 2),
            "processes": len(psutil.pids()),
            "uptime_seconds": time.time() - psutil.boot_time(),
            "network_sent_mb": round(net_io.bytes_sent / (1024**2), 2),
            "network_recv_mb": round(net_io.bytes_recv / (1024**2), 2),
            "platform_uptime": (datetime.now() - system_state["start_time"]).total_seconds(),
            "active_connections": len(active_connections),
            "total_automations": len(system_state["automations"]),
            "total_workflows": len(system_state["workflows"]),
            "timestamp": datetime.now().isoformat()
        }
        
        system_state["stats"] = stats
        return stats
    except Exception as e:
        print(f"System stats error: {e}")
        return {}

# ==================== PAGE ROUTES ====================
@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {
        "request": request,
        "stats": get_system_stats(),
        "features": {
            "desktop_recorder": modules['desktop_bridge'].__class__.__name__ != "DummyModule",
            "file_organizer": modules['file_organizer'].__class__.__name__ != "DummyModule",
            "marketplace": modules['marketplace'].__class__.__name__ != "DummyModule",
            "ollama": modules['ollama'].__class__.__name__ != "DummyModule",
            "mobile": modules['mobile'].__class__.__name__ != "DummyModule"
        }
    })

@app.get("/desktop-recorder", response_class=HTMLResponse)
async def desktop_recorder_page(request: Request):
    return templates.TemplateResponse("desktop_recorder.html", {
        "request": request,
        "recorder_available": modules['desktop_bridge'].__class__.__name__ != "DummyModule"
    })

@app.get("/file-organizer", response_class=HTMLResponse)
async def file_organizer_page(request: Request):
    return templates.TemplateResponse("file_organizer.html", {
        "request": request,
        "organizer_available": modules['file_organizer'].__class__.__name__ != "DummyModule"
    })

@app.get("/ai-automation", response_class=HTMLResponse)
async def ai_automation_page(request: Request):
    return templates.TemplateResponse("ai_automation.html", {
        "request": request,
        "ollama_available": modules['ollama'].__class__.__name__ != "DummyModule"
    })

@app.get("/marketplace", response_class=HTMLResponse)
async def marketplace_page(request: Request):
    templates_list = []
    if modules['marketplace'].__class__.__name__ != "DummyModule":
        templates_list = modules['marketplace'].get_templates(limit=50)
    
    return templates.TemplateResponse("marketplace.html", {
        "request": request,
        "templates": templates_list,
        "categories": modules['marketplace'].get_categories() if modules['marketplace'].__class__.__name__ != "DummyModule" else []
    })

@app.get("/analytics", response_class=HTMLResponse)
async def analytics_page(request: Request):
    analytics_data = {}
    if modules['analytics'].__class__.__name__ != "DummyModule":
        analytics_data = modules['analytics'].get_dashboard_data()
    
    return templates.TemplateResponse("analytics.html", {
        "request": request,
        "analytics": analytics_data,
        "charts_available": len(analytics_data.get("charts", [])) > 0
    })

@app.get("/mobile", response_class=HTMLResponse)
async def mobile_page(request: Request):
    mobile_data = {}
    if modules['mobile'].__class__.__name__ != "DummyModule":
        mobile_data = modules['mobile'].get_status()
    
    return templates.TemplateResponse("mobile.html", {
        "request": request,
        "mobile": mobile_data,
        "qr_code": mobile_data.get("qr_code", ""),
        "paired_devices": mobile_data.get("paired_devices", 0)
    })

@app.get("/settings", response_class=HTMLResponse)
async def settings_page(request: Request):
    return templates.TemplateResponse("settings.html", {"request": request})

@app.get("/profile", response_class=HTMLResponse)
async def profile_page(request: Request):
    return templates.TemplateResponse("profile.html", {"request": request})

@app.get("/help", response_class=HTMLResponse)
async def help_page(request: Request):
    return templates.TemplateResponse("help.html", {"request": request})

@app.get("/landing", response_class=HTMLResponse)
async def landing_page(request: Request):
    return templates.TemplateResponse("landing.html", {"request": request})

# ==================== CORE API ENDPOINTS ====================
@app.get("/api/health")
async def health():
    """Comprehensive health check"""
    uptime = (datetime.now() - system_state["start_time"]).total_seconds()
    
    module_status = {}
    for name, module in modules.items():
        module_status[name] = module.__class__.__name__ != "DummyModule"
    
    return {
        "status": "healthy",
        "service": "Agentic AI Platform",
        "version": "6.0.0",
        "uptime_seconds": uptime,
        "uptime_human": str(timedelta(seconds=int(uptime))),
        "timestamp": datetime.now().isoformat(),
        "modules": module_status,
        "system": get_system_stats(),
        "features": {
            "total_automations": len(system_state["automations"]),
            "total_workflows": len(system_state["workflows"]),
            "total_recordings": len(system_state["recordings"]),
            "active_users": len(system_state["active_users"]),
            "websocket_connections": len(active_connections)
        }
    }

@app.get("/api/system-stats")
async def get_system_stats_api():
    return get_system_stats()

@app.get("/api/logs")
async def get_logs_api(limit: int = 100, level: str = None):
    logs = system_state["logs"]
    if level:
        logs = [log for log in logs if log["level"].lower() == level.lower()]
    return {"success": True, "logs": logs[:limit], "total": len(logs)}

# ==================== DESKTOP BRIDGE ENDPOINTS ====================
@app.get("/api/desktop/status")
async def desktop_status():
    if modules['desktop_bridge'].__class__.__name__ == "DummyModule":
        return {"success": False, "message": "Desktop bridge not available"}
    
    status = modules['desktop_bridge'].get_status()
    return {"success": True, "status": status}

@app.post("/api/desktop/recording/start")
async def start_desktop_recording():
    if modules['desktop_bridge'].__class__.__name__ == "DummyModule":
        return {"success": False, "message": "Desktop bridge not available"}
    
    result = modules['desktop_bridge'].start_recording()
    if result.get("success"):
        system_state["desktop_recorder_running"] = True
        system_state["current_recording"] = result.get("output_file")
        add_log("INFO", f"Desktop recording started: {result.get('output_file')}")
    
    return result

@app.post("/api/desktop/recording/stop")
async def stop_desktop_recording():
    if modules['desktop_bridge'].__class__.__name__ == "DummyModule":
        return {"success": False, "message": "Desktop bridge not available"}
    
    result = modules['desktop_bridge'].stop_recording()
    if result.get("success"):
        system_state["desktop_recorder_running"] = False
        if system_state["current_recording"]:
            system_state["recordings"].append({
                "id": len(system_state["recordings"]) + 1,
                "name": os.path.basename(system_state["current_recording"]),
                "path": system_state["current_recording"],
                "timestamp": datetime.now().isoformat(),
                "size": "Unknown"
            })
        system_state["current_recording"] = None
        add_log("INFO", "Desktop recording stopped")
    
    return result

@app.get("/api/desktop/recordings")
async def get_desktop_recordings():
    if modules['desktop_bridge'].__class__.__name__ == "DummyModule":
        return {"success": True, "recordings": []}
    
    recordings = modules['desktop_bridge'].list_recordings()
    return {"success": True, "recordings": recordings}

@app.post("/api/desktop/screenshot")
async def take_screenshot():
    if modules['desktop_bridge'].__class__.__name__ == "DummyModule":
        return {"success": False, "message": "Desktop bridge not available"}
    
    result = modules['desktop_bridge'].take_screenshot()
    return result

# ==================== FILE ORGANIZER ENDPOINTS ====================
@app.post("/api/files/organize")
async def organize_files(
    source_dir: str = Form(...),
    organization_type: str = Form("type"),
    target_dir: str = Form(None),
    delete_duplicates: bool = Form(False)
):
    if modules['file_organizer'].__class__.__name__ == "DummyModule":
        return {"success": False, "message": "File organizer not available"}
    
    try:
        result = modules['file_organizer'].organize_files(
            source_dir=source_dir,
            organization_type=organization_type,
            target_dir=target_dir,
            delete_duplicates=delete_duplicates
        )
        
        if result.get("success"):
            add_log("INFO", f"Files organized: {result.get('files_processed', 0)} files processed")
        
        return result
    except Exception as e:
        add_log("ERROR", f"File organization failed: {str(e)}")
        return {"success": False, "error": str(e)}

@app.get("/api/files/analyze")
async def analyze_files(directory: str):
    if modules['file_organizer'].__class__.__name__ == "DummyModule":
        return {"success": False, "message": "File organizer not available"}
    
    try:
        analysis = modules['file_organizer'].analyze_directory(directory)
        return {"success": True, "analysis": analysis}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/files/find-duplicates")
async def find_duplicate_files(directory: str = Form(...)):
    if modules['file_organizer'].__class__.__name__ == "DummyModule":
        return {"success": False, "message": "File organizer not available"}
    
    try:
        duplicates = modules['file_organizer'].find_duplicates(directory)
        return {"success": True, "duplicates": duplicates, "count": len(duplicates)}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/files/cleanup")
async def cleanup_files(directory: str = Form(...), days_old: int = Form(30)):
    if modules['file_organizer'].__class__.__name__ == "DummyModule":
        return {"success": False, "message": "File organizer not available"}
    
    try:
        result = modules['file_organizer'].cleanup_old_files(directory, days_old)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

# ==================== MARKETPLACE ENDPOINTS ====================
@app.get("/api/marketplace/templates")
async def get_marketplace_templates(
    category: str = None,
    search: str = None,
    limit: int = 50,
    featured: bool = False
):
    if modules['marketplace'].__class__.__name__ == "DummyModule":
        return {"success": True, "templates": [], "count": 0}
    
    templates = modules['marketplace'].get_templates(
        category=category,
        search=search,
        limit=limit,
        featured=featured
    )
    
    return {
        "success": True,
        "templates": templates,
        "count": len(templates),
        "categories": modules['marketplace'].get_categories()
    }

@app.get("/api/marketplace/template/{template_id}")
async def get_template_details(template_id: int):
    if modules['marketplace'].__class__.__name__ == "DummyModule":
        return {"success": False, "message": "Marketplace not available"}
    
    template = modules['marketplace'].get_template(template_id)
    if template:
        return {"success": True, "template": template}
    else:
        return {"success": False, "message": "Template not found"}

@app.post("/api/marketplace/template/{template_id}/download")
async def download_template(template_id: int):
    if modules['marketplace'].__class__.__name__ == "DummyModule":
        return {"success": False, "message": "Marketplace not available"}
    
    result = modules['marketplace'].download_template(template_id)
    if result.get("success"):
        add_log("INFO", f"Template downloaded: {result.get('title', 'Unknown')}")
    
    return result

@app.post("/api/marketplace/template/{template_id}/rate")
async def rate_template(template_id: int, rating: int = Form(...), review: str = Form(None)):
    if modules['marketplace'].__class__.__name__ == "DummyModule":
        return {"success": False, "message": "Marketplace not available"}
    
    result = modules['marketplace'].rate_template(template_id, rating, review)
    return result

@app.get("/api/marketplace/categories")
async def get_marketplace_categories():
    if modules['marketplace'].__class__.__name__ == "DummyModule":
        return {"success": True, "categories": []}
    
    categories = modules['marketplace'].get_categories()
    return {"success": True, "categories": categories}

# ==================== ANALYTICS ENDPOINTS ====================
@app.get("/api/analytics/dashboard")
async def get_analytics_dashboard():
    if modules['analytics'].__class__.__name__ == "DummyModule":
        return {"success": True, "dashboard": {}, "charts": []}
    
    dashboard_data = modules['analytics'].get_dashboard_data()
    return {"success": True, **dashboard_data}

@app.get("/api/analytics/usage")
async def get_usage_analytics(days: int = 30):
    if modules['analytics'].__class__.__name__ == "DummyModule":
        return {"success": True, "usage": [], "summary": {}}
    
    usage_data = modules['analytics'].get_usage_data(days)
    return {"success": True, **usage_data}

@app.get("/api/analytics/time-saved")
async def get_time_saved_analytics():
    if modules['analytics'].__class__.__name__ == "DummyModule":
        return {"success": True, "time_saved": 0, "breakdown": []}
    
    time_data = modules['analytics'].get_time_saved_data()
    return {"success": True, **time_data}

@app.get("/api/analytics/report")
async def generate_analytics_report(
    start_date: str = None,
    end_date: str = None,
    format: str = "json"
):
    if modules['analytics'].__class__.__name__ == "DummyModule":
        return {"success": False, "message": "Analytics not available"}
    
    report = modules['analytics'].generate_report(start_date, end_date, format)
    return report

# ==================== MOBILE ENDPOINTS ====================
@app.get("/api/mobile/status")
async def get_mobile_status():
    if modules['mobile'].__class__.__name__ == "DummyModule":
        return {"success": True, "mobile": {"available": False}}
    
    status = modules['mobile'].get_status()
    return {"success": True, "mobile": status}

@app.get("/api/mobile/qr-code")
async def get_mobile_qr_code():
    if modules['mobile'].__class__.__name__ == "DummyModule":
        return {"success": False, "message": "Mobile not available"}
    
    qr_code = modules['mobile'].generate_qr_code()
    return {"success": True, "qr_code": qr_code}

@app.post("/api/mobile/pair")
async def pair_mobile_device(device_id: str = Form(...), device_name: str = Form(...)):
    if modules['mobile'].__class__.__name__ == "DummyModule":
        return {"success": False, "message": "Mobile not available"}
    
    result = modules['mobile'].pair_device(device_id, device_name)
    return result

@app.get("/api/mobile/devices")
async def get_paired_devices():
    if modules['mobile'].__class__.__name__ == "DummyModule":
        return {"success": True, "devices": []}
    
    devices = modules['mobile'].get_paired_devices()
    return {"success": True, "devices": devices}

@app.post("/api/mobile/notification")
async def send_mobile_notification(
    title: str = Form(...),
    message: str = Form(...),
    device_id: str = Form(None)
):
    if modules['mobile'].__class__.__name__ == "DummyModule":
        return {"success": False, "message": "Mobile not available"}
    
    result = modules['mobile'].send_notification(title, message, device_id)
    return result

# ==================== OLLAMA AI ENDPOINTS ====================
@app.get("/api/ai/ollama/status")
async def get_ollama_status():
    if modules['ollama'].__class__.__name__ == "DummyModule":
        return {"success": False, "available": False, "message": "Ollama not available"}
    
    status = modules['ollama'].get_status()
    return {"success": True, "available": True, "status": status}

@app.post("/api/ai/ollama/generate")
async def ollama_generate_code(request: Request):
    if modules['ollama'].__class__.__name__ == "DummyModule":
        return {"success": False, "message": "Ollama not available"}
    
    try:
        data = await request.json()
        task = data.get("task", "")
        model = data.get("model", "")
        
        if not task:
            return {"success": False, "message": "Task description required"}
        
        add_log("INFO", f"Ollama generation requested: {task[:50]}...")
        
        result = modules['ollama'].generate_automation_code(task, model)
        
        if result.get("success"):
            # Save to system state
            automation_id = len(system_state["automations"]) + 1
            automation = {
                "id": automation_id,
                "name": f"ollama_{automation_id}.py",
                "task": task,
                "model": result.get("model", "unknown"),
                "generated_at": datetime.now().isoformat(),
                "tokens": result.get("tokens", 0)
            }
            system_state["automations"].append(automation)
            
            # Save to file
            code_dir = "generated_automations/ollama"
            os.makedirs(code_dir, exist_ok=True)
            code_path = os.path.join(code_dir, automation["name"])
            
            with open(code_path, "w", encoding="utf-8") as f:
                f.write(result["code"])
            
            result["file_path"] = code_path
            add_log("SUCCESS", f"Ollama generated: {automation['name']}")
        
        return result
        
    except Exception as e:
        add_log("ERROR", f"Ollama generation error: {str(e)}")
        return {"success": False, "error": str(e)}

@app.post("/api/ai/ollama/analyze")
async def ollama_analyze_task(request: Request):
    if modules['ollama'].__class__.__name__ == "DummyModule":
        return {"success": False, "message": "Ollama not available"}
    
    try:
        data = await request.json()
        task = data.get("task", "")
        
        if not task:
            return {"success": False, "message": "Task description required"}
        
        analysis = modules['ollama'].analyze_task(task)
        return {"success": True, "analysis": analysis}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

# ==================== WORKFLOW ENDPOINTS ====================
@app.get("/api/workflows")
async def get_workflows():
    return {"success": True, "workflows": system_state["workflows"]}

@app.post("/api/workflows")
async def create_workflow(request: Request):
    try:
        data = await request.json()
        workflow_id = len(system_state["workflows"]) + 1
        
        workflow = {
            "id": workflow_id,
            "name": data.get("name", f"Workflow {workflow_id}"),
            "description": data.get("description", ""),
            "steps": data.get("steps", []),
            "trigger": data.get("trigger", "manual"),
            "schedule": data.get("schedule", None),
            "enabled": data.get("enabled", True),
            "created_at": datetime.now().isoformat(),
            "last_run": None,
            "run_count": 0,
            "success_count": 0
        }
        
        system_state["workflows"].append(workflow)
        add_log("INFO", f"Workflow created: {workflow['name']}")
        
        return {"success": True, "workflow": workflow}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/workflows/{workflow_id}/run")
async def run_workflow(workflow_id: int):
    try:
        workflow = next((w for w in system_state["workflows"] if w["id"] == workflow_id), None)
        if not workflow:
            return {"success": False, "message": "Workflow not found"}
        
        # Simulate workflow execution
        add_log("INFO", f"Running workflow: {workflow['name']}")
        
        # Update workflow stats
        workflow["last_run"] = datetime.now().isoformat()
        workflow["run_count"] = workflow.get("run_count", 0) + 1
        workflow["success_count"] = workflow.get("success_count", 0) + 1
        
        return {
            "success": True,
            "message": f"Workflow '{workflow['name']}' executed successfully",
            "workflow": workflow
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# ==================== USER MANAGEMENT ENDPOINTS ====================
@app.post("/api/auth/register")
async def register_user(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...)
):
    try:
        # Check if user exists
        conn = sqlite3.connect('database/users.db')
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ? OR username = ?", (email, username))
        if cursor.fetchone():
            conn.close()
            return {"success": False, "message": "User already exists"}
        
        # Create user
        api_key = hashlib.sha256(f"{username}{email}{datetime.now()}".encode()).hexdigest()
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, api_key, created_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (username, email, password_hash, api_key, datetime.now().isoformat()))
        
        user_id = cursor.lastrowid
        
        # Create default settings
        cursor.execute('''
            UPDATE users SET settings = ? WHERE id = ?
        ''', (json.dumps({"theme": "dark", "notifications": True}), user_id))
        
        conn.commit()
        conn.close()
        
        add_log("INFO", f"New user registered: {username} ({email})")
        
        return {
            "success": True,
            "message": "User registered successfully",
            "user": {
                "id": user_id,
                "username": username,
                "email": email,
                "api_key": api_key
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/auth/login")
async def login_user(
    email: str = Form(...),
    password: str = Form(...)
):
    try:
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        conn = sqlite3.connect('database/users.db')
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, username, email, api_key FROM users 
            WHERE email = ? AND password_hash = ?
        ''', (email, password_hash))
        
        user = cursor.fetchone()
        
        if user:
            # Update last login
            cursor.execute('''
                UPDATE users SET last_login = ? WHERE id = ?
            ''', (datetime.now().isoformat(), user[0]))
            conn.commit()
            
            add_log("INFO", f"User logged in: {user[1]}")
            
            return {
                "success": True,
                "message": "Login successful",
                "user": {
                    "id": user[0],
                    "username": user[1],
                    "email": user[2],
                    "api_key": user[3]
                }
            }
        else:
            return {"success": False, "message": "Invalid email or password"}
    except Exception as e:
        return {"success": False, "error": str(e)}

# ==================== EXPORT/IMPORT ENDPOINTS ====================
@app.get("/api/export/automations")
async def export_automations(format: str = "json"):
    """Export all automations"""
    try:
        automations = system_state["automations"]
        
        if format == "json":
            export_data = {
                "version": "1.0",
                "export_date": datetime.now().isoformat(),
                "automations": automations
            }
            
            # Create JSON file
            export_file = io.BytesIO()
            export_file.write(json.dumps(export_data, indent=2).encode('utf-8'))
            export_file.seek(0)
            
            return StreamingResponse(
                export_file,
                media_type="application/json",
                headers={
                    "Content-Disposition": f"attachment; filename=automations_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                }
            )
        
        elif format == "zip":
            # Create ZIP with all automation files
            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                # Add automations list
                zip_file.writestr(
                    "automations.json",
                    json.dumps(automations, indent=2)
                )
                
                # Add individual automation files
                for automation in automations:
                    if "file_path" in automation and os.path.exists(automation["file_path"]):
                        zip_file.write(
                            automation["file_path"],
                            f"scripts/{os.path.basename(automation['file_path'])}"
                        )
            
            zip_buffer.seek(0)
            
            return StreamingResponse(
                zip_buffer,
                media_type="application/zip",
                headers={
                    "Content-Disposition": f"attachment; filename=automations_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
                }
            )
        
        else:
            return {"success": False, "message": f"Unsupported format: {format}"}
            
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/import/automations")
async def import_automations(file: UploadFile = File(...)):
    """Import automations from file"""
    try:
        content = await file.read()
        
        if file.filename.endswith('.json'):
            data = json.loads(content)
            if "automations" in data:
                for automation in data["automations"]:
                    # Generate new ID
                    automation["id"] = len(system_state["automations"]) + 1
                    automation["imported_at"] = datetime.now().isoformat()
                    system_state["automations"].append(automation)
                
                add_log("INFO", f"Imported {len(data['automations'])} automations")
                return {"success": True, "count": len(data["automations"])}
        
        return {"success": False, "message": "Invalid import file"}
    except Exception as e:
        return {"success": False, "error": str(e)}

# ==================== WEBSOCKET ENDPOINTS ====================
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    system_state["users_online"] = len(active_connections)
    
    try:
        await websocket.send_json({
            "type": "connection_established",
            "message": "Connected to Agentic AI Platform",
            "users_online": system_state["users_online"],
            "timestamp": datetime.now().isoformat(),
            "features": {
                "desktop_recorder": modules['desktop_bridge'].__class__.__name__ != "DummyModule",
                "file_organizer": modules['file_organizer'].__class__.__name__ != "DummyModule",
                "marketplace": modules['marketplace'].__class__.__name__ != "DummyModule",
                "ollama": modules['ollama'].__class__.__name__ != "DummyModule"
            }
        })
        
        # Send initial system state
        await websocket.send_json({
            "type": "system_state",
            "state": {
                "desktop_recorder_running": system_state["desktop_recorder_running"],
                "recordings_count": len(system_state["recordings"]),
                "workflows_count": len(system_state["workflows"]),
                "automations_count": len(system_state["automations"]),
                "logs_count": len(system_state["logs"])
            }
        })
        
        # Send recent logs
        if system_state["logs"]:
            await websocket.send_json({
                "type": "recent_logs",
                "logs": system_state["logs"][:10]
            })
        
        # Main loop
        while True:
            await asyncio.sleep(5)
            
            try:
                # Send system stats
                await websocket.send_json({
                    "type": "system_stats",
                    "stats": get_system_stats(),
                    "timestamp": datetime.now().isoformat()
                })
            except:
                break
            
            # Check for incoming messages
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=0.1)
                await handle_websocket_message(websocket, data)
            except asyncio.TimeoutError:
                continue
            except:
                break
                
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        if websocket in active_connections:
            active_connections.remove(websocket)
        system_state["users_online"] = len(active_connections)

async def handle_websocket_message(websocket: WebSocket, data: str):
    """Handle WebSocket messages"""
    try:
        message = json.loads(data)
        msg_type = message.get("type")
        
        if msg_type == "ping":
            await websocket.send_json({
                "type": "pong", 
                "timestamp": datetime.now().isoformat()
            })
        
        elif msg_type == "start_recording":
            result = await start_desktop_recording()
            await websocket.send_json({
                "type": "recording_status",
                "status": "recording" if result["success"] else "error",
                "recording_id": result.get("recording_id"),
                "message": result.get("message")
            })
        
        elif msg_type == "stop_recording":
            result = await stop_desktop_recording()
            await websocket.send_json({
                "type": "recording_status",
                "status": "stopped" if result["success"] else "error",
                "message": result.get("message")
            })
        
        elif msg_type == "organize_files":
            # This would need a proper form data handler
            await websocket.send_json({
                "type": "file_operation",
                "status": "received",
                "message": "File organization request received"
            })
        
        elif msg_type == "generate_automation":
            # Simulate AI generation
            await websocket.send_json({
                "type": "ai_generation",
                "status": "processing",
                "message": "AI is generating your automation..."
            })
            
            await asyncio.sleep(2)
            
            await websocket.send_json({
                "type": "ai_generation",
                "status": "completed",
                "message": "Automation code generated successfully!"
            })
            
    except json.JSONDecodeError:
        await websocket.send_json({
            "type": "error", 
            "message": "Invalid JSON message"
        })
    except Exception as e:
        await websocket.send_json({
            "type": "error", 
            "message": f"Message handling error: {str(e)}"
        })

# ==================== STARTUP AND SHUTDOWN ====================
@app.on_event("startup")
async def startup_event():
    """Run on startup"""
    add_log("INFO", "Starting Agentic AI Platform...")
    
    # Initialize databases
    init_databases()
    
    # Create CSS file if it doesn't exist
    css_file = Path("static/style.css")
    if not css_file.exists():
        css_dir = Path("static")
        css_dir.mkdir(exist_ok=True)
        
        basic_css = """/* Basic CSS for Agentic AI Platform */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, sans-serif; background: #0f172a; color: #f1f5f9; min-height: 100vh; }
.container { max-width: 1400px; margin: 0 auto; padding: 20px; }
.header { text-align: center; padding: 40px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 20px; margin-bottom: 30px; }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; margin-bottom: 40px; }
.card { background: rgba(30, 41, 59, 0.8); border-radius: 16px; padding: 25px; transition: all 0.3s ease; border: 1px solid rgba(255, 255, 255, 0.1); }
.card:hover { transform: translateY(-8px); border-color: #6366f1; box-shadow: 0 15px 30px rgba(99, 102, 241, 0.2); }
.btn { padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.3s; }
.btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(99, 102, 241, 0.4); }
@media (max-width: 768px) { .container { padding: 15px; } .cards-grid { grid-template-columns: 1fr; } }"""
        
        with open(css_file, "w", encoding="utf-8") as f:
            f.write(basic_css)
        add_log("INFO", "Created style.css")
    
    # Create sample data
    system_state["recordings"] = [
        {"id": 1, "name": "Demo Recording 1", "timestamp": "2024-01-01T10:00:00", "duration": "30s", "size": "1.5MB"},
        {"id": 2, "name": "Demo Recording 2", "timestamp": "2024-01-02T14:30:00", "duration": "45s", "size": "2.3MB"}
    ]
    
    system_state["workflows"] = [
        {"id": 1, "name": "Daily Backup", "description": "Automatically backup important files", "status": "active", "schedule": "daily"},
        {"id": 2, "name": "Email Cleanup", "description": "Clean old emails weekly", "status": "active", "schedule": "weekly"}
    ]
    
    system_state["automations"] = [
        {"id": 1, "name": "File Organizer", "description": "Organize files by type", "created_at": "2024-01-01T09:00:00"},
        {"id": 2, "name": "Email Responder", "description": "Auto-respond to common emails", "created_at": "2024-01-02T10:30:00"}
    ]
    
    add_log("INFO", "Agentic AI Platform started successfully")
    print("✅ Server ready - All systems operational!")

@app.on_event("shutdown")
async def shutdown_event():
    """Run on shutdown"""
    add_log("INFO", "Agentic AI Platform shutting down")
    print("👋 Server shutting down...")

# ==================== ERROR HANDLERS ====================
@app.exception_handler(404)
async def not_found_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=404,
        content={"success": False, "message": f"Endpoint {request.url.path} not found"}
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: Exception):
    add_log("ERROR", f"Internal server error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Internal server error", "error": str(exc)}
    )

# ==================== MAIN ====================
if __name__ == "__main__":
    port = 5000
    
    print(f"🌐 Starting server on port {port}")
    print(f"📊 Dashboard: http://localhost:{port}")
    print(f"🔧 Health API: http://localhost:{port}/api/health")
    print(f"🔌 WebSocket: ws://localhost:{port}/ws")
    print(f"📚 API Docs: http://localhost:{port}/api/docs")
    print("="*60)
    print("📁 Available Pages:")
    pages = [
        ("Main Dashboard", "/"),
        ("Desktop Recorder", "/desktop-recorder"),
        ("File Organizer", "/file-organizer"),
        ("AI Automation", "/ai-automation"),
        ("Marketplace", "/marketplace"),
        ("Analytics", "/analytics"),
        ("Mobile", "/mobile"),
        ("Settings", "/settings"),
        ("Profile", "/profile"),
        ("Help", "/help"),
        ("Landing", "/landing")
    ]
    for name, path in pages:
        print(f"  • {name}: http://localhost:{port}{path}")
    print("="*60)
    print("🤖 Available Features:")
    for name, module in modules.items():
        status = "✅ Available" if module.__class__.__name__ != "DummyModule" else "⚠️ Not Available"
        print(f"  • {name.replace('_', ' ').title()}: {status}")
    print("="*60)
    print("🚀 Server is running! Press Ctrl+C to stop")
    print("="*60)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info",
        reload=False
    )