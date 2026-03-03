# backend/database_fixed.py - Fixed SQLAlchemy 2.0 connection
from sqlalchemy import create_engine, Column, String, Integer, DateTime, JSON, Text, Boolean, ForeignKey, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Use SQLite for now (simple and works)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./agentic.db")

# SQLite needs check_same_thread=False
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ===== SIMPLIFIED DATABASE MODELS =====

class Agent(Base):
    __tablename__ = "agents"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    type = Column(String)  # researcher, writer, coder, analyst
    config = Column(JSON)  # Store agent configuration
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

class Team(Base):
    __tablename__ = "teams"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    agent_ids = Column(JSON)  # Store array of agent IDs
    workflow_config = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create all tables
def init_db():
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")
    return True

# Test database connection
def test_connection():
    try:
        with engine.connect() as conn:
            if DATABASE_URL.startswith("sqlite"):
                # SQLite doesn't have version()
                conn.execute(text("SELECT 1"))
                print("✅ SQLite database connected")
            else:
                result = conn.execute(text("SELECT version()"))
                print(f"✅ Database connected: {result.fetchone()[0]}")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    if test_connection():
        init_db()
