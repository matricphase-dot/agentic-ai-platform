# D:\AGENTIC_AI\quick_fix.py
import os
import subprocess
import time
import requests
import sys
from pathlib import Path

def fix_port_issue():
    """Change port from 8084 to 8080 in main.py"""
    print("🔧 Fixing port configuration...")
    
    main_py_path = r"D:\AGENTIC_AI\CORE\main.py"
    
    # Read current main.py
    with open(main_py_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace port 8084 with 8080
    content = content.replace("port=8084", "port=8080")
    content = content.replace("localhost:8084", "localhost:8080")
    content = content.replace('"8084"', '"8080"')
    
    # Write back
    with open(main_py_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Changed port from 8084 to 8080")
    return True

def check_dependencies():
    """Check and install missing dependencies"""
    print("\n📦 Checking dependencies...")
    
    # sqlite3 is built into Python, so we don't need to install it
    packages = [
        "websocket-client",
        "colorama",
        "pyautogui",
        "psutil",
        "pillow",
        "passlib",
        "python-jose[cryptography]",
        "sqlalchemy",
        "pywin32"  # For Windows desktop automation
    ]
    
    for package in packages:
        try:
            __import__(package.replace('-', '_').replace('[', '').replace(']', ''))
            print(f"✅ {package} already installed")
        except ImportError:
            print(f"📥 Installing {package}...")
            subprocess.run([sys.executable, "-m", "pip", "install", package], check=False)
    
    return True

def create_simple_launcher():
    """Create a simple launcher script"""
    print("\n🚀 Creating launcher script...")
    
    launcher_bat = r"""@echo off
chcp 65001 > nul
echo ========================================
echo    AGENTIC AI PLATFORM - LAUNCHER
echo ========================================
echo.

REM Kill existing processes on port 8080
echo Checking for existing processes on port 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do (
    echo Killing process PID: %%a
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 2 /nobreak >nul

REM Create necessary directories
echo Creating directories...
if not exist "screenshots" mkdir screenshots
if not exist "static/screenshots" mkdir static/screenshots
if not exist "uploads" mkdir uploads
if not exist "backups" mkdir backups
if not exist "logs" mkdir logs

REM Start the server
echo Starting Agentic AI Platform...
echo.
echo 🌐 Dashboard: http://localhost:8080/dashboard
echo 📚 API Docs: http://localhost:8080/api/docs
echo 🏥 Health Check: http://localhost:8080/api/health
echo 🔌 WebSocket: ws://localhost:8080/ws
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Run the server
python CORE\main.py

if errorlevel 1 (
    echo.
    echo ❌ Server failed to start!
    echo.
    echo Common issues:
    echo 1. Missing dependencies - run: pip install -r requirements.txt
    echo 2. Another app using port 8080
    echo 3. Python version must be 3.8+
    echo.
    pause
)
"""
    
    with open(r"D:\AGENTIC_AI\launch.bat", 'w', encoding='utf-8') as f:
        f.write(launcher_bat)
    
    print("✅ Created launch.bat")
    return True

def test_server():
    """Test if server is running correctly"""
    print("\n🧪 Testing server...")
    
    # Start server in background
    print("Starting server...")
    server_process = subprocess.Popen(
        [sys.executable, r"CORE\main.py"],
        cwd=r"D:\AGENTIC_AI",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
    )
    
    # Wait for server to start
    print("Waiting for server to start (10 seconds)...")
    time.sleep(10)
    
    # Test endpoints
    endpoints = [
        ("http://localhost:8080/api/health", "Health Check"),
        ("http://localhost:8080/api/system/status", "System Status"),
        ("http://localhost:8080/api/agents", "Agents List"),
        ("http://localhost:8080/dashboard", "Dashboard"),
    ]
    
    results = []
    for url, name in endpoints:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print(f"✅ {name}: Working")
                results.append(True)
            else:
                print(f"❌ {name}: Status {response.status_code}")
                results.append(False)
        except Exception as e:
            print(f"❌ {name}: Error - {str(e)[:50]}")
            results.append(False)
    
    # Stop server
    server_process.terminate()
    
    return all(results)

def create_requirements_file():
    """Create requirements.txt based on main.py imports"""
    print("\n📋 Creating requirements.txt...")
    
    requirements = """fastapi==0.104.1
uvicorn[standard]==0.24.0
websockets==12.0
python-multipart==0.0.6
sqlalchemy==2.0.25
pyautogui==0.9.54
psutil==5.9.8
pillow==10.1.0
passlib[bcrypt]==1.7.4
python-jose[cryptography]==3.3.0
requests==2.31.0
colorama==0.4.6
websocket-client==1.6.4
"""
    
    with open(r"D:\AGENTIC_AI\requirements.txt", 'w') as f:
        f.write(requirements)
    
    print("✅ Created requirements.txt")
    return True

def main():
    print("\n" + "="*60)
    print("AGENTIC AI PLATFORM - QUICK FIX")
    print("="*60)
    
    steps = [
        ("Fixing port configuration", fix_port_issue),
        ("Creating requirements file", create_requirements_file),
        ("Checking dependencies", check_dependencies),
        ("Creating launcher script", create_simple_launcher),
        ("Testing server", test_server),
    ]
    
    all_ok = True
    for step_name, step_func in steps:
        print(f"\n▶ {step_name}...")
        try:
            success = step_func()
            if success:
                print(f"   ✅ {step_name} completed")
            else:
                print(f"   ⚠️ {step_name} had issues")
                all_ok = False
        except Exception as e:
            print(f"   ❌ {step_name} failed: {str(e)}")
            all_ok = False
    
    print("\n" + "="*60)
    if all_ok:
        print("🎉 ALL FIXES APPLIED SUCCESSFULLY!")
        print("\n📌 NEXT STEPS:")
        print("1. Run: cd /d D:\\AGENTIC_AI")
        print("2. Run: launch.bat")
        print("3. Open: http://localhost:8080/dashboard")
        print("4. Test all features from the dashboard")
    else:
        print("⚠️  Some fixes had issues. Manual intervention may be needed.")
    
    print("\n🔗 Quick Links:")
    print("   Dashboard: http://localhost:8080/dashboard")
    print("   API Docs: http://localhost:8080/api/docs")
    print("   Health Check: http://localhost:8080/api/health")
    print("="*60)

if __name__ == "__main__":
    main()