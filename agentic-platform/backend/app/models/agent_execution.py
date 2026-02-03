from sqlalchemy import Column, Integer, String, DateTime, Text, Float, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class AgentExecution(Base):
    __tablename__ = "agent_executions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    agent_id = Column(Integer, ForeignKey("agents.id"))
    input = Column(Text)
    output = Column(Text)
    status = Column(String, default="pending")  # pending, success, error
    execution_time = Column(Float)  # in seconds
    cost = Column(Float, default=0.0)  # in USD
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    # user = relationship("User", back_populates="executions")
    # agent = relationship("Agent", back_populates="executions")