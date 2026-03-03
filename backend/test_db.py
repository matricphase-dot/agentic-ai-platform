# test_db.py - Check database connection
from database import test_connection, SessionLocal
from sqlalchemy import text

print("Testing database connection...")
if test_connection():
    print("✅ Database connected")
    
    # Test a simple query
    db = SessionLocal()
    try:
        result = db.execute(text("SELECT version();"))
        version = result.fetchone()[0]
        print(f"✅ PostgreSQL version: {version}")
    except Exception as e:
        print(f"❌ Query failed: {e}")
    finally:
        db.close()
else:
    print("❌ Database connection failed")
