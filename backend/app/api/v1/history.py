from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.agent import AgentExecution
from app.api.v1.auth import get_current_user

router = APIRouter()

@router.get("/history")
def get_execution_history(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get execution history for current user"""
    executions = db.query(AgentExecution).filter(
        AgentExecution.user_id == current_user.id
    ).order_by(AgentExecution.created_at.desc()).offset(skip).limit(limit).all()
    
    return executions

@router.get("/history/{execution_id}")
def get_execution_details(
    execution_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get details of a specific execution"""
    execution = db.query(AgentExecution).filter(
        AgentExecution.id == execution_id,
        AgentExecution.user_id == current_user.id
    ).first()
    
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    return execution