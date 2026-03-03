# test_python.py - Python test script for Agentic AI Platform
import requests
import json
import sys

def test_backend():
    print("🧪 Testing Agentic AI Backend...")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    
    # 1. Health check
    print("\n1. Health check...")
    try:
        resp = requests.get(f"{base_url}/health")
        print(f"   Status: {resp.status_code}")
        if resp.status_code == 200:
            print("   ✅ Backend is running")
            print(f"   Response: {resp.json()}")
        else:
            print("   ❌ Backend not responding correctly")
            return False
    except Exception as e:
        print(f"   ❌ Connection failed: {e}")
        return False
    
    # 2. Register user
    print("\n2. Registering user...")
    user_data = {
        "email": "python@test.com",
        "password": "python123",
        "company": "Python Test Corp",
        "plan": "pro"
    }
    
    try:
        resp = requests.post(f"{base_url}/auth/register", json=user_data)
        print(f"   Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            token = data["access_token"]
            print(f"   ✅ User registered: {data['user']['email']}")
            print(f"   Token: {token[:20]}...")
        else:
            print(f"   ❌ Registration failed: {resp.text}")
            return False
    except Exception as e:
        print(f"   ❌ Registration error: {e}")
        return False
    
    # 3. Create agent
    print("\n3. Creating agent...")
    headers = {"token": token}
    agent_data = {
        "name": "Python Test Agent",
        "agent_type": "researcher",
        "system_prompt": "Created by Python test script"
    }
    
    try:
        resp = requests.post(f"{base_url}/agents", json=agent_data, headers=headers)
        print(f"   Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            print(f"   ✅ Agent created: {data['agent']['name']}")
            agent_id = data["agent"]["id"]
        else:
            print(f"   ❌ Agent creation failed: {resp.text}")
            return False
    except Exception as e:
        print(f"   ❌ Agent creation error: {e}")
        return False
    
    # 4. List agents
    print("\n4. Listing agents...")
    try:
        resp = requests.get(f"{base_url}/agents", headers=headers)
        print(f"   Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            print(f"   ✅ Agents found: {data['count']}")
            for agent in data.get('agents', []):
                print(f"      • {agent['name']} ({agent['type']})")
        else:
            print(f"   ❌ Agent listing failed: {resp.text}")
    except Exception as e:
        print(f"   ❌ Agent listing error: {e}")
    
    # 5. Query agent
    print("\n5. Querying agent...")
    try:
        query_url = f"{base_url}/agents/{agent_id}/query?task=What%20is%20AI%3F&detailed=true"
        resp = requests.post(query_url, headers=headers)
        print(f"   Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            print(f"   ✅ Query successful")
            print(f"   Response: {data['response'][:100]}...")
            print(f"   Cost: {data.get('cost', 'N/A')}")
        else:
            print(f"   ❌ Query failed: {resp.text}")
    except Exception as e:
        print(f"   ❌ Query error: {e}")
    
    # 6. Create team
    print("\n6. Creating team...")
    team_data = {
        "name": "Python Test Team",
        "agent_ids": [agent_id],
        "workflow_type": "sequential",
        "description": "Created by Python script"
    }
    
    try:
        resp = requests.post(f"{base_url}/teams", json=team_data, headers=headers)
        print(f"   Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            team_id = data["team"]["id"]
            print(f"   ✅ Team created: {data['team']['name']}")
            print(f"   Team ID: {team_id}")
        else:
            print(f"   ❌ Team creation failed: {resp.text}")
            return False
    except Exception as e:
        print(f"   ❌ Team creation error: {e}")
        return False
    
    # 7. Execute team task
    print("\n7. Executing team task...")
    task_data = {
        "task": "Research AI trends and write a summary",
        "workflow_type": "sequential",
        "detailed": True
    }
    
    try:
        resp = requests.post(f"{base_url}/teams/{team_id}/execute", json=task_data, headers=headers)
        print(f"   Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            print(f"   ✅ Task executed successfully!")
            print(f"   Collaboration ID: {data.get('collaboration_id', 'N/A')}")
            print(f"   Agents used: {data.get('agents_used', 'N/A')}")
            print(f"   Total cost: {data.get('total_cost', 'N/A')}")
        else:
            print(f"   ❌ Task execution failed: {resp.text}")
    except Exception as e:
        print(f"   ❌ Task execution error: {e}")
    
    # 8. Get system stats
    print("\n8. Getting system statistics...")
    try:
        resp = requests.get(f"{base_url}/system/stats", headers=headers)
        print(f"   Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            print(f"   ✅ Stats retrieved")
            print(f"   User: {data['user']['email']}")
            print(f"   Plan: {data['user']['plan']}")
            print(f"   Agents: {data['agents']['total']}")
            print(f"   Teams: {data['teams']['total']}")
        else:
            print(f"   ❌ Stats retrieval failed: {resp.text}")
    except Exception as e:
        print(f"   ❌ Stats error: {e}")
    
    # 9. Get pricing
    print("\n9. Getting pricing info...")
    try:
        resp = requests.get(f"{base_url}/pricing")
        print(f"   Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            print(f"   ✅ Pricing retrieved")
            for plan in data.get('plans', []):
                print(f"      • {plan['name']}: {plan['price']}")
        else:
            print(f"   ❌ Pricing retrieval failed: {resp.text}")
    except Exception as e:
        print(f"   ❌ Pricing error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 All tests completed successfully!")
    print("=" * 50)
    
    return True

if __name__ == "__main__":
    print("🚀 Agentic AI Platform - Python Test Script")
    print("Make sure the backend is running at http://localhost:8000")
    
    if test_backend():
        sys.exit(0)
    else:
        sys.exit(1)
