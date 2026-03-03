# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from datetime import datetime
import os
import logging

from app.routers import auth, agents, users, analytics, teams, agent_containers, websocket
from app.database import engine, Base

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables
try:
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables created successfully")
except Exception as e:
    logger.error(f"❌ Failed to create database tables: {e}")

app = FastAPI(
    title="Agentic AI Platform API",
    version="1.0.0",
    description="AWS for AI Agents - Cloud platform for deploying and managing AI agents",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Add GZip middleware for compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS middleware - Configure properly for production
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004",
    "https://agentic-platform-umber.vercel.app",
    "https://agentic-platform-*.vercel.app",
    "https://agentic-platform-*.vercel.app",
]

# Get allowed origins from environment
env_origins = os.getenv("ALLOWED_ORIGINS", "")
if env_origins:
    allowed_origins.extend([origin.strip() for origin in env_origins.split(",")])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(agents.router)
app.include_router(analytics.router)
app.include_router(teams.router)
app.include_router(agent_containers.router)
app.include_router(websocket.router)

@app.get("/")
async def root():
    return {
        "message": "Agentic AI Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "operational",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": os.getenv("ENVIRONMENT", "development"),
        "features": [
            "AI Agent Marketplace",
            "No-Code Agent Builder",
            "Team Collaboration",
            "Analytics Dashboard",
            "Agent Containers (Docker)",
            "Agent Communication Protocol",
            "Real-time WebSocket API"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Test database connection
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        
        return {
            "status": "healthy",
            "service": "agentic-ai-platform",
            "version": "1.0.0",
            "timestamp": datetime.utcnow().isoformat(),
            "environment": os.getenv("ENVIRONMENT", "development"),
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "service": "agentic-ai-platform",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@app.get("/info")
async def api_info():
    """API information endpoint"""
    return {
        "name": "Agentic AI Platform",
        "version": "1.0.0",
        "description": "AWS for AI Agents - Cloud platform for deploying and managing AI agents",
        "repository": "https://github.com/matricphase-dot/agentic-ai-platform",
        "endpoints": {
            "auth": "/api/v1/auth",
            "users": "/api/v1/users",
            "agents": "/api/v1/agents",
            "analytics": "/api/v1/analytics",
            "teams": "/api/v1/teams",
            "agent_containers": "/api/v1/agent-containers",
            "websocket": "/api/v1/ws/{agent_id}",
            "docs": "/docs",
            "health": "/health"
        },
        "status": "live",
        "live_urls": {
            "frontend": "https://agentic-platform-umber.vercel.app",
            "backend": "https://agentic-ai-platform-tajr.onrender.com",
            "api_docs": "https://agentic-ai-platform-tajr.onrender.com/docs"
        }
    }

@app.get("/status")
async def status_check():
    """Detailed status check"""
    status_info = {
        "api": "online",
        "database": "checking",
        "redis": "not_configured",
        "websocket": "available",
        "timestamp": datetime.utcnow().isoformat()
    }
    
    try:
        # Check database
        with engine.connect() as conn:
            result = conn.execute("SELECT version()")
            db_version = result.fetchone()[0]
            status_info["database"] = "connected"
            status_info["database_version"] = db_version.split()[0]
    except Exception as e:
        status_info["database"] = "error"
        status_info["database_error"] = str(e)
    
    return status_info

# Error handlers
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTP Error",
            "message": exc.detail,
            "status_code": exc.status_code,
            "path": request.url.path,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "message": "Invalid request parameters",
            "details": exc.errors(),
            "path": request.url.path,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred",
            "status_code": 500,
            "path": request.url.path,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info("🚀 Agentic AI Platform API starting up...")
    logger.info(f"📊 Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"🔗 API Documentation: /docs")
    logger.info(f"🌐 Allowed Origins: {allowed_origins}")
    
    # Check environment variables
    required_vars = ["SECRET_KEY", "DATABASE_URL"]
    for var in required_vars:
        if not os.getenv(var):
            logger.warning(f"⚠️  Environment variable {var} is not set")
    
    logger.info("✅ Startup completed")

@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    logger.info("👋 Agentic AI Platform API shutting down...")
    # Cleanup resources if needed

# WebSocket test endpoint
@app.get("/ws-test")
async def websocket_test():
    """HTML page for testing WebSocket connections"""
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Agentic AI - WebSocket Test</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .container { max-width: 800px; margin: 0 auto; }
            .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
            .connected { background: #d4edda; color: #155724; }
            .disconnected { background: #f8d7da; color: #721c24; }
            .message { padding: 10px; margin: 5px 0; background: #f8f9fa; border-radius: 5px; }
            .input-group { margin: 10px 0; }
            input, button { padding: 10px; margin: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Agentic AI - Agent Communication Test</h1>
            
            <div class="input-group">
                <input type="text" id="agentId" placeholder="Enter Agent ID" value="test-agent-1">
                <button onclick="connect()">Connect</button>
                <button onclick="disconnect()">Disconnect</button>
            </div>
            
            <div id="status" class="status disconnected">Disconnected</div>
            
            <div class="input-group">
                <input type="text" id="receiverId" placeholder="Receiver Agent ID" value="test-agent-2">
                <input type="text" id="message" placeholder="Type message...">
                <button onclick="sendMessage()">Send Message</button>
            </div>
            
            <div class="input-group">
                <button onclick="registerAgent()">Register Agent</button>
                <button onclick="ping()">Ping</button>
            </div>
            
            <h3>Messages:</h3>
            <div id="messages"></div>
        </div>
        
        <script>
            let ws = null;
            
            function updateStatus(connected) {
                const status = document.getElementById('status');
                status.textContent = connected ? 'Connected' : 'Disconnected';
                status.className = 'status ' + (connected ? 'connected' : 'disconnected');
            }
            
            function addMessage(text, type = 'info') {
                const messages = document.getElementById('messages');
                const message = document.createElement('div');
                message.className = 'message';
                message.textContent = `[\${new Date().toLocaleTimeString()}] \${text}`;
                messages.appendChild(message);
                messages.scrollTop = messages.scrollHeight;
            }
            
            function connect() {
                const agentId = document.getElementById('agentId').value;
                if (!agentId) {
                    alert('Please enter an Agent ID');
                    return;
                }
                
                // Use secure WebSocket if page is HTTPS
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const wsUrl = `\${protocol}//\${window.location.host}/api/v1/ws/agent/\${agentId}`;
                
                ws = new WebSocket(wsUrl);
                
                ws.onopen = function() {
                    updateStatus(true);
                    addMessage('Connected to agent network');
                    
                    // Auto-register on connect
                    registerAgent();
                };
                
                ws.onmessage = function(event) {
                    const data = JSON.parse(event.data);
                    addMessage(`Received: \${JSON.stringify(data)}`, 'received');
                };
                
                ws.onclose = function() {
                    updateStatus(false);
                    addMessage('Disconnected from agent network');
                };
                
                ws.onerror = function(error) {
                    addMessage(`WebSocket error: \${error}`, 'error');
                };
            }
            
            function disconnect() {
                if (ws) {
                    ws.close();
                    ws = null;
                }
            }
            
            function registerAgent() {
                if (!ws || ws.readyState !== WebSocket.OPEN) {
                    alert('Not connected');
                    return;
                }
                
                const agentId = document.getElementById('agentId').value;
                ws.send(JSON.stringify({
                    type: 'register',
                    agent_id: agentId,
                    agent_info: {
                        name: `Agent \${agentId}`,
                        type: 'web_client',
                        capabilities: ['chat', 'collaboration']
                    }
                }));
                
                addMessage('Sent registration request');
            }
            
            function sendMessage() {
                if (!ws || ws.readyState !== WebSocket.OPEN) {
                    alert('Not connected');
                    return;
                }
                
                const receiverId = document.getElementById('receiverId').value;
                const message = document.getElementById('message').value;
                
                if (!receiverId || !message) {
                    alert('Please enter receiver ID and message');
                    return;
                }
                
                ws.send(JSON.stringify({
                    type: 'message',
                    receiver_id: receiverId,
                    content: message,
                    message_type: 'text'
                }));
                
                addMessage(`Sent to \${receiverId}: \${message}`);
                document.getElementById('message').value = '';
            }
            
            function ping() {
                if (!ws || ws.readyState !== WebSocket.OPEN) {
                    alert('Not connected');
                    return;
                }
                
                ws.send(JSON.stringify({
                    type: 'ping'
                }));
                
                addMessage('Sent ping');
            }
            
            // Auto-connect on page load for testing
            window.onload = function() {
                setTimeout(connect, 1000);
            };
        </script>
    </body>
    </html>
    """
    from fastapi.responses import HTMLResponse
    return HTMLResponse(html)

# Rate limiting endpoint (placeholder for future implementation)
@app.get("/rate-limit-info")
async def rate_limit_info():
    return {
        "message": "Rate limiting will be implemented in production",
        "limits": {
            "free_tier": "100 requests/hour",
            "pro_tier": "1000 requests/hour",
            "enterprise": "Unlimited"
        },
        "current_tier": "development",
        "note": "No rate limiting applied in development mode"
    }

# Metrics endpoint (placeholder for future implementation)
@app.get("/metrics")
async def get_metrics():
    """Basic metrics endpoint (to be expanded with Prometheus)"""
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "status": "healthy",
        "uptime": "unknown",  # Would calculate from startup time
        "endpoints": {
            "total": 6,
            "active": 6
        },
        "database": {
            "status": "connected",
            "tables": len(Base.metadata.tables)
        }
    }