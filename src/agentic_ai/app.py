# D:\AGENTIC_AI\src\agentic_ai\app.py
"""
Main application factory for Agentic AI
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn
import os
from pathlib import Path

def create_app() -> FastAPI:
    """Create and configure the FastAPI application"""
    
    app = FastAPI(
        title="Agentic AI Platform",
        description="Unified Platform for AI Agents with Desktop Automation",
        version="3.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json"
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
    static_dir = Path(__file__).parent / "static"
    static_dir.mkdir(exist_ok=True)
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")
    
    return app

def run_server(host: str = "0.0.0.0", port: int = 8080, reload: bool = False):
    """Run the server"""
    
    app = create_app()
    
    print("\n" + "="*60)
    print("🚀 AGENTIC AI PLATFORM")
    print("="*60)
    print(f"Version: 3.0.0")
    print(f"Environment: Production")
    print(f"Server: http://{host}:{port}")
    print(f"Dashboard: http://{host}:{port}/dashboard")
    print(f"API Docs: http://{host}:{port}/api/docs")
    print("="*60)
    
    uvicorn.run(
        "agentic_ai.app:create_app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )