# backend/app/routers/agent_containers.py
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.database import get_db
from app.models.user import User
from app.models.agent_container import AgentContainer
from app.services.agent_container import AgentContainerService
from app.middleware.auth import get_current_user
from app.schemas.agent_container import (
    AgentContainerCreate, AgentContainerUpdate, 
    AgentContainerResponse, AgentContainerDeploy
)

router = APIRouter(
    prefix="/api/v1/agent-containers",
    tags=["agent-containers"],
    responses={404: {"description": "Not found"}},
)

agent_service = AgentContainerService()

@router.get("/", response_model=List[AgentContainerResponse])
async def get_agent_containers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get all agent containers for current user"""
    containers = db.query(AgentContainer).filter(
        AgentContainer.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return containers

@router.post("/", response_model=AgentContainerResponse, status_code=status.HTTP_201_CREATED)
async def create_agent_container(
    container_data: AgentContainerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new agent container configuration"""
    
    # Create container in database
    container = AgentContainer(
        **container_data.dict(exclude_unset=True),
        user_id=current_user.id,
        status="created"
    )
    
    db.add(container)
    db.commit()
    db.refresh(container)
    
    return container

@router.post("/{container_id}/deploy", response_model=AgentContainerResponse)
async def deploy_agent_container(
    container_id: int,
    deploy_data: AgentContainerDeploy,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deploy an agent container (create Docker container)"""
    
    container = db.query(AgentContainer).filter(
        AgentContainer.id == container_id,
        AgentContainer.user_id == current_user.id
    ).first()
    
    if not container:
        raise HTTPException(status_code=404, detail="Agent container not found")
    
    if container.status == "running":
        raise HTTPException(status_code=400, detail="Container is already running")
    
    # Prepare configuration for Docker
    agent_config = {
        "name": container.name,
        "user_id": current_user.id,
        "model": container.model_name,
        "temperature": container.temperature,
        "max_tokens": container.max_tokens,
        "openai_api_key": deploy_data.openai_api_key,
        "code": deploy_data.custom_code if deploy_data.custom_code else ""
    }
    
    # Create Docker container
    try:
        docker_container_id = agent_service.create_agent_container(agent_config)
        
        # Update database
        container.container_id = docker_container_id
        container.status = "deployed"
        container.environment = json.dumps({
            "OPENAI_API_KEY": deploy_data.openai_api_key,
            "AGENT_ID": docker_container_id,
            "MODEL": container.model_name,
            "TEMPERATURE": str(container.temperature),
            "MAX_TOKENS": str(container.max_tokens)
        })
        
        db.commit()
        db.refresh(container)
        
        # Start container in background
        background_tasks.add_task(
            agent_service.start_agent,
            docker_container_id
        )
        
        return container
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to deploy container: {str(e)}")

@router.post("/{container_id}/start", response_model=AgentContainerResponse)
async def start_agent_container(
    container_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a deployed agent container"""
    
    container = db.query(AgentContainer).filter(
        AgentContainer.id == container_id,
        AgentContainer.user_id == current_user.id
    ).first()
    
    if not container:
        raise HTTPException(status_code=404, detail="Agent container not found")
    
    if not container.container_id:
        raise HTTPException(status_code=400, detail="Container not deployed")
    
    if container.status == "running":
        raise HTTPException(status_code=400, detail="Container is already running")
    
    # Start container
    success = agent_service.start_agent(container.container_id)
    
    if success:
        container.status = "running"
        container.last_started = datetime.utcnow()
        db.commit()
        db.refresh(container)
        
        return container
    else:
        raise HTTPException(status_code=500, detail="Failed to start container")

@router.post("/{container_id}/stop", response_model=AgentContainerResponse)
async def stop_agent_container(
    container_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Stop a running agent container"""
    
    container = db.query(AgentContainer).filter(
        AgentContainer.id == container_id,
        AgentContainer.user_id == current_user.id
    ).first()
    
    if not container:
        raise HTTPException(status_code=404, detail="Agent container not found")
    
    if container.status != "running":
        raise HTTPException(status_code=400, detail="Container is not running")
    
    # Stop container
    success = agent_service.stop_agent(container.container_id)
    
    if success:
        container.status = "stopped"
        container.last_stopped = datetime.utcnow()
        db.commit()
        db.refresh(container)
        
        return container
    else:
        raise HTTPException(status_code=500, detail="Failed to stop container")

@router.get("/{container_id}/status")
async def get_container_status(
    container_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get real-time status of agent container"""
    
    container = db.query(AgentContainer).filter(
        AgentContainer.id == container_id,
        AgentContainer.user_id == current_user.id
    ).first()
    
    if not container:
        raise HTTPException(status_code=404, detail="Agent container not found")
    
    if not container.container_id:
        return {"status": "not_deployed"}
    
    # Get status from Docker
    status_info = agent_service.get_agent_status(container.container_id)
    
    # Update database if status changed
    if status_info.get("status") != container.status:
        container.status = status_info.get("status", container.status)
        db.commit()
    
    return {
        "container_id": container.container_id,
        "status": status_info.get("status"),
        "details": status_info
    }

@router.delete("/{container_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent_container(
    container_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an agent container"""
    
    container = db.query(AgentContainer).filter(
        AgentContainer.id == container_id,
        AgentContainer.user_id == current_user.id
    ).first()
    
    if not container:
        raise HTTPException(status_code=404, detail="Agent container not found")
    
    # Stop container if running
    if container.status == "running" and container.container_id:
        agent_service.stop_agent(container.container_id)
    
    # Delete from database
    db.delete(container)
    db.commit()