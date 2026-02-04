# backend/app/routers/analytics.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, extract
from datetime import datetime, timedelta, date
from typing import Dict, List, Optional, Any

from app.database import get_db
from app.models.user import User
from app.models.agent import Agent
from app.models.agent_execution import AgentExecution
from app.middleware.auth import get_current_user

router = APIRouter(
    prefix="/api/v1/analytics",
    tags=["analytics"],
    responses={404: {"description": "Not found"}},
)

# Helper functions
def get_date_range(days: int = 30):
    """Get date range for the last N days"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    return start_date, end_date

@router.get("/dashboard")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive dashboard analytics for the current user
    """
    # Total statistics
    total_agents = db.query(Agent).filter(
        Agent.user_id == current_user.id
    ).count()
    
    total_executions = db.query(AgentExecution).filter(
        AgentExecution.user_id == current_user.id
    ).count()
    
    # Today's statistics
    today = datetime.utcnow().date()
    today_executions = db.query(AgentExecution).filter(
        AgentExecution.user_id == current_user.id,
        func.date(AgentExecution.created_at) == today
    ).count()
    
    # This week's statistics
    week_ago = datetime.utcnow() - timedelta(days=7)
    weekly_executions = db.query(AgentExecution).filter(
        AgentExecution.user_id == current_user.id,
        AgentExecution.created_at >= week_ago
    ).count()
    
    # Time saved estimation (assuming 15 minutes saved per execution)
    time_saved_minutes = total_executions * 15
    
    # Weekly trend data
    weekly_data = db.query(
        func.date(AgentExecution.created_at).label('date'),
        func.count(AgentExecution.id).label('count')
    ).filter(
        AgentExecution.user_id == current_user.id,
        AgentExecution.created_at >= week_ago
    ).group_by(func.date(AgentExecution.created_at)).order_by('date').all()
    
    # Format weekly data
    weekly_trend = []
    current_date = week_ago.date()
    for i in range(7):
        date_str = current_date.strftime("%Y-%m-%d")
        count = next((d[1] for d in weekly_data if str(d[0]) == date_str), 0)
        weekly_trend.append({
            "date": date_str,
            "day": current_date.strftime("%a"),
            "count": count
        })
        current_date += timedelta(days=1)
    
    # Top agents by usage
    top_agents = db.query(
        Agent.name,
        Agent.icon,
        func.count(AgentExecution.id).label('execution_count')
    ).join(AgentExecution).filter(
        AgentExecution.user_id == current_user.id
    ).group_by(Agent.id).order_by(desc('execution_count')).limit(5).all()
    
    # Agent categories breakdown
    categories = db.query(
        Agent.category,
        func.count(Agent.id).label('agent_count'),
        func.count(AgentExecution.id).label('execution_count')
    ).outerjoin(AgentExecution).filter(
        Agent.user_id == current_user.id
    ).group_by(Agent.category).all()
    
    # Recent activity
    recent_activity = db.query(AgentExecution).filter(
        AgentExecution.user_id == current_user.id
    ).order_by(desc(AgentExecution.created_at)).limit(10).all()
    
    return {
        "summary": {
            "total_agents": total_agents,
            "total_executions": total_executions,
            "today_executions": today_executions,
            "weekly_executions": weekly_executions,
            "time_saved_minutes": time_saved_minutes,
            "time_saved_hours": round(time_saved_minutes / 60, 1),
            "automation_rate": min(100, (weekly_executions / max(1, total_executions)) * 100)
        },
        "trends": {
            "weekly": weekly_trend,
            "top_agents": [
                {
                    "name": agent[0],
                    "icon": agent[1],
                    "count": agent[2],
                    "percentage": round((agent[2] / max(1, total_executions)) * 100, 1)
                }
                for agent in top_agents
            ]
        },
        "breakdown": {
            "categories": [
                {
                    "name": cat[0],
                    "agent_count": cat[1],
                    "execution_count": cat[2],
                    "percentage": round((cat[2] / max(1, total_executions)) * 100, 1)
                }
                for cat in categories
            ]
        },
        "recent_activity": [
            {
                "id": activity.id,
                "agent_name": activity.agent.name if activity.agent else "Unknown",
                "agent_icon": activity.agent.icon if activity.agent else "🤖",
                "input": activity.input[:50] + "..." if len(activity.input) > 50 else activity.input,
                "execution_time_ms": activity.execution_time_ms,
                "created_at": activity.created_at.isoformat() if activity.created_at else None
            }
            for activity in recent_activity
        ]
    }

