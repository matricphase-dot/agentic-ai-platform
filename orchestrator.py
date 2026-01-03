# orchestrator.py - CORRECTED VERSION
from fastapi import FastAPI, Request, HTTPException, BackgroundTasks
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import json
import sqlite3
from pathlib import Path
import os
import subprocess
import asyncio
import logging

# Initialize app
app = FastAPI(title="Agentic AI Platform", version="2.0")

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Setup templates and static files
try:
    templates = Jinja2Templates(directory="templates")
    app.mount("/static", StaticFiles(directory="static"), name="static")
    logger.info("✅ Templates and static files configured")
except Exception as e:
    logger.warning(f"⚠️ Template/static setup: {e}")
    # Create a minimal template fallback
    templates = None

# --- CRITICAL: NO stand-alone code here! Only definitions. ---
# All executable logic must be inside route functions or async tasks.

# --- ROUTE DEFINITIONS ---
@app.get("/", response_class=HTMLResponse)
async def serve_dashboard(request: Request):
    """Serve the main dashboard page"""
    try:
        if templates:
            return templates.TemplateResponse("dashboard.html", {"request": request})
        else:
            # Fallback HTML dashboard
            html_content = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Agentic AI Platform</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
                    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    h1 { color: #333; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
                    .status { background: #e7f4e4; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    .endpoint { background: #f0f0f0; padding: 10px; margin: 10px 0; border-left: 4px solid #667eea; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🚀 Agentic AI Platform</h1>
                    <div class="status">
                        <strong>Status:</strong> <span style="color: green;">● Online</span>
                        <p>Your dashboard is running successfully on Railway.</p>
                    </div>
                    <h2>API Endpoints</h2>
                    <div class="endpoint"><strong>GET</strong> <code>/api/health</code> - Service health check</div>
                    <div class="endpoint"><strong>GET</strong> <code>/api/workflows</code> - List available workflows</div>
                    <div class="endpoint"><strong>POST</strong> <code>/api/execute/{name}</code> - Execute a workflow</div>
                    <p><a href="/api/health" target="_blank">Test Health Endpoint</a></p>
                </div>
            </body>
            </html>
            """
            return HTMLResponse(content=html_content)
    except Exception as e:
        logger.error(f"Dashboard error: {e}")
        return HTMLResponse(content=f"<h1>Dashboard Error</h1><p>{str(e)}</p>", status_code=500)

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return JSONResponse({
        "status": "healthy",
        "service": "Agentic AI Platform",
        "version": "2.0",
        "endpoints": ["/", "/dashboard", "/api/health", "/api/workflows", "/api/execute/{name}"]
    })

@app.get("/api/workflows")
async def list_workflows():
    """List available workflows"""
    workflows_file = Path("workflows.json")
    if workflows_file.exists():
        with open(workflows_file, "r") as f:
            workflows = json.load(f)
    else:
        # Default workflow
        workflows = {
            "file_organizer": {
                "name": "File Organizer",
                "description": "Organize files by type",
                "endpoint": "/api/execute/file_organizer"
            }
        }
    return JSONResponse({"workflows": workflows})

@app.post("/api/execute/{workflow_name}")
async def execute_workflow(workflow_name: str, background_tasks: BackgroundTasks):
    """Execute a workflow (runs in background)"""
    
    async def run_file_organizer():
        """Example background task"""
        try:
            script_path = Path("organize_files.py")
            if script_path.exists():
                result = subprocess.run(
                    ["python", str(script_path)],
                    capture_output=True,
                    text=True,
                    timeout=60
                )
                logger.info(f"File organizer completed: {result.returncode}")
                return result.returncode == 0
            return False
        except Exception as e:
            logger.error(f"Workflow error: {e}")
            return False
    
    if workflow_name == "file_organizer":
        # Add to background tasks so the HTTP response returns immediately
        background_tasks.add_task(run_file_organizer)
        return JSONResponse({
            "status": "started",
            "workflow": workflow_name,
            "message": "Workflow execution started in background"
        })
    else:
        raise HTTPException(status_code=404, detail=f"Workflow '{workflow_name}' not found")

# --- MODULE ENDS HERE ---
# No code should execute here! The app will now wait for requests.