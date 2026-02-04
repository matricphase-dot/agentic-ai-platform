"""
Agentic AI Platform - Production Backend
Simplified and Working Version
"""

import os
import logging
import time
from contextlib import asynccontextmanager
from typing import List, Optional
from datetime import datetime, timedelta

from fastapi import FastAPI, Request, HTTPException, Depends, status, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.exc import SQLAlchemyError
from jose import JWTError, jwt
from passlib.context import CryptContext
import openai

# Database and Models
from app.database import engine, SessionLocal, Base, get_db
from app.models.user import User
from app.models.agent import Agent, AgentExecution

# Pydantic models
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)

logger = logging.getLogger(__name__)

# ========== SIMPLE CONFIGURATION ==========

# Load environment variables directly
from dotenv import load_dotenv
load_dotenv()

# Configuration with defaults
class Settings:
    # OpenAI Configuration
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
    OPENAI_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", "1000"))
    OPENAI_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", "0.7"))
    
    # Database Configuration
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./agentic.db")
    
    # JWT Authentication
    SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-this-in-production")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # CORS Configuration
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    
    # Admin User
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@agenticai.com")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin123!")
    ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
    
    # Server Configuration
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "8000"))
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    
    # Application URLs
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
    BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

settings = Settings()

# ========== PYDANTIC MODELS ==========

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class UserBase(BaseModel):
    email: str
    username: str
    full_name: Optional[str] = None
    is_admin: bool = False
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class AgentBase(BaseModel):
    name: str
    description: str
    category: str
    instructions: str
    is_public: bool = True

class AgentCreate(AgentBase):
    pass

