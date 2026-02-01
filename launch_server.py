# launch_server.py
import subprocess
import sys
import time
import socket
import webbrowser

def check_port(port=8080):
    """Check if port is in use"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(1)
    result = sock.connect_ex(('localhost', port))
    sock.close()
    return result == 0

def start_server():
    print("🚀 Starting Agentic AI Platform...")
    print("="*50)
    
    if check_port(8080):
        print("❌ Port 8080 is already in use!")
        print("   Another server might be running or another app using this port.")
        return False
    
    # Try different startup methods
    print("🔄 Starting server_production.py...")
    
    try:
        # Try to run server_production.py directly
        process = subprocess.Popen(
            [sys.executable, "server_production.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait a bit for server to start
        print("⏳ Waiting for server to start...")
        time.sleep(3)
        
        if check_port(8080):
            print("✅ Server started successfully on port 8080!")
            print("\n🌐 Dashboard: http://localhost:8080/dashboard")
            print("📚 API Docs: http://localhost:8080/api/docs")
            print("❤️  Health: http://localhost:8080/api/health")
            
            # Open dashboard in browser
            webbrowser.open("http://localhost:8080/dashboard")
            
            print("\n📋 Server is running. Press Ctrl+C to stop.")
            try:
                # Keep the server running
                process.wait()
            except KeyboardInterrupt:
                print("\n🛑 Stopping server...")
                process.terminate()
            
            return True
        else:
            print("❌ Server failed to start on port 8080")
            process.terminate()
            return False
            
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return False

if __name__ == "__main__":
    start_server()