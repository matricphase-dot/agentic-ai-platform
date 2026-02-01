# check_connection.py
import socket
import requests
import json
from datetime import datetime
import subprocess

def check_port(host='localhost', port=8080):
    """Check if a port is open"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(2)
    result = sock.connect_ex((host, port))
    sock.close()
    return result == 0

def check_server():
    """Check which server is running and what endpoints are available"""
    print("🔍 CHECKING SERVER STATUS")
    print("="*50)
    
    # Check common ports
    ports = [8080, 8084, 8000, 5000]
    running_on = None
    
    for port in ports:
        if check_port(port=port):
            print(f"✅ Port {port} is OPEN")
            running_on = port
        else:
            print(f"❌ Port {port} is CLOSED")
    
    if not running_on:
        print("\n❌ No server detected on common ports")
        return False
    
    print(f"\n🎯 Server detected on port {running_on}")
    
    # Try to get server info
    try:
        response = requests.get(f"http://localhost:{running_on}/api/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Server is RESPONDING")
            print(f"   Status: {data.get('status', 'Unknown')}")
            print(f"   Message: {data.get('message', 'No message')}")
            print(f"   Version: {data.get('version', 'Unknown')}")
            print(f"   Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
            # Try to get more endpoints
            endpoints = ['/api/agents', '/api/tasks', '/api/marketplace', '/dashboard']
            print(f"\n🔍 Testing endpoints...")
            for endpoint in endpoints:
                try:
                    r = requests.get(f"http://localhost:{running_on}{endpoint}", timeout=3)
                    print(f"   {endpoint:30} → Status: {r.status_code}")
                except:
                    print(f"   {endpoint:30} → ❌ Failed")
            
            return True
        else:
            print(f"❌ Server returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error connecting to server: {e}")
        return False

def check_processes():
    """Check for running Python processes"""
    print("\n🔍 CHECKING RUNNING PROCESSES")
    print("="*50)
    
    try:
        result = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq python*', '/FO', 'CSV'], 
                              capture_output=True, text=True)
        lines = result.stdout.strip().split('\n')
        if len(lines) > 1:
            print("📊 Running Python processes:")
            for line in lines[1:]:  # Skip header
                parts = line.replace('"', '').split(',')
                if len(parts) >= 2:
                    print(f"   PID: {parts[1]:10} | Name: {parts[0]}")
        else:
            print("No Python processes found")
    except Exception as e:
        print(f"Error checking processes: {e}")

def main():
    print("🚀 AGENTIC AI PLATFORM - SERVER DIAGNOSTIC")
    print("="*50)
    
    check_server()
    check_processes()
    
    print("\n" + "="*50)
    print("💡 RECOMMENDATIONS:")
    print("1. If port 8080 is open but not responding, server may have crashed")
    print("2. If no ports open, start server: python server_production.py")
    print("3. If port 8084 is expected, check .env or config files")
    print("\nTry: python -m uvicorn CORE.main:app --host 0.0.0.0 --port 8080 --reload")

if __name__ == "__main__":
    main()