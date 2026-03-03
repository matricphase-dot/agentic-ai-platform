# database.py - PostgreSQL Models for Agentic AI Platform
from sqlalchemy import create_engine, Column, Integer, String, JSON, DateTime, Boolean, ForeignKey, Text, Float, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.sql import text
from datetime import datetime
import os
from dotenv import load_dotenv
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Database connection - Use SQLite for now
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./agentic.db")

logger.info(f"Connecting to database: {DATABASE_URL[:30]}...")

try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300)
    logger.info("✅ Database engine created")
except Exception as e:
    logger.error(f"❌ Database engine creation failed: {e}")
    # Create SQLite fallback
    DATABASE_URL = "sqlite:///./agentic.db"
    engine = create_engine(DATABASE_URL)
    logger.warning(f"Falling back to SQLite: {DATABASE_URL}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Association table for many-to-many relationship between teams and agents
team_agents = Table('team_agents', Base.metadata,
    Column('team_id', Integer, ForeignKey('teams.id')),
    Column('agent_id', Integer, ForeignKey('agents.id'))
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    company = Column(String)
    plan = Column(String, default='free')  # free, pro, business, enterprise
    api_key = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    credits = Column(Float, default=0.0)
    monthly_spend_limit = Column(Float, default=100.0)
    current_month_spend = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime)
    
    # Relationships
    agents = relationship("Agent", back_populates="owner", cascade="all, delete-orphan")
    teams = relationship("Team", back_populates="owner", cascade="all, delete-orphan")
    collaborations = relationship("Collaboration", back_populates="owner", cascade="all, delete-orphan")
    api_logs = relationship("APILog", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, plan={self.plan})>"

class Agent(Base):
    __tablename__ = "agents"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text)
    agent_type = Column(String, nullable=False)  # researcher, writer, coder, analyst, custom
    system_prompt = Column(Text)
    model = Column(String, default='gpt-3.5-turbo')  # gpt-3.5-turbo, gpt-4, claude-3, etc.
    temperature = Column(Float, default=0.7)
    max_tokens = Column(Integer, default=1000)
    config = Column(JSON, default={})
    is_public = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    usage_count = Column(Integer, default=0)
    total_tokens_used = Column(Integer, default=0)
    total_cost = Column(Float, default=0.0)
    avg_response_time = Column(Float, default=0.0)
    success_rate = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_used_at = Column(DateTime)
    
    # Foreign keys
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    owner = relationship("User", back_populates="agents")
    teams = relationship("Team", secondary=team_agents, back_populates="agents")
    
    def __repr__(self):
        return f"<Agent(id={self.id}, name={self.name}, type={self.agent_type})>"

class Team(Base):
    __tablename__ = "teams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text)
    workflow_type = Column(String, default='sequential')  # sequential, parallel, hierarchical, review
    workflow_config = Column(JSON, default={})
    is_active = Column(Boolean, default=True)
    usage_count = Column(Integer, default=0)
    total_tasks = Column(Integer, default=0)
    successful_tasks = Column(Integer, default=0)
    avg_completion_time = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    owner = relationship("User", back_populates="teams")
    agents = relationship("Agent", secondary=team_agents, back_populates="teams")
    collaborations = relationship("Collaboration", back_populates="team", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Team(id={self.id}, name={self.name}, agents={len(self.agents)})>"

class Collaboration(Base):
    __tablename__ = "collaborations"
    
    id = Column(Integer, primary_key=True, index=True)
    task = Column(Text, nullable=False)
    workflow_type = Column(String, default='sequential')
    steps = Column(JSON, default=[])  # List of step execution results
    result = Column(Text)
    status = Column(String, default='pending')  # pending, running, completed, failed, cancelled
    error_message = Column(Text)
    total_tokens_used = Column(Integer, default=0)
    total_cost = Column(Float, default=0.0)
    processing_time_ms = Column(Integer, default=0)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Foreign keys
    team_id = Column(Integer, ForeignKey("teams.id"))
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    team = relationship("Team", back_populates="collaborations")
    owner = relationship("User", back_populates="collaborations")
    
    def __repr__(self):
        return f"<Collaboration(id={self.id}, task={self.task[:50]}..., status={self.status})>"

class APILog(Base):
    __tablename__ = "api_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    endpoint = Column(String, nullable=False)
    method = Column(String, nullable=False)
    status_code = Column(Integer)
    response_time_ms = Column(Integer)
    request_data = Column(JSON)
    response_data = Column(JSON)
    tokens_used = Column(Integer, default=0)
    cost = Column(Float, default=0.0)
    ip_address = Column(String)
    user_agent = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="api_logs")
    
    def __repr__(self):
        return f"<APILog(id={self.id}, endpoint={self.endpoint}, status={self.status_code})>"

# Create all tables
def create_tables():
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created successfully")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to create tables: {e}")
        return False

# Get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Test connection (FIXED VERSION)
def test_connection():
    try:
        with engine.connect() as conn:
            # FIXED: Use text() for SQL query
            result = conn.execute(text("SELECT 1"))
            result.fetchone()
            logger.info("✅ Database connection successful")
            return True
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing database connection...")
    if test_connection():
        print("✅ Connection successful")
        create_tables()
    else:
        print("❌ Connection failed")
