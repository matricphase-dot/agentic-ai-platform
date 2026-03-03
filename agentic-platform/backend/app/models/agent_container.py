# backend/app/models/agent_container.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Text, Boolean, Float
from sqlalchemy.orm import relationship
from app.database import Base

class AgentContainer(Base):
    __tablename__ = "agent_containers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    container_id = Column(String, unique=True, index=True)  # Docker container ID
    
    # Container configuration
    image = Column(String, default="python:3.11-slim")
    command = Column(String, default="python /app/agent_runner.py")
    environment = Column(JSON)  # Environment variables
    volumes = Column(JSON)      # Volume mounts
    ports = Column(JSON)        # Port mappings
    
    # Resource limits
    memory_limit_mb = Column(Integer, default=512)
    cpu_limit = Column(Float, default=0.5)  # CPU cores
    gpu_enabled = Column(Boolean, default=False)
    
    # Agent configuration
    model_name = Column(String, default="gpt-3.5-turbo")
    temperature = Column(Float, default=0.7)
    max_tokens = Column(Integer, default=1000)
    system_prompt = Column(Text)
    
    # Status
    status = Column(String, default="stopped")  # created, running, stopped, error
    last_started = Column(DateTime)
    last_stopped = Column(DateTime)
    health_status = Column(String, default="unknown")
    
    # Relationships
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="agent_containers")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "container_id": self.container_id,
            "image": self.image,
            "status": self.status,
            "health_status": self.health_status,
            "model_name": self.model_name,
            "memory_limit_mb": self.memory_limit_mb,
            "cpu_limit": self.cpu_limit,
            "last_started": self.last_started.isoformat() if self.last_started else None,
            "last_stopped": self.last_stopped.isoformat() if self.last_stopped else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "user_id": self.user_id
        }