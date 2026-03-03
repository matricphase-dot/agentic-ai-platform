# complete_platform_check.py
import requests
import os
import sys
import webbrowser
import time
from datetime import datetime

def check_server():
    print("🔍 Platform Status Check")
    print("="*50)
    
    print("1. Checking server on port 5000...")
    try:
        response = requests.get("http://localhost:5000/", timeout=5)
        if response.status_code == 200:
            print("   ✅ Server is responding")
            return True
        else:
            print(f"   ❌ Server error: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("   ❌ Server not running")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def check_directories():
    print("\n2. Checking required directories...")
    required_dirs = ["database", "static/css", "static/js", "templates"]
    
    all_exist = True
    for directory in required_dirs:
        if os.path.exists(directory):
            print(f"   ✅ {directory}/")
        else:
            print(f"   ❌ {directory}/ - MISSING")
            all_exist = False
    
    return all_exist

def check_files():
    print("\n3. Checking required files...")
    required_files = [
        "server_production.py",
        "templates/dashboard.html", 
        "templates/login.html",
        "static/css/style.css",
        "static/js/dashboard.js"
    ]
    
    all_exist = True
    for file in required_files:
        if os.path.exists(file):
            size = os.path.getsize(file)
            print(f"   ✅ {file:30} - {size:,} bytes")
        else:
            print(f"   ❌ {file:30} - MISSING")
            all_exist = False
    
    return all_exist

def test_endpoints():
    print("\n4. Testing API endpoints...")
    
    base_url = "http://localhost:5000"
    endpoints = [
        ("/", "Root"),
        ("/dashboard", "Dashboard"),
        ("/login", "Login"),
        ("/api/health", "Health Check"),
        ("/api/agents", "Agents"),
        ("/api/tasks", "Tasks"),
        ("/api/marketplace/tasks", "Marketplace"),
        ("/api/analytics", "Analytics"),
        ("/api/docs", "API Docs")
    ]
    
    results = []
    for endpoint, name in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=3)
            if response.status_code == 200:
                print(f"   ✅ {name:20} - 200 OK")
                results.append(True)
            else:
                print(f"   ⚠️  {name:20} - {response.status_code}")
                results.append(False)
        except Exception as e:
            print(f"   ❌ {name:20} - Failed: {str(e)[:30]}")
            results.append(False)
    
    return sum(results), len(results)

def main():
    print("🚀 AGENTIC AI PLATFORM - COMPLETE CHECK")
    print("="*60)
    
    # Check if server is running
    if not check_server():
        print("\n⚠️  Server is not running. Starting server...")
        start_server()
        time.sleep(3)  # Wait for server to start
    
    # Run checks
    dirs_ok = check_directories()
    files_ok = check_files()
    passed, total = test_endpoints()
    
    print("\n" + "="*60)
    print("📊 CHECK RESULTS")
    print("="*60)
    
    status = "✅ READY" if passed >= total - 2 else "⚠️  NEEDS FIXES"
    print(f"Platform Status: {status}")
    print(f"API Endpoints: {passed}/{total} working")
    print(f"Directories: {'✅ Complete' if dirs_ok else '❌ Missing'}")
    print(f"Files: {'✅ Complete' if files_ok else '❌ Missing'}")
    
    print("\n🌐 URLs:")
    print("  Dashboard: http://localhost:5000/dashboard")
    print("  Login: http://localhost:5000/login")
    print("  API Docs: http://localhost:5000/api/docs")
    print("  Health Check: http://localhost:5000/api/health")
    
    # Open dashboard
    print("\n🔗 Opening dashboard in browser...")
    try:
        webbrowser.open("http://localhost:5000/dashboard")
    except:
        print("  ⚠️  Could not open browser automatically")
    
    print("\n" + "="*60)
    print("🎯 NEXT STEPS:")
    if passed == total:
        print("1. Your platform is READY! 🎉")
        print("2. Test the impossible task demo")
        print("3. Push to GitHub")
        print("4. Prepare investor materials")
    else:
        print("1. Fix missing endpoints")
        print("2. Ensure all files exist")
        print("3. Restart server")
        print("4. Run this check again")
    
    return passed == total

def start_server():
    """Start the server in background"""
    import subprocess
    print("Starting server_production.py...")
    
    # Start server in a separate process
    subprocess.Popen([sys.executable, "server_production.py"], 
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE)
    
    print("Server starting on port 5000...")
    print("Please wait 5 seconds for server to initialize")

if __name__ == "__main__":
    main()