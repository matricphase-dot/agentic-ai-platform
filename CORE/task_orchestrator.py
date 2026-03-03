"""
Task Orchestrator - Manages task execution
"""
import asyncio
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)

class TaskOrchestrator:
    def __init__(self):
        self.tasks = {}
        self.running_tasks = set()
        logger.info("Task Orchestrator initialized")
    
    async def execute_task(self, agent_id: str, task_data: Dict[str, Any], user_id: int = 0) -> Dict[str, Any]:
        """Execute a task with an agent"""
        task_id = str(uuid.uuid4())
        
        task = {
            "id": task_id,
            "agent_id": agent_id,
            "user_id": user_id,
            "input": task_data,
            "status": "running",
            "created_at": datetime.now(),
            "started_at": datetime.now(),
            "result": None,
            "error": None
        }
        
        self.tasks[task_id] = task
        self.running_tasks.add(task_id)
        
        try:
            # Simulate task execution
            await asyncio.sleep(0.5)  # Simulate processing time
            
            task["status"] = "completed"
            task["completed_at"] = datetime.now()
            task["result"] = {
                "success": True,
                "message": f"Task executed by {agent_id}",
                "output": f"Processed: {task_data}"
            }
            
        except Exception as e:
            task["status"] = "failed"
            task["error"] = str(e)
            logger.error(f"Task {task_id} failed: {e}")
        
        finally:
            self.running_tasks.discard(task_id)
        
        return task
    
    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get task by ID"""
        return self.tasks.get(task_id)
    
    def list_tasks(self, user_id: Optional[int] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """List tasks, optionally filtered by user"""
        tasks_list = []
        
        for task in list(self.tasks.values())[-limit:]:
            if user_id is None or task["user_id"] == user_id:
                tasks_list.append({
                    "id": task["id"],
                    "agent_id": task["agent_id"],
                    "status": task["status"],
                    "created_at": task["created_at"].isoformat(),
                    "completed_at": task.get("completed_at", {}).isoformat() if task.get("completed_at") else None
                })
        
        return tasks_list