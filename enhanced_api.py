# enhanced_api.py - Professional API with Auth & Database
import os
import json
import logging
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, status, BackgroundTasks, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
import uvicorn
from sqlalchemy.orm import Session
import jwt
from database_setup import (
    DatabaseManager, AuthManager, User, Workflow, ExecutionLog, 
    Agent, APIKey, FileOrganizationRule, SessionLocal,
    UserCreate, UserLogin, WorkflowCreate, ExecutionLogCreate
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="Agentic AI Platform API",
    description="Professional Autonomous Workflow Platform",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
db_manager = DatabaseManager()
auth_manager = AuthManager(db_manager)

# Dependency: Get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency: Get current user from token
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    payload = auth_manager.verify_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

# Dependency: Get user from API key
async def get_user_from_api_key(
    x_api_key: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    if not x_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required"
        )
    
    api_key = db.query(APIKey).filter(
        APIKey.key == x_api_key,
        APIKey.is_active == True
    ).first()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
    # Update last used
    api_key.last_used = datetime.utcnow()
    db.commit()
    
    return api_key.user

# Pydantic models for responses
class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class WorkflowResponse(BaseModel):
    id: int
    name: str
    description: str
    tasks: List[dict]
    schedule: Optional[str]
    is_active: bool
    owner: UserResponse
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class StatsResponse(BaseModel):
    users: int
    workflows: int
    active_workflows: int
    total_executions: int
    today_executions: int
    agents: int

# Routes
@app.get("/")
async def root():
    return {
        "message": "Agentic AI Platform v2.0",
        "status": "online",
        "timestamp": datetime.utcnow().isoformat(),
        "docs": "/docs",
        "features": [
            "User Authentication",
            "Workflow Management",
            "File Organization",
            "Agent System",
            "API Keys",
            "Execution Logging"
        ]
    }

# Auth Routes
@app.post("/api/auth/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Register new user"""
    user = auth_manager.create_user(db, user_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already exists"
        )
    
    return user

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    """Login and get token"""
    user = auth_manager.authenticate_user(
        db, 
        login_data.username, 
        login_data.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Generate token
    token = user.generate_token(db_manager.secret_key)
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user
    )

@app.post("/api/auth/api-key")
async def create_api_key(
    name: str = "Default",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate new API key"""
    api_key = auth_manager.generate_api_key(db, current_user.id, name)
    return {"api_key": api_key, "name": name}

# User Routes
@app.get("/api/users/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user info"""
    return current_user

@app.get("/api/users/stats")
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user statistics"""
    workflows = db.query(Workflow).filter(
        Workflow.owner_id == current_user.id
    ).count()
    
    active_workflows = db.query(Workflow).filter(
        Workflow.owner_id == current_user.id,
        Workflow.is_active == True
    ).count()
    
    executions = db.query(ExecutionLog).filter(
        ExecutionLog.user_id == current_user.id
    ).count()
    
    api_keys = db.query(APIKey).filter(
        APIKey.user_id == current_user.id,
        APIKey.is_active == True
    ).count()
    
    return {
        "workflows": workflows,
        "active_workflows": active_workflows,
        "total_executions": executions,
        "api_keys": api_keys
    }

# Workflow Routes
@app.post("/api/workflows", response_model=WorkflowResponse)
async def create_workflow(
    workflow_data: WorkflowCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new workflow"""
    workflow = Workflow(
        **workflow_data.dict(),
        owner_id=current_user.id
    )
    
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    
    # Log creation
    log = ExecutionLog(
        task_type="workflow_creation",
        status="success",
        details=f"Created workflow: {workflow.name}",
        user_id=current_user.id,
        workflow_id=workflow.id
    )
    db.add(log)
    db.commit()
    
    return workflow

@app.get("/api/workflows", response_model=List[WorkflowResponse])
async def list_workflows(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """List user's workflows"""
    workflows = db.query(Workflow).filter(
        Workflow.owner_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return workflows

@app.get("/api/workflows/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(
    workflow_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific workflow"""
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.owner_id == current_user.id
    ).first()
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    return workflow

@app.post("/api/workflows/{workflow_id}/execute")
async def execute_workflow(
    workflow_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Execute a workflow manually"""
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.owner_id == current_user.id
    ).first()
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    # Update last executed
    workflow.last_executed = datetime.utcnow()
    db.commit()
    
    # Start execution in background
    background_tasks.add_task(
        execute_workflow_background,
        workflow_id,
        current_user.id
    )
    
    return {
        "message": "Workflow execution started",
        "workflow_id": workflow_id,
        "started_at": datetime.utcnow().isoformat()
    }

async def execute_workflow_background(workflow_id: int, user_id: int):
    """Background task to execute workflow"""
    db = SessionLocal()
    try:
        workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not workflow:
            return
        
        # Execute tasks
        for task in workflow.tasks:
            log = ExecutionLog(
                task_type=task.get("action", "unknown"),
                status="running",
                details=f"Executing: {task}",
                user_id=user_id,
                workflow_id=workflow_id
            )
            db.add(log)
            db.commit()
            
            # Simulate execution
            import time
            time.sleep(1)
            
            log.status = "success"
            log.duration = 1000  # 1 second
            db.commit()
        
        # Update workflow
        workflow.last_executed = datetime.utcnow()
        db.commit()
        
    finally:
        db.close()

# File Organization Routes
@app.post("/api/files/organize")
async def organize_files(
    source_path: str,
    organization_type: str = "by_type",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Organize files using user's rules"""
    # Log start
    log = ExecutionLog(
        task_type="file_organization",
        status="running",
        details=f"Organizing {source_path} by {organization_type}",
        user_id=current_user.id
    )
    db.add(log)
    db.commit()
    
    # Get user's organization rules
    rules = db.query(FileOrganizationRule).filter(
        FileOrganizationRule.user_id == current_user.id,
        FileOrganizationRule.is_active == True
    ).order_by(FileOrganizationRule.priority).all()
    
    # Execute organization
    try:
        # This would integrate with your actual organizer
        # For now, simulate
        import time
        time.sleep(2)
        
        log.status = "success"
        log.details = f"Organized {source_path} using {len(rules)} rules"
        log.duration = 2000
        
    except Exception as e:
        log.status = "failed"
        log.details = f"Organization failed: {str(e)}"
    
    db.commit()
    
    return {
        "message": "File organization completed",
        "rules_applied": len(rules),
        "log_id": log.id
    }

@app.get("/api/files/rules")
async def get_file_rules(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's file organization rules"""
    rules = db.query(FileOrganizationRule).filter(
        FileOrganizationRule.user_id == current_user.id
    ).all()
    
    return rules

@app.post("/api/files/rules")
async def create_file_rule(
    name: str,
    pattern: str,
    target_folder: str,
    priority: int = 1,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new file organization rule"""
    rule = FileOrganizationRule(
        name=name,
        pattern=pattern,
        target_folder=target_folder,
        priority=priority,
        user_id=current_user.id
    )
    
    db.add(rule)
    db.commit()
    
    return {"message": "Rule created", "rule_id": rule.id}

# Agent Routes
@app.get("/api/agents")
async def list_agents(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """List available agents"""
    agents = db.query(Agent).filter(
        Agent.is_active == True
    ).offset(skip).limit(limit).all()
    
    return agents

@app.post("/api/agents/{agent_id}/execute")
async def execute_agent(
    agent_id: int,
    parameters: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Execute a specific agent"""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    # Update agent stats
    agent.total_executions += 1
    
    # Log execution
    log = ExecutionLog(
        task_type=f"agent_{agent.agent_type}",
        status="running",
        details=f"Executing {agent.name} with parameters: {parameters}",
        user_id=current_user.id
    )
    db.add(log)
    db.commit()
    
    try:
        # Execute agent (simulated)
        import time
        time.sleep(1)
        
        log.status = "success"
        log.duration = 1000
        agent.success_count += 1
        
    except Exception as e:
        log.status = "failed"
        log.details = f"Agent execution failed: {str(e)}"
        agent.failure_count += 1
    
    db.commit()
    
    return {
        "agent": agent.name,
        "status": log.status,
        "execution_id": log.id
    }

# Stats Routes
@app.get("/api/stats")
async def get_system_stats(
    db: Session = Depends(get_db)
):
    """Get system statistics"""
    today = datetime.utcnow().date()
    
    stats = {
        "users": db.query(User).filter(User.is_active == True).count(),
        "workflows": db.query(Workflow).count(),
        "active_workflows": db.query(Workflow).filter(
            Workflow.is_active == True
        ).count(),
        "total_executions": db.query(ExecutionLog).count(),
        "today_executions": db.query(ExecutionLog).filter(
            ExecutionLog.created_at >= today
        ).count(),
        "agents": db.query(Agent).filter(Agent.is_active == True).count()
    }
    
    return stats

@app.get("/api/logs")
async def get_execution_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    task_type: Optional[str] = None,
    status: Optional[str] = None
):
    """Get execution logs for current user"""
    query = db.query(ExecutionLog).filter(
        ExecutionLog.user_id == current_user.id
    )
    
    if task_type:
        query = query.filter(ExecutionLog.task_type == task_type)
    
    if status:
        query = query.filter(ExecutionLog.status == status)
    
    logs = query.order_by(
        ExecutionLog.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return logs

# API Key Routes (for API key authentication)
@app.post("/api/files/organize/api")
async def organize_files_api(
    source_path: str,
    organization_type: str = "by_type",
    user: User = Depends(get_user_from_api_key),
    db: Session = Depends(get_db)
):
    """Organize files via API key authentication"""
    return await organize_files(source_path, organization_type, user, db)

@app.get("/api/workflows/api")
async def list_workflows_api(
    user: User = Depends(get_user_from_api_key),
    db: Session = Depends(get_db)
):
    """List workflows via API key"""
    return await list_workflows(user, db)

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    logger.info("🚀 Agentic AI Platform starting up...")
    logger.info(f"📁 Database: {os.path.abspath('agentic_database.db')}")
    logger.info("✅ System ready!")

# Main entry point
if __name__ == "__main__":
    # Create admin user if not exists
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            logger.info("👑 Creating admin user...")
            # You would create admin here, but we'll let the API do it on first login
            pass
    finally:
        db.close()
    
    # Start server
    uvicorn.run(
        "enhanced_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )