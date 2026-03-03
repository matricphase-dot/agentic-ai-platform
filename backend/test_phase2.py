import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("?? Testing Phase 2 Endpoints...")
print("=" * 50)

# Test 1: Health endpoint
print("\\n1. Testing /health endpoint...")
try:
    response = client.get("/health")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   ? Error: {e}")

# Test 2: Agent roles
print("\\n2. Testing /agents/agent-roles endpoint...")
try:
    response = client.get("/api/v1/agents/agent-roles")
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   Found {len(data.get('roles', []))} agent roles")
    for role in data.get('roles', []):
        print(f"     - {role['value']}: {role['description']}")
except Exception as e:
    print(f"   ? Error: {e}")

# Test 3: Create workflow
print("\\n3. Testing workflow creation...")
try:
    workflow_data = {
        "name": "Test E-commerce Setup",
        "pattern": "sequential",
        "user_id": "1"
    }
    response = client.post("/api/v1/agents/create-workflow", json=workflow_data)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ? Success! Session ID: {data.get('session_id')}")
        print(f"   Message: {data.get('message')}")
    else:
        print(f"   ? Failed: {response.text}")
except Exception as e:
    print(f"   ? Error: {e}")

print("\\n" + "=" * 50)
print("?? Phase 2 Test Complete!")
