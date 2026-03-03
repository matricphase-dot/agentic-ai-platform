# migrate.py - Database migration script
from database import engine, Base, create_tables, test_connection
import sys

def migrate():
    print("🔧 Running database migration...")
    
    if not test_connection():
        print("❌ Cannot connect to database. Check your DATABASE_URL in .env")
        sys.exit(1)
    
    # Create all tables
    create_tables()
    
    # Add initial data if needed
    from database import SessionLocal
    from sqlalchemy.sql import text
    
    db = SessionLocal()
    try:
        # Check if users table is empty
        result = db.execute(text("SELECT COUNT(*) FROM users"))
        count = result.scalar()
        
        if count == 0:
            print("📝 No data found. Would you like to create a test user?")
            response = input("Create test user? (y/n): ")
            if response.lower() == 'y':
                from passlib.context import CryptContext
                pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
                
                hashed_password = pwd_context.hash("test123")
                db.execute(text("""
                    INSERT INTO users (email, hashed_password, plan, api_key, is_active)
                    VALUES (:email, :password, :plan, :api_key, :active)
                """), {
                    'email': 'test@agentic.ai',
                    'password': hashed_password,
                    'plan': 'pro',
                    'api_key': 'test_key_123',
                    'active': True
                })
                db.commit()
                print("✅ Test user created: test@agentic.ai / test123")
        
        print(f"📊 Database stats:")
        tables = ['users', 'agents', 'teams', 'collaborations']
        for table in tables:
            result = db.execute(text(f"SELECT COUNT(*) FROM {table}"))
            count = result.scalar()
            print(f"   • {table}: {count} records")
            
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        db.rollback()
    finally:
        db.close()
    
    print("✅ Migration completed successfully!")

if __name__ == "__main__":
    migrate()
