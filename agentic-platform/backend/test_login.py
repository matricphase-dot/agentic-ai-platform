import sys
import os

# Check if requests is installed
try:
    import requests
except ImportError:
    print("Installing requests module...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests

def test_backend():
    print("🧪 Testing Agentic AI Backend API...")
    print("=" * 50)
    
    # Test 1: Health endpoint
    print("\n1️⃣  Testing health endpoint...")
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print(f"✅ Health check: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        print("   Make sure the backend is running:")
        print("   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
        return False
    
    # Test 2: Login endpoint
    print("\n2️⃣  Testing login endpoint...")
    try:
        login_data = {
            "email": "admin@agenticai.com",
            "password": "Admin123!"
        }
        response = requests.post(
            "http://localhost:8000/api/v1/auth/login",
            json=login_data,
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Login successful!")
            print(f"   Token: {result['access_token'][:30]}...")
            print(f"   User: {result['user']['name']} ({result['user']['email']})")
            
            # Test 3: Protected endpoint
            print("\n3️⃣  Testing protected endpoint...")
            headers = {"Authorization": f"Bearer {result['access_token']}"}
            me_response = requests.get(
                "http://localhost:8000/api/v1/auth/me",
                headers=headers,
                timeout=5
            )
            
            if me_response.status_code == 200:
                user_info = me_response.json()
                print(f"✅ User info retrieved successfully!")
                print(f"   ID: {user_info['id']}")
                print(f"   Name: {user_info['name']}")
                print(f"   Email: {user_info['email']}")
            else:
                print(f"❌ Failed to get user info: {me_response.status_code}")
            
            return True
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
            # Try to register first
            print("\n🔄 Attempting to register admin user...")
            register_data = {
                "email": "admin@agenticai.com",
                "password": "Admin123!",
                "name": "Admin User"
            }
            register_response = requests.post(
                "http://localhost:8000/api/v1/auth/register",
                json=register_data,
                timeout=5
            )
            
            if register_response.status_code == 200:
                print(f"✅ Admin user registered!")
                print("   Please run the test again.")
            else:
                print(f"❌ Registration failed: {register_response.status_code}")
                print(f"   Response: {register_response.text}")
            
            return False
            
    except Exception as e:
        print(f"❌ Error during login test: {e}")
        return False

if __name__ == "__main__":
    if test_backend():
        print("\n" + "=" * 50)
        print("🎉 All tests passed! Backend is working correctly.")
        print("=" * 50)
    else:
        print("\n" + "=" * 50)
        print("❌ Some tests failed. Please check the errors above.")
        print("=" * 50)