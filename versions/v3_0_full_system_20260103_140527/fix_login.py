# fix_login.py
import os
import bcrypt
from database_setup import DatabaseManager, User, SessionLocal

def check_and_fix_admin():
    """Check if admin exists and fix password"""
    db = SessionLocal()
    
    # Check admin user
    admin = db.query(User).filter(User.username == "admin").first()
    
    if admin:
        print(f"✅ Admin user found: {admin.username}")
        print(f"   Email: {admin.email}")
        print(f"   Is admin: {admin.is_admin}")
        
        # Test password
        test_password = "admin123"
        if admin.verify_password(test_password):
            print("✅ Password 'admin123' works!")
        else:
            print("❌ Password doesn't match")
            # Reset password
            hashed = bcrypt.hashpw(test_password.encode('utf-8'), bcrypt.gensalt())
            admin.hashed_password = hashed.decode('utf-8')
            db.commit()
            print("✅ Password reset to 'admin123'")
    else:
        print("❌ Admin user not found!")
        # Create admin
        password = "admin123"
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
        print("✅ Admin user created with password 'admin123'")
    
    db.close()

def list_all_users():
    """List all users in database"""
    db = SessionLocal()
    users = db.query(User).all()
    
    print("\n📋 ALL USERS IN DATABASE:")
    for user in users:
        print(f"  • {user.username} ({user.email}) - Admin: {user.is_admin}")
    
    db.close()

if __name__ == "__main__":
    print("🔍 DATABASE DIAGNOSTIC TOOL")
    print("="*50)
    
    # Initialize database
    db_manager = DatabaseManager()
    db_manager.create_tables()
    
    # Check admin
    check_and_fix_admin()
    
    # List users
    list_all_users()
    
    print("\n✅ Diagnostic complete!")
    print("\n🔑 Login with:")
    print("   Username: admin")
    print("   Password: admin123")