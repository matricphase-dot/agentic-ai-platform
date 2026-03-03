# launch_complete.py
import subprocess
import sys
import time
import os
import webbrowser

def start_platform():
    print("🚀 STARTING COMPLETE AGENTIC AI PLATFORM")
    print("="*60)
    
    # Step 1: Check if server is already running
    print("1. Checking current server status...")
    try:
        import requests
        response = requests.get("http://localhost:5000/", timeout=2)
        if response.status_code == 200:
            print("   ✅ Server is already running")
            print("\n🌐 Platform URLs:")
            print("   Dashboard: http://localhost:5000/dashboard")
            print("   Login: http://localhost:5000/login")
            print("   API Docs: http://localhost:5000/api/docs")
            webbrowser.open("http://localhost:5000/dashboard")
            return True
    except:
        print("   ⚠️  No server detected")
    
    # Step 2: Ensure required files exist
    print("\n2. Checking platform files...")
    required_files = [
        "server_production.py",
        "templates/dashboard.html",
        "templates/login.html"
    ]
    
    missing_files = []
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
            print(f"   ❌ {file} - MISSING")
        else:
            print(f"   ✅ {file}")
    
    if missing_files:
        print("\n❌ Missing required files. Please run setup_directories.py first.")
        return False
    
    # Step 3: Start the server
    print("\n3. Starting server...")
    print("   Starting: python server_production.py")
    
    # Start server process
    process = subprocess.Popen(
        [sys.executable, "server_production.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    # Wait for server to start
    print("   Waiting for server to initialize...")
    time.sleep(5)
    
    # Step 4: Verify server is running
    print("\n4. Verifying server...")
    try:
        response = requests.get("http://localhost:5000/api/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Server is running!")
            print(f"   Version: {data.get('version', 'Unknown')}")
            print(f"   Status: {data.get('message', 'Unknown')}")
            
            # Open dashboard
            print("\n🌐 Opening dashboard...")
            webbrowser.open("http://localhost:5000/dashboard")
            
            print("\n" + "="*60)
            print("🎉 PLATFORM STARTED SUCCESSFULLY!")
            print("="*60)
            print("\n📊 Access your platform at:")
            print("   Dashboard: http://localhost:5000/dashboard")
            print("   Login: http://localhost:5000/login")
            print("   API Docs: http://localhost:5000/api/docs")
            print("\n🔑 Demo Credentials:")
            print("   Email: admin@agenticai.com")
            print("   Password: Admin123!")
            
            # Keep the server running
            print("\n📝 Server is running. Press Ctrl+C in the server window to stop.")
            
            return True
        else:
            print(f"   ❌ Server returned error: {response.status_code}")
            process.terminate()
            return False
            
    except Exception as e:
        print(f"   ❌ Failed to connect to server: {e}")
        process.terminate()
        return False

if __name__ == "__main__":
    # Add current directory to path
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    
    try:
        success = start_platform()
        if not success:
            print("\n❌ Failed to start platform.")
            print("\n💡 Troubleshooting steps:")
            print("   1. Run: python fix_encoding.py")
            print("   2. Run: python setup_directories.py")
            print("   3. Run: python server_production.py manually")
            print("   4. Check port 5000 is not in use")
    except KeyboardInterrupt:
        print("\n🛑 Launch cancelled")
    except Exception as e:
        print(f"\n❌ Error: {e}")