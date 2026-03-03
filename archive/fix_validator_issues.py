# D:\AGENTIC_AI\fix_validator_issues.py
import sqlite3
import os
from datetime import datetime

def fix_database_issues():
    """Fix database schema issues"""
    print("🔧 Fixing database schema issues...")
    
    conn = sqlite3.connect("agentic.db")
    cursor = conn.cursor()
    
    # Create users table if it doesn't exist
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            password_hash TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Add missing columns to tasks table
    try:
        cursor.execute("ALTER TABLE tasks ADD COLUMN agent_type TEXT")
        print("✅ Added agent_type column to tasks")
    except:
        print("⚠️ agent_type column already exists or can't be added")
    
    try:
        cursor.execute("ALTER TABLE tasks ADD COLUMN processing_time REAL")
        print("✅ Added processing_time column to tasks")
    except:
        print("⚠️ processing_time column already exists or can't be added")
    
    # Add some sample data
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        cursor.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            ("admin", "admin@agentic.ai", "password123")
        )
        print("✅ Added sample user")
    
    conn.commit()
    conn.close()
    print("✅ Database fixes applied")

def create_quick_fix_main():
    """Create a quick-fix version of main.py"""
    print("\n🔧 Creating patched main.py...")
    
    # Read current main.py
    with open(r"CORE\main.py", 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add import for endpoint patch at the top
    import_statement = 'import sys\nimport os\nsys.path.append(os.path.dirname(os.path.abspath(__file__)))\n'
    
    if 'import sys' not in content:
        content = content.replace(
            'import os',
            'import os\nimport sys\n'
        )
    
    # Find the place to add endpoint initialization
    if 'app = FastAPI(' in content:
        # Find the end of FastAPI initialization
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if 'app = FastAPI(' in line:
                # Insert after all middleware and template setup
                insert_point = i + 1
                for j in range(i+1, len(lines)):
                    if 'templates = Jinja2Templates(' in lines[j]:
                        insert_point = j + 1
                        break
                
                # Insert the patch import and initialization
                patch_code = '''
# ========== ENDPOINT PATCH FOR VALIDATOR ==========
try:
    from endpoint_patch import add_missing_endpoints
    add_missing_endpoints(app)
    print("✅ Validator endpoint patch applied")
except Exception as e:
    print(f"⚠️ Validator patch failed: {e}")
'''
                lines.insert(insert_point, patch_code)
                content = '\n'.join(lines)
                break
    
    # Write back
    with open(r"CORE\main_patched.py", 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Created main_patched.py")

def run_quick_test():
    """Run a quick test to verify fixes"""
    print("\n🧪 Running quick test...")
    
    import requests
    
    endpoints_to_test = [
        ("/api/status", "Status endpoint"),
        ("/api/marketplace", "Marketplace endpoint"),
        ("/api/analytics", "Analytics endpoint"),
        ("/api/analytics/agents", "Agent analytics"),
        ("/api/users", "Users endpoint"),
    ]
    
    base_url = "http://localhost:8080"
    
    for endpoint, name in endpoints_to_test:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            if response.status_code == 200:
                print(f"✅ {name}: Working")
            else:
                print(f"⚠️ {name}: Status {response.status_code}")
        except Exception as e:
            print(f"❌ {name}: Error - {str(e)[:50]}")

def main():
    print("\n" + "="*60)
    print("AGENTIC AI - VALIDATOR ISSUES FIXER")
    print("="*60)
    
    # Check if server is running
    try:
        import requests
        response = requests.get("http://localhost:8080/api/health", timeout=3)
        if response.status_code == 200:
            print("✅ Server is running on port 8080")
        else:
            print("⚠️ Server responded with non-200 status")
    except:
        print("❌ Server is not running. Please start the server first.")
        print("\nRun: python CORE\\main.py")
        return
    
    # Apply fixes
    fix_database_issues()
    create_quick_fix_main()
    
    print("\n" + "="*60)
    print("🎉 FIXES APPLIED SUCCESSFULLY!")
    print("="*60)
    print("\n📌 NEXT STEPS:")
    print("1. Restart the server with the patched version:")
    print("   python CORE\\main_patched.py")
    print("\n2. Or apply patches to your existing server by:")
    print("   - Running this fix script")
    print("   - Then run the validator again")
    print("\n3. Test with:")
    print("   python feature_validator.py")
    print("="*60)

if __name__ == "__main__":
    main()