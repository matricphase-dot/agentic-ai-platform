# D:\AGENTIC_AI\core\database.py
import os
from sqlalchemy import create_engine, Column, String, Integer, DateTime, Boolean, JSON, Text, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import uuid
from datetime import datetime

# Get database URL from environment or use SQLite for now
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./agentic.db")

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency for database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    plan = Column(String(50), default="free")
    api_key = Column(String(255), unique=True, index=True)
    credits = Column(Integer, default=1000)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    settings = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    agents = relationship("Agent", back_populates="user")
    tasks = relationship("Task", back_populates="user")

class Agent(Base):
    __tablename__ = "agents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    agent_type = Column(String(100), nullable=False)  # file_organizer, email_assistant, etc.
    description = Column(Text)
    config = Column(JSON, default={})
    status = Column(String(50), default="active")  # active, disabled, training
    version = Column(Integer, default=1)
    performance_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="agents")
    tasks = relationship("Task", back_populates="agent")

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    agent_id = Column(String, ForeignKey("agents.id"))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    input_data = Column(JSON, default={})
    output_data = Column(JSON, default={})
    status = Column(String(50), default="pending")  # pending, processing, completed, failed
    bounty = Column(Integer, default=0)
    cost = Column(Integer, default=0)  # Credits spent
    error_message = Column(Text)
    execution_time = Column(Float)  # Seconds
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="tasks")
    agent = relationship("Agent", back_populates="tasks")

class AgentSkill(Base):
    __tablename__ = "agent_skills"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_id = Column(String, ForeignKey("agents.id"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    skill_level = Column(Float, default=1.0)  # 0-1 scale
    examples = Column(JSON, default=[])
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class TaskMarketplace(Base):
    __tablename__ = "task_marketplace"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    creator_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, default=[])
    bounty = Column(Integer, nullable=False)
    status = Column(String(50), default="open")  # open, assigned, completed
    assigned_to = Column(String, ForeignKey("agents.id"))
    result = Column(JSON)
    deadline = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create all tables
def init_db():
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")