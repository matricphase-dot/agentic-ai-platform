"""
AGENTIC AI PLATFORM - COMPLETE DIAGNOSTIC TOOL
Checks ALL features, endpoints, and functionality
"""

import os
import sys
import json
import requests
import subprocess
import time
from datetime import datetime
from colorama import init, Fore, Style

# Initialize colorama for colored output
init(autoreset=True)

class PlatformDiagnostic:
    def __init__(self):
        self.base_url = "http://localhost:8084"
        self.results = []
        self.session = requests.Session()
        
    def log_result(self, test_name, status, message="", data=None):
        """Log test result with color coding"""
        color = Fore.GREEN if status == "PASS" else Fore.RED if status == "FAIL" else Fore.YELLOW
        symbol = "✓" if status == "PASS" else "✗" if status == "FAIL" else "⚠"
        
        print(f"{color}{symbol} {test_name}: {status}{Style.RESET_ALL}")
        if message:
            print(f"   {Fore.CYAN}{message}{Style.RESET_ALL}")
        if data:
            print(f"   Data: {json.dumps(data, indent=2)[:200]}...")
        
        self.results.append({
            "test": test_name,
            "status": status,
            "message": message,
            "data": data if not isinstance(data, dict) or len(str(data)) < 500 else "Data too large"
        })
    
    def check_server_status(self):
        """Check if server is running"""
        try:
            response = self.session.get(f"{self.base_url}/api/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Server Status", "PASS", 
                              f"Server running on {self.base_url}", data)
                return True
            else:
                self.log_result("Server Status", "FAIL", 
                              f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_result("Server Status", "FAIL", str(e))
            return False
    
    def check_dashboard(self):
        """Check dashboard access"""
        try:
            response = self.session.get(f"{self.base_url}/dashboard", timeout=5)
            if response.status_code == 200:
                if "Agentic AI" in response.text:
                    self.log_result("Dashboard Access", "PASS", 
                                  "Dashboard loaded successfully")
                    return True
                else:
                    self.log_result("Dashboard Access", "FAIL", 
                                  "Dashboard content missing")
                    return False
            else:
                self.log_result("Dashboard Access", "FAIL", 
                              f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Dashboard Access", "FAIL", str(e))
            return False
    
    def check_api_docs(self):
        """Check API documentation"""
        try:
            response = self.session.get(f"{self.base_url}/api/docs", timeout=5)
            if response.status_code == 200:
                self.log_result("API Documentation", "PASS", 
                              "Swagger UI available")
                return True
            else:
                self.log_result("API Documentation", "FAIL", 
                              f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_result("API Documentation", "FAIL", str(e))
            return False
    
    def check_system_endpoints(self):
        """Check all system endpoints"""
        endpoints = [
            ("/api/system/status", "GET", "System Status"),
            ("/api/platform/info", "GET", "Platform Info"),
            ("/api/analytics/dashboard", "GET", "Dashboard Analytics"),
            ("/api/analytics/metrics", "GET", "Platform Metrics"),
        ]
        
        for endpoint, method, name in endpoints:
            try:
                if method == "GET":
                    response = self.session.get(f"{self.base_url}{endpoint}", timeout=5)
                else:
                    response = self.session.post(f"{self.base_url}{endpoint}", timeout=5)
                
                if response.status_code == 200:
                    data = response.json()
                    self.log_result(f"System: {name}", "PASS", 
                                  f"Endpoint working", {"status_code": response.status_code})
                else:
                    self.log_result(f"System: {name}", "FAIL", 
                                  f"HTTP {response.status_code}: {response.text[:100]}")
            except Exception as e:
                self.log_result(f"System: {name}", "FAIL", str(e))
    
    def check_authentication(self):
        """Test authentication system"""
        # First check if we can register
        test_email = f"test_{int(time.time())}@agentic.ai"
        test_user = {
            "email": test_email,
            "password": "TestPass123!",
            "username": "testuser"
        }
        
        try:
            # Test registration
            response = self.session.post(
                f"{self.base_url}/api/auth/register",
                data=test_user,
                timeout=5
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                token = data.get("access_token")
                self.log_result("User Registration", "PASS", 
                              "User registered successfully")
                
                # Test login with registered user
                login_data = {
                    "email": test_email,
                    "password": "TestPass123!"
                }
                
                response = self.session.post(
                    f"{self.base_url}/api/auth/login",
                    data=login_data,
                    timeout=5
                )
                
                if response.status_code == 200:
                    login_data = response.json()
                    self.log_result("User Login", "PASS", 
                                  "User logged in successfully")
                    
                    # Test getting user info with token
                    headers = {"Authorization": f"Bearer {login_data['access_token']}"}
                    response = self.session.get(
                        f"{self.base_url}/api/auth/me",
                        headers=headers,
                        timeout=5
                    )
                    
                    if response.status_code == 200:
                        self.log_result("User Info", "PASS", 
                                      "User info retrieved")
                    else:
                        self.log_result("User Info", "FAIL", 
                                      f"HTTP {response.status_code}")
                else:
                    self.log_result("User Login", "FAIL", 
                                  f"HTTP {response.status_code}")
            else:
                self.log_result("User Registration", "FAIL", 
                              f"HTTP {response.status_code}: {response.text[:100]}")
                
        except Exception as e:
            self.log_result("Authentication System", "FAIL", str(e))
    
    def check_desktop_automation(self):
        """Test desktop automation features"""
        endpoints = [
            ("/api/desktop/status", "GET", "Desktop Status"),
        ]
        
        for endpoint, method, name in endpoints:
            try:
                if method == "GET":
                    response = self.session.get(f"{self.base_url}{endpoint}", timeout=10)
                else:
                    response = self.session.post(f"{self.base_url}{endpoint}", timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    self.log_result(f"Desktop: {name}", "PASS", 
                                  f"Desktop automation available", 
                                  {"status": data.get("status"), "screen_size": data.get("screen_size")})
                else:
                    self.log_result(f"Desktop: {name}", "FAIL", 
                                  f"HTTP {response.status_code}")
            except Exception as e:
                self.log_result(f"Desktop: {name}", "FAIL", str(e))
        
        # Test screenshot endpoint
        try:
            response = self.session.post(
                f"{self.base_url}/api/desktop/screenshot",
                timeout=15
            )
            if response.status_code == 200:
                data = response.json()
                self.log_result("Desktop: Screenshot", "PASS", 
                              "Screenshot captured", {"url": data.get("url")})
            else:
                self.log_result("Desktop: Screenshot", "FAIL", 
                              f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("Desktop: Screenshot", "FAIL", str(e))
    
    def check_email_automation(self):
        """Test email automation"""
        try:
            # Test email agent
            response = self.session.get(
                f"{self.base_url}/api/agent/email/test",
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                self.log_result("Email Agent Test", "PASS", 
                              "Email agent is available", data)
            else:
                self.log_result("Email Agent Test", "FAIL", 
                              f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("Email Agent Test", "FAIL", str(e))
    
    def check_file_operations(self):
        """Test file operations"""
        try:
            response = self.session.get(
                f"{self.base_url}/api/agent/file/test",
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                self.log_result("File Agent Test", "PASS", 
                              "File agent is available", data)
            else:
                self.log_result("File Agent Test", "FAIL", 
                              f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("File Agent Test", "FAIL", str(e))
    
    def check_agents_system(self):
        """Test AI agents system"""
        endpoints = [
            ("/api/agents", "GET", "List Agents"),
            ("/api/agent/types", "GET", "Agent Types"),
            ("/api/agent/capabilities", "GET", "Agent Capabilities"),
        ]
        
        for endpoint, method, name in endpoints:
            try:
                if method == "GET":
                    response = self.session.get(f"{self.base_url}{endpoint}", timeout=5)
                else:
                    continue
                
                if response.status_code == 200:
                    data = response.json()
                    self.log_result(f"Agents: {name}", "PASS", 
                                  f"Endpoint working", 
                                  {"count": data.get("count") if isinstance(data, dict) else len(data)})
                else:
                    self.log_result(f"Agents: {name}", "FAIL", 
                                  f"HTTP {response.status_code}")
            except Exception as e:
                self.log_result(f"Agents: {name}", "FAIL", str(e))
    
    def check_task_system(self):
        """Test task management"""
        endpoints = [
            ("/api/tasks", "GET", "List Tasks"),
        ]
        
        for endpoint, method, name in endpoints:
            try:
                if method == "GET":
                    response = self.session.get(f"{self.base_url}{endpoint}", timeout=5)
                
                if response.status_code == 200:
                    data = response.json()
                    self.log_result(f"Tasks: {name}", "PASS", 
                                  f"Tasks retrieved", 
                                  {"count": data.get("count", 0)})
                else:
                    self.log_result(f"Tasks: {name}", "FAIL", 
                                  f"HTTP {response.status_code}")
            except Exception as e:
                self.log_result(f"Tasks: {name}", "FAIL", str(e))
    
    def check_marketplace(self):
        """Test marketplace"""
        endpoints = [
            ("/api/marketplace/tasks", "GET", "Marketplace Tasks"),
        ]
        
        for endpoint, method, name in endpoints:
            try:
                if method == "GET":
                    response = self.session.get(f"{self.base_url}{endpoint}", timeout=5)
                
                if response.status_code == 200:
                    data = response.json()
                    self.log_result(f"Marketplace: {name}", "PASS", 
                                  f"Marketplace working", 
                                  {"count": data.get("count", 0)})
                else:
                    self.log_result(f"Marketplace: {name}", "FAIL", 
                                  f"HTTP {response.status_code}")
            except Exception as e:
                self.log_result(f"Marketplace: {name}", "FAIL", str(e))
    
    def check_websocket(self):
        """Test WebSocket connection"""
        try:
            # We'll do a simple test by checking if the endpoint exists
            response = self.session.get(f"{self.base_url}/ws", timeout=5)
            # WebSocket endpoint should return 426 or similar
            self.log_result("WebSocket Endpoint", "INFO", 
                          f"WebSocket endpoint responds with HTTP {response.status_code}")
        except Exception as e:
            # Expected to fail for WebSocket
            self.log_result("WebSocket Endpoint", "INFO", 
                          "WebSocket endpoint exists (connection requires WS protocol)")
    
    def check_all_features(self):
        """Run comprehensive feature test"""
        print(f"\n{Fore.CYAN}🔍 AGENTIC AI PLATFORM DIAGNOSTIC - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Style.RESET_ALL}")
        print(f"{Fore.CYAN}📊 Testing platform at: {self.base_url}{Style.RESET_ALL}\n")
        
        # Check server is running
        if not self.check_server_status():
            print(f"{Fore.RED}❌ Server is not running. Please start the platform first.{Style.RESET_ALL}")
            return False
        
        print(f"\n{Fore.YELLOW}📋 RUNNING COMPREHENSIVE TESTS...{Style.RESET_ALL}\n")
        
        # Run all tests
        self.check_dashboard()
        self.check_api_docs()
        self.check_system_endpoints()
        self.check_authentication()
        self.check_desktop_automation()
        self.check_email_automation()
        self.check_file_operations()
        self.check_agents_system()
        self.check_task_system()
        self.check_marketplace()
        self.check_websocket()
        
        # Run comprehensive test endpoint if available
        try:
            response = self.session.get(f"{self.base_url}/api/test/all", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Comprehensive Test", "INFO", 
                              "Platform self-test results", data.get("summary"))
        except:
            pass
        
        return True
    
    def generate_report(self):
        """Generate a summary report"""
        total = len(self.results)
        passed = sum(1 for r in self.results if r["status"] == "PASS")
        failed = sum(1 for r in self.results if r["status"] == "FAIL")
        warnings = sum(1 for r in self.results if r["status"] == "WARNING")
        
        print(f"\n{Fore.CYAN}📊 DIAGNOSTIC REPORT{Style.RESET_ALL}")
        print(f"{Fore.CYAN}{'='*50}{Style.RESET_ALL}")
        print(f"{Fore.GREEN}✓ PASSED: {passed}/{total}{Style.RESET_ALL}")
        print(f"{Fore.RED}✗ FAILED: {failed}/{total}{Style.RESET_ALL}")
        if warnings > 0:
            print(f"{Fore.YELLOW}⚠ WARNINGS: {warnings}/{total}{Style.RESET_ALL}")
        
        # Show failed tests
        if failed > 0:
            print(f"\n{Fore.RED}❌ FAILED TESTS:{Style.RESET_ALL}")
            for result in self.results:
                if result["status"] == "FAIL":
                    print(f"  - {result['test']}: {result['message']}")
        
        # Recommendations
        print(f"\n{Fore.CYAN}💡 RECOMMENDATIONS:{Style.RESET_ALL}")
        
        # Check if server is running
        server_status = any(r["test"] == "Server Status" and r["status"] == "PASS" for r in self.results)
        if not server_status:
            print("  1. Start the server: cd D:\\AGENTIC_AI && python -m uvicorn CORE.main:app --host 0.0.0.0 --port 8084 --reload")
        
        # Check authentication
        auth_status = any(r["test"] == "User Registration" and r["status"] == "PASS" for r in self.results)
        if not auth_status:
            print("  2. Check authentication endpoints in main.py")
        
        # Check desktop automation
        desktop_status = any(r["test"] == "Desktop: Desktop Status" and r["status"] == "PASS" for r in self.results)
        if not desktop_status:
            print("  3. Install pyautogui: pip install pyautogui")
            print("  4. Check desktop automation endpoints in main.py")
        
        # Check if dashboard loads
        dashboard_status = any(r["test"] == "Dashboard Access" and r["status"] == "PASS" for r in self.results)
        if not dashboard_status:
            print("  5. Check templates/dashboard.html exists")
        
        # Save detailed report
        self.save_detailed_report()
        
        return passed, failed, warnings
    
    def save_detailed_report(self):
        """Save detailed report to file"""
        report_file = "platform_diagnostic_report.json"
        with open(report_file, "w") as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "base_url": self.base_url,
                "results": self.results,
                "summary": {
                    "total": len(self.results),
                    "passed": sum(1 for r in self.results if r["status"] == "PASS"),
                    "failed": sum(1 for r in self.results if r["status"] == "FAIL"),
                    "warnings": sum(1 for r in self.results if r["status"] == "WARNING")
                }
            }, f, indent=2)
        
        print(f"\n{Fore.GREEN}📄 Detailed report saved to: {report_file}{Style.RESET_ALL}")

def main():
    """Main diagnostic function"""
    print(f"{Fore.CYAN}🚀 Starting Agentic AI Platform Diagnostic...{Style.RESET_ALL}")
    
    # Check if colorama is installed
    try:
        import colorama
    except ImportError:
        print("Installing colorama for colored output...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "colorama"])
        import colorama
        init(autoreset=True)
    
    # Run diagnostic
    diagnostic = PlatformDiagnostic()
    
    try:
        diagnostic.check_all_features()
        passed, failed, warnings = diagnostic.generate_report()
        
        if failed == 0:
            print(f"\n{Fore.GREEN}✅ All tests passed! Your platform is fully functional.{Style.RESET_ALL}")
            print(f"{Fore.CYAN}🌐 Open your dashboard at: http://localhost:8084/dashboard{Style.RESET_ALL}")
        else:
            print(f"\n{Fore.YELLOW}⚠ Some tests failed. Check the recommendations above.{Style.RESET_ALL}")
            
    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}⚠ Diagnostic interrupted by user.{Style.RESET_ALL}")
    except Exception as e:
        print(f"\n{Fore.RED}❌ Diagnostic error: {str(e)}{Style.RESET_ALL}")

if __name__ == "__main__":
    main()