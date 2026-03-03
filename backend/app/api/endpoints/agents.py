"""
Agent Endpoints - API endpoints for agent operations
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import logging
import uuid

from app.services.agents.agent_orchestrator import AgentOrchestrator, WorkflowStatus
from app.services.api.execution_service import ExecutionService
from app.services.agents.agent_memory import AgentMemory
from app.core.schemas import WorkflowDefinition, WorkflowStep, WorkflowResult
from app.services.agents.agent_definitions import AgentRole

router = APIRouter(prefix="/agents", tags=["agents"])

logger = logging.getLogger(__name__)

# Pydantic models for requests/responses
class CreateWorkflowRequest(BaseModel):
    name: str
    pattern: str = "sequential"
    user_id: Optional[str] = "test_user"  # Default for testing

class CreateWorkflowResponse(BaseModel):
    session_id: str
    workflow_id: str
    status: str
    message: str

class WorkflowStatusResponse(BaseModel):
    session_id: str
    status: str
    current_step: int
    errors: List[str]
    history_count: int
    metadata: dict

class ExecuteStepRequest(BaseModel):
    session_id: str
    step: WorkflowStep

class ExecuteStepResponse(BaseModel):
    success: bool
    agent: str
    output: dict
    session_id: str

# Dependency injections (simplified)
def get_execution_service():
    return ExecutionService()

def get_agent_memory():
    return AgentMemory()

def get_orchestrator():
    return AgentOrchestrator(
        execution_service=get_execution_service(),
        memory=get_agent_memory()
    )

@router.post("/create-workflow", response_model=CreateWorkflowResponse)
async def create_workflow(
    request: CreateWorkflowRequest,
    background_tasks: BackgroundTasks,
    orchestrator: AgentOrchestrator = Depends(get_orchestrator)
):
    """Create a new multi-agent workflow"""
    try:
        # Create workflow definition
        workflow_def = {
            "id": f"wf_{uuid.uuid4().hex[:8]}",
            "name": request.name,
            "pattern": request.pattern,
            "steps": []  # Will be populated by the pattern
        }
        
        # Create workflow session
        user_id = request.user_id or "anonymous"
        session_id = await orchestrator.create_workflow(workflow_def, user_id)
        
        # Start workflow in background
        background_tasks.add_task(
            orchestrator.execute_workflow,
            session_id,
            {"task": request.name}
        )
        
        return CreateWorkflowResponse(
            session_id=session_id,
            workflow_id=workflow_def["id"],
            status="started",
            message=f"Workflow '{request.name}' started with pattern: {request.pattern}"
        )
        
    except Exception as e:
        logger.error(f"Failed to create workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/session/{session_id}", response_model=WorkflowStatusResponse)
async def get_session_status(
    session_id: str,
    orchestrator: AgentOrchestrator = Depends(get_orchestrator)
):
    """Get status of a workflow session"""
    try:
        status = await orchestrator.get_session_status(session_id)
        
        if "error" in status:
            raise HTTPException(status_code=404, detail=status["error"])
        
        return WorkflowStatusResponse(**status)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get session status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/execute-step", response_model=ExecuteStepResponse)
async def execute_step(
    request: ExecuteStepRequest,
    orchestrator: AgentOrchestrator = Depends(get_orchestrator)
):
    """Execute a single workflow step"""
    try:
        result = await orchestrator.execute_step(
            request.session_id,
            request.step,
            {"input": "test_input"}
        )
        
        return ExecuteStepResponse(
            success=result["success"],
            agent=result["agent"],
            output=result["output"],
            session_id=request.session_id
        )
        
    except Exception as e:
        logger.error(f"Failed to execute step: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/agent-roles")
async def get_agent_roles():
    """Get available agent roles"""
    return {
        "roles": [
            {"value": role.value, "description": role.name}
            for role in AgentRole
        ]
    }

@router.get("/patterns")
async def get_collaboration_patterns():
    """Get available collaboration patterns"""
    return {
        "patterns": [
            {
                "value": "sequential",
                "name": "Sequential/Manager-Worker",
                "description": "Agents work in sequence, each completing a specific task"
            },
            {
                "value": "debate",
                "name": "Debate/Reflective",
                "description": "Agents debate and critique each other's work"
            },
            {
                "value": "skills",
                "name": "Skills/Handoffs",
                "description": "Agents with specific skills hand off tasks"
            }
        ]
    }
