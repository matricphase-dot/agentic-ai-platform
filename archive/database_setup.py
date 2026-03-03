# database_setup.py - Complete Database System
import os
import json
from datetime import datetime
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
from sqlalchemy.sql import func
import bcrypt
import jwt
from pydantic import BaseModel, EmailStr
import secrets

# Database setup
Base = declarative_base()
engine = create_engine('sqlite:///agentic_database.db', echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Pydantic Models for API
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class WorkflowCreate(BaseModel):
    name: str
    description: str
    tasks: List[dict]
    schedule: Optional[str] = None
    is_active: bool = True

class ExecutionLogCreate(BaseModel):
    task_type: str
    status: str
    details: str
    user_id: Optional[int] = None

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    workflows = relationship("Workflow", back_populates="owner")
    executions = relationship("ExecutionLog", back_populates="user")
    api_keys = relationship("APIKey", back_populates="user")
    
    def verify_password(self, password: str) -> bool:
        return bcrypt.checkpw(password.encode('utf-8'), self.hashed_password.encode('utf-8'))
    
    def generate_token(self, secret_key: str, expires_delta: int = 3600) -> str:
        payload = {
            "sub": self.username,
            "user_id": self.id,
            "exp": datetime.utcnow().timestamp() + expires_delta
        }
        return jwt.encode(payload, secret_key, algorithm="HS256")

class Workflow(Base):
    __tablename__ = "workflows"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    tasks = Column(JSON, nullable=False)  # List of task definitions
    schedule = Column(String(50))  # Cron expression
    is_active = Column(Boolean, default=True)
    last_executed = Column(DateTime, nullable=True)
    next_execution = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    owner = relationship("User", back_populates="workflows")
    executions = relationship("ExecutionLog", back_populates="workflow")

class ExecutionLog(Base):
    __tablename__ = "execution_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    task_type = Column(String(50), nullable=False)
    status = Column(String(20), nullable=False)  # success, failed, running, queued
    details = Column(Text)
    duration = Column(Integer)  # Duration in milliseconds
    result_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="executions")
    workflow = relationship("Workflow", back_populates="executions")

class APIKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(50))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used = Column(DateTime, nullable=True)
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    user = relationship("User", back_populates="api_keys")

class Agent(Base):
    __tablename__ = "agents"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    description = Column(Text)
    agent_type = Column(String(50), nullable=False)  # organizer, analyzer, generator, etc.
    config = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    version = Column(String(20), default="1.0.0")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Statistics
    total_executions = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    failure_count = Column(Integer, default=0)
    avg_duration = Column(Integer, default=0)  # milliseconds

class FileOrganizationRule(Base):
    __tablename__ = "file_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    pattern = Column(String(100), nullable=False)  # regex pattern or extension
    target_folder = Column(String(200), nullable=False)
    priority = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    user = relationship("User")

# Database Manager
class DatabaseManager:
    def __init__(self):
        self.engine = engine
        self.Base = Base
        self.create_tables()
        self.SessionLocal = SessionLocal
        self.secret_key = os.environ.get("SECRET_KEY", secrets.token_hex(32))
    
    def create_tables(self):
        """Create all database tables"""
        Base.metadata.create_all(bind=self.engine)
        print("✅ Database tables created successfully")
    
    def get_db(self):
        """Get database session"""
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    
    def create_admin_user(self):
        """Create initial admin user"""
        db = SessionLocal()
        try:
            # Check if admin exists
            admin = db.query(User).filter(User.username == "admin").first()
            if not admin:
                # Create admin user
                password = "admin123"  # Change this in production!
                hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
                
                admin = User(
                    username="admin",
                    email="admin@agentic.ai",
                    hashed_password=hashed.decode('utf-8'),
                    full_name="System Administrator",
                    is_admin=True
                )
                db.add(admin)
                db.commit()
                print("✅ Admin user created")
                
                # Create default file organization rules
                self.create_default_rules(db, admin.id)
            else:
                print("⚠️  Admin user already exists")
        finally:
            db.close()
    
    def create_default_rules(self, db: Session, user_id: int):
        """Create default file organization rules"""
        default_rules = [
            {
                "name": "PDF Documents",
                "pattern": ".*\\.pdf$",
                "target_folder": "Documents/Work/Reports",
                "priority": 1
            },
            {
                "name": "Python Scripts",
                "pattern": ".*\\.py$",
                "target_folder": "Development/Python/Scripts",
                "priority": 1
            },
            {
                "name": "Images (JPG/PNG)",
                "pattern": ".*\\.(jpg|jpeg|png|gif)$",
                "target_folder": "Media/Images",
                "priority": 1
            },
            {
                "name": "Word Documents",
                "pattern": ".*\\.(doc|docx)$",
                "target_folder": "Documents/Work/Projects",
                "priority": 1
            },
            {
                "name": "Excel Files",
                "pattern": ".*\\.(xls|xlsx|csv)$",
                "target_folder": "Documents/Work/Data",
                "priority": 1
            }
        ]
        
        for rule_data in default_rules:
            rule = FileOrganizationRule(
                name=rule_data["name"],
                pattern=rule_data["pattern"],
                target_folder=rule_data["target_folder"],
                priority=rule_data["priority"],
                user_id=user_id
            )
            db.add(rule)
        
        db.commit()
        print("✅ Default file organization rules created")
    
    def create_sample_data(self):
        """Create sample data for testing"""
        db = SessionLocal()
        try:
            # Create a test user
            password = bcrypt.hashpw("test123".encode('utf-8'), bcrypt.gensalt())
            test_user = User(
                username="testuser",
                email="test@agentic.ai",
                hashed_password=password.decode('utf-8'),
                full_name="Test User"
            )
            db.add(test_user)
            db.commit()
            
            # Create sample workflow
            workflow = Workflow(
                name="Daily Desktop Cleanup",
                description="Automatically organize desktop files every day",
                tasks=[
                    {
                        "action": "organize_files",
                        "source": "~/Desktop",
                        "type": "by_type",
                        "enabled": True
                    },
                    {
                        "action": "backup_important",
                        "target": "System/Backups/Daily",
                        "enabled": True
                    }
                ],
                schedule="0 9 * * *",  # 9 AM daily
                is_active=True,
                owner_id=test_user.id
            )
            db.add(workflow)
            
            # Create API key for test user
            api_key = APIKey(
                key=secrets.token_hex(32),
                name="Test API Key",
                user_id=test_user.id
            )
            db.add(api_key)
            
            # Create sample agent
            organizer_agent = Agent(
                name="File Organizer",
                description="Organizes files based on rules and patterns",
                agent_type="organizer",
                config={
                    "batch_size": 100,
                    "conflict_resolution": "rename",
                    "log_level": "info"
                }
            )
            db.add(organizer_agent)
            
            db.commit()
            print("✅ Sample data created successfully")
            
        finally:
            db.close()

