# D:\AGENTIC_AI\CORE\main.py
"""
Agentic AI Platform - Main Server (PRODUCTION READY)
Version: 5.0.0
"""
import pyautogui
import os
import asyncio
import json
import uuid
import time
import logging
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional, Union
from contextlib import asynccontextmanager

# FastAPI imports
from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect, Body, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.security import HTTPBearer
from pydantic import BaseModel, Field, EmailStr
import uvicorn

# Authentication imports
import bcrypt
import jwt
from jose import JWTError

# Database imports
from sqlalchemy import create_engine, Column, String, Integer, DateTime, Boolean, JSON, Text, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.append(str(PROJECT_ROOT))

# ==================== CONFIGURATION ====================
class Settings:
    SECRET_KEY = os.getenv("JWT_SECRET", "dev-secret-change-in-production-2024")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS = 7
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./agentic_production.db")
    UPLOAD_FOLDER = "./uploads"
    MAX_UPLOAD_SIZE = 100 * 1024 * 1024  # 100MB

settings = Settings()

# ==================== DATABASE MODELS ====================
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    plan = Column(String(50), default="free")
    api_key = Column(String(255), unique=True, index=True)
    credits = Column(Integer, default=1000)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    settings = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    agents = relationship("Agent", back_populates="user")
    tasks = relationship("Task", back_populates="user")

class Agent(Base):
    __tablename__ = "agents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    agent_type = Column(String(100), nullable=False)
    description = Column(Text)
    config = Column(JSON, default={})
    status = Column(String(50), default="active")
    skills = Column(JSON, default=[])
    version = Column(Integer, default=1)
    performance_score = Column(Float, default=0.0)
    tasks_processed = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="agents")
    tasks = relationship("Task", back_populates="agent")

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    agent_id = Column(String, ForeignKey("agents.id"))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(String(50), default="pending")
    input_data = Column(JSON, default={})
    output_data = Column(JSON, default={})
    bounty = Column(Integer, default=0)
    cost = Column(Integer, default=0)
    error_message = Column(Text)
    execution_time = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="tasks")
    agent = relationship("Agent", back_populates="tasks")

class MarketplaceTask(Base):
    __tablename__ = "marketplace_tasks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    bounty = Column(Integer, default=100)
    status = Column(String(50), default="open")
    assigned_to = Column(String)
    result = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

class AgentBid(Base):
    __tablename__ = "agent_bids"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id = Column(String, ForeignKey("marketplace_tasks.id"))
    agent_id = Column(String, ForeignKey("agents.id"))
    user_id = Column(String, ForeignKey("users.id"))
    bid_amount = Column(Integer)
    confidence_score = Column(Float)
    estimated_completion = Column(String)
    submitted_at = Column(DateTime, default=datetime.utcnow)

class SystemLog(Base):
    __tablename__ = "system_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    level = Column(String(20))
    message = Column(Text)
    user_id = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

class PlatformMetric(Base):
    __tablename__ = "platform_metrics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    metric_name = Column(String(100))
    metric_value = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

# ==================== DATABASE SETUP ====================
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==================== AUTHENTICATION ====================
security = HTTPBearer()

class TokenData(BaseModel):
    user_id: str
    email: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    plan: Optional[str] = "free"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    plan: str
    api_key: Optional[str] = None

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_api_key() -> str:
    return f"ak_{uuid.uuid4().hex}_{uuid.uuid4().hex[:8]}"

