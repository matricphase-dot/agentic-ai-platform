"""
Unified Models for Agentic AI Platform
"""
from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, Boolean, Float, ForeignKey, LargeBinary
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

# ========== PHASE 1 MODELS ==========
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    company = Column(String, nullable=True)
    plan = Column(String, default="free")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class APIConnector(Base):
    __tablename__ = "api_connectors"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    provider = Column(String, nullable=False)
    base_url = Column(String, nullable=False)
    auth_type = Column(String, nullable=False)  # api_key, oauth2, bearer_token
    auth_config = Column(JSON, default=dict)
    openapi_schema = Column(JSON, nullable=True)
    available_actions = Column(JSON, default=list)
    is_verified = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UserAPICredential(Base):
    __tablename__ = "user_api_credentials"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    connector_id = Column(String, ForeignKey("api_connectors.id"), nullable=False)
    encrypted_credentials = Column(LargeBinary, nullable=False)
    oauth2_tokens = Column(JSON, nullable=True)
    permissions = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class APIExecutionLog(Base):
    __tablename__ = "api_execution_logs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    execution_id = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    connector_id = Column(String, ForeignKey("api_connectors.id"), nullable=False)
    action_name = Column(String, nullable=False)
    endpoint = Column(String, nullable=False)
    method = Column(String, nullable=False)
    status_code = Column(Integer, nullable=True)
    request_body = Column(JSON, nullable=True)
    response_body = Column(JSON, nullable=True)
    latency_ms = Column(Float, nullable=True)
    cost_usd = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

# ========== PHASE 2 MODELS ==========
class AgentSession(Base):
    """Agent workflow session"""
    __tablename__ = "agent_sessions"
    
    id = Column(String, primary_key=True)
    workflow_id = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="pending")
    shared_state = Column(JSON, default=dict)
    agent_history = Column(JSON, default=list)
    errors = Column(JSON, default=list)
    session_data = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class Workflow(Base):
    """Workflow definition"""
    __tablename__ = "workflows"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    pattern = Column(String, default="sequential")
    steps = Column(JSON, default=list)
    version = Column(String, default="1.0")
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_template = Column(Boolean, default=False)
    tags = Column(JSON, default=list)

class WorkflowStep(Base):
    """Individual step in a workflow"""
    __tablename__ = "workflow_steps"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    workflow_id = Column(String, ForeignKey("workflows.id"), nullable=False)
    step_number = Column(Integer, nullable=False)
    agent_role = Column(String, nullable=False)
    instruction = Column(Text, nullable=False)
    max_retries = Column(Integer, default=3)
    timeout_seconds = Column(Integer, default=300)
    required_inputs = Column(JSON, default=list)
    expected_outputs = Column(JSON, default=list)
    
    workflow = relationship("Workflow", back_populates="steps")

class WorkflowExecution(Base):
    """Execution record for a workflow"""
    __tablename__ = "workflow_executions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("agent_sessions.id"), nullable=False)
    workflow_id = Column(String, ForeignKey("workflows.id"), nullable=False)
    status = Column(String, default="started")
    input_data = Column(JSON, default=dict)
    output_data = Column(JSON, default=dict)
    error_log = Column(Text, nullable=True)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    execution_time_ms = Column(Float, nullable=True)
    cost_usd = Column(Float, default=0.0)

class AgentMemory(Base):
    """Memory entries for agents"""
    __tablename__ = "agent_memory_entries"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("agent_sessions.id"), nullable=False)
    agent_role = Column(String, nullable=False)
    entry_type = Column(String, nullable=False)
    entry_data = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Add relationships
Workflow.steps = relationship("WorkflowStep", order_by=WorkflowStep.step_number, back_populates="workflow")
