# orchestrator.py - MINIMAL WORKING VERSION
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
import os

app = FastAPI(title="Agentic AI Platform")

# Setup templates
try:
    templates = Jinja2Templates(directory="templates")
except:
    print("⚠️ Templates directory not found")

@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Main dashboard page"""
    try:
        return templates.TemplateResponse("dashboard.html", {"request": request})
    except Exception as e:
        # Fallback HTML if template fails
        html_content = """
        <html>
            <head><title>Agentic AI Platform</title></head>
            <body>
                <h1>🎯 Agentic AI Platform</h1>
                <p>Dashboard is running successfully!</p>
                <p><a href="/api/health">Check API Health</a></p>
            </body>
        </html>
        """
        return HTMLResponse(content=html_content)

@app.get("/api/health")
async def health_check():
    return JSONResponse({
        "status": "healthy",
        "service": "Agentic AI Platform",
        "version": "1.0.0"
    })

print("✅ Agentic AI Platform routes registered")