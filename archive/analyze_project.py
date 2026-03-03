import os
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime

def analyze_project():
    """Generate complete project analysis for your Agentic AI Platform"""
    
    print("🔍 AGENTIC AI PLATFORM - COMPREHENSIVE ANALYSIS")
    print("="*70)
    
    project_path = Path(".").absolute()
    print(f"Project Location: {project_path}")
    
    # 1. Analyze file structure
    print("\n📁 PROJECT STRUCTURE ANALYSIS")
    print("-"*40)
    
    python_files = []
    module_folders = []
    total_size = 0
    
    for root, dirs, files in os.walk(project_path):
        # Skip virtual environments and cache
        dirs[:] = [d for d in dirs if not d.startswith(('.', '__', 'venv', 'env'))]
        
        level = root.replace(str(project_path), '').count(os.sep)
        indent = ' ' * 2 * level
        
        print(f"{indent}{os.path.basename(root) or 'ROOT'}/")
        
        for file in files:
            if not file.startswith('.') and not file.endswith(('.pyc', '.tmp')):
                file_path = Path(root) / file
                file_size = file_path.stat().st_size if file_path.exists() else 0
                total_size += file_size
                
                if file.endswith('.py'):
                    python_files.append(file_path)
                    print(f"{indent}  📄 {file} ({file_size/1024:.1f} KB)")
                elif file.endswith(('.html', '.css', '.js')):
                    print(f"{indent}  🌐 {file}")
                elif file.endswith(('.json', '.yaml', '.yml')):
                    print(f"{indent}  ⚙️  {file}")
                else:
                    print(f"{indent}  📋 {file}")
    
    # 2. Check critical components
    print("\n✅ CRITICAL COMPONENTS CHECK")
    print("-"*40)
    
    critical_files = {
        "Main Application": ["main.py", "orchestrator.py"],
        "Web Dashboard": ["unified_dashboard.py", "dashboard.html"],
        "API Layer": ["agentic_api.py", "enhanced_api.py"],
        "Deployment": ["deployment_packager.py", "requirements.txt"],
        "Version Control": ["version_manager.py"],
        "Database": ["database_setup.py", "agentic_database.db"]
    }
    
    found = 0
    total_checks = 0
    
    for component, files in critical_files.items():
        total_checks += len(files)
        component_status = []
        
        for file in files:
            if (project_path / file).exists():
                found += 1
                component_status.append(f"✅ {file}")
            else:
                component_status.append(f"❌ {file}")
        
        print(f"{component}: {', '.join(component_status)}")
    
    # 3. Check module structure
    print("\n🤖 MODULE DIRECTORY CHECK")
    print("-"*40)
    
    module_dirs = ["modules", "templates", "static", "automations", "workflows"]
    
    for module in module_dirs:
        module_path = project_path / module
        if module_path.exists() and module_path.is_dir():
            items = list(module_path.iterdir())
            item_count = len([i for i in items if not i.name.startswith('.')])
            print(f"📁 {module}/ - {item_count} items")
            
            # List top 5 items
            for item in items[:5]:
                if not item.name.startswith('.'):
                    if item.is_dir():
                        print(f"   ├── 📂 {item.name}/")
                    else:
                        print(f"   ├── 📄 {item.name}")
            if len(items) > 5:
                print(f"   └── ... {len(items)-5} more items")
        else:
            print(f"❌ {module}/ - Directory not found")
    
    # 4. Analyze requirements
    print("\n📦 DEPENDENCIES CHECK")
    print("-"*40)
    
    req_file = project_path / "requirements.txt"
    if req_file.exists():
        with open(req_file, 'r') as f:
            requirements = [line.strip() for line in f if line.strip() and not line.startswith('#')]
            print(f"Found {len(requirements)} dependencies")
            
            # Categorize dependencies
            categories = {
                "Web Framework": ["fastapi", "flask", "django", "uvicorn"],
                "AI/ML": ["openai", "langchain", "transformers", "torch", "tensorflow"],
                "Automation": ["pyautogui", "selenium", "pywin32", "opencv-python"],
                "Database": ["sqlalchemy", "psycopg2", "pymongo", "redis"],
                "Utilities": ["requests", "pandas", "numpy", "python-dotenv"]
            }
            
            for category, keywords in categories.items():
                cat_deps = []
                for req in requirements:
                    for keyword in keywords:
                        if keyword in req.lower():
                            cat_deps.append(req.split('==')[0] if '==' in req else req)
                            break
                if cat_deps:
                    print(f"  {category}: {', '.join(cat_deps)}")
    else:
        print("❌ requirements.txt not found")
    
    # 5. Test API endpoints if available
    print("\n🌐 API ENDPOINTS CHECK")
    print("-"*40)
    
    api_files = ["agentic_api.py", "enhanced_api.py", "main.py"]
    endpoints_found = []
    
    for api_file in api_files:
        file_path = project_path / api_file
        if file_path.exists():
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                    
                    # Look for FastAPI or Flask routes
                    import re
                    fastapi_routes = re.findall(r'@app\.(get|post|put|delete)\(["\']([^"\']+)["\']', content)
                    flask_routes = re.findall(r'@app\.route\(["\']([^"\']+)["\']', content)
                    
                    if fastapi_routes:
                        for method, path in fastapi_routes:
                            endpoints_found.append(f"{method.upper()} {path}")
                    elif flask_routes:
                        for path in flask_routes:
                            endpoints_found.append(f"GET {path}")
            except Exception as e:
                pass
    
    if endpoints_found:
        print(f"Found {len(endpoints_found)} API endpoints:")
        for endpoint in endpoints_found[:10]:  # Show first 10
            print(f"  🔗 {endpoint}")
        if len(endpoints_found) > 10:
            print(f"  ... and {len(endpoints_found)-10} more")
    else:
        print("No API endpoints detected in code")
    
    # 6. Deployment readiness check
    print("\n🚀 DEPLOYMENT READINESS CHECK")
    print("-"*40)
    
    deployment_files = {
        "Dockerfile": project_path / "Dockerfile",
        "docker-compose.yml": project_path / "docker-compose.yml",
        "railway.toml": project_path / "railway.toml",
        "render.yaml": project_path / "render.yaml",
        ".env.example": project_path / ".env.example",
        "README.md": project_path / "README.md"
    }
    
    ready_count = 0
    for name, path in deployment_files.items():
        if path.exists():
            print(f"✅ {name}")
            ready_count += 1
        else:
            print(f"❌ {name}")
    
    # 7. Generate summary report
    print("\n📊 PROJECT SUMMARY")
    print("="*70)
    
    # Calculate metrics
    total_files = sum([len(files) for r, d, files in os.walk(project_path)])
    py_line_count = 0
    
    for py_file in python_files:
        try:
            with open(py_file, 'r') as f:
                py_line_count += len(f.readlines())
        except:
            pass
    
    print(f"📁 Total Files: {total_files}")
    print(f"🐍 Python Files: {len(python_files)}")
    print(f"📝 Total Python Lines: {py_line_count:,}")
    print(f"💾 Project Size: {total_size/(1024*1024):.1f} MB")
    print(f"✅ Critical Files: {found}/{total_checks}")
    print(f"🚀 Deployment Ready: {ready_count}/{len(deployment_files)}")
    
    # Calculate readiness score
    readiness = (found / total_checks * 0.6 + ready_count / len(deployment_files) * 0.4) * 100
    
    print(f"\n📈 OVERALL READINESS: {readiness:.1f}%")
    
    if readiness > 80:
        print("🎉 Excellent! Your project is deployment-ready!")
        next_steps = ["Deploy to Railway.app", "Setup CI/CD", "Get first users"]
    elif readiness > 60:
        print("🚀 Good progress! Focus on deployment files next.")
        next_steps = ["Add missing deployment configs", "Test locally", "Prepare for deployment"]
    elif readiness > 40:
        print("📚 Project has good foundation. Need to complete critical components.")
        next_steps = ["Complete core modules", "Add API endpoints", "Create deployment package"]
    else:
        print("🛠️ Foundational phase. Focus on core development.")
        next_steps = ["Build core features", "Create web interface", "Setup version control"]
    
    print("\n🎯 RECOMMENDED NEXT STEPS:")
    for i, step in enumerate(next_steps, 1):
        print(f"  {i}. {step}")
    
    # Save report to file
    report_file = project_path / "project_analysis_report.txt"
    with open(report_file, 'w') as f:
        f.write(str(sys.stdout))
    
    print(f"\n📋 Full report saved to: {report_file}")
    print("\n📤 SHARE THIS OUTPUT WITH ME:")
    print("1. Copy everything from '🔍 AGENTIC AI PLATFORM' to the end")
    print("2. Paste it in your next message")
    print("3. I'll provide a customized 7-day launch plan")

if __name__ == "__main__":
    analyze_project()