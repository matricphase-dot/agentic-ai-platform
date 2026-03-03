# backend/app/schemas/agent_container.py
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class AgentContainerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    image: str = Field(default="python:3.11-slim")
    model_name: str = Field(default="gpt-3.5-turbo")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=1000, ge=1, le=4000)
    memory_limit_mb: int = Field(default=512, ge=128, le=8192)
    cpu_limit: float = Field(default=0.5, ge=0.1, le=8.0)
    gpu_enabled: bool = Field(default=False)
    system_prompt: Optional[str] = None

class AgentContainerCreate(AgentContainerBase):
    pass

class AgentContainerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    model_name: Optional[str] = None
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(None, ge=1, le=4000)
    system_prompt: Optional[str] = None

class AgentContainerDeploy(BaseModel):
    openai_api_key: str
    custom_code: Optional[str] = None

class AgentContainerResponse(AgentContainerBase):
    id: int
    container_id: Optional[str]
    status: str
    health_status: Optional[str]
    last_started: Optional[datetime]
    last_stopped: Optional[datetime]
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class AgentContainerStatus(BaseModel):
    container_id: str
    status: str
    details: Dict[str, Any]
    created_at: Optional[datetime]
    started_at: Optional[datetime]