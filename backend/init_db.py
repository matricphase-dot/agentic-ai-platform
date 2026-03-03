# init_db.py - Initialize Render PostgreSQL Database
from database import engine, Base, SessionLocal
import logging
from sqlalchemy import text

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_database():
    """Initialize database with schema and optional test data"""
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created")
        
        # Add test data if database is empty
        db = SessionLocal()
        try:
            # Check if users table is empty
            result = db.execute(text("SELECT COUNT(*) FROM users"))
            user_count = result.scalar()
            
            if user_count == 0:
                logger.info("📝 Database is empty. Adding test data...")
                
                # Add test user
                from passlib.context import CryptContext
                pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
                
                test_user = {
                    'email': 'demo@agentic.ai',
                    'hashed_password': pwd_context.hash('demo123'),
                    'full_name': 'Demo User',
                    'company': 'Agentic AI',
                    'plan': 'pro',
                    'api_key': 'demo_key_' + '1234567890abcdef',
                    'credits': 100.00
                }
                
                db.execute(text("""
                    INSERT INTO users (email, hashed_password, full_name, company, plan, api_key, credits)
                    VALUES (:email, :password, :full_name, :company, :plan, :api_key, :credits)
                """), test_user)
                
                # Add test agents
                test_agents = [
                    {
                        'name': 'Research Assistant',
                        'description': 'Expert in market research and trend analysis',
                        'agent_type': 'researcher',
                        'owner_id': 1,
                        'model': 'gpt-4',
                        'system_prompt': 'You are a senior research analyst specializing in technology trends.'
                    },
                    {
                        'name': 'Content Writer',
                        'description': 'Creates engaging marketing content',
                        'agent_type': 'writer',
                        'owner_id': 1,
                        'model': 'gpt-3.5-turbo',
                        'system_prompt': 'You are a professional copywriter with expertise in AI technology.'
                    },
                    {
                        'name': 'Code Analyst',
                        'description': 'Reviews and analyzes code',
                        'agent_type': 'coder',
                        'owner_id': 1,
                        'model': 'gpt-4',
                        'system_prompt': 'You are a senior software engineer specializing in Python and AI systems.'
                    }
                ]
                
                for agent in test_agents:
                    db.execute(text("""
                        INSERT INTO agents (name, description, agent_type, owner_id, model, system_prompt)
                        VALUES (:name, :description, :agent_type, :owner_id, :model, :system_prompt)
                    """), agent)
                
                db.commit()
                logger.info("✅ Test data added: 1 user, 3 agents")
            else:
                logger.info(f"📊 Database already has {user_count} users")
                
            # Show current stats
            tables = ['users', 'agents', 'teams', 'collaborations', 'api_logs']
            for table in tables:
                result = db.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.scalar()
                logger.info(f"   • {table}: {count} records")
                
        except Exception as e:
            logger.error(f"❌ Error adding test data: {e}")
            db.rollback()
        finally:
            db.close()
            
        return True
        
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Initializing Agentic AI Database...")
    print("=" * 50)
    if init_database():
        print("✅ Database initialization complete!")
    else:
        print("❌ Database initialization failed")
