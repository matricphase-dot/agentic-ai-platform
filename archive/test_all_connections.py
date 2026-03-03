# test_all_connections.py
import requests
import json
import socket
import os
from datetime import datetime

def test_endpoint(base_url, endpoint, method='GET', data=None):
    """Test a single endpoint"""
    url = f"{base_url}{endpoint}"
    try:
        if method == 'GET':
            response = requests.get(url, timeout=5)
        elif method == 'POST':
            response = requests.post(url, json=data, timeout=5)
        
        if response.status_code == 200:
            try:
                data = response.json()
                return True, f"✅ {endpoint:30} - Status: {response.status_code}", data
            except:
                return True, f"✅ {endpoint:30} - Status: {response.status_code} (HTML)", None
        else:
            return False, f"❌ {endpoint:30} - Status: {response.status_code}", None
    except Exception as e:
        return False, f"❌ {endpoint:30} - Error: {str(e)[:50]}", None

def test_all_connections():
    base_url = "http://localhost:5000"
    print("🔗 TESTING ALL PLATFORM CONNECTIONS")
    print("="*60)
    
    endpoints = [
        # Core endpoints
        ('/api/health', 'GET'),
        ('/api/agents', 'GET'),
        ('/api/tasks', 'GET'),
        ('/api/marketplace/tasks', 'GET'),
        ('/api/analytics', 'GET'),
        
        # Dashboard pages
        ('/dashboard', 'GET'),
        ('/login', 'GET'),
        ('/product_hunt', 'GET'),
        ('/api/docs', 'GET'),
        
        # Agent endpoints
        ('/api/agents/list', 'GET'),
        ('/api/tasks/create', 'POST'),
        ('/api/marketplace/create', 'POST'),
    ]
    
    results = []
    for endpoint, method in endpoints:
        success, message, data = test_endpoint(base_url, endpoint, method)
        results.append((success, message))
        print(message)
        
        # If we got data, show a preview
        if data and isinstance(data, dict) and len(data) > 0:
            print(f"   Data: {json.dumps(data)[:100]}...")
    
    print("\n" + "="*60)
    print("📊 CONNECTION SUMMARY")
    print("="*60)
    
    total = len(results)
    passed = sum(1 for success, _ in results if success)
    failed = total - passed
    
    print(f"Total endpoints tested: {total}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    
    if failed > 0:
        print("\n⚠️  Failed endpoints:")
        for success, message in results:
            if not success:
                print(f"   {message}")
    
    # Check static files
    print("\n📁 CHECKING STATIC FILES")
    print("="*60)
    
    static_files = ['static/css/style.css', 'static/js/dashboard.js', 'static/images/logo.png']
    for file in static_files:
        if os.path.exists(file):
            size = os.path.getsize(file)
            print(f"✅ {file:30} - {size:,} bytes")
        else:
            print(f"❌ {file:30} - MISSING")
    
    return passed, total

if __name__ == "__main__":
    test_all_connections()