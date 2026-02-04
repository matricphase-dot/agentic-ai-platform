# backend/app/models/user.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    
    # Profile fields
    company = Column(String, nullable=True)
    role = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    
    # Usage tracking
    total_executions = Column(Integer, default=0)
    total_agents = Column(Integer, default=0)
    last_active = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    agents = relationship("Agent", back_populates="owner")
    agent_executions = relationship("AgentExecution", back_populates="user")
    
    # Team relationships (will be added when Team model is created)
    # owned_teams = relationship("Team", back_populates="owner")
    # teams = relationship("Team", secondary="team_members", back_populates="members")
    
    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "company": self.company,
            "role": self.role,
            "avatar_url": self.avatar_url,
            "bio": self.bio,
            "is_active": self.is_active,
            "is_admin": self.is_admin,
            "total_executions": self.total_executions,
            "total_agents": self.total_agents,
            "last_active": self.last_active.isoformat() if self.last_active else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    def to_public_dict(self):
        """Public representation without sensitive info"""
        return {
            "id": self.id,
            "name": self.name,
            "company": self.company,
            "role": self.role,
            "avatar_url": self.avatar_url,
            "bio": self.bio,
            "total_agents": self.total_agents,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }