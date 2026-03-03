# check_server.py
import socket
import os
import sys

def check_ports():
    print("🔍 Checking server ports...")
    ports = [8080, 8084, 8000, 5000, 8081]
    for port in ports:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex(('localhost', port))
        if result == 0:
            print(f"✅ Port {port} is OPEN - Server is running!")
            sock.close()
            return port
        sock.close()
    print("❌ No server detected on common ports")
    return None

def check_which_server():
    print("\n📋 Checking server files...")
    server_files = {
        'server_production.py': 'Production server',
        'server.py': 'Main server', 
        'CORE/main.py': 'Core FastAPI app',
        'run.py': 'Runner script',
        'run_platform.py': 'Platform runner'
    }
    
    for file, desc in server_files.items():
        if os.path.exists(file):
            size = os.path.getsize(file)
            print(f"  {desc:20} → {file:25} ({size:,} bytes)")
    
    return [f for f in server_files.keys() if os.path.exists(f)]

def main():
    print("="*60)
    print("🛠️  AGENTIC AI PLATFORM - SERVER DIAGNOSTIC")
    print("="*60)
    
    # Check if server is running
    port = check_ports()
    
    # Check available server files
    available = check_which_server()
    
    print("\n" + "="*60)
    print("🚀 RECOMMENDED START COMMANDS:")
    print("="*60)
    
    if port:
        print(f"\n✅ Server is already running on port {port}")
        print(f"   Dashboard: http://localhost:{port}/dashboard")
        print(f"   API Docs: http://localhost:{port}/api/docs")
        print(f"   Health: http://localhost:{port}/api/health")
    else:
        print("\n❌ No server detected. Start one of these:")
        if 'server_production.py' in available:
            print(f"   1. python server_production.py")
        if 'server.py' in available:
            print(f"   2. python server.py")
        if 'CORE/main.py' in available:
            print(f"   3. python -m uvicorn CORE.main:app --host 0.0.0.0 --port 8080 --reload")
        if 'run_platform.py' in available:
            print(f"   4. python run_platform.py")
    
    print("\n" + "="*60)
    print("📊 For testing, open in browser:")
    print("   http://localhost:8080/dashboard")
    print("="*60)

if __name__ == "__main__":
    main()