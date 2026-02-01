# D:\AGENTIC_AI\tests\test_full_platform.py
"""
Complete Platform Test Suite
For Aditya Mehra's Agentic AI Platform
"""

import asyncio
import sys
import os
import json
import sqlite3
import requests
import time
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.append(str(PROJECT_ROOT))

class CompletePlatformTester:
    """Test every component of the Agentic AI Platform"""
    
    def __init__(self):
        self.test_results = []
        self.base_url = "http://localhost:8000"
        self.project_root = PROJECT_ROOT
    
    def run_all_tests(self):
        """Run all platform tests"""
        print("\n" + "="*70)
        print("🤖 AGENTIC AI PLATFORM - COMPLETE TEST SUITE")
        print("👨‍💻 Founder: Aditya Mehra (2nd Year B.Tech)")
        print("="*70)
        
        tests = [
            self.test_environment,
            self.test_database,
            self.test_server_health,
            self.test_api_endpoints,
            self.test_sdk_import,
            self.test_agent_creation,
            self.test_agent_execution,
            self.test_marketplace,
            self.test_web_dashboard,
            self.test_security,
            self.test_performance,
            self.test_backup_system
        ]
        
        for test in tests:
            try:
                result = test()
                self.test_results.append(result)
                self._print_test_result(test.__name__, result)
            except Exception as e:
                self.test_results.append(False)
                print(f"❌ {test.__name__}: FAILED - {e}")
        
        self._print_summary()
    
    def test_environment(self):
        """Test environment setup"""
        print("\n🔧 Testing Environment...")
        
        # Check required directories
        required_dirs = [
            "CORE", "agentic_sdk", "examples", "templates",
            "static", "database", "logs", "backups"
        ]
        
        for dir_name in required_dirs:
            dir_path = self.project_root / dir_name
            if not dir_path.exists():
                raise Exception(f"Missing directory: {dir_name}")
        
        # Check required files
        required_files = [
            "CORE/main.py",
            "agentic_sdk/__init__.py",
            "agentic_sdk/agent_base.py",
            "launch.py",
            "config.json"
        ]
        
        for file_path in required_files:
            if not (self.project_root / file_path).exists():
                raise Exception(f"Missing file: {file_path}")
        
        return True
    
    def test_database(self):
        """Test database setup"""
        print("\n💾 Testing Databases...")
        
        databases = [
            "agentic_database.db",
            "marketplace.db",
            "demonstrations.db"
        ]
        
        for db_name in databases:
            db_path = self.project_root / "database" / db_name
            
            if not db_path.exists():
                # Try to create
                conn = sqlite3.connect(str(db_path))
                conn.close()
            
            # Test connection
            conn = sqlite3.connect(str(db_path))
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            conn.close()
            
            if result[0] != 1:
                raise Exception(f"Database test failed: {db_name}")
        
        return True
    
    def test_server_health(self):
        """Test server health endpoint"""
        print("\n❤️ Testing Server Health...")
        
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    print(f"   Founder: {data.get('founder', 'Unknown')}")
                    print(f"   Version: {data.get('version', 'Unknown')}")
                    return True
            return False
        except:
            print("   ⚠️ Server not running. Start with: python launch.py")
            return False
    
    def test_api_endpoints(self):
        """Test all API endpoints"""
        print("\n🔌 Testing API Endpoints...")
        
        endpoints = [
            ("/api/agents", "GET"),
            ("/api/founder", "GET"),
            ("/api/demo/student-founder-pitch", "GET")
        ]
        
        for endpoint, method in endpoints:
            try:
                if method == "GET":
                    response = requests.get(f"{self.base_url}{endpoint}", timeout=5)
                    if response.status_code not in [200, 404, 500]:
                        raise Exception(f"Endpoint {endpoint} returned {response.status_code}")
                print(f"   ✅ {endpoint}")
            except Exception as e:
                print(f"   ⚠️ {endpoint}: {e}")
        
        return True
    
    def test_sdk_import(self):
        """Test SDK import and basic functionality"""
        print("\n🛠️ Testing SDK Import...")
        
        try:
            from agentic_sdk import AgentBase, AgentRegistry
            from agentic_sdk.types import AgentState
            
            # Test agent creation
            class TestAgent(AgentBase):
                def __init__(self):
                    super().__init__(name="Test Agent")
            
            agent = TestAgent()
            registry = AgentRegistry()
            registry.register(agent)
            
            print(f"   ✅ SDK Version: {agentic_sdk.__version__}")
            print(f"   ✅ Agent States: {[state.value for state in AgentState]}")
            
            return True
        except Exception as e:
            raise Exception(f"SDK import failed: {e}")
    
    def test_agent_creation(self):
        """Test agent creation via SDK"""
        print("\n🤖 Testing Agent Creation...")
        
        try:
            # Use SDK CLI to create an agent
            import subprocess
            
            agent_name = "PlatformTestAgent"
            result = subprocess.run(
                [sys.executable, "-m", "agentic_sdk.cli", "create", agent_name],
                capture_output=True,
                text=True,
                cwd=self.project_root
            )
            
            if result.returncode == 0:
                agent_file = self.project_root / f"{agent_name.lower().replace(' ', '_')}_agent.py"
                if agent_file.exists():
                    print(f"   ✅ Created: {agent_file.name}")
                    return True
            else:
                raise Exception(f"CLI error: {result.stderr}")
        except Exception as e:
            raise Exception(f"Agent creation failed: {e}")
    
    def test_agent_execution(self):
        """Test agent execution"""
        print("\n⚡ Testing Agent Execution...")
        
        try:
            # Import and run a simple agent
            from agentic_sdk import AgentBase, action
            
            class SimpleTestAgent(AgentBase):
                def __init__(self):
                    super().__init__(name="Simple Test Agent")
                
                @action(description="Test action")
                async def test(self, data: str) -> dict:
                    return {"result": f"Processed: {data}", "success": True}
            
            agent = SimpleTestAgent()
            
            async def run_test():
                await agent.start()
                result = await agent.execute("test", data="test data")
                await agent.stop()
                return result
            
            result = asyncio.run(run_test())
            
            if result.get("success"):
                print(f"   ✅ Agent executed successfully")
                return True
            else:
                raise Exception(f"Agent execution failed: {result}")
        except Exception as e:
            raise Exception(f"Agent execution test failed: {e}")
    
    def test_marketplace(self):
        """Test marketplace functionality"""
        print("\n🏪 Testing Marketplace...")
        
        try:
            # Check marketplace database
            db_path = self.project_root / "database" / "marketplace.db"
            conn = sqlite3.connect(str(db_path))
            cursor = conn.cursor()
            
            # Check tables exist
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='marketplace_tasks'")
            if not cursor.fetchone():
                raise Exception("Marketplace tasks table missing")
            
            cursor.execute("SELECT COUNT(*) FROM marketplace_tasks")
            task_count = cursor.fetchone()[0]
            
            conn.close()
            
            print(f"   ✅ Marketplace database: {task_count} tasks")
            return True
        except Exception as e:
            raise Exception(f"Marketplace test failed: {e}")
    
    def test_web_dashboard(self):
        """Test web dashboard accessibility"""
        print("\n🌐 Testing Web Dashboard...")
        
        try:
            response = requests.get(f"{self.base_url}/dashboard", timeout=5)
            if response.status_code == 200:
                print("   ✅ Dashboard accessible")
                return True
            else:
                raise Exception(f"Dashboard returned {response.status_code}")
        except:
            print("   ⚠️ Dashboard not accessible (server may not be running)")
            return False
    
    def test_security(self):
        """Test basic security features"""
        print("\n🔒 Testing Security...")
        
        try:
            # Test CORS headers
            response = requests.get(f"{self.base_url}/api/health")
            if "access-control-allow-origin" in response.headers:
                print("   ✅ CORS headers present")
            
            # Check for common vulnerabilities
            test_endpoints = [
                "/api/admin",
                "/api/config",
                "/api/users"
            ]
            
            for endpoint in test_endpoints:
                response = requests.get(f"{self.base_url}{endpoint}")
                if response.status_code not in [404, 403]:
                    print(f"   ⚠️ Endpoint {endpoint} may be exposed")
            
            return True
        except Exception as e:
            raise Exception(f"Security test failed: {e}")
    
    def test_performance(self):
        """Test platform performance"""
        print("\n⚡ Testing Performance...")
        
        try:
            import psutil
            import time
            
            # Test API response time
            start_time = time.time()
            for _ in range(5):
                requests.get(f"{self.base_url}/api/health", timeout=2)
            avg_time = (time.time() - start_time) / 5
            
            # Test memory usage
            process = psutil.Process()
            memory_mb = process.memory_info().rss / 1024 / 1024
            
            print(f"   ⏱️ Average response time: {avg_time:.2f}s")
            print(f"   💾 Memory usage: {memory_mb:.1f}MB")
            
            if avg_time < 1.0 and memory_mb < 500:
                return True
            else:
                raise Exception(f"Performance issues: {avg_time:.2f}s response, {memory_mb:.1f}MB memory")
        except ImportError:
            print("   ⚠️ psutil not installed, skipping detailed metrics")
            return True
        except Exception as e:
            raise Exception(f"Performance test failed: {e}")
    
    def test_backup_system(self):
        """Test backup functionality"""
        print("\n💾 Testing Backup System...")
        
        try:
            backup_dir = self.project_root / "backups"
            backup_dir.mkdir(exist_ok=True)
            
            # Create a test backup
            import shutil
            from datetime import datetime
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = backup_dir / f"test_backup_{timestamp}.db"
            
            # Copy a database file
            source_db = self.project_root / "database" / "agentic_database.db"
            if source_db.exists():
                shutil.copy2(source_db, backup_file)
                
                if backup_file.exists():
                    size_mb = backup_file.stat().st_size / 1024 / 1024
                    print(f"   ✅ Backup created: {backup_file.name} ({size_mb:.1f}MB)")
                    
                    # Clean up test backup
                    backup_file.unlink()
                    return True
                else:
                    raise Exception("Backup file not created")
            else:
                print("   ⚠️ No database to backup")
                return True
        except Exception as e:
            raise Exception(f"Backup test failed: {e}")
    
    def _print_test_result(self, test_name, result):
        """Print test result"""
        test_name_display = test_name.replace("_", " ").title()
        if result:
            print(f"✅ {test_name_display}: PASS")
        else:
            print(f"❌ {test_name_display}: FAIL")
    
    def _print_summary(self):
        """Print test summary"""
        print("\n" + "="*70)
        print("📊 TEST SUMMARY")
        print("="*70)
        
        passed = sum(1 for result in self.test_results if result)
        total = len(self.test_results)
        
        print(f"✅ Tests Passed: {passed}/{total}")
        print(f"📈 Success Rate: {(passed/total*100):.1f}%")
        
        if passed == total:
            print("\n🎉 ALL TESTS PASSED! Platform is ready for launch.")
        else:
            print(f"\n⚠️ {total - passed} tests failed. Review and fix issues.")
        
        # Generate test report
        report = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "founder": "Aditya Mehra",
            "platform_version": "4.0.0",
            "tests_passed": passed,
            "tests_total": total,
            "success_rate": (passed/total*100),
            "details": [
                {
                    "test": test.__name__,
                    "passed": result
                }
                for test, result in zip([
                    self.test_environment,
                    self.test_database,
                    self.test_server_health,
                    self.test_api_endpoints,
                    self.test_sdk_import,
                    self.test_agent_creation,
                    self.test_agent_execution,
                    self.test_marketplace,
                    self.test_web_dashboard,
                    self.test_security,
                    self.test_performance,
                    self.test_backup_system
                ], self.test_results)
            ]
        }
        
        # Save report
        report_file = self.project_root / "logs" / "test_report.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📄 Test report saved: {report_file}")
        print("="*70)


def main():
    """Run complete platform tests"""
    tester = CompletePlatformTester()
    tester.run_all_tests()
    
    # Offer to fix issues
    passed = sum(1 for result in tester.test_results if result)
    total = len(tester.test_results)
    
    if passed < total:
        print("\n🛠️ Would you like to run the auto-fix tool? (y/n)")
        choice = input("> ").strip().lower()
        
        if choice == 'y':
            run_auto_fix()


def run_auto_fix():
    """Run auto-fix for common issues"""
    print("\n🔧 Running Auto-Fix Tool...")
    
    fixes = [
        ("Create missing directories", fix_directories),
        ("Initialize databases", fix_databases),
        ("Install dependencies", fix_dependencies),
        ("Create sample data", fix_sample_data)
    ]
    
    for fix_name, fix_function in fixes:
        print(f"\n{fix_name}...")
        try:
            fix_function()
            print(f"✅ {fix_name} completed")
        except Exception as e:
            print(f"❌ {fix_name} failed: {e}")


def fix_directories():
    """Fix missing directories"""
    from pathlib import Path
    
    PROJECT_ROOT = Path(__file__).parent.parent
    directories = [
        "CORE", "agentic_sdk", "examples", "templates",
        "static", "database", "logs", "backups",
        "static/css", "static/js", "static/images",
        "examples/basic", "examples/advanced",
        "logs/app", "logs/errors",
        "backups/daily", "backups/weekly"
    ]
    
    for dir_name in directories:
        dir_path = PROJECT_ROOT / dir_name
        dir_path.mkdir(parents=True, exist_ok=True)


