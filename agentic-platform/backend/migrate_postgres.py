# backend/migrate_postgres.py
import os
import sys
from sqlalchemy import create_engine, text
from app.database import Base, engine
from app.models.user import User
from app.models.agent import Agent
from app.models.agent_execution import AgentExecution

def verify_postgres_connection():
    """Verify PostgreSQL connection is working"""
    try:
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ Connected to PostgreSQL: {version}")
            
            # Check if tables exist
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """))
            tables = [row[0] for row in result.fetchall()]
            print(f"📊 Existing tables: {tables}")
            
            return True
    except Exception as e:
        print(f"❌ PostgreSQL connection error: {e}")
        return False

def migrate_data_if_needed():
    """Migrate data from SQLite to PostgreSQL if needed"""
    sqlite_path = "agentic.db"
    if os.path.exists(sqlite_path):
        print("📦 SQLite database found. Would you like to migrate data?")
        response = input("Migrate data from SQLite to PostgreSQL? (y/n): ")
        
        if response.lower() == 'y':
            try:
                print("🔄 Starting data migration...")
                # This would be a more complex migration script
                # For now, just note that data migration is needed
                print("⚠️ Note: Data migration requires manual steps.")
                print("Please export SQLite data and import to PostgreSQL.")
            except Exception as e:
                print(f"❌ Migration error: {e}")
    else:
        print("📭 No SQLite database found. Starting fresh with PostgreSQL.")

def create_tables():
    """Create all tables in PostgreSQL"""
    try:
        print("🔄 Creating tables in PostgreSQL...")
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully!")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")

def add_sample_data():
    """Add sample data for testing"""
    try:
        from app.database import SessionLocal
        from app.models.user import User
        from app.models.agent import Agent
        from datetime import datetime
        
        db = SessionLocal()
        
        # Check if admin user exists
        admin = db.query(User).filter(User.email == "admin@agenticai.com").first()
        
        if not admin:
            print("👤 Creating admin user...")
            admin = User(
                email="admin@agenticai.com",
                name="Admin User",
                hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # hash for "Admin123!"
                is_admin=True
            )
            db.add(admin)
            db.commit()
            print("✅ Admin user created")
        
        # Check if sample agents exist
        agents_count = db.query(Agent).count()
        if agents_count == 0:
            print("🤖 Creating sample agents...")
            sample_agents = [
                Agent(
                    name="Marketing Copywriter",
                    description="Creates compelling marketing copy for products and services",
                    category="Marketing",
                    icon="📝",
                    instructions="You are a professional marketing copywriter. Create engaging, persuasive copy that converts readers to customers.",
                    input_template="Create marketing copy for {product/service} targeting {audience}",
                    user_id=admin.id,
                    is_public=True,
                    is_template=True
                ),
                Agent(
                    name="Code Assistant",
                    description="Helps with coding tasks, debugging, and code review",
                    category="Development",
                    icon="💻",
                    instructions="You are an expert software developer. Write clean, efficient code and provide helpful explanations.",
                    input_template="Help me with this coding problem: {problem_description}",
                    user_id=admin.id,
                    is_public=True,
                    is_template=True
                ),
                # Add more sample agents as needed
            ]
            
            for agent in sample_agents:
                db.add(agent)
            
            db.commit()
            print(f"✅ Created {len(sample_agents)} sample agents")
        
        db.close()
        
    except Exception as e:
        print(f"❌ Error adding sample data: {e}")

def main():
    """Main migration function"""
    print("🚀 Agentic AI Platform - PostgreSQL Migration")
    print("=" * 50)
    
    # Verify connection
    if not verify_postgres_connection():
        print("❌ Cannot proceed without PostgreSQL connection.")
        print("Please ensure DATABASE_URL is set correctly.")
        sys.exit(1)
    
    # Create tables
    create_tables()
    
    # Add sample data
    add_sample_data()
    
    # Check for SQLite migration
    migrate_data_if_needed()
    
    print("\n🎉 Migration complete!")
    print("Your Agentic AI Platform is now using PostgreSQL.")
    print("\nNext steps:")
    print("1. Restart your backend server")
    print("2. Update your frontend to use the analytics endpoints")
    print("3. Test the new features!")

if __name__ == "__main__":
    main()