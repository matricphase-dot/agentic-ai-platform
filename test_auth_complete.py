# D:\AGENTIC_AI\test_auth_complete.py
import requests
import json
import time
import sys
import os

BASE_URL = "http://localhost:8082"
TEST_EMAIL = "test@agentic.ai"
TEST_PASSWORD = "SecurePass123!"

def print_header(text):
    print("\n" + "="*60)
    print(f"🧪 {text}")
    print("="*60)

def print_result(success, step, message=""):
    icon = "✅" if success else "❌"
    status = "PASS" if success else "FAIL"
    print(f"{icon} [{status}] {step}")
    if message:
        print(f"   → {message}")
    return success

def test_authentication_complete():
    """Comprehensive authentication test"""
    results = []
    
    print_header("COMPLETE AUTHENTICATION VALIDATION")
    print(f"Testing against: {BASE_URL}")
    print(f"Test user: {TEST_EMAIL}")
    
    # Step 1: Health check (no auth required)
    print_header("1. HEALTH CHECK (Public Endpoint)")
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            results.append(print_result(True, "Health endpoint", f"Status: {health_data.get('status')}"))
            print(f"   Version: {health_data.get('version')}")
            print(f"   Uptime: {health_data.get('uptime')}s")
        else:
            results.append(print_result(False, "Health endpoint", f"Status code: {response.status_code}"))
    except Exception as e:
        results.append(print_result(False, "Health endpoint", f"Error: {str(e)}"))
        print("❌ Cannot connect to server. Make sure it's running!")
        return False
    
    # Step 2: User Registration
    print_header("2. USER REGISTRATION")
    try:
        registration_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "plan": "pro"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=registration_data,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            access_token = data.get("access_token")
            user_id = data.get("user_id")
            api_key = data.get("api_key")
            
            if access_token:
                results.append(print_result(True, "User registration", 
                    f"User ID: {user_id}"))
                print(f"   Token: {access_token[:30]}...")
                print(f"   API Key: {api_key[:20]}...")
                
                # Save token for later tests
                with open("test_token.txt", "w") as f:
                    f.write(access_token)
            else:
                results.append(print_result(False, "User registration", "No token in response"))
        elif response.status_code == 400 and "already registered" in response.text.lower():
            results.append(print_result(True, "User already exists", "Skipping registration"))
            
            # Try to login instead
            print("\n⚠️  User exists, testing login instead...")
            login_data = {
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            }
            
            response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                access_token = data.get("access_token")
                with open("test_token.txt", "w") as f:
                    f.write(access_token)
                print("✅ Login successful, using existing user")
            else:
                results.append(print_result(False, "Login with existing user", 
                    f"Status: {response.status_code}"))
        else:
            results.append(print_result(False, "User registration", 
                f"Status: {response.status_code}, Response: {response.text}"))
    except Exception as e:
        results.append(print_result(False, "User registration", f"Error: {str(e)}"))
    
    # Step 3: Read token from file
    try:
        with open("test_token.txt", "r") as f:
            access_token = f.read().strip()
        
        if not access_token:
            print("❌ No access token available")
            return False
            
        headers = {"Authorization": f"Bearer {access_token}"}
        results.append(print_result(True, "Token loaded", f"Token length: {len(access_token)}"))
    except Exception as e:
        print(f"❌ Cannot load token: {e}")
        return False
    
    # Step 4: Get User Info (Protected Endpoint)
    print_header("3. PROTECTED ENDPOINTS TEST")
    try:
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers, timeout=5)
        
        if response.status_code == 200:
            user_data = response.json()
            results.append(print_result(True, "Get user info", 
                f"Email: {user_data.get('email')}"))
            print(f"   Plan: {user_data.get('plan')}")
            print(f"   Credits: {user_data.get('credits')}")
            print(f"   API Key: {user_data.get('api_key', 'Not found')}")
        else:
            results.append(print_result(False, "Get user info", 
                f"Status: {response.status_code}, Response: {response.text}"))
    except Exception as e:
        results.append(print_result(False, "Get user info", f"Error: {str(e)}"))
    
    # Step 5: Test without token (should fail)
    print_header("4. SECURITY TEST (Without Token)")
    try:
        response = requests.get(f"{BASE_URL}/api/auth/me", timeout=5)
        if response.status_code == 401:
            results.append(print_result(True, "Unauthorized access blocked", 
                "Correctly returned 401"))
        else:
            results.append(print_result(False, "Unauthorized access", 
                f"Should return 401, got {response.status_code}"))
    except Exception as e:
        results.append(print_result(False, "Unauthorized access test", f"Error: {str(e)}"))
    
    # Step 6: Test invalid token (should fail)
    print_header("5. INVALID TOKEN TEST")
    try:
        invalid_headers = {"Authorization": "Bearer invalid_token_12345"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=invalid_headers, timeout=5)
        if response.status_code == 401:
            results.append(print_result(True, "Invalid token rejected", 
                "Correctly returned 401"))
        else:
            results.append(print_result(False, "Invalid token", 
                f"Should return 401, got {response.status_code}"))
    except Exception as e:
        results.append(print_result(False, "Invalid token test", f"Error: {str(e)}"))
    
    # Step 7: Refresh API Key
    print_header("6. API KEY MANAGEMENT")
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/refresh-api-key",
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            api_data = response.json()
            new_api_key = api_data.get("api_key")
            if new_api_key:
                results.append(print_result(True, "API key refresh", 
                    f"New API Key: {new_api_key[:20]}..."))
                
                # Update headers with new API key if needed
                print("   ⚠️  API key refreshed successfully")
            else:
                results.append(print_result(False, "API key refresh", "No API key in response"))
        else:
            results.append(print_result(False, "API key refresh", 
                f"Status: {response.status_code}"))
    except Exception as e:
        results.append(print_result(False, "API key refresh", f"Error: {str(e)}"))
    
    # Step 8: Test Agent Creation (Protected Business Logic)
    print_header("7. BUSINESS LOGIC WITH AUTHENTICATION")
    try:
        agent_data = {
            "name": "Test Agent via Auth",
            "description": "Testing agent creation with authentication",
            "agent_type": "test",
            "skills": ["testing", "validation"]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/agents",
            json=agent_data,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            agent_response = response.json()
            results.append(print_result(True, "Create agent with auth", 
                f"Agent ID: {agent_response.get('agent_id')}"))
        elif response.status_code == 401:
            results.append(print_result(False, "Create agent with auth", 
                "Authentication failed for business endpoint"))
        else:
            results.append(print_result(False, "Create agent with auth", 
                f"Status: {response.status_code}, Response: {response.text}"))
    except Exception as e:
        results.append(print_result(False, "Create agent with auth", f"Error: {str(e)}"))
    
    # Step 9: Test Task Creation (Another Protected Endpoint)
    try:
        task_data = {
            "title": "Test Task via Auth",
            "description": "Testing task creation with authentication",
            "assigned_agent": None
        }
        
        response = requests.post(
            f"{BASE_URL}/api/tasks",
            json=task_data,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            task_response = response.json()
            results.append(print_result(True, "Create task with auth", 
                f"Task ID: {task_response.get('task_id')}"))
        elif response.status_code == 401:
            results.append(print_result(False, "Create task with auth", 
                "Authentication failed for task endpoint"))
        else:
            results.append(print_result(False, "Create task with auth", 
                f"Status: {response.status_code}, Response: {response.text}"))
    except Exception as e:
        results.append(print_result(False, "Create task with auth", f"Error: {str(e)}"))
    
    # Step 10: Test Marketplace (Protected but might be public)
    print_header("8. MARKETPLACE ACCESS CONTROL")
    try:
        response = requests.get(f"{BASE_URL}/api/marketplace/tasks", headers=headers, timeout=5)
        if response.status_code == 200:
            marketplace_data = response.json()
            results.append(print_result(True, "Access marketplace", 
                f"Found {marketplace_data.get('count', 0)} tasks"))
        else:
            results.append(print_result(False, "Access marketplace", 
                f"Status: {response.status_code}"))
    except Exception as e:
        results.append(print_result(False, "Access marketplace", f"Error: {str(e)}"))
    
    # Step 11: Test Analytics Dashboard
    try:
        response = requests.get(f"{BASE_URL}/api/analytics/dashboard", headers=headers, timeout=5)
        if response.status_code == 200:
            analytics_data = response.json()
            results.append(print_result(True, "Access analytics", 
                "Dashboard data retrieved"))
        else:
            results.append(print_result(False, "Access analytics", 
                f"Status: {response.status_code}"))
    except Exception as e:
        results.append(print_result(False, "Access analytics", f"Error: {str(e)}"))
    
    # Step 12: Test System Status (might be public)
    try:
        response = requests.get(f"{BASE_URL}/api/system/status", timeout=5)
        if response.status_code == 200:
            system_data = response.json()
            results.append(print_result(True, "System status", 
                f"Platform: {system_data.get('platform', {}).get('version', 'Unknown')}"))
        else:
            results.append(print_result(False, "System status", 
                f"Status: {response.status_code}"))
    except Exception as e:
        results.append(print_result(False, "System status", f"Error: {str(e)}"))
    
    # Step 13: Test Desktop Automation (if available)
    print_header("9. DESKTOP AUTOMATION (If Enabled)")
    try:
        response = requests.get(f"{BASE_URL}/api/desktop/status", headers=headers, timeout=5)
        if response.status_code == 200:
            desktop_data = response.json()
            results.append(print_result(True, "Desktop status", 
                f"Status: {desktop_data.get('status', 'Unknown')}"))
        elif response.status_code == 404:
            results.append(print_result(False, "Desktop endpoint", 
                "Endpoint not found (might be disabled)"))
        else:
            results.append(print_result(False, "Desktop status", 
                f"Status: {response.status_code}"))
    except Exception as e:
        results.append(print_result(False, "Desktop status", f"Error: {str(e)}"))
    
    # Step 14: Test WebSocket Connection
    print_header("10. WEBSOCKET CONNECTION TEST")
    try:
        import websocket
        import threading
        import time
        
        ws_url = BASE_URL.replace("http", "ws") + "/ws"
        
        def on_message(ws, message):
            print(f"   📨 WebSocket message: {message[:50]}...")
        
        def on_error(ws, error):
            print(f"   ❌ WebSocket error: {error}")
        
        def on_close(ws, close_status_code, close_msg):
            print(f"   🔌 WebSocket closed: {close_status_code}")
        
        def on_open(ws):
            print("   ✅ WebSocket connected")
            # Send a test message
            ws.send(json.dumps({"type": "test", "message": "Hello from auth test"}))
        
        # Try to connect
        ws = websocket.WebSocketApp(
            ws_url,
            on_open=on_open,
            on_message=on_message,
            on_error=on_error,
            on_close=on_close
        )
        
        # Run in separate thread
        wst = threading.Thread(target=ws.run_forever)
        wst.daemon = True
        wst.start()
        
        # Wait a bit for connection
        time.sleep(2)
        
        if ws.sock and ws.sock.connected:
            results.append(print_result(True, "WebSocket connection", "Connected successfully"))
            ws.close()
        else:
            results.append(print_result(False, "WebSocket connection", "Failed to connect"))
            
    except ImportError:
        results.append(print_result(False, "WebSocket test", "websocket-client not installed"))
    except Exception as e:
        results.append(print_result(False, "WebSocket test", f"Error: {str(e)}"))
    
    # Step 15: Test All Features Endpoint
    print_header("11. COMPREHENSIVE FEATURE TEST")
    try:
        response = requests.get(f"{BASE_URL}/api/test/all", headers=headers, timeout=10)
        if response.status_code == 200:
            test_data = response.json()
            passed = test_data.get('passed_tests', 0)
            total = test_data.get('total_tests', 0)
            results.append(print_result(True, "Comprehensive test", 
                f"Passed: {passed}/{total} tests"))
        else:
            results.append(print_result(False, "Comprehensive test", 
                f"Status: {response.status_code}"))
    except Exception as e:
        results.append(print_result(False, "Comprehensive test", f"Error: {str(e)}"))
    
    # FINAL RESULTS
    print_header("📊 FINAL AUTHENTICATION VALIDATION RESULTS")
    
    total_tests = len(results)
    passed_tests = sum(1 for r in results if r)
    failed_tests = total_tests - passed_tests
    
    print(f"✅ PASSED: {passed_tests}/{total_tests}")
    print(f"❌ FAILED: {failed_tests}/{total_tests}")
    
    if failed_tests == 0:
        print("\n🎉 CONGRATULATIONS! Authentication is FULLY SETUP!")
        print("All authentication features are working correctly.")
    else:
        print("\n⚠️  Some authentication tests failed. Need to fix:")
        for i, (success, step, _) in enumerate([r for r in results if not r], 1):
            print(f"   {i}. {step}")
    
    print("\n🔑 TEST CREDENTIALS USED:")
    print(f"   Email: {TEST_EMAIL}")
    print(f"   Password: {TEST_PASSWORD}")
    
    if os.path.exists("test_token.txt"):
        with open("test_token.txt", "r") as f:
            token = f.read()
            print(f"\n📝 TEST TOKEN (for manual testing):")
            print(f"   {token[:50]}...")
    
    return failed_tests == 0

if __name__ == "__main__":
    print("🔍 AGENTIC AI - COMPLETE AUTHENTICATION VALIDATION")
    print("="*60)
    
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=2)
        if response.status_code != 200:
            print("❌ Server is not running or not responding!")
            print(f"   Make sure the server is running at {BASE_URL}")
            print("   Run: python start_fixed.bat")
            sys.exit(1)
    except:
        print("❌ Cannot connect to server!")
        print(f"   Make sure the server is running at {BASE_URL}")
        print("   Run: python start_fixed.bat")
        sys.exit(1)
    
    success = test_authentication_complete()
    
    if success:
        print("\n" + "="*60)
        print("🎯 NEXT STEPS:")
        print("1. Your authentication system is READY FOR PRODUCTION")
        print("2. Test with multiple users simultaneously")
        print("3. Implement rate limiting if needed")
        print("4. Set up SSL/TLS for production")
        print("="*60)
    else:
        print("\n" + "="*60)
        print("🔧 TROUBLESHOOTING:")
        print("1. Check if server logs show authentication errors")
        print("2. Verify JWT_SECRET in .env file")
        print("3. Check database connection")
        print("4. Ensure all endpoints have proper @Depends() decorators")
        print("="*60)
    
    sys.exit(0 if success else 1)