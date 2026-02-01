import sys
import os
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

# Import FastAPI
from fastapi import FastAPI, Request, WebSocket
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# Create app FIRST
app = FastAPI(
    title="Agentic AI Platform",
    description="Complete AI Agent Platform with 6 Agents and Marketplace",
    version="5.2.0"
)

# Lazy template initialization
_templates = None
def get_templates():
    global _templates
    if _templates is None:
        templates_dir = project_root / "templates"
        _templates = Jinja2Templates(directory=str(templates_dir))
    return _templates

# Mount static files
static_dir = project_root / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Import your routers
try:
    from src.agentic_ai.routers import agents, tasks, marketplace, users, analytics, desktop
    app.include_router(agents.router, prefix="/api/agents", tags=["agents"])
    app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
    app.include_router(marketplace.router, prefix="/api/marketplace", tags=["marketplace"])
    app.include_router(users.router, prefix="/api/users", tags=["users"])
    app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
    app.include_router(desktop.router, prefix="/api/desktop", tags=["desktop"])
except ImportError as e:
    print(f"Warning: Could not import some routers: {e}")

# Basic routes
@app.get("/", response_class=HTMLResponse)
async def root():
    try:
        templates = get_templates()
        return templates.TemplateResponse("dashboard.html", {"request": {}})
    except:
        return HTMLResponse("<h1>Agentic AI Platform</h1><p>Dashboard loading...</p>")

@app.get("/api/health")
async def health():
    return {"status": "healthy", "service": "agentic-ai", "version": "5.2.0"}

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard():
    try:
        templates = get_templates()
        return templates.TemplateResponse("dashboard.html", {"request": {}})
    except:
        return HTMLResponse("<h1>Dashboard</h1><p>Template not available</p>")

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_json({"message": "Connected to Agentic AI Platform"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)