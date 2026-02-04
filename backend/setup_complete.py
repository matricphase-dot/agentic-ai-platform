import sys
import os
import subprocess
import sqlite3

def setup_backend():
    print("🚀 Setting up Agentic AI Backend...")
    print("=" * 50)
    
    # Step 1: Install requirements
    print("\n📦 Step 1: Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed")
    except subprocess.CalledProcessError:
        print("⚠️  Could not install from requirements.txt, installing individually...")
        packages = [
            "fastapi==0.104.1",
            "uvicorn[standard]==0.24.0",
            "sqlalchemy==2.0.23",
            "pydantic==2.5.0",
            "python-jose[cryptography]==3.3.0",
            "python-multipart==0.0.6",
            "openai==1.3.0",
            "python-dotenv==1.0.0",
            "requests==2.31.0"
        ]
        for package in packages:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print("✅ Dependencies installed")
    
    # Step 2: Create database and admin user
    print("\n🗄️  Step 2: Setting up database...")
    create_database_and_admin()
    
    # Step 3: Test the setup
    print("\n🧪 Step 3: Testing setup...")
    test_setup()
    
    print("\n" + "=" * 50)
    print("🎉 Setup complete! Start the backend with:")
    print("   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    print("=" * 50)

def create_database_and_admin():
    """Create database tables and admin user"""
    import hashlib
    
    # Add current directory to path
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    
    try:
        from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime
        from sqlalchemy.orm import sessionmaker, declarative_base
        from sqlalchemy.sql import func
        
        # Database setup
        SQLALCHEMY_DATABASE_URL = "sqlite:///./agentic_ai.db"
        engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        Base = declarative_base()
        
        # Define User model
        class User(Base):
            __tablename__ = "users"
            
            id = Column(Integer, primary_key=True, index=True)
            email = Column(String, unique=True, index=True, nullable=False)
            hashed_password = Column(String, nullable=False)
            name = Column(String, nullable=False)
            is_active = Column(Boolean, default=True)
            created_at = Column(DateTime(timezone=True), server_default=func.now())
            updated_at = Column(DateTime(timezone=True), onupdate=func.now())
        
        # Create tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created")
        
        # Create admin user
        db = SessionLocal()
        try:
            # Check if admin exists
            existing = db.query(User).filter(User.email == "admin@agenticai.com").first()
            if existing:
                print("✅ Admin user already exists")
                return existing
            
            # Create admin user
            def get_password_hash(password: str) -> str:
                return hashlib.sha256(password.encode()).hexdigest()
            
            hashed_password = get_password_hash("Admin123!")
            admin = User(
                email="admin@agenticai.com",
                hashed_password=hashed_password,
                name="Admin User",
                is_active=True
            )
            
            db.add(admin)
            db.commit()
            db.refresh(admin)
            
            print("✅ Admin user created successfully!")
            print(f"   Email: admin@agenticai.com")
            print(f"   Password: Admin123!")
            return admin
            
        except Exception as e:
            print(f"❌ Error creating admin: {e}")
            db.rollback()
            return None
        finally:
            db.close()
            
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return None

def test_setup():
    """Test the backend setup"""
    print("Testing database...")
    
    # Check if database file exists
    if os.path.exists("agentic_ai.db"):
        print("✅ Database file exists")
        
        # Check database contents
        conn = sqlite3.connect('agentic_ai.db')
        cursor = conn.cursor()
        
        # Check tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print(f"✅ Found {len(tables)} tables: {[t[0] for t in tables]}")
        
        # Check users
        cursor.execute("SELECT COUNT(*) FROM users;")
        user_count = cursor.fetchone()[0]
        print(f"✅ Found {user_count} user(s) in database")
        
        cursor.execute("SELECT email, name FROM users;")
        users = cursor.fetchall()
        for email, name in users:
            print(f"   - {email} ({name})")
        
        conn.close()
    else:
        print("❌ Database file not found")
    
    print("\n✅ Setup test completed!")

if __name__ == "__main__":
    setup_backend()