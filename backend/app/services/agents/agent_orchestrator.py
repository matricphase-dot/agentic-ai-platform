"""
Core Agent Orchestrator - Manages multi-agent workflows
"""
from enum import Enum
from typing import Dict, Any, List, Optional, Callable
import asyncio
import json
from datetime import datetime
from pydantic import BaseModel, Field
import logging

from ..api.execution_service import ExecutionService
from .agent_definitions import AgentRole, AgentCapability
from .collaboration_patterns import SequentialPattern, DebatePattern, SkillsPattern
from .agent_memory import AgentMemory
from app.core.schemas import WorkflowStep, WorkflowResult

logger = logging.getLogger(__name__)

class WorkflowStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"  # For human-in-the-loop

class AgentContext(BaseModel):
    """Context shared between agents in a workflow"""
    workflow_id: str
    session_id: str
    current_step: int = 0
    shared_state: Dict[str, Any] = Field(default_factory=dict)
    agent_history: List[Dict] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class AgentOrchestrator:
    """Main orchestrator for multi-agent workflows"""
    
    def __init__(self, execution_service: ExecutionService, 
                 memory: Optional[AgentMemory] = None):
        self.execution_service = execution_service
        self.memory = memory or AgentMemory()
        self.active_sessions: Dict[str, AgentContext] = {}
        
        # Available collaboration patterns
        self.patterns = {
            "sequential": SequentialPattern(),
            "debate": DebatePattern(),
            "skills": SkillsPattern()
        }
    
    async def create_workflow(self, 
                            workflow_def: Dict[str, Any],
                            user_id: str) -> str:
        """Create a new workflow session"""
        workflow_id = f"wf_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{user_id[-6:]}"
        session_id = f"sess_{workflow_id}"
        
        context = AgentContext(
            workflow_id=workflow_id,
            session_id=session_id,
            metadata={
                "user_id": user_id,
                "created_at": datetime.now().isoformat(),
                "workflow_def": workflow_def,
                "status": WorkflowStatus.PENDING
            }
        )
        
        self.active_sessions[session_id] = context
        await self.memory.save_session(session_id, context.dict())
        
        logger.info(f"Created workflow {workflow_id} for user {user_id}")
        return session_id
    
    async def execute_workflow(self, 
                             session_id: str,
                             initial_input: Dict[str, Any]) -> WorkflowResult:
        """Execute a complete workflow"""
        if session_id not in self.active_sessions:
            raise ValueError(f"Session {session_id} not found")
        
        context = self.active_sessions[session_id]
        context.metadata["status"] = WorkflowStatus.RUNNING
        context.metadata["started_at"] = datetime.now().isoformat()
        
        try:
            # Get workflow definition
            workflow_def = context.metadata["workflow_def"]
            pattern_type = workflow_def.get("pattern", "sequential")
            
            # Select collaboration pattern
            pattern = self.patterns.get(pattern_type, self.patterns["sequential"])
            
            # Execute workflow using selected pattern
            result = await pattern.execute(
                context=context,
                initial_input=initial_input,
                execution_service=self.execution_service,
                memory=self.memory
            )
            
            # Update context
            context.metadata["status"] = WorkflowStatus.COMPLETED
            context.metadata["completed_at"] = datetime.now().isoformat()
            context.metadata["result"] = result.dict()
            
        except Exception as e:
            logger.error(f"Workflow execution failed: {str(e)}")
            context.metadata["status"] = WorkflowStatus.FAILED
            context.errors.append(str(e))
            result = WorkflowResult(
                success=False,
                output={"error": str(e)},
                errors=context.errors
            )
        
        # Save final state
        await self.memory.save_session(session_id, context.dict())
        
        return result
    
    async def execute_step(self,
                         session_id: str,
                         step: WorkflowStep,
                         step_input: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single workflow step with a specialized agent"""
        context = self.active_sessions[session_id]
        
        # Log step start
        context.agent_history.append({
            "timestamp": datetime.now().isoformat(),
            "step": step.step_number,
            "agent": step.agent_role.value,
            "action": "start",
            "input": step_input
        })
        
        try:
            # Get agent definition
            agent_def = AgentCapability.get_agent(step.agent_role)
            
            # Prepare context for agent
            agent_context = {
                "shared_state": context.shared_state,
                "history": context.agent_history[-10:],  # Last 10 entries
                "step_instruction": step.instruction,
                "step_input": step_input
            }
            
            # Execute agent logic
            agent_result = await agent_def.execute(
                context=agent_context,
                execution_service=self.execution_service
            )
            
            # Update shared state
            if agent_result.get("update_shared_state"):
                context.shared_state.update(agent_result["update_shared_state"])
            
            # Log successful completion
            context.agent_history.append({
                "timestamp": datetime.now().isoformat(),
                "step": step.step_number,
                "agent": step.agent_role.value,
                "action": "complete",
                "output": agent_result.get("output", {}),
                "success": True
            })
            
            # Save to memory
            await self.memory.add_to_history(
                session_id=session_id,
                entry={
                    "type": "agent_execution",
                    "agent": step.agent_role.value,
                    "result": agent_result,
                    "timestamp": datetime.now().isoformat()
                }
            )
            
            return {
                "success": True,
                "agent": step.agent_role.value,
                "output": agent_result.get("output", {}),
                "shared_state_updates": agent_result.get("update_shared_state", {})
            }
            
        except Exception as e:
            logger.error(f"Step execution failed: {str(e)}")
            
            # Log error
            context.agent_history.append({
                "timestamp": datetime.now().isoformat(),
                "step": step.step_number,
                "agent": step.agent_role.value,
                "action": "error",
                "error": str(e),
                "success": False
            })
            
            context.errors.append(f"Step {step.step_number} failed: {str(e)}")
            
            # Implement retry logic (simplified)
            if step.retry_count < step.max_retries:
                logger.info(f"Retrying step {step.step_number}, attempt {step.retry_count + 1}")
                step.retry_count += 1
                return await self.execute_step(session_id, step, step_input)
            
            raise
    
    async def get_session_status(self, session_id: str) -> Dict[str, Any]:
        """Get current status of a workflow session"""
        if session_id not in self.active_sessions:
            # Try to load from memory
            session_data = await self.memory.load_session(session_id)
            if session_data:
                return session_data
        
        context = self.active_sessions.get(session_id)
        if not context:
            return {"error": "Session not found"}
        
        return {
            "session_id": session_id,
            "workflow_id": context.workflow_id,
            "status": context.metadata.get("status"),
            "current_step": context.current_step,
            "errors": context.errors,
            "history_count": len(context.agent_history),
            "metadata": context.metadata
        }
    
    async def pause_for_human_review(self,
                                   session_id: str,
                                   review_data: Dict[str, Any]) -> None:
        """Pause workflow for human review/approval"""
        context = self.active_sessions[session_id]
        context.metadata["status"] = WorkflowStatus.PAUSED
        context.metadata["human_review"] = {
            "requested_at": datetime.now().isoformat(),
            "data": review_data,
            "approved": False
        }
        
        # In production, this would trigger a webhook/notification
        logger.info(f"Workflow {session_id} paused for human review")
    
    async def resume_after_approval(self,
                                  session_id: str,
                                  approval: bool,
                                  notes: Optional[str] = None) -> bool:
        """Resume workflow after human approval"""
        context = self.active_sessions[session_id]
        
        if context.metadata.get("status") != WorkflowStatus.PAUSED:
            return False
        
        review = context.metadata.get("human_review", {})
        review["approved"] = approval
        review["approved_at"] = datetime.now().isoformat()
        review["approval_notes"] = notes
        
        if approval:
            context.metadata["status"] = WorkflowStatus.RUNNING
            logger.info(f"Workflow {session_id} resumed after approval")
            return True
        else:
            context.metadata["status"] = WorkflowStatus.FAILED
            context.errors.append("Workflow rejected in human review")
            logger.info(f"Workflow {session_id} rejected in human review")
            return False
