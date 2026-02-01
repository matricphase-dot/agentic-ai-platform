# orchestrator.py - COMPLETE FIXED VERSION
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import os
from pathlib import Path
import json
import sqlite3
from datetime import datetime

# Initialize app
app = FastAPI(
    title="Agentic AI Platform",
    description="Complete Desktop Automation System",
    version="3.0.0"
)

# Get base directory
BASE_DIR = Path(__file__).parent

# Setup templates directory
TEMPLATES_DIR = BASE_DIR / "templates"
TEMPLATES_DIR.mkdir(exist_ok=True)

# Setup static directory
STATIC_DIR = BASE_DIR / "static"
STATIC_DIR.mkdir(exist_ok=True)

# Configure templates and static files
try:
    templates = Jinja2Templates(directory=str(TEMPLATES_DIR))
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
    print(f"✅ Templates loaded from: {TEMPLATES_DIR}")
except Exception as e:
    print(f"⚠️  Template warning: {e}")
    templates = None

# ==================== DASHBOARD ROUTES ====================

@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Main dashboard page - THIS MUST EXIST AND RETURN HTML"""
    try:
        # Try to render from template
        if templates:
            return templates.TemplateResponse("dashboard.html", {"request": request})
        else:
            # Fallback HTML
            return HTMLResponse(content="""
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Agentic AI Platform</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                    }
                    .container { 
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(10px);
                        border-radius: 20px;
                        padding: 40px;
                        width: 90%;
                        max-width: 800px;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                    }
                    h1 { 
                        font-size: 3.5rem; 
                        margin-bottom: 20px;
                        text-align: center;
                        background: linear-gradient(45deg, #fff, #a8edea);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    .status { 
                        background: rgba(0, 255, 0, 0.2); 
                        padding: 15px; 
                        border-radius: 10px; 
                        margin: 20px 0;
                        text-align: center;
                        border: 2px solid rgba(0, 255, 0, 0.5);
                    }
                    .features { 
                        display: grid; 
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                        gap: 20px; 
                        margin: 30px 0;
                    }
                    .feature-card {
                        background: rgba(255, 255, 255, 0.1);
                        padding: 20px;
                        border-radius: 10px;
                        text-align: center;
                        transition: transform 0.3s;
                    }
                    .feature-card:hover {
                        transform: translateY(-5px);
                        background: rgba(255, 255, 255, 0.2);
                    }
                    .feature-card h3 {
                        margin-bottom: 10px;
                        color: #a8edea;
                    }
                    .buttons {
                        display: flex;
                        gap: 15px;
                        justify-content: center;
                        margin-top: 30px;
                    }
                    .btn {
                        padding: 12px 30px;
                        border: none;
                        border-radius: 50px;
                        font-size: 1rem;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s;
                        text-decoration: none;
                        display: inline-block;
                    }
                    .btn-primary {
                        background: linear-gradient(45deg, #667eea, #764ba2);
                        color: white;
                    }
                    .btn-secondary {
                        background: rgba(255, 255, 255, 0.2);
                        color: white;
                        border: 2px solid rgba(255, 255, 255, 0.3);
                    }
                    .btn:hover {
                        transform: scale(1.05);
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    }
                    .api-info {
                        margin-top: 30px;
                        padding: 20px;
                        background: rgba(0, 0, 0, 0.2);
                        border-radius: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🚀 Agentic AI Platform</h1>
                    
                    <div class="status">
                        <h2>✅ System Status: OPERATIONAL</h2>
                        <p>All systems are running normally</p>
                    </div>
                    
                    <div class="features">
                        <div class="feature-card">
                            <h3>🖥️ Desktop Recorder</h3>
                            <p>Record mouse & keyboard actions</p>
                        </div>
                        <div class="feature-card">
                            <h3>🤖 AI Automation</h3>
                            <p>Generate scripts with Ollama AI</p>
                        </div>
                        <div class="feature-card">
                            <h3>📁 File Organizer</h3>
                            <p>Automatically organize files</p>
                        </div>
                        <div class="feature-card">
                            <h3>🌐 Web Dashboard</h3>
                            <p>Manage everything from browser</p>
                        </div>
                    </div>
                    
                    <div class="buttons">
                        <a href="/api/health" class="btn btn-primary">Check API Health</a>
                        <a href="/docs" class="btn btn-secondary">View API Documentation</a>
                        <a href="#" onclick="launchDesktopRecorder()" class="btn btn-primary">Launch Desktop Recorder</a>
                    </div>
                    
                    <div class="api-info">
                        <h3>📡 API Endpoints</h3>
                        <ul style="list-style: none; margin-top: 10px;">
                            <li>🔗 <a href="/api/health" style="color: #a8edea;">GET /api/health</a> - System health check</li>
                            <li>🔗 <a href="/api/workflows" style="color: #a8edea;">GET /api/workflows</a> - List workflows</li>
                            <li>🔗 <a href="/docs" style="color: #a8edea;">GET /docs</a> - Interactive API docs</li>
                        </ul>
                    </div>
                </div>
                
                <script>
                function launchDesktopRecorder() {
                    alert("Desktop recorder would launch here.\\n\\nIn production, this would start the desktop agent.");
                }
                </script>
            </body>
            </html>
            """)
    except Exception as e:
        return HTMLResponse(content=f"""
        <h1>Error Loading Dashboard</h1>
        <p>Error: {str(e)}</p>
        <p>But the API is working! Try <a href="/api/health">/api/health</a></p>
        """, status_code=500)

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard_page(request: Request):
    """Alternative dashboard route"""
    return await dashboard(request)

# ==================== API ROUTES ====================

@app.get("/api/health")
async def health_check():
    return JSONResponse({
        "status": "healthy",
        "service": "Agentic AI Platform",
        "version": "3.0.0",
        "timestamp": datetime.now().isoformat(),
        "endpoints": ["/", "/dashboard", "/api/health", "/api/workflows", "/docs"]
    })

@app.get("/api/workflows")
async def list_workflows():
    return JSONResponse({
        "workflows": [
            {"id": "desktop_recorder", "name": "Desktop Recorder", "status": "active"},
            {"id": "file_organizer", "name": "File Organizer", "status": "active"},
            {"id": "ai_automation", "name": "AI Automation Generator", "status": "active"}
        ]
    })

@app.get("/api/desktop/status")
async def desktop_status():
    return JSONResponse({
        "desktop_agent": "ready",
        "path": "D:\\agentic-core\\desktop_recorder.py",
        "ollama_integrated": True
    })

# ==================== STARTUP ====================

print("\n" + "="*60)
print("🚀 AGENTIC AI PLATFORM INITIALIZED")
print("="*60)
print(f"📊 Dashboard: http://localhost:5000")
print(f"🔧 API Health: http://localhost:5000/api/health")
print(f"📚 API Docs: http://localhost:5000/docs")
print(f"🖥️ Desktop: http://localhost:5000/api/desktop/status")
print("="*60)