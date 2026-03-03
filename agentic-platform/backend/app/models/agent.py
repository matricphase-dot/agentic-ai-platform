# backend/app/models/agent.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from app.database import Base

class Agent(Base):
    __tablename__ = "agents"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic info
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=False, index=True)
    icon = Column(String, default="🤖")
    
    # Configuration
    instructions = Column(Text, nullable=False)  # System prompt
    input_template = Column(Text, nullable=False)  # User input template
    
    # Model settings
    model_name = Column(String, default="gpt-3.5-turbo")
    temperature = Column(Float, default=0.7)
    max_tokens = Column(Integer, default=1000)
    
    # Visibility & ownership
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_public = Column(Boolean, default=False)
    is_template = Column(Boolean, default=False)
    
    # Team collaboration (optional)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    visibility = Column(String, default="private")  # private, team, public
    
    # Usage statistics
    execution_count = Column(Integer, default=0)
    average_rating = Column(Float, default=0.0)
    total_likes = Column(Integer, default=0)
    
    # Metadata
    tags = Column(String, nullable=True)  # Comma-separated tags
    version = Column(String, default="1.0.0")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_executed = Column(DateTime, nullable=True)
    
    # Relationships
    owner = relationship("User", back_populates="agents")
    executions = relationship("AgentExecution", back_populates="agent")
    # team = relationship("Team", back_populates="agents")  # Uncomment when Team model exists
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "icon": self.icon,
            "instructions": self.instructions,
            "input_template": self.input_template,
            "model_name": self.model_name,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "user_id": self.user_id,
            "owner_name": self.owner.name if self.owner else None,
            "is_public": self.is_public,
            "is_template": self.is_template,
            "team_id": self.team_id,
            "visibility": self.visibility,
            "execution_count": self.execution_count,
            "average_rating": self.average_rating,
            "total_likes": self.total_likes,
            "tags": self.tags.split(",") if self.tags else [],
            "version": self.version,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_executed": self.last_executed.isoformat() if self.last_executed else None
        }
    
    def to_simple_dict(self):
        """Simplified version for lists"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "icon": self.icon,
            "execution_count": self.execution_count,
            "average_rating": self.average_rating,
            "owner_name": self.owner.name if self.owner else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }