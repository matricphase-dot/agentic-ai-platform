import sys
import os
import hashlib

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./agentic_ai.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Define User model locally
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

def get_password_hash(password: str) -> str:
    """Simple SHA256 hash"""
    return hashlib.sha256(password.encode()).hexdigest()

def main():
    print("Setting up database...")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")
    
    # Create session
    db = SessionLocal()
    
    try:
        # Check if admin exists
        existing = db.query(User).filter(User.email == "admin@agenticai.com").first()
        if existing:
            print("Admin already exists:")
            print(f"  Email: {existing.email}")
            print(f"  Name: {existing.name}")
            return
        
        # Create admin user
        hashed_password = get_password_hash("Admin123!")
        admin = User(
            email="admin@agenticai.com",
            hashed_password=hashed_password,
            name="Admin User",
            is_active=True
        )
        
        db.add(admin)
        db.commit()
        
        print("✅ Admin user created successfully!")
        print(f"  Email: admin@agenticai.com")
        print(f"  Password: Admin123!")
        print(f"  Hashed password: {hashed_password[:20]}...")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()