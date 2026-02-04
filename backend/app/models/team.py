# backend/app/models/team.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table, Text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

# Association table for team members
team_members = Table(
    'team_members',
    Base.metadata,
    Column('team_id', Integer, ForeignKey('teams.id'), primary_key=True),
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('role', String, default='member'),  # member, admin, owner
    Column('joined_at', DateTime, default=datetime.utcnow)
)

class Team(Base):
    __tablename__ = "teams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    logo_url = Column(String, nullable=True)
    
    # Team settings
    visibility = Column(String, default='private')  # private, public, hidden
    allow_join_requests = Column(Boolean, default=True)
    
    # Ownership
    owner_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Statistics
    agent_count = Column(Integer, default=0)
    execution_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="owned_teams")
    members = relationship("User", secondary=team_members, back_populates="teams")
    agents = relationship("Agent", back_populates="team")
    invitations = relationship("TeamInvitation", back_populates="team")
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "logo_url": self.logo_url,
            "visibility": self.visibility,
            "allow_join_requests": self.allow_join_requests,
            "owner_id": self.owner_id,
            "owner_name": self.owner.name if self.owner else None,
            "agent_count": self.agent_count,
            "execution_count": self.execution_count,
            "member_count": len(self.members) if self.members else 0,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "members": [
                {
                    "id": member.id,
                    "name": member.name,
                    "email": member.email,
                    "avatar_url": member.avatar_url,
                    "role": self.get_member_role(member.id)
                }
                for member in self.members
            ] if self.members else []
        }
    
    def get_member_role(self, user_id: int):
        """Get the role of a specific member"""
        # This would require querying the team_members table
        # For now, return a default or implement proper logic
        return "member"
    
    def is_member(self, user_id: int):
        """Check if a user is a member of this team"""
        return any(member.id == user_id for member in self.members)
    
    def is_owner_or_admin(self, user_id: int):
        """Check if a user is owner or admin"""
        return user_id == self.owner_id or self.get_member_role(user_id) in ['owner', 'admin']

class TeamInvitation(Base):
    __tablename__ = "team_invitations"
    
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey('teams.id'), nullable=False)
    email = Column(String, nullable=False)
    token = Column(String, unique=True, nullable=False)
    role = Column(String, default='member')
    
    # Invitation status
    status = Column(String, default='pending')  # pending, accepted, expired, revoked
    invited_by = Column(Integer, ForeignKey('users.id'))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    accepted_at = Column(DateTime, nullable=True)
    
    # Relationships
    team = relationship("Team", back_populates="invitations")
    inviter = relationship("User", foreign_keys=[invited_by])
    
    def to_dict(self):
        return {
            "id": self.id,
            "team_id": self.team_id,
            "team_name": self.team.name if self.team else None,
            "email": self.email,
            "role": self.role,
            "status": self.status,
            "invited_by": self.invited_by,
            "inviter_name": self.inviter.name if self.inviter else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "accepted_at": self.accepted_at.isoformat() if self.accepted_at else None,
            "is_expired": datetime.utcnow() > self.expires_at
        }