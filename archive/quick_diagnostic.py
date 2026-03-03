# quick_diagnostic.py
import socket
import os

print("🔍 Quick Diagnostic")
print("="*40)

# Check ports
for port in [8080, 8084, 8000]:
    sock = socket.socket()
    sock.settimeout(1)
    result = sock.connect_ex(('localhost', port))
    status = "✅ OPEN" if result == 0 else "❌ CLOSED"
    print(f"Port {port}: {status}")
    sock.close()

print("\n📁 Available Server Files:")
server_files = ['server_production.py', 'server.py', 'CORE/main.py']
for f in server_files:
    if os.path.exists(f):
        size = os.path.getsize(f)
        print(f"  {f:20} ({size:,} bytes)")

print("\n🚀 Recommended startup:")
if os.path.exists('server_production.py'):
    print("  python server_production.py")
elif os.path.exists('server.py'):
    print("  python server.py")
elif os.path.exists('CORE/main.py'):
    print("  python -m uvicorn CORE.main:app --port 8080 --reload")