# agentic_api.py - Professional API for your Agentic AI System
import os
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Agentic AI API",
    description="Professional API for Autonomous Workflow Execution",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class WorkflowRequest(BaseModel):
    name: str
    description: str
    tasks: List[Dict]
    schedule: Optional[str] = None  # Cron expression
    notify_on_complete: bool = False

class FileOrganizeRequest(BaseModel):
    source_path: str
    organization_type: str = "by_type"  # by_type, by_date, by_size
    target_workspace: Optional[str] = None

class AgentTask(BaseModel):
    agent_type: str  # "organizer", "analyzer", "generator", "reporter"
    parameters: Dict
    priority: int = 1

# Global state
execution_log = []
active_workflows = []
workspace_path = Path(__file__).parent

class AgenticOrchestrator:
    """Enhanced orchestrator with API capabilities"""
    
    def __init__(self):
        self.workspace = workspace_path
        self.log_file = self.workspace / "System" / "Logs" / "api_executions.log"
        self.log_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Load existing workflows
        self.workflows_file = self.workspace / "workflows.json"
        if self.workflows_file.exists():
            with open(self.workflows_file, 'r') as f:
                self.workflows = json.load(f)
        else:
            self.workflows = []
    
    def log_execution(self, task_type: str, status: str, details: str):
        """Log execution details"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "task_type": task_type,
            "status": status,
            "details": details
        }
        execution_log.append(log_entry)
        
        # Write to file
        with open(self.log_file, 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
        
        logger.info(f"{task_type}: {status} - {details}")
        return log_entry
    
    async def organize_files(self, request: FileOrganizeRequest):
        """API wrapper for file organization"""
        try:
            self.log_execution("file_organization", "started", 
                             f"Organizing {request.source_path} by {request.organization_type}")
            
            # Call your existing organizer
            source = Path(request.source_path)
            if not source.exists():
                raise HTTPException(status_code=404, detail="Source path not found")
            
            # This is where we integrate with your existing organize_files.py
            result = await self._run_organizer(source, request.organization_type)
            
            self.log_execution("file_organization", "completed", 
                             f"Organized {result['files_processed']} files")
            return result
            
        except Exception as e:
            self.log_execution("file_organization", "failed", str(e))
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _run_organizer(self, source_path: Path, org_type: str):
        """Run the existing organizer script"""
        # Import your existing organizer
        import sys
        sys.path.append(str(self.workspace))
        
        try:
            # Dynamically import and run your organizer
            from organize_files import organize_by_type, organize_by_date
            
            if org_type == "by_type":
                count = organize_by_type(str(source_path), str(self.workspace))
            elif org_type == "by_date":
                count = organize_by_date(str(source_path), str(self.workspace))
            else:
                count = 0
            
            return {
                "status": "success",
                "files_processed": count,
                "source": str(source_path),
                "destination": str(self.workspace),
                "organization_type": org_type,
                "timestamp": datetime.now().isoformat()
            }
        except ImportError:
            # Fallback to simple organization
            return await self._simple_organizer(source_path, org_type)
    
    async def _simple_organizer(self, source_path: Path, org_type: str):
        """Simple organizer for API demo"""
        organized = 0
        file_extensions = {
            '.pdf': 'Documents',
            '.py': 'Development/Python',
            '.txt': 'Documents',
            '.jpg': 'Media/Images',
            '.csv': 'Data'
        }
        
        for file in source_path.iterdir():
            if file.is_file():
                ext = file.suffix.lower()
                if ext in file_extensions:
                    target_dir = self.workspace / file_extensions[ext]
                    target_dir.mkdir(parents=True, exist_ok=True)
                    
                    try:
                        # In real implementation, you'd move files
                        # For now, just count
                        organized += 1
                    except Exception as e:
                        logger.error(f"Failed to organize {file}: {e}")
        
        return {
            "status": "success",
            "files_processed": organized,
            "note": "This is a demo - files were not actually moved"
        }
    
    def create_workflow(self, workflow: WorkflowRequest):
        """Create a new workflow"""
        workflow_id = len(self.workflows) + 1
        workflow_data = {
            "id": workflow_id,
            "name": workflow.name,
            "description": workflow.description,
            "tasks": workflow.tasks,
            "schedule": workflow.schedule,
            "created_at": datetime.now().isoformat(),
            "status": "active"
        }
        
        self.workflows.append(workflow_data)
        self._save_workflows()
        
        self.log_execution("workflow_creation", "success", 
                         f"Created workflow: {workflow.name} (ID: {workflow_id})")
        
        return {"workflow_id": workflow_id, **workflow_data}
    
    def _save_workflows(self):
        """Save workflows to file"""
        with open(self.workflows_file, 'w') as f:
            json.dump(self.workflows, f, indent=2)

# Initialize orchestrator
orchestrator = AgenticOrchestrator()

# API Routes
@app.get("/")
async def root():
    return {
        "message": "Agentic AI API v1.0",
        "status": "running",
        "workspace": str(workspace_path),
        "endpoints": [
            "/docs - API Documentation",
            "/api/health - System Health",
            "/api/organize - File Organization",
            "/api/workflows - Workflow Management",
            "/api/logs - Execution Logs"
        ]
    }

@app.get("/api/health")
async def health_check():
    """Check system health"""
    disk_info = {
        "workspace": str(workspace_path),
        "exists": workspace_path.exists(),
        "total_workflows": len(orchestrator.workflows),
        "total_executions": len(execution_log)
    }
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "system": disk_info
    }

@app.post("/api/organize")
async def organize_files_api(request: FileOrganizeRequest, background_tasks: BackgroundTasks):
    """Organize files endpoint"""
    background_tasks.add_task(orchestrator.organize_files, request)
    
    return {
        "message": "File organization started",
        "task_id": f"org_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "details": {
            "source": request.source_path,
            "type": request.organization_type,
            "started_at": datetime.now().isoformat()
        }
    }

@app.post("/api/workflows")
async def create_workflow_api(workflow: WorkflowRequest):
    """Create a new workflow"""
    return orchestrator.create_workflow(workflow)

@app.get("/api/workflows")
async def list_workflows():
    """List all workflows"""
    return {
        "count": len(orchestrator.workflows),
        "workflows": orchestrator.workflows
    }

@app.get("/api/logs")
async def get_logs(limit: int = 50):
    """Get execution logs"""
    return {
        "total_logs": len(execution_log),
        "logs": execution_log[-limit:] if execution_log else []
    }

@app.post("/api/agents/execute")
async def execute_agent(task: AgentTask):
    """Execute a specific agent task"""
    task_id = f"agent_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    log_entry = orchestrator.log_execution(
        task.agent_type,
        "queued",
        f"Task queued with ID: {task_id}"
    )
    
    # Simulate agent execution
    await asyncio.sleep(1)  # Simulate processing
    
    result = {
        "task_id": task_id,
        "agent_type": task.agent_type,
        "status": "completed",
        "result": f"Agent '{task.agent_type}' executed successfully",
        "parameters": task.parameters,
        "execution_time": "1.0s",  # Simulated
        "timestamp": datetime.now().isoformat()
    }
    
    orchestrator.log_execution(
        task.agent_type,
        "completed",
        f"Task {task_id} completed successfully"
    )
    
    return result

@app.get("/api/workspace/structure")
async def get_workspace_structure():
    """Get current workspace folder structure"""
    def get_tree(path: Path, level=0):
        structure = {}
        for item in path.iterdir():
            if item.is_dir():
                structure[item.name] = get_tree(item, level + 1)
            else:
                structure[item.name] = "file"
        return structure
    
    return {
        "workspace": str(workspace_path),
        "structure": get_tree(workspace_path)
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    logger.info("Agentic AI API starting up...")
    logger.info(f"Workspace: {workspace_path}")
    logger.info(f"Workflows loaded: {len(orchestrator.workflows)}")

# Main entry point
if __name__ == "__main__":
    # Create sample workflows if none exist
    if not orchestrator.workflows:
        sample_workflow = WorkflowRequest(
            name="Daily Desktop Cleanup",
            description="Automatically organize desktop files every day",
            tasks=[
                {"action": "organize_files", "source": "~/Desktop", "type": "by_type"},
                {"action": "backup", "target": "System/Backups/Daily"}
            ],
            schedule="0 9 * * *",  # 9 AM daily
            notify_on_complete=True
        )
        orchestrator.create_workflow(sample_workflow)
    
    # Start the API server
    uvicorn.run(
        "agentic_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )