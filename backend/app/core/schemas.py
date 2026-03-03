"""
Core Pydantic Schemas for Agentic AI Platform
"""
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

from app.services.agents.agent_definitions import AgentRole

class WorkflowStep(BaseModel):
    """Definition of a single workflow step"""
    step_number: int
    agent_role: AgentRole
    instruction: str
    max_retries: int = 3
    retry_count: int = 0
    timeout_seconds: Optional[int] = 300
    required_inputs: List[str] = Field(default_factory=list)
    expected_outputs: List[str] = Field(default_factory=list)

class WorkflowDefinition(BaseModel):
    """Complete workflow definition"""
    id: str
    name: str
    description: Optional[str] = None
    pattern: str = "sequential"
    steps: List[WorkflowStep] = Field(default_factory=list)
    version: str = "1.0"
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)

class WorkflowResult(BaseModel):
    """Result of workflow execution"""
    success: bool
    output: Dict[str, Any] = Field(default_factory=dict)
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    execution_time_ms: Optional[float] = None
    cost_estimate_usd: Optional[float] = None

class AgentRequest(BaseModel):
    """Request to an agent"""
    session_id: str
    agent_role: AgentRole
    input_data: Dict[str, Any]
    context: Optional[Dict[str, Any]] = None

class AgentResponse(BaseModel):
    """Response from an agent"""
    success: bool
    output: Dict[str, Any]
    error: Optional[str] = None
    confidence: float = Field(ge=0.0, le=1.0)
    reasoning: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class APIExecutionRequest(BaseModel):
    """Request to execute an API action"""
    connector_id: str
    action_name: str
    parameters: Dict[str, Any]
    user_id: str
    session_id: Optional[str] = None

class APIExecutionResponse(BaseModel):
    """Response from API execution"""
    success: bool
    result: Dict[str, Any]
    error: Optional[str] = None
    status_code: Optional[int] = None
    latency_ms: float
    cost_usd: Optional[float] = None