# Auth Manager
class AuthManager:
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager
        self.secret_key = db_manager.secret_key
    
    def authenticate_user(self, db: Session, username: str, password: str):
        """Authenticate user and return user object"""
        user = db.query(User).filter(User.username == username).first()
        if not user or not user.verify_password(password):
            return None
        return user
    
    def create_user(self, db: Session, user_data: UserCreate):
        """Create new user"""
        # Check if user exists
        existing = db.query(User).filter(
            (User.username == user_data.username) | 
            (User.email == user_data.email)
        ).first()
        
        if existing:
            return None
        
        # Hash password
        hashed = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt())
        
        # Create user
        user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed.decode('utf-8'),
            full_name=user_data.full_name
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    def verify_token(self, token: str):
        """Verify JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"])
            return payload
        except jwt.PyJWTError:
            return None
    
    def generate_api_key(self, db: Session, user_id: int, name: str = "Default"):
        """Generate API key for user"""
        api_key = APIKey(
            key=secrets.token_hex(32),
            name=name,
            user_id=user_id
        )
        db.add(api_key)
        db.commit()
        return api_key.key

# Initialize database
def initialize_database():
    """Initialize database with required data"""
    db_manager = DatabaseManager()
    
    # Create admin user
    db_manager.create_admin_user()
    
    # Create sample data (optional)
    create_sample = input("Create sample data for testing? (y/n): ").lower()
    if create_sample == 'y':
        db_manager.create_sample_data()
    
    return db_manager

# Export stats
def export_database_stats():
    """Export database statistics"""
    db = SessionLocal()
    try:
        stats = {
            "users": db.query(User).count(),
            "workflows": db.query(Workflow).count(),
            "executions": db.query(ExecutionLog).count(),
            "agents": db.query(Agent).count(),
            "api_keys": db.query(APIKey).filter(APIKey.is_active == True).count(),
            "file_rules": db.query(FileOrganizationRule).count()
        }
        
        # Save to file
        with open("database_stats.json", "w") as f:
            json.dump(stats, f, indent=2)
        
        print("📊 Database Statistics:")
        for key, value in stats.items():
            print(f"  {key}: {value}")
            
        return stats
    finally:
        db.close()

# Main execution
if __name__ == "__main__":
    print("\n" + "="*60)
    print("🤖 AGENTIC AI DATABASE SETUP")
    print("="*60)
    
    # Initialize database
    db_manager = initialize_database()
    
    # Export stats
    export_database_stats()
    
    print("\n✅ Database setup completed successfully!")
    print("\n📁 Files created:")
    print("  • agentic_database.db - SQLite database")
    print("  • database_stats.json - Statistics report")
    
    print("\n🔐 Default credentials:")
    print("  • Username: admin")
    print("  • Password: admin123")
    
    print("\n🚀 Next steps:")
    print("  1. Run: python enhanced_api.py")
    print("  2. Access: http://localhost:8000/docs")
    print("  3. Login with admin credentials")