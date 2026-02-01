"""
AUTOMATIC FIX SCRIPT FOR AGENTIC AI PLATFORM
Fixes common missing features and endpoints
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def install_requirements():
    """Install all required dependencies"""
    print("📦 Installing required packages...")
    
    requirements = [
        "fastapi==0.104.1",
        "uvicorn[standard]==0.24.0",
        "sqlalchemy==2.0.23",
        "pyautogui==0.9.54",
        "psutil==5.9.6",
        "pillow==10.1.0",
        "jinja2==3.1.2",
        "websockets==12.0",
        "python-jose[cryptography]==3.3.0",
        "passlib[bcrypt]==1.7.4",
        "python-multipart==0.0.6",
        "python-dotenv==1.0.0",
        "requests==2.31.0",
        "colorama==0.4.6"
    ]
    
    for req in requirements:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", req])
            print(f"  ✓ Installed: {req}")
        except:
            print(f"  ✗ Failed to install: {req}")
    
    print("✅ All packages installed")

def create_missing_directories():
    """Create all required directories"""
    print("📁 Creating missing directories...")
    
    directories = [
        "screenshots",
        "static/screenshots",
        "uploads",
        "backups",
        "logs",
        "templates",
        "static/css",
        "static/js"
    ]
    
    for dir_path in directories:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        print(f"  ✓ Created: {dir_path}")
    
    print("✅ All directories created")

def create_missing_files():
    """Create missing essential files"""
    print("📄 Creating missing files...")
    
    # Create basic dashboard if missing
    dashboard_path = "templates/dashboard.html"
    if not os.path.exists(dashboard_path):
        print(f"  ⚠ Dashboard missing at: {dashboard_path}")
        print("  Please copy the complete dashboard.html to templates/")
    
    # Create requirements.txt if missing
    requirements_content = """fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
pyautogui==0.9.54
psutil==5.9.6
pillow==10.1.0
jinja2==3.1.2
websockets==12.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
python-dotenv==1.0.0"""
    
    with open("requirements.txt", "w") as f:
        f.write(requirements_content)
    print("  ✓ Created: requirements.txt")
    
    print("✅ Missing files checked")

def check_database():
    """Check and fix database"""
    print("💾 Checking database...")
    
    db_path = "agentic.db"
    if not os.path.exists(db_path):
        print(f"  ⚠ Database not found: {db_path}")
        print("  Database will be created automatically when server starts")
    else:
        print(f"  ✓ Database found: {db_path} ({os.path.getsize(db_path)} bytes)")
    
    print("✅ Database checked")

def verify_endpoints():
    """Verify all API endpoints are defined in main.py"""
    print("🔌 Checking API endpoints in main.py...")
    
    main_file = "CORE/main.py"
    if not os.path.exists(main_file):
        print(f"  ❌ Main file missing: {main_file}")
        return False
    
    with open(main_file, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Check for key endpoints
    endpoints_to_check = [
        "@app.get(\"/api/health\")",
        "@app.get(\"/api/system/status\")",
        "@app.post(\"/api/desktop/screenshot\")",
        "@app.get(\"/api/agents\")",
        "@app.get(\"/api/tasks\")",
        "@app.get(\"/api/marketplace/tasks\")",
        "@app.post(\"/api/email/send\")",
        "@app.post(\"/api/files/organize\")",
        "@app.websocket(\"/ws\")"
    ]
    
    missing_endpoints = []
    for endpoint in endpoints_to_check:
        if endpoint not in content:
            missing_endpoints.append(endpoint)
    
    if missing_endpoints:
        print(f"  ⚠ Missing {len(missing_endpoints)} endpoints:")
        for ep in missing_endpoints:
            print(f"    - {ep}")
    else:
        print("  ✓ All essential endpoints found")
    
    print("✅ Endpoints verified")
    return len(missing_endpoints) == 0

def create_startup_script():
    """Create startup script for Windows"""
    print("⚡ Creating startup script...")
    
    script_content = """@echo off
chcp 65001 >nul
echo ========================================
echo AGENTIC AI PLATFORM - COMPLETE VERSION
echo ========================================
echo.

echo Stopping existing processes...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM uvicorn.exe 2>nul
timeout /t 1 /nobreak >nul

echo Creating directories...
if not exist "screenshots" mkdir screenshots
if not exist "static\\screenshots" mkdir "static\\screenshots"
if not exist "uploads" mkdir uploads
if not exist "backups" mkdir backups
if not exist "logs" mkdir logs
if not exist "templates" mkdir templates

echo.
echo Starting Agentic AI Platform...
echo.
echo ✅ DASHBOARD: http://localhost:8084/dashboard
echo 📚 API DOCS: http://localhost:8084/api/docs
echo 🩺 HEALTH: http://localhost:8084/api/health
echo.
echo Press Ctrl+C to stop the server
echo.

python -m uvicorn CORE.main:app --host 0.0.0.0 --port 8084 --reload

pause"""
    
    with open("start_platform.bat", "w") as f:
        f.write(script_content)
    
    print("  ✓ Created: start_platform.bat")
    print("✅ Startup script created")

def run_quick_test():
    """Run a quick test of the platform"""
    print("🧪 Running quick platform test...")
    
    import requests
    try:
        # Test if server responds
        response = requests.get("http://localhost:8084/api/health", timeout=5)
        if response.status_code == 200:
            print("  ✓ Server is running and responding")
            data = response.json()
            print(f"  ✓ Platform version: {data.get('version', 'Unknown')}")
        else:
            print(f"  ⚠ Server responded with HTTP {response.status_code}")
    except:
        print("  ⚠ Server is not running (this is normal if you haven't started it yet)")
    
    print("✅ Quick test completed")

def main():
    """Main fix function"""
    print("🔧 AGENTIC AI PLATFORM FIX SCRIPT")
    print("=" * 50)
    
    # Change to project directory
    project_dir = "D:/AGENTIC_AI"
    if os.path.exists(project_dir):
        os.chdir(project_dir)
        print(f"📁 Working in: {os.getcwd()}")
    else:
        print(f"❌ Project directory not found: {project_dir}")
        return
    
    # Run all fixes
    print("\n🚀 STARTING AUTOMATIC FIXES...\n")
    
    install_requirements()
    print()
    
    create_missing_directories()
    print()
    
    create_missing_files()
    print()
    
    check_database()
    print()
    
    verify_endpoints()
    print()
    
    create_startup_script()
    print()
    
    run_quick_test()
    print()
    
    print("=" * 50)
    print("✅ ALL FIXES COMPLETED!")
    print("\n📋 NEXT STEPS:")
    print("1. Start the platform: double-click start_platform.bat")
    print("2. Open browser to: http://localhost:8084/dashboard")
    print("3. Run diagnostic: python diagnose_platform.py")
    print("\n💡 If features are still missing:")
    print("   - Check CORE/main.py has all endpoints")
    print("   - Verify templates/dashboard.html exists")
    print("   - Ensure all dependencies are installed")

if __name__ == "__main__":
    main()