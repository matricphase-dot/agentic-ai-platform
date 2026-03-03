# backend/app/routers/teams.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
import secrets
from datetime import datetime, timedelta

from app.database import get_db
from app.models.user import User
from app.models.team import Team, TeamInvitation, team_members
from app.models.agent import Agent
from app.middleware.auth import get_current_user

router = APIRouter(
    prefix="/api/v1/teams",
    tags=["teams"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[dict])
async def get_teams(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all teams for the current user"""
    # Get teams user owns or is a member of
    teams = db.query(Team).filter(
        or_(
            Team.owner_id == current_user.id,
            Team.members.any(id=current_user.id)
        )
    ).all()
    
    return [team.to_dict() for team in teams]

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_team(
    name: str,
    description: Optional[str] = None,
    visibility: str = "private",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new team"""
    
    # Check if team with same name exists for this user
    existing_team = db.query(Team).filter(
        Team.owner_id == current_user.id,
        Team.name == name
    ).first()
    
    if existing_team:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a team with this name"
        )
    
    # Create team
    team = Team(
        name=name,
        description=description,
        visibility=visibility,
        owner_id=current_user.id
    )
    
    # Add creator as first member
    team.members.append(current_user)
    
    db.add(team)
    db.commit()
    db.refresh(team)
    
    return {
        "message": "Team created successfully",
        "team": team.to_dict()
    }

@router.get("/{team_id}")
async def get_team(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get team details"""
    team = db.query(Team).filter(Team.id == team_id).first()
    
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Check permissions
    if not team.is_member(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this team"
        )
    
    return team.to_dict()

@router.put("/{team_id}")
async def update_team(
    team_id: int,
    name: Optional[str] = None,
    description: Optional[str] = None,
    visibility: Optional[str] = None,
    allow_join_requests: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update team settings"""
    team = db.query(Team).filter(Team.id == team_id).first()
    
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Check if user is owner
    if team.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team owner can update team settings"
        )
    
    # Update fields if provided
    if name is not None:
        team.name = name
    if description is not None:
        team.description = description
    if visibility is not None:
        team.visibility = visibility
    if allow_join_requests is not None:
        team.allow_join_requests = allow_join_requests
    
    team.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(team)
    
    return {
        "message": "Team updated successfully",
        "team": team.to_dict()
    }

@router.delete("/{team_id}")
async def delete_team(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a team"""
    team = db.query(Team).filter(Team.id == team_id).first()
    
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Check if user is owner
    if team.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team owner can delete the team"
        )
    
    db.delete(team)
    db.commit()
    
    return {"message": "Team deleted successfully"}

@router.post("/{team_id}/invite")
async def invite_member(
    team_id: int,
    email: str,
    role: str = "member",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Invite a user to join the team"""
    team = db.query(Team).filter(Team.id == team_id).first()
    
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Check permissions
    if not team.is_owner_or_admin(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to invite members"
        )
    
    # Check if user exists
    invited_user = db.query(User).filter(User.email == email).first()
    
    # Create invitation token
    token = secrets.token_urlsafe(32)
    
    invitation = TeamInvitation(
        team_id=team_id,
        email=email,
        token=token,
        role=role,
        invited_by=current_user.id,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    
    db.add(invitation)
    db.commit()
    db.refresh(invitation)
    
    # TODO: Send email invitation
    
    return {
        "message": f"Invitation sent to {email}",
        "invitation": invitation.to_dict()
    }

@router.post("/invitations/{token}/accept")
async def accept_invitation(
    token: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Accept a team invitation"""
    invitation = db.query(TeamInvitation).filter(
        TeamInvitation.token == token,
        TeamInvitation.status == "pending"
    ).first()
    
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found or already used"
        )
    
    # Check if invitation is expired
    if datetime.utcnow() > invitation.expires_at:
        invitation.status = "expired"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation has expired"
        )
    
    # Check if invitation is for current user's email
    if invitation.email.lower() != current_user.email.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This invitation is not for your email"
        )
    
    # Get team
    team = db.query(Team).filter(Team.id == invitation.team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Add user to team
    if current_user not in team.members:
        team.members.append(current_user)
    
    # Update invitation
    invitation.status = "accepted"
    invitation.accepted_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "message": f"You have joined {team.name}",
        "team": team.to_dict()
    }

@router.get("/{team_id}/agents")
async def get_team_agents(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all agents for a team"""
    team = db.query(Team).filter(Team.id == team_id).first()
    
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Check if user is member
    if not team.is_member(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this team"
        )
    
    # Get team agents
    agents = db.query(Agent).filter(
        Agent.team_id == team_id,
        Agent.visibility.in_(["team", "public"])
    ).all()
    
    return [agent.to_dict() for agent in agents]

@router.post("/{team_id}/agents/{agent_id}/share")
async def share_agent_with_team(
    team_id: int,
    agent_id: int,
    visibility: str = "team",  # team or public
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Share an agent with a team"""
    team = db.query(Team).filter(Team.id == team_id).first()
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    
    if not team or not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team or agent not found"
        )
    
    # Check if user owns the agent
    if agent.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't own this agent"
        )
    
    # Check if user is team member
    if not team.is_member(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this team"
        )
    
    # Share agent with team
    agent.team_id = team_id
    agent.visibility = visibility
    
    db.commit()
    db.refresh(agent)
    
    return {
        "message": f"Agent '{agent.name}' shared with team '{team.name}'",
        "agent": agent.to_dict()
    }