class AgentResponse(AgentBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ExecutionRequest(BaseModel):
    input: str
    agent_id: int
    parameters: Optional[dict] = None

class ExecutionResponse(BaseModel):
    id: int
    agent_id: int
    user_id: int
    input: str
    output: str
    execution_time: float
    created_at: datetime
    
    class Config:
        from_attributes = True

# ========== SECURITY SETUP ==========

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ========== DATABASE INITIALIZATION ==========

def init_database():
    """Initialize database and create tables"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created successfully")
        
        # Create admin user if not exists
        db = SessionLocal()
        try:
            admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
            if not admin:
                hashed_password = pwd_context.hash(settings.ADMIN_PASSWORD)
                admin = User(
                    email=settings.ADMIN_EMAIL,
                    username=settings.ADMIN_USERNAME,
                    full_name="System Administrator",
                    hashed_password=hashed_password,
                    is_admin=True,
                    is_active=True
                )
                db.add(admin)
                db.commit()
                logger.info(f"✅ Admin user created: {settings.ADMIN_EMAIL}")
            else:
                logger.info("✅ Admin user already exists")
                
            # Create sample agents if none exist
            agent_count = db.query(Agent).count()
            if agent_count == 0:
                create_sample_agents(db)
                
        except Exception as e:
            logger.error(f"❌ Failed to create admin user: {e}")
            db.rollback()
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise

def create_sample_agents(db: SessionLocal):
    """Create sample agents for the platform"""
    sample_agents = [
        {
            "name": "Marketing Copywriter",
            "description": "Creates compelling marketing copy",
            "category": "Marketing",
            "instructions": "You are a marketing copywriter. Create engaging copy.",
            "is_public": True,
            "created_by": 1
        },
        {
            "name": "Code Assistant",
            "description": "Helps with coding tasks",
            "category": "Development",
            "instructions": "You are a software developer. Provide code solutions.",
            "is_public": True,
            "created_by": 1
        },
        {
            "name": "Customer Support",
            "description": "Handles customer queries",
            "category": "Support",
            "instructions": "You are a customer support agent. Help customers.",
            "is_public": True,
            "created_by": 1
        },
        {
            "name": "Content Summarizer",
            "description": "Summarizes long content",
            "category": "Content",
            "instructions": "You summarize content concisely.",
            "is_public": True,
            "created_by": 1
        },
        {
            "name": "SEO Optimizer",
            "description": "Optimizes content for SEO",
            "category": "Marketing",
            "instructions": "You are an SEO expert. Optimize content.",
            "is_public": True,
            "created_by": 1
        },
        {
            "name": "Data Analyst",
            "description": "Analyzes data insights",
            "category": "Analytics",
            "instructions": "You are a data analyst. Provide insights.",
            "is_public": True,
            "created_by": 1
        }
    ]
    
    for agent_data in sample_agents:
        agent = Agent(**agent_data)
        db.add(agent)
    
    db.commit()
    logger.info(f"✅ Created {len(sample_agents)} sample agents")

# ========== AUTHENTICATION UTILITIES ==========

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: SessionLocal = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# ========== OPENAI INTEGRATION ==========

def init_openai():
    """Initialize OpenAI client"""
    try:
        if settings.OPENAI_API_KEY:
            openai.api_key = settings.OPENAI_API_KEY
            logger.info("✅ OpenAI initialized successfully")
        else:
            logger.warning("⚠️ OPENAI_API_KEY not set. OpenAI features will not work.")
    except Exception as e:
        logger.error(f"❌ OpenAI initialization failed: {e}")

# ========== LIFESPAN MANAGER ==========

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup
    logger.info("🚀 Starting Agentic AI Platform Backend...")
    logger.info(f"📊 Environment: {settings.ENVIRONMENT}")
    logger.info(f"🌐 Backend URL: {settings.BACKEND_URL}")
    
    try:
        # Initialize database
        logger.info("🗄️ Initializing database...")
        init_database()
        
        # Initialize OpenAI
        logger.info("🤖 Initializing OpenAI service...")
        init_openai()
        
        logger.info("✅ Startup complete")
        
    except Exception as e:
        logger.error(f"❌ Startup failed: {str(e)}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Agentic AI Platform Backend...")

# ========== FASTAPI APP ==========

app = FastAPI(
    title="Agentic AI Platform API",
    description="No-Code AI Agent Platform for Businesses",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
    contact={
        "name": "Agentic AI Support",
        "email": "support@agenticai.com",
    }
)

# ========== MIDDLEWARE ==========

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip Compression Middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Skip logging for health checks
    if request.url.path in ["/health", "/metrics", "/favicon.ico"]:
        response = await call_next(request)
        return response
    
    logger.info(f"📥 {request.method} {request.url.path}")
    
    try:
        response = await call_next(request)
    except Exception as e:
        logger.error(f"❌ Request failed: {str(e)}")
        raise
    
    process_time = (time.time() - start_time) * 1000
    formatted_time = f"{process_time:.2f}ms"
    
    response.headers["X-Process-Time"] = formatted_time
    return response

# ========== HEALTH ENDPOINTS ==========

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Agentic AI Platform API",
        "version": "1.0.0",
        "status": "operational",
        "environment": settings.ENVIRONMENT,
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "login": "/api/v1/auth/login",
            "register": "/api/v1/auth/register",
            "agents": "/api/v1/agents",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db_status = "connected"
        db.close()
    except Exception:
        db_status = "disconnected"
    
    return {
        "status": "healthy",
        "service": "agentic-ai-backend",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "openai": "configured" if settings.OPENAI_API_KEY else "not_configured",
    }

# ========== AUTHENTICATION ENDPOINTS ==========

@app.post("/api/v1/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: SessionLocal = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user_dict = user_data.dict(exclude={"password"})
    user_dict["hashed_password"] = hashed_password
    
    db_user = User(**user_dict)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    logger.info(f"✅ New user registered: {user_data.email}")
    
    return db_user

@app.post("/api/v1/auth/login", response_model=Token)
async def login(
    email: str = Body(..., embed=True),
    password: str = Body(..., embed=True),
    db: SessionLocal = Depends(get_db)
):
    """Login user and return JWT token"""
    user = db.query(User).filter(User.email == email).first()
    
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.email})
    
    logger.info(f"✅ User logged in: {email}")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "is_admin": user.is_admin,
            "is_active": user.is_active
        }
    }

@app.get("/api/v1/auth/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """Get current user profile"""
    return current_user

# ========== AGENTS ENDPOINTS ==========

@app.get("/api/v1/agents", response_model=List[AgentResponse])
async def list_agents(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: SessionLocal = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all agents"""
    query = db.query(Agent)
    
    if category:
        query = query.filter(Agent.category == category)
    
    if search:
        query = query.filter(
            (Agent.name.contains(search)) | 
            (Agent.description.contains(search))
        )
    
    # Only show public agents or user's own agents
    query = query.filter((Agent.is_public == True) | (Agent.created_by == current_user.id))
    
    agents = query.order_by(Agent.created_at.desc()).offset(skip).limit(limit).all()
    return agents

@app.get("/api/v1/agents/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: int,
    db: SessionLocal = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get agent by ID"""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if not agent.is_public and agent.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return agent

@app.post("/api/v1/agents", response_model=AgentResponse)
async def create_agent(
    agent_data: AgentCreate,
    db: SessionLocal = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new agent"""
    db_agent = Agent(**agent_data.dict(), created_by=current_user.id)
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    
    logger.info(f"✅ Agent created: {agent_data.name} by {current_user.email}")
    
    return db_agent

@app.post("/api/v1/agents/{agent_id}/execute", response_model=ExecutionResponse)
async def execute_agent(
    agent_id: int,
    execution_data: ExecutionRequest,
    db: SessionLocal = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Execute an agent"""
    start_time = time.time()
    
    # Get agent
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if not agent.is_public and agent.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        # Check OpenAI API key
        if not settings.OPENAI_API_KEY:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": agent.instructions},
                {"role": "user", "content": execution_data.input}
            ],
            max_tokens=settings.OPENAI_MAX_TOKENS,
            temperature=settings.OPENAI_TEMPERATURE,
        )
        
        output = response.choices[0].message.content.strip()
        
    except Exception as e:
        logger.error(f"❌ OpenAI API error: {str(e)}")
        output = f"Error executing agent: {str(e)}"
    
    execution_time = time.time() - start_time
    
    # Save execution
    db_execution = AgentExecution(
        agent_id=agent_id,
        user_id=current_user.id,
        input=execution_data.input,
        output=output,
        execution_time=execution_time,
        parameters=execution_data.parameters or {}
    )
    db.add(db_execution)
    db.commit()
    db.refresh(db_execution)
    
    logger.info(f"✅ Agent executed: {agent.name} - Time: {execution_time:.2f}s")
    
    return db_execution

# ========== EXECUTION HISTORY ==========

@app.get("/api/v1/executions", response_model=List[ExecutionResponse])
async def list_executions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    agent_id: Optional[int] = None,
    db: SessionLocal = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List execution history"""
    query = db.query(AgentExecution).filter(AgentExecution.user_id == current_user.id)
    
    if agent_id:
        query = query.filter(AgentExecution.agent_id == agent_id)
    
    executions = query.order_by(AgentExecution.created_at.desc()).offset(skip).limit(limit).all()
    return executions

# ========== ERROR HANDLERS ==========

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    logger.warning(f"HTTP {exc.status_code}: {exc.detail}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "code": exc.status_code,
            "message": exc.detail,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle all exceptions"""
    logger.error(f"Unhandled Exception: {str(exc)}")
    
    error_message = "Internal server error"
    if settings.ENVIRONMENT != "production":
        error_message = str(exc)
    
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "code": 500,
            "message": error_message,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# ========== MAIN ENTRY POINT ==========

if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"🚀 Starting Agentic AI Platform Backend")
    logger.info(f"🌐 Host: {settings.HOST}")
    logger.info(f"🔌 Port: {settings.PORT}")
    logger.info(f"📊 Environment: {settings.ENVIRONMENT}")
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )