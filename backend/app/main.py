# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os

from app.routers import auth, agents, users, analytics, teams, agent_containers
from app.database import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Agentic AI Platform API",
    version="1.0.0",
    description="No-code platform for creating and deploying AI agents",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(agents.router)
app.include_router(analytics.router)
app.include_router(teams.router)
app.include_router(agent_containers.router)

@app.get("/")
async def root():
    return {
        "message": "Agentic AI Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "operational",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "agentic-ai-platform",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.get("/info")
async def api_info():
    return {
        "name": "Agentic AI Platform",
        "version": "1.0.0",
        "description": "AWS for AI Agents - Cloud platform for deploying and managing AI agents",
        "endpoints": {
            "auth": "/api/v1/auth",
            "users": "/api/v1/users",
            "agents": "/api/v1/agents",
            "analytics": "/api/v1/analytics",
            "teams": "/api/v1/teams",
            "agent_containers": "/api/v1/agent-containers"
        },
        "status": "live",
        "features": [
            "AI Agent Marketplace",
            "No-Code Agent Builder",
            "Team Collaboration",
            "Analytics Dashboard",
            "Agent Containers (Docker-based)",
            "Multi-Model Support"
        ]
    }

# Error handlers
@app.exception_handler(404)
async def not_found_exception_handler(request, exc):
    return {
        "error": "Not Found",
        "message": f"The requested resource {request.url.path} was not found",
        "status_code": 404
    }

@app.exception_handler(500)
async def internal_server_error_handler(request, exc):
    return {
        "error": "Internal Server Error",
        "message": "An unexpected error occurred",
        "status_code": 500,
        "timestamp": datetime.utcnow().isoformat()
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    print("🚀 Agentic AI Platform API starting up...")
    print(f"📊 Environment: {os.getenv('ENVIRONMENT', 'development')}")
    print(f"🔗 Docs available at: /docs")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    print("👋 Agentic AI Platform API shutting down...")