@router.get("/usage")
async def get_usage_analytics(
    timeframe: str = Query("7d", description="Timeframe: 7d, 30d, 90d"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed usage analytics for a specific timeframe
    """
    # Parse timeframe
    if timeframe.endswith('d'):
        days = int(timeframe[:-1])
    else:
        days = 7
    
    start_date, end_date = get_date_range(days)
    
    # Get executions per day
    daily_executions = db.query(
        func.date(AgentExecution.created_at).label('date'),
        func.count(AgentExecution.id).label('execution_count'),
        func.avg(AgentExecution.execution_time_ms).label('avg_execution_time')
    ).filter(
        AgentExecution.user_id == current_user.id,
        AgentExecution.created_at >= start_date,
        AgentExecution.created_at <= end_date
    ).group_by(func.date(AgentExecution.created_at)).order_by('date').all()
    
    # Get agent usage distribution
    agent_usage = db.query(
        Agent.name,
        Agent.category,
        func.count(AgentExecution.id).label('execution_count'),
        func.avg(AgentExecution.execution_time_ms).label('avg_execution_time')
    ).join(AgentExecution).filter(
        AgentExecution.user_id == current_user.id,
        AgentExecution.created_at >= start_date,
        AgentExecution.created_at <= end_date
    ).group_by(Agent.id).order_by(desc('execution_count')).all()
    
    # Calculate totals
    total_executions = sum([day[1] for day in daily_executions])
    avg_execution_time = sum([day[2] or 0 for day in daily_executions]) / max(1, len(daily_executions))
    
    return {
        "timeframe": {
            "start_date": start_date.date().isoformat(),
            "end_date": end_date.date().isoformat(),
            "days": days
        },
        "summary": {
            "total_executions": total_executions,
            "executions_per_day": round(total_executions / max(1, days), 1),
            "avg_execution_time_ms": round(avg_execution_time, 0),
            "total_time_saved_minutes": total_executions * 15
        },
        "daily_data": [
            {
                "date": day[0].isoformat() if isinstance(day[0], date) else str(day[0]),
                "execution_count": day[1],
                "avg_execution_time_ms": round(day[2] or 0, 0)
            }
            for day in daily_executions
        ],
        "agent_usage": [
            {
                "name": agent[0],
                "category": agent[1],
                "execution_count": agent[2],
                "avg_execution_time_ms": round(agent[3] or 0, 0),
                "percentage": round((agent[2] / max(1, total_executions)) * 100, 1)
            }
            for agent in agent_usage
        ]
    }

@router.get("/agent/{agent_id}")
async def get_agent_analytics(
    agent_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed analytics for a specific agent
    """
    # Verify agent ownership
    agent = db.query(Agent).filter(
        Agent.id == agent_id,
        Agent.user_id == current_user.id
    ).first()
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Get agent executions
    executions = db.query(AgentExecution).filter(
        AgentExecution.agent_id == agent_id
    ).order_by(desc(AgentExecution.created_at)).all()
    
    # Calculate statistics
    total_executions = len(executions)
    
    if total_executions == 0:
        return {
            "agent": agent.to_dict(),
            "summary": {
                "total_executions": 0,
                "avg_execution_time_ms": 0,
                "success_rate": 0,
                "last_executed": None
            },
            "executions": []
        }
    
    # Calculate averages
    total_execution_time = sum([e.execution_time_ms or 0 for e in executions])
    avg_execution_time = total_execution_time / total_executions
    
    # Success rate (assuming non-error responses are successful)
    successful_executions = sum([1 for e in executions if not e.error_message])
    success_rate = (successful_executions / total_executions) * 100
    
    # Recent executions
    recent_executions = [
        {
            "id": e.id,
            "input": e.input[:100] + "..." if len(e.input) > 100 else e.input,
            "output": e.output[:200] + "..." if e.output and len(e.output) > 200 else e.output,
            "execution_time_ms": e.execution_time_ms,
            "error": bool(e.error_message),
            "created_at": e.created_at.isoformat() if e.created_at else None
        }
        for e in executions[:10]  # Last 10 executions
    ]
    
    # Daily usage for last 7 days
    week_ago = datetime.utcnow() - timedelta(days=7)
    daily_usage = db.query(
        func.date(AgentExecution.created_at).label('date'),
        func.count(AgentExecution.id).label('count')
    ).filter(
        AgentExecution.agent_id == agent_id,
        AgentExecution.created_at >= week_ago
    ).group_by(func.date(AgentExecution.created_at)).order_by('date').all()
    
    return {
        "agent": agent.to_dict(),
        "summary": {
            "total_executions": total_executions,
            "avg_execution_time_ms": round(avg_execution_time, 0),
            "success_rate": round(success_rate, 1),
            "total_execution_time_minutes": round(total_execution_time / 60000, 1),
            "last_executed": agent.last_executed.isoformat() if agent.last_executed else None
        },
        "executions": {
            "recent": recent_executions,
            "daily_usage": [
                {
                    "date": day[0].isoformat() if isinstance(day[0], date) else str(day[0]),
                    "count": day[1]
                }
                for day in daily_usage
            ]
        }
    }

@router.get("/team/{team_id}")
async def get_team_analytics(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get analytics for a team (to be implemented with Team model)
    """
    # TODO: Implement team analytics when Team model is ready
    return {
        "message": "Team analytics endpoint - requires Team model implementation",
        "team_id": team_id
    }

@router.get("/export")
async def export_analytics_data(
    format: str = Query("json", description="Export format: json, csv"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export analytics data in various formats
    """
    # Get all executions for the user
    executions = db.query(AgentExecution).filter(
        AgentExecution.user_id == current_user.id
    ).order_by(desc(AgentExecution.created_at)).all()
    
    if format.lower() == "csv":
        # Generate CSV data
        csv_data = "id,agent_name,input,output,execution_time_ms,created_at,error\n"
        for exec in executions:
            agent_name = exec.agent.name if exec.agent else "Unknown"
            input_clean = (exec.input or "").replace('"', '""').replace("\n", " ")
            output_clean = (exec.output or "").replace('"', '""').replace("\n", " ")[:500]
            csv_data += f'{exec.id},"{agent_name}","{input_clean}","{output_clean}",{exec.execution_time_ms},{exec.created_at},{bool(exec.error_message)}\n'
        
        return {
            "format": "csv",
            "data": csv_data,
            "filename": f"agentic_analytics_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
        }
    
    else:  # JSON format
        return {
            "format": "json",
            "data": [
                {
                    "id": exec.id,
                    "agent_id": exec.agent_id,
                    "agent_name": exec.agent.name if exec.agent else "Unknown",
                    "input": exec.input,
                    "output": exec.output[:1000] if exec.output else None,  # Limit output size
                    "execution_time_ms": exec.execution_time_ms,
                    "error": exec.error_message,
                    "created_at": exec.created_at.isoformat() if exec.created_at else None
                }
                for exec in executions
            ],
            "total_records": len(executions),
            "exported_at": datetime.utcnow().isoformat()
        }