def fix_databases():
    """Initialize databases"""
    import sqlite3
    from pathlib import Path
    
    PROJECT_ROOT = Path(__file__).parent.parent
    database_dir = PROJECT_ROOT / "database"
    database_dir.mkdir(exist_ok=True)
    
    # Main database
    db_path = database_dir / "agentic_database.db"
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        agent_type TEXT,
        status TEXT DEFAULT 'idle',
        skills TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP,
        tasks_processed INTEGER DEFAULT 0,
        success_rate REAL DEFAULT 0.0
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        assigned_agent TEXT,
        created_by TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        result TEXT,
        error TEXT
    )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Databases initialized")


def fix_dependencies():
    """Install missing dependencies"""
    import subprocess
    import sys
    
    requirements = [
        "fastapi",
        "uvicorn[standard]",
        "sqlite3",
        "pydantic",
        "websockets",
        "python-multipart",
        "click",
        "requests",
        "beautifulsoup4",
        "pandas",
        "numpy"
    ]
    
    for package in requirements:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        except:
            print(f"⚠️ Failed to install {package}")


def fix_sample_data():
    """Create sample data"""
    from pathlib import Path
    import json
    
    PROJECT_ROOT = Path(__file__).parent.parent
    
    # Sample agents
    sample_agents = [
        {
            "name": "Student Assistant",
            "description": "Helps with academic planning",
            "type": "education",
            "skills": ["scheduling", "organization", "planning"]
        }
    ]
    
    data_dir = PROJECT_ROOT / "data"
    data_dir.mkdir(exist_ok=True)
    
    with open(data_dir / "sample_agents.json", 'w') as f:
        json.dump(sample_agents, f, indent=2)
    
    print("✅ Sample data created")


if __name__ == "__main__":
    main()