# test_ai.py - Test AI features
import requests
import json

BASE_URL = "http://localhost:5000"

def test_ai_features():
    print("🧪 Testing Agentic AI Platform...")
    
    # 1. Check health
    print("\n1. Checking system health...")
    response = requests.get(f"{BASE_URL}/api/health")
    if response.status_code == 200:
        health = response.json()
        print(f"✅ Status: {health['status']}")
        print(f"📊 Features: {health['features']}")
    else:
        print(f"❌ Health check failed: {response.status_code}")
    
    # 2. Test basic AI generation
    print("\n2. Testing basic AI generation...")
    response = requests.post(f"{BASE_URL}/api/ai/generate")
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Basic AI: {result['message']}")
    else:
        print(f"❌ Basic AI failed: {response.status_code}")
    
    # 3. Test advanced AI generation
    print("\n3. Testing advanced AI generation...")
    task = "Automate organizing my desktop files by type"
    response = requests.post(
        f"{BASE_URL}/api/ai/advanced/generate",
        json={"task": task}
    )
    if response.status_code == 200:
        result = response.json()
        if result.get("success"):
            print(f"✅ Advanced AI: {result.get('message', 'Code generated')}")
            print(f"   Model: {result.get('ai_model', 'unknown')}")
        else:
            print(f"⚠️ Advanced AI fallback: {result.get('error', 'Unknown error')}")
    else:
        print(f"❌ Advanced AI failed: {response.status_code}")
    
    # 4. Test system stats
    print("\n4. Testing system stats...")
    response = requests.get(f"{BASE_URL}/api/system-stats")
    if response.status_code == 200:
        stats = response.json()
        print(f"✅ CPU: {stats['cpu_usage']}%")
        print(f"✅ Memory: {stats['memory_used']}%")
        print(f"✅ Disk: {stats['disk_used']}%")
    else:
        print(f"❌ Stats failed: {response.status_code}")
    
    print("\n🎉 All tests completed!")
    print(f"\n🌐 Dashboard: {BASE_URL}")
    print(f"🤖 AI Automation: {BASE_URL}/ai-automation")

if __name__ == "__main__":
    test_ai_features()