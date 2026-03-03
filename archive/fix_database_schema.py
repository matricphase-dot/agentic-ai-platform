# D:\AGENTIC_AI\fix_database_schema.py
import sqlite3
import os

def fix_database_schema():
    print("🔧 Fixing database schema issues...")
    
    db_path = "agentic.db"
    
    if not os.path.exists(db_path):
        print(f"❌ Database file not found: {db_path}")
        return False
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if tasks table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'")
        if not cursor.fetchone():
            print("❌ Tasks table doesn't exist")
            conn.close()
            return False
        
        # Get current columns in tasks table
        cursor.execute("PRAGMA table_info(tasks)")
        columns = [col[1] for col in cursor.fetchall()]
        print(f"Current columns in tasks table: {columns}")
        
        # Add missing columns if they don't exist
        if 'agent_type' not in columns:
            print("➕ Adding 'agent_type' column to tasks table...")
            cursor.execute("ALTER TABLE tasks ADD COLUMN agent_type TEXT")
        
        if 'processing_time' not in columns:
            print("➕ Adding 'processing_time' column to tasks table...")
            cursor.execute("ALTER TABLE tasks ADD COLUMN processing_time REAL")
        
        # Check if users table has password_hash column
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        if cursor.fetchone():
            cursor.execute("PRAGMA table_info(users)")
            user_columns = [col[1] for col in cursor.fetchall()]
            
            if 'password_hash' not in user_columns:
                print("➕ Adding 'password_hash' column to users table...")
                cursor.execute("ALTER TABLE users ADD COLUMN password_hash TEXT")
        
        conn.commit()
        conn.close()
        
        print("✅ Database schema fixed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error fixing database schema: {e}")
        conn.close()
        return False

def create_simple_test_data():
    """Create simple test data that works with the schema"""
    print("\n📝 Creating simple test data...")
    
    try:
        conn = sqlite3.connect("agentic.db")
        cursor = conn.cursor()
        
        # Create a simple task without the problematic columns
        cursor.execute('''
            INSERT INTO tasks (title, description, status) 
            VALUES (?, ?, ?)
        ''', ("Database Test Task", "Testing database operations", "open"))
        
        conn.commit()
        conn.close()
        print("✅ Created test task")
        return True
        
    except Exception as e:
        print(f"❌ Error creating test data: {e}")
        return False

def main():
    print("\n" + "="*60)
    print("DATABASE SCHEMA FIXER")
    print("="*60)
    
    # First, fix the schema
    if not fix_database_schema():
        print("\n❌ Failed to fix database schema")
        return
    
    # Create test data
    create_simple_test_data()
    
    print("\n" + "="*60)
    print("✅ DATABASE FIXED SUCCESSFULLY!")
    print("="*60)
    print("\n📌 Next steps:")
    print("1. The database schema is now compatible with the application")
    print("2. Restart the server for changes to take effect")
    print("3. Run the validator again")
    print("\nTo restart the server:")
    print("   Ctrl+C to stop current server")
    print("   python CORE\\main_fixed.py")
    print("\nThen run: python feature_validator_fixed.py")

if __name__ == "__main__":
    main()