import sys
import os
import hashlib

# Add the app directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app.models.user import User

def get_password_hash(password: str) -> str:
    """Simple SHA256 hash for development"""
    return hashlib.sha256(password.encode()).hexdigest()

def setup_database():
    """Create database tables if they don't exist"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")

def create_admin():
    setup_database()
    
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.email == "admin@agenticai.com").first()
        if admin:
            print("Admin user already exists")
            print(f"Email: {admin.email}")
            print(f"Name: {admin.name}")
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
        db.refresh(admin)
        
        print("✅ Admin user created successfully")
        print("Email: admin@agenticai.com")
        print("Password: Admin123!")
        print(f"User ID: {admin.id}")
        
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()