# orchestrator.py - COMPLETE FIXED VERSION
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import json
import sqlite3
from pathlib import Path
import os
import subprocess

# Initialize FastAPI app
app = FastAPI(title="Agentic AI Platform", version="2.0")

# Setup templates and static files
try:
    templates = Jinja2Templates(directory="templates")
    app.mount("/static", StaticFiles(directory="static"), name="static")
except Exception as e:
    print(f"⚠️ Template/static setup warning: {e}")

# --- DASHBOARD ROUTES (HTML PAGES) ---
@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Serve the main dashboard page"""
    try:
        return templates.TemplateResponse("dashboard.html", {"request": request})
    except Exception as e:
        # Fallback: serve a basic HTML page
        return HTMLResponse("""
        <html>
            <head><title>Agentic AI Platform</title></head>
            <body>
                <h1>Agentic AI Dashboard</h1>
                <p>Dashboard is loading...</p>
                <p>API is working: <a href="/api/health">/api/health</a></p>
            </body>
        </html>
        """)

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard_alt(request: Request):
    """Alternative dashboard route"""
    return await dashboard(request)

# --- API ROUTES (JSON ENDPOINTS) ---
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "2.0", "service": "Agentic AI Platform"}

@app.get("/api/workflows")
async def list_workflows():
    if Path("workflows.json").exists():
        with open("workflows.json", "r") as f:
            workflows = json.load(f)
        return {"workflows": workflows, "count": len(workflows)}
    return {"workflows": ["file_organizer"], "count": 1}

@app.post("/api/execute/{workflow_id}")
async def execute_workflow(workflow_id: str):
    if workflow_id == "file_organizer":
        try:
            result = subprocess.run(
                ["python", "organize_files.py"], 
                capture_output=True, 
                text=True, 
                timeout=30
            )
            return {
                "workflow_id": workflow_id,
                "status": "success" if result.returncode == 0 else "error",
                "output": result.stdout,
                "error": result.stderr
            }
        except Exception as e:
            return {"workflow_id": workflow_id, "status": "error", "message": str(e)}
    
    return {"workflow_id": workflow_id, "status": "unknown_workflow"}

@app.get("/api/workspace/structure")
async def workspace_structure():
    """Returns workspace file structure"""
    structure = []
    for root, dirs, files in os.walk(".", topdown=True):
        # Skip hidden and system directories
        dirs[:] = [d for d in dirs if not d.startswith(('.', '__'))]
        level = root.replace(".", "").count(os.sep)
        indent = " " * 2 * level
        structure.append(f"{indent}{os.path.basename(root) or 'ROOT'}/")
        for file in files[:5]:  # Limit files per directory
            if not file.startswith('.'):
                structure.append(f"{indent}  📄 {file}")
    
    return {"structure": structure[:100]}  # Limit total lines

print("✅ Agentic AI Platform initialized with dashboard + API")
print("🌐 Dashboard: /")
print("🔧 API Health: /api/health")
print("📊 Workflows: /api/workflows")