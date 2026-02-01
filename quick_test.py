# D:\AGENTIC_AI\quick_test.py
import requests
import json
import time

BASE_URL = "http://localhost:8080"

def test_endpoint(endpoint, name):
    try:
        response = requests.get(f"{BASE_URL}{endpoint}", timeout=5)
        if response.status_code == 200:
            print(f"✅ {name}: SUCCESS")
            return True
        else:
            print(f"❌ {name}: Status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ {name}: ERROR - {str(e)[:50]}")
        return False

print("🧪 AGENTIC AI - QUICK TEST")
print("="*50)

endpoints = [
    ("/api/health", "Health Check"),
    ("/api/system/status", "System Status"),
    ("/api/agents", "List Agents"),
    ("/api/tasks", "List Tasks"),
    ("/api/marketplace/tasks", "Marketplace Tasks"),
    ("/api/desktop/status", "Desktop Automation"),
    ("/dashboard", "Dashboard"),
]

all_passed = True
for endpoint, name in endpoints:
    passed = test_endpoint(endpoint, name)
    all_passed = all_passed and passed
    time.sleep(0.5)

print("\n" + "="*50)
if all_passed:
    print("🎉 ALL TESTS PASSED!")
    print("\n🌐 Platform is fully operational!")
    print("📊 Dashboard: http://localhost:8080/dashboard")
    print("📚 API Docs: http://localhost:8080/api/docs")
    print("🤖 Agents: http://localhost:8080/api/agents")
else:
    print("⚠️ Some tests failed")

print("\n🔗 Quick Links:")
print("1. Open Dashboard: start http://localhost:8080/dashboard")
print("2. Test Desktop Automation: curl http://localhost:8080/api/desktop/screenshot")
print("3. Create Task: curl -X POST http://localhost:8080/api/tasks -d \"title=Test&description=Test\"")