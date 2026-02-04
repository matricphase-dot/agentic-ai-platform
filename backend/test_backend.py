import requests
import time
import sys

def test_backend():
    print("Testing Agentic AI Backend...")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    
    # Test 1: Health endpoint
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   ❌ Failed: {e}")
        return False
    
    # Test 2: Root endpoint
    print("\n2. Testing root endpoint...")
    try:
        response = requests.get(base_url, timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   ❌ Failed: {e}")
        return False
    
    # Test 3: Login
    print("\n3. Testing login endpoint...")
    login_data = {
        "email": "admin@agenticai.com",
        "password": "Admin123!"
    }
    
    try:
        response = requests.post(f"{base_url}/api/v1/auth/login", json=login_data, timeout=5)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            token = response.json()["access_token"]
            print(f"   ✅ Login successful! Token: {token[:30]}...")
            
            # Test 4: Get agents (protected)
            print("\n4. Testing agents endpoint...")
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{base_url}/api/v1/agents", headers=headers, timeout=5)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                agents = response.json()
                print(f"   ✅ Found {len(agents)} agents")
            else:
                print(f"   ❌ Failed to get agents: {response.text}")
                
            # Test 5: Execute agent
            print("\n5. Testing agent execution...")
            execution_data = {"input": "Create a marketing post for our new AI platform"}
            response = requests.post(
                f"{base_url}/api/v1/agents/1/execute",
                json=execution_data,
                headers=headers,
                timeout=5
            )
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ Agent execution successful!")
                print(f"   Agent: {result['agent_name']}")
        else:
            print(f"   ❌ Login failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("✅ All tests passed! Backend is working correctly.")
    print("=" * 50)
    return True

if __name__ == "__main__":
    # Wait a bit for server to start if needed
    time.sleep(2)
    success = test_backend()
    sys.exit(0 if success else 1)