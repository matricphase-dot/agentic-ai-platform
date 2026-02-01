# D:\AGENTIC_AI\test_auth.py
import requests
import json

BASE_URL = "http://localhost:8080/api"

def test_authentication():
    print("🧪 Testing Authentication System...")
    print("=" * 50)
    
    # Test 1: Register a new user
    print("1. Testing user registration...")
    register_data = {
        "email": "test@agentic.ai",
        "password": "SecurePass123!",
        "plan": "pro"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    
    if response.status_code == 200:
        token_data = response.json()
        print(f"✅ Registration successful!")
        print(f"   User ID: {token_data['user_id']}")
        print(f"   Token: {token_data['access_token'][:30]}...")
        access_token = token_data['access_token']
    else:
        print(f"❌ Registration failed: {response.status_code}")
        print(f"   Error: {response.text}")
        return
    
    # Test 2: Get current user info
    print("\n2. Testing user info endpoint...")
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    
    if response.status_code == 200:
        user_data = response.json()
        print(f"✅ User info retrieved successfully!")
        print(f"   Email: {user_data['email']}")
        print(f"   Plan: {user_data['plan']}")
        print(f"   Credits: {user_data['credits']}")
    else:
        print(f"❌ Failed to get user info: {response.status_code}")
        print(f"   Error: {response.text}")
    
    # Test 3: Test protected endpoint
    print("\n3. Testing protected agent creation...")
    agent_data = {
        "name": "Test Agent",
        "agent_type": "file_organizer",
        "config": {"folder": "./test"}
    }
    
    response = requests.post(f"{BASE_URL}/agents/create", 
                           json=agent_data, 
                           headers=headers)
    
    if response.status_code == 200:
        print(f"✅ Agent created successfully with auth!")
    else:
        print(f"⚠️  Agent creation response: {response.status_code}")
        print(f"   Note: This might be expected if agent logic isn't fully implemented")
    
    # Test 4: Test without authentication
    print("\n4. Testing without authentication (should fail)...")
    response = requests.post(f"{BASE_URL}/agents/create", json=agent_data)
    
    if response.status_code == 401:
        print(f"✅ Correctly blocked unauthorized access!")
    else:
        print(f"❌ Should have returned 401, got {response.status_code}")
    
    # Test 5: Login with credentials
    print("\n5. Testing login...")
    login_data = {
        "email": "test@agentic.ai",
        "password": "SecurePass123!"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    
    if response.status_code == 200:
        print(f"✅ Login successful!")
    else:
        print(f"❌ Login failed: {response.status_code}")
    
    print("\n" + "=" * 50)
    print("✅ Authentication system test completed!")

if __name__ == "__main__":
    test_authentication()