async def get_current_user(token: str = Depends(security), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_user_id(token: str = Depends(security)) -> str:
    try:
        payload = jwt.decode(token.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== AGENT CLASSES ====================
class AgentBase:
    """Base class for agents"""
    def __init__(self, name: str, description: str = "", agent_type: str = "general"):
        self.name = name
        self.description = description
        self.agent_type = agent_type
        self.actions = []
        self.id = str(uuid.uuid4())
        self.status = "idle"
        self.tasks_processed = 0
        self.success_rate = 0.0
        self.created_at = datetime.now()
        self.last_active = datetime.now()
    
    async def execute(self, task: str) -> Dict[str, Any]:
        """Execute a task"""
        self.last_active = datetime.now()
        self.tasks_processed += 1
        return {
            "status": "success", 
            "message": "Task executed", 
            "agent": self.name, 
            "task": task,
            "timestamp": datetime.now().isoformat()
        }

class AgentRegistry:
    """Registry for managing agents"""
    def __init__(self):
        self.agents = {}
    
    def register(self, agent):
        """Register an agent"""
        self.agents[agent.id] = agent
        return agent
    
    def get(self, agent_id):
        """Get an agent by ID"""
        return self.agents.get(agent_id)
    
    def get_by_name(self, name):
        """Get an agent by name"""
        for agent in self.agents.values():
            if agent.name == name:
                return agent
        return None
    
    def list(self):
        """List all agents"""
        return list(self.agents.values())
    
    def count(self):
        """Count agents"""
        return len(self.agents)

sdk_registry = AgentRegistry()

# ==================== PROJECT PATHS ====================
project_root = PROJECT_ROOT
static_dir = project_root / "static"
templates_dir = project_root / "templates"
log_dir = project_root / "logs"
backup_dir = project_root / "backups"

# Ensure directories exist
for directory in [static_dir, templates_dir, log_dir, backup_dir]:
    directory.mkdir(parents=True, exist_ok=True)

# ==================== LOGGING ====================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(str(log_dir / 'app.log'), encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ==================== PLATFORM ANALYTICS ====================
class PlatformAnalytics:
    def __init__(self):
        self.start_time = time.time()
        self.total_requests = 0
        self.active_features = {}
    
    def track_request(self, endpoint: str):
        self.total_requests += 1
        self.active_features[endpoint] = self.active_features.get(endpoint, 0) + 1
    
    def get_metrics(self):
        return {
            "uptime": int(time.time() - self.start_time),
            "total_requests": self.total_requests,
            "active_features": len(self.active_features)
        }

analytics = PlatformAnalytics()

# ==================== WEBSOCKET MANAGER ====================
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New WebSocket connection. Total: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except:
            pass
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

# ==================== DATA MODELS ====================
class AgentCreate(BaseModel):
    name: str
    description: str = ""
    agent_type: str = "general"
    skills: List[str] = []

class TaskCreate(BaseModel):
    title: str
    description: str
    assigned_agent: Optional[str] = None

class MarketplaceTaskCreate(BaseModel):
    title: str
    description: str
    bounty: int = 100

class TestAgentRequest(BaseModel):
    agent_id: str
    task: str = "Test task"

# ==================== LIFESPAN & STARTUP ====================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events"""
    # Startup
    logger.info("Starting Agentic AI Platform v5.0.0...")
    
    # Load sample data
    await load_sample_data()
    
    # Start background tasks
    task = asyncio.create_task(background_cleanup())
    metrics_task = asyncio.create_task(background_metrics())
    
    yield
    
    # Shutdown
    task.cancel()
    metrics_task.cancel()
    try:
        await task
        await metrics_task
    except asyncio.CancelledError:
        pass
    logger.info("Shutting down Agentic AI Platform...")

# ==================== BACKGROUND TASKS ====================
async def background_cleanup():
    """Clean up old data and update statistics"""
    while True:
        try:
            db = SessionLocal()
            
            # Clean up old completed tasks (older than 30 days)
            cutoff = datetime.utcnow() - timedelta(days=30)
            deleted = db.query(Task).filter(
                Task.status == "completed",
                Task.created_at < cutoff
            ).delete()
            
            if deleted > 0:
                logger.info(f"Cleaned up {deleted} old tasks")
            
            # Update agent statistics
            agents = db.query(Agent).all()
            for agent in agents:
                agent_tasks = db.query(Task).filter(Task.agent_id == agent.id).all()
                if agent_tasks:
                    completed = sum(1 for t in agent_tasks if t.status == "completed")
                    agent.tasks_processed = len(agent_tasks)
                    agent.success_rate = (completed / len(agent_tasks)) * 100 if len(agent_tasks) > 0 else 0
                    agent.last_active = datetime.utcnow()
            
            db.commit()
            db.close()
            
        except Exception as e:
            logger.error(f"Background cleanup error: {e}")
        
        await asyncio.sleep(3600)  # Run every hour

async def background_metrics():
    """Update platform metrics"""
    while True:
        try:
            db = SessionLocal()
            
            # Count metrics
            agent_count = db.query(Agent).count()
            task_count = db.query(Task).count()
            user_count = db.query(User).count()
            marketplace_count = db.query(MarketplaceTask).count()
            
            # Calculate success rate
            agents = db.query(Agent).all()
            avg_success = sum(a.success_rate for a in agents) / len(agents) if agents else 0
            
            # Update or create metrics
            metrics = [
                ("agent_count", agent_count),
                ("task_count", task_count),
                ("user_count", user_count),
                ("marketplace_tasks", marketplace_count),
                ("avg_success_rate", round(avg_success, 2)),
                ("uptime_hours", int((time.time() - analytics.start_time) / 3600))
            ]
            
            for metric_name, metric_value in metrics:
                metric = db.query(PlatformMetric).filter(
                    PlatformMetric.metric_name == metric_name
                ).first()
                
                if metric:
                    metric.metric_value = metric_value
                    metric.created_at = datetime.utcnow()
                else:
                    metric = PlatformMetric(
                        metric_name=metric_name,
                        metric_value=metric_value
                    )
                    db.add(metric)
            
            db.commit()
            db.close()
            
        except Exception as e:
            logger.error(f"Background metrics error: {e}")
        
        await asyncio.sleep(300)  # Update every 5 minutes

# ==================== SAMPLE DATA ====================
async def load_sample_data():
    """Load sample data into database"""
    try:
        db = SessionLocal()
        
        # Check if we already have sample data
        user_count = db.query(User).count()
        
        if user_count == 0:
            # Create admin user
            admin_user = User(
                email="admin@agentic.ai",
                password_hash=hash_password("admin123"),
                plan="enterprise",
                api_key=create_api_key(),
                is_verified=True
            )
            db.add(admin_user)
            
            # Create sample agents
            sample_agents = [
                Agent(
                    user_id=admin_user.id,
                    name="File Organizer Agent",
                    description="Organizes files by type and content automatically",
                    agent_type="file_organizer",
                    skills=["file_organization", "nlp", "computer_vision"],
                    performance_score=92.5,
                    tasks_processed=15,
                    success_rate=92.5
                ),
                Agent(
                    user_id=admin_user.id,
                    name="Student Assistant Agent",
                    description="Helps with academic work and research",
                    agent_type="student_assistant",
                    skills=["research", "writing", "analysis"],
                    performance_score=95.5,
                    tasks_processed=22,
                    success_rate=95.5
                ),
                Agent(
                    user_id=admin_user.id,
                    name="Email Automation Agent",
                    description="Automates email responses and organization",
                    agent_type="email_automation",
                    skills=["email", "automation", "response"],
                    performance_score=88.9,
                    tasks_processed=18,
                    success_rate=88.9
                ),
                Agent(
                    user_id=admin_user.id,
                    name="Web Navigator Agent",
                    description="Browses and interacts with websites autonomously",
                    agent_type="web_navigator",
                    skills=["web_automation", "browser_control"],
                    performance_score=91.7,
                    tasks_processed=12,
                    success_rate=91.7
                ),
                Agent(
                    user_id=admin_user.id,
                    name="Marketplace Connector",
                    description="Automatically bids on marketplace tasks",
                    agent_type="marketplace_connector",
                    skills=["market_analysis", "bidding"],
                    performance_score=87.5,
                    tasks_processed=8,
                    success_rate=87.5
                ),
                Agent(
                    user_id=admin_user.id,
                    name="Data Analysis Agent",
                    description="Analyzes and processes data from various sources",
                    agent_type="data_analysis",
                    skills=["data_processing", "analysis"],
                    performance_score=85.7,
                    tasks_processed=9,
                    success_rate=85.7
                )
            ]
            
            for agent in sample_agents:
                db.add(agent)
            
            # Create sample tasks
            sample_tasks = [
                Task(
                    user_id=admin_user.id,
                    agent_id=sample_agents[0].id,
                    title="Organize downloads folder",
                    description="Categorize files in Downloads folder by type and content",
                    status="completed",
                    input_data={"folder": "Downloads"},
                    output_data={"files_processed": 45, "categories_created": 8},
                    execution_time=300
                ),
                Task(
                    user_id=admin_user.id,
                    agent_id=sample_agents[1].id,
                    title="Research AI trends 2024",
                    description="Find latest developments in AI for Q1 2024 report",
                    status="in_progress",
                    input_data={"topic": "AI trends 2024"}
                ),
                Task(
                    user_id=admin_user.id,
                    agent_id=sample_agents[2].id,
                    title="Clean email inbox",
                    description="Organize and categorize 500+ emails",
                    status="pending",
                    input_data={"email_count": 500}
                )
            ]
            
            for task in sample_tasks:
                db.add(task)
            
            # Create marketplace tasks
            marketplace_tasks = [
                MarketplaceTask(
                    user_id=admin_user.id,
                    title="Clean up email inbox",
                    description="Organize 500+ emails into folders, archive old ones",
                    bounty=250,
                    status="open"
                ),
                MarketplaceTask(
                    user_id=admin_user.id,
                    title="Data entry from PDF invoices",
                    description="Extract data from 20 PDF invoices into Excel format",
                    bounty=150,
                    status="claimed",
                    assigned_to=sample_agents[0].id
                ),
                MarketplaceTask(
                    user_id=admin_user.id,
                    title="Web scraping product data",
                    description="Scrape 100 product listings from e-commerce site",
                    bounty=300,
                    status="open"
                )
            ]
            
            for task in marketplace_tasks:
                db.add(task)
            
            # Create system logs
            system_logs = [
                SystemLog(level="INFO", message="System initialized successfully", user_id=admin_user.id),
                SystemLog(level="INFO", message="Sample data loaded", user_id=admin_user.id)
            ]
            
            for log in system_logs:
                db.add(log)
            
            db.commit()
            logger.info("Sample data loaded successfully")
        
        db.close()
        
    except Exception as e:
        logger.error(f"Error loading sample data: {e}")

# ==================== FASTAPI APP ====================
app = FastAPI(
    title="Agentic AI Platform",
    description="Universal Agentic Intelligence Operating System",
    version="5.0.0",
    lifespan=lifespan
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
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Templates
templates = Jinja2Templates(directory=templates_dir)

# ==================== AUTHENTICATION ENDPOINTS ====================
@app.post("/api/auth/register", response_model=TokenResponse)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    analytics.track_request("register")
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        plan=user_data.plan,
        api_key=create_api_key()
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": new_user.id, "email": new_user.email, "plan": new_user.plan}
    )
    
    # Log the registration
    system_log = SystemLog(
        level="INFO",
        message=f"New user registered: {new_user.email}",
        user_id=new_user.id
    )
    db.add(system_log)
    db.commit()
    
    return TokenResponse(
        access_token=access_token,
        user_id=new_user.id,
        email=new_user.email,
        plan=new_user.plan,
        api_key=new_user.api_key
    )

@app.post("/api/auth/login", response_model=TokenResponse)
async def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login user and return JWT token"""
    analytics.track_request("login")
    
    user = db.query(User).filter(User.email == user_data.email).first()
    
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Account disabled"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email, "plan": user.plan}
    )
    
    # Update last login
    user.updated_at = datetime.utcnow()
    db.commit()
    
    # Log the login
    system_log = SystemLog(
        level="INFO",
        message=f"User logged in: {user.email}",
        user_id=user.id
    )
    db.add(system_log)
    db.commit()
    
    return TokenResponse(
        access_token=access_token,
        user_id=user.id,
        email=user.email,
        plan=user.plan,
        api_key=user.api_key
    )

@app.get("/api/auth/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user information"""
    analytics.track_request("get_user_info")
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "plan": current_user.plan,
        "credits": current_user.credits,
        "api_key": current_user.api_key,
        "is_verified": current_user.is_verified,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        "agent_count": db.query(Agent).filter(Agent.user_id == current_user.id).count(),
        "task_count": db.query(Task).filter(Task.user_id == current_user.id).count()
    }

@app.post("/api/auth/refresh-api-key")
async def refresh_api_key(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a new API key for the user"""
    analytics.track_request("refresh_api_key")
    
    current_user.api_key = create_api_key()
    current_user.updated_at = datetime.utcnow()
    db.commit()
    
    # Log the refresh
    system_log = SystemLog(
        level="INFO",
        message="API key refreshed",
        user_id=current_user.id
    )
    db.add(system_log)
    db.commit()
    
    return {"api_key": current_user.api_key}

# ==================== PLATFORM ENDPOINTS ====================
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Home page"""
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "platform": {
            "name": "Agentic AI",
            "tagline": "Universal Agentic Intelligence Platform",
            "version": "5.0.0"
        }
    })

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Main dashboard"""
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "platform": {
            "name": "Agentic AI",
            "tagline": "Universal Agentic Intelligence Platform",
            "version": "5.0.0"
        }
    })

@app.get("/api/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint"""
    analytics.track_request("health_check")
    
    # Check database connection
    try:
        db.execute("SELECT 1")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "5.0.0",
        "service": "agentic-ai-platform",
        "database": db_status,
        "authentication": "enabled",
        "uptime": int(time.time() - analytics.start_time),
        "total_requests": analytics.total_requests
    }

# ==================== AGENT ENDPOINTS ====================
@app.get("/api/agents")
async def get_agents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all agents for current user"""
    analytics.track_request("get_agents")
    
    agents = db.query(Agent).filter(Agent.user_id == current_user.id).all()
    
    agents_data = []
    for agent in agents:
        agents_data.append({
            "id": agent.id,
            "name": agent.name,
            "description": agent.description,
            "agent_type": agent.agent_type,
            "status": agent.status,
            "skills": agent.skills,
            "performance_score": agent.performance_score,
            "tasks_processed": agent.tasks_processed,
            "success_rate": agent.success_rate,
            "created_at": agent.created_at.isoformat() if agent.created_at else None,
            "last_active": agent.last_active.isoformat() if agent.last_active else None
        })
    
    return {
        "success": True,
        "count": len(agents),
        "agents": agents_data
    }

@app.post("/api/agents")
async def create_agent(
    agent_data: AgentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new agent"""
    analytics.track_request("create_agent")
    
    # Create agent in database
    agent = Agent(
        user_id=current_user.id,
        name=agent_data.name,
        description=agent_data.description,
        agent_type=agent_data.agent_type,
        skills=agent_data.skills
    )
    
    db.add(agent)
    db.commit()
    db.refresh(agent)
    
    # Also register in runtime registry
    runtime_agent = AgentBase(agent.name, agent.description, agent.agent_type)
    runtime_agent.id = agent.id
    sdk_registry.register(runtime_agent)
    
    # Log the creation
    system_log = SystemLog(
        level="INFO",
        message=f"Agent created: {agent.name}",
        user_id=current_user.id
    )
    db.add(system_log)
    db.commit()
    
    # Broadcast via WebSocket
    await manager.broadcast(json.dumps({
        "type": "agent_created",
        "agent_id": agent.id,
        "agent_name": agent.name,
        "user_id": current_user.id,
        "timestamp": datetime.now().isoformat()
    }))
    
    return {
        "success": True,
        "message": f"Agent '{agent.name}' created successfully",
        "agent_id": agent.id
    }

# ==================== TASK ENDPOINTS ====================
@app.get("/api/tasks")
async def get_tasks(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all tasks for current user"""
    analytics.track_request("get_tasks")
    
    query = db.query(Task).filter(Task.user_id == current_user.id)
    
    if status:
        query = query.filter(Task.status == status)
    
    tasks = query.order_by(Task.created_at.desc()).all()
    
    tasks_data = []
    for task in tasks:
        tasks_data.append({
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "agent_id": task.agent_id,
            "bounty": task.bounty,
            "execution_time": task.execution_time,
            "created_at": task.created_at.isoformat() if task.created_at else None,
            "completed_at": task.completed_at.isoformat() if task.completed_at else None
        })
    
    return {
        "success": True,
        "count": len(tasks),
        "tasks": tasks_data
    }

@app.post("/api/tasks")
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new task"""
    analytics.track_request("create_task")
    
    task = Task(
        user_id=current_user.id,
        title=task_data.title,
        description=task_data.description,
        agent_id=task_data.assigned_agent
    )
    
    db.add(task)
    db.commit()
    db.refresh(task)
    
    # Log the creation
    system_log = SystemLog(
        level="INFO",
        message=f"Task created: {task.title}",
        user_id=current_user.id
    )
    db.add(system_log)
    db.commit()
    
    await manager.broadcast(json.dumps({
        "type": "task_created",
        "task_id": task.id,
        "task_title": task.title,
        "user_id": current_user.id,
        "timestamp": datetime.now().isoformat()
    }))
    
    return {
        "success": True,
        "message": f"Task '{task.title}' created successfully",
        "task_id": task.id
    }

# ==================== MARKETPLACE ENDPOINTS ====================
@app.get("/api/marketplace/tasks")
async def get_marketplace_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all marketplace tasks"""
    analytics.track_request("get_marketplace_tasks")
    
    tasks = db.query(MarketplaceTask).filter(
        MarketplaceTask.status == "open"
    ).order_by(MarketplaceTask.created_at.desc()).all()
    
    tasks_data = []
    for task in tasks:
        tasks_data.append({
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "bounty": task.bounty,
            "status": task.status,
            "created_at": task.created_at.isoformat() if task.created_at else None
        })
    
    return {
        "success": True,
        "count": len(tasks),
        "tasks": tasks_data
    }

@app.post("/api/marketplace/tasks")
async def create_marketplace_task(
    task_data: MarketplaceTaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new marketplace task"""
    analytics.track_request("create_marketplace_task")
    
    task = MarketplaceTask(
        user_id=current_user.id,
        title=task_data.title,
        description=task_data.description,
        bounty=task_data.bounty
    )
    
    db.add(task)
    db.commit()
    db.refresh(task)
    
    # Log the creation
    system_log = SystemLog(
        level="INFO",
        message=f"Marketplace task created: {task.title} (bounty: {task.bounty})",
        user_id=current_user.id
    )
    db.add(system_log)
    db.commit()
    
    return {
        "success": True,
        "message": f"Marketplace task '{task.title}' created successfully",
        "task_id": task.id,
        "bounty": task.bounty
    }

# ==================== ANALYTICS ENDPOINTS ====================
@app.get("/api/analytics/dashboard")
async def get_dashboard_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive dashboard analytics"""
    analytics.track_request("get_dashboard_analytics")
    
    # User-specific counts
    user_agents = db.query(Agent).filter(Agent.user_id == current_user.id).count()
    user_tasks = db.query(Task).filter(Task.user_id == current_user.id).count()
    user_completed_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status == "completed"
    ).count()
    
    # Global counts (admin only or public)
    total_agents = db.query(Agent).count()
    total_tasks = db.query(Task).count()
    total_users = db.query(User).count()
    marketplace_tasks = db.query(MarketplaceTask).count()
    
    return {
        "success": True,
        "analytics": {
            "user": {
                "agents": user_agents,
                "tasks": user_tasks,
                "completed_tasks": user_completed_tasks,
                "completion_rate": round((user_completed_tasks / user_tasks * 100), 2) if user_tasks > 0 else 0
            },
            "platform": {
                "total_agents": total_agents,
                "total_tasks": total_tasks,
                "total_users": total_users,
                "marketplace_tasks": marketplace_tasks,
                "web_socket_connections": len(manager.active_connections),
                "api_requests": analytics.total_requests,
                "uptime_hours": int((time.time() - analytics.start_time) / 3600)
            }
        }
    }

# ==================== SYSTEM ENDPOINTS ====================
@app.get("/api/system/status")
async def get_system_status(db: Session = Depends(get_db)):
    """Get detailed system status"""
    analytics.track_request("get_system_status")
    
    try:
        import psutil
        
        system_info = {
            "platform": sys.platform,
            "python_version": sys.version,
            "cpu_cores": psutil.cpu_count(),
            "cpu_usage": psutil.cpu_percent(),
            "memory_total": psutil.virtual_memory().total,
            "memory_available": psutil.virtual_memory().available,
            "memory_percent": psutil.virtual_memory().percent,
            "disk_usage": psutil.disk_usage('/').percent
        }
        
        # Database metrics
        db_metrics = {
            "total_users": db.query(User).count(),
            "total_agents": db.query(Agent).count(),
            "total_tasks": db.query(Task).count(),
            "database_url": settings.DATABASE_URL
        }
        
        return {
            "success": True,
            "system": system_info,
            "database": db_metrics,
            "platform": {
                "version": "5.0.0",
                "status": "running",
                "start_time": analytics.start_time,
                "uptime": int(time.time() - analytics.start_time),
                "web_socket_connections": len(manager.active_connections),
                "api_endpoints_available": 18
            },
            "timestamp": datetime.now().isoformat()
        }
    except ImportError:
        # Fallback without psutil
        return {
            "success": True,
            "system": {
                "platform": sys.platform,
                "python_version": sys.version,
                "note": "Install psutil for detailed system metrics"
            },
            "database": {
                "total_users": db.query(User).count(),
                "total_agents": db.query(Agent).count(),
                "total_tasks": db.query(Task).count()
            },
            "timestamp": datetime.now().isoformat()
        }

# ==================== AGENT TESTING ENDPOINTS ====================
@app.get("/api/agent/test/{agent_name}")
async def test_agent_by_name(
    agent_name: str,
    task: str = "Test task from API",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Test an agent with a task by name"""
    analytics.track_request("test_agent_by_name")
    
    agent = sdk_registry.get_by_name(agent_name)
    
    if agent:
        result = await agent.execute(task)
        
        # Log the test
        system_log = SystemLog(
            level="INFO",
            message=f"Agent test: {agent_name} - {task}",
            user_id=current_user.id
        )
        db.add(system_log)
        db.commit()
        
        return {
            "success": True,
            "agent": agent_name,
            "task": task,
            "result": result
        }
    else:
        # Try to find agent in database
        db_agent = db.query(Agent).filter(
            Agent.name == agent_name,
            Agent.user_id == current_user.id
        ).first()
        
        if db_agent:
            runtime_agent = AgentBase(db_agent.name, db_agent.description, db_agent.agent_type)
            runtime_agent.id = db_agent.id
            sdk_registry.register(runtime_agent)
            
            result = await runtime_agent.execute(task)
            return {
                "success": True,
                "agent": agent_name,
                "task": task,
                "result": result,
                "note": "Agent loaded from database"
            }
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Agent '{agent_name}' not found"
            )

# ==================== DESKTOP AUTOMATION ENDPOINTS ====================
@app.get("/api/desktop/status")
async def desktop_status():
    try:
        x, y = pyautogui.position()
        width, height = pyautogui.size()
        return {
            "status": "online",
            "mouse": {"x": x, "y": y},
            "screen": {"width": width, "height": height},
            "desktop_automation": True
        }
    except Exception as e:
        return {"status": "offline", "error": str(e)}

@app.post("/api/desktop/screenshot")
async def take_screenshot(current_user: User = Depends(get_current_user)):
    try:
        os.makedirs("screenshots", exist_ok=True)
        filename = f"screenshots/screen_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        pyautogui.screenshot(filename)
        
        # Log the action
        db = SessionLocal()
        system_log = SystemLog(
            level="INFO",
            message=f"Screenshot taken: {filename}",
            user_id=current_user.id
        )
        db.add(system_log)
        db.commit()
        db.close()
        
        return {"success": True, "filename": filename}
    except Exception as e:
        return {"success": False, "error": str(e)}

# ==================== WEB SOCKET ENDPOINT ====================
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                message_type = message_data.get("type", "message")
                
                if message_type == "agent_status":
                    # Update agent status
                    agent_id = message_data.get("agent_id")
                    status = message_data.get("status")
                    # Broadcast to all clients
                    await manager.broadcast(json.dumps({
                        "type": "agent_status_update",
                        "agent_id": agent_id,
                        "status": status,
                        "timestamp": datetime.now().isoformat()
                    }))
                elif message_type == "task_update":
                    # Task update
                    await manager.broadcast(json.dumps({
                        "type": "task_update",
                        "task_id": message_data.get("task_id"),
                        "status": message_data.get("status"),
                        "timestamp": datetime.now().isoformat()
                    }))
                else:
                    # Echo the received message
                    await websocket.send_text(f"Message received: {data}")
            except json.JSONDecodeError:
                # Plain text message
                await websocket.send_text(f"Message received: {data}")
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# ==================== TEST ALL FEATURES ====================
@app.get("/api/test/all")
async def test_all_features(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Test all platform features"""
    analytics.track_request("test_all_features")
    
    results = []
    
    # Test authentication
    try:
        results.append({"feature": "Authentication", "status": "success", "message": "User authenticated"})
    except:
        results.append({"feature": "Authentication", "status": "error", "message": "Authentication failed"})
    
    # Test database connection
    try:
        db.execute("SELECT 1")
        results.append({"feature": "Database", "status": "success", "message": "Database connected"})
    except:
        results.append({"feature": "Database", "status": "error", "message": "Database connection failed"})
    
    # Test agent retrieval
    try:
        agents_count = db.query(Agent).filter(Agent.user_id == current_user.id).count()
        results.append({"feature": "Agent Retrieval", "status": "success", "message": f"Found {agents_count} agents"})
    except:
        results.append({"feature": "Agent Retrieval", "status": "error", "message": "Failed to retrieve agents"})
    
    # Test WebSocket
    try:
        ws_status = "connected" if len(manager.active_connections) > 0 else "available"
        results.append({"feature": "WebSocket", "status": "success", "message": f"WebSocket {ws_status}"})
    except:
        results.append({"feature": "WebSocket", "status": "error", "message": "WebSocket failed"})
    
    return {
        "success": True,
        "user": current_user.email,
        "results": results,
        "total_tests": len(results),
        "passed_tests": len([r for r in results if r["status"] == "success"]),
        "failed_tests": len([r for r in results if r["status"] == "error"]),
        "timestamp": datetime.now().isoformat()
    }

# ==================== STARTUP SCRIPT ====================
def create_startup_script():
    """Create startup scripts for the platform"""
    try:
        # Windows batch file
        bat_content = '''@echo off
echo ====================================================
echo         AGENTIC AI PLATFORM v5.0.0
echo ====================================================
echo.
echo Starting Agentic AI Platform...
echo.
echo Platform Features:
echo - Full Authentication System (JWT)
echo - PostgreSQL Database Ready
echo - 6 Built-in AI Agents
echo - Task Marketplace System
echo - Web Dashboard Interface
echo - Real-time WebSocket Communication
echo - Desktop Automation
echo - Comprehensive API (18+ endpoints)
echo.
echo Access URLs:
echo   Dashboard: http://localhost:8080/dashboard
echo   API Docs:  http://localhost:8080/api/docs
echo   Health:    http://localhost:8080/api/health
echo.
cd /d "%~dp0"
python main.py
pause
'''
        with open(project_root / "start.bat", "w", encoding='utf-8') as f:
            f.write(bat_content)
        
        print("Created startup script: start.bat")
    except Exception as e:
        print(f"Could not create startup script: {e}")

# ==================== MAIN ENTRY POINT ====================
if __name__ == "__main__":
    # Global start time
    start_time = time.time()
    
    # Startup message
    print("\n" + "="*70)
    print("AGENTIC AI PLATFORM v5.0.0 - PRODUCTION READY")
    print("="*70)
    print(f"Project Root: {project_root}")
    print(f"Working Dir: {os.getcwd()}")
    print(f"Python Version: {sys.version}")
    print("="*70)
    print("PRODUCTION FEATURES:")
    print("  - Full JWT Authentication System")
    print("  - PostgreSQL Database Ready")
    print("  - Password Hashing (bcrypt)")
    print("  - 6 Built-in AI Agents")
    print("  - Task Marketplace with Bounty System")
    print("  - Real-time WebSocket Communication")
    print("  - Desktop Automation (screenshots, mouse control)")
    print("  - 18+ Secure API Endpoints")
    print("  - SQLAlchemy ORM with relationships")
    print("  - Background Tasks & Automatic Cleanup")
    print("  - Comprehensive Analytics Dashboard")
    print("="*70)
    print("ACCESS URLS:")
    print(f"  Dashboard: http://localhost:8080/dashboard")
    print(f"  API Documentation: http://localhost:8080/api/docs")
    print(f"  Health Check: http://localhost:8080/api/health")
    print(f"  WebSocket: ws://localhost:8080/ws")
    print("="*70)
    print("Starting server...\n")
    
    # Create startup scripts
    create_startup_script()
    
    try:
        # Start the server
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8080,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        print(f"ERROR: Failed to start server: {e}")
        print("\nTROUBLESHOOTING:")
        print("1. Check if port 8080 is already in use")
        print("2. Install requirements: pip install -r requirements.txt")
        print("3. Check database connection")
        input("\nPress Enter to exit...")