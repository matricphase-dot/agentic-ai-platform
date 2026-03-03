# D:\AGENTIC_AI\maintenance.py
import os
import shutil
import datetime
from pathlib import Path

def analyze_current_main():
    """Analyze the current main.py file"""
    project_root = Path(__file__).parent
    main_py = project_root / "CORE" / "main.py"
    
    if not main_py.exists():
        print("❌ main.py not found!")
        return None
    
    print("🔍 ANALYZING CURRENT MAIN.PY")
    print("="*50)
    
    with open(main_py, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stats = {
        'file_size_kb': os.path.getsize(main_py) / 1024,
        'line_count': len(content.splitlines()),
        'character_count': len(content),
        'import_count': content.count('import ') + content.count('from '),
        'function_count': content.count('def '),
        'class_count': content.count('class '),
        'route_count': content.count('@app.'),
        'feature_flags': {}
    }
    
    # Check for features
    features = {
        'Authentication': 'auth' in content.lower() or 'jwt' in content.lower() or 'token' in content.lower(),
        'Database': 'database' in content.lower() or 'sql' in content.lower(),
        'WebSocket': 'websocket' in content.lower(),
        'Desktop Automation': 'pyautogui' in content.lower(),
        'Multiple Agents': 'agent' in content.lower() and content.count('agent') > 5,
        'Task Marketplace': 'marketplace' in content.lower(),
        'API Endpoints': content.count('@app.') > 10,
    }
    
    print(f"📊 File Statistics:")
    print(f"   Size: {stats['file_size_kb']:.1f} KB")
    print(f"   Lines: {stats['line_count']:,}")
    print(f"   Characters: {stats['character_count']:,}")
    print(f"   Functions: {stats['function_count']}")
    print(f"   Classes: {stats['class_count']}")
    print(f"   API Routes: {stats['route_count']}")
    
    print("\n✅ Features Detected:")
    for feature, present in features.items():
        icon = "✅" if present else "❌"
        print(f"   {icon} {feature}")
        stats['feature_flags'][feature] = present
    
    print("\n📋 Import Analysis:")
    lines = content.splitlines()
    imports = [line for line in lines if line.strip().startswith(('import ', 'from '))]
    for imp in imports[:15]:  # Show first 15 imports
        print(f"   {imp}")
    
    if len(imports) > 15:
        print(f"   ... and {len(imports) - 15} more imports")
    
    return stats

def create_feature_checklist():
    """Create a feature checklist"""
    checklist = {
        "Authentication System": [
            "User registration endpoint",
            "User login endpoint", 
            "JWT token generation",
            "Password hashing",
            "Protected endpoints",
            "User profile endpoint"
        ],
        "Database": [
            "Database connection",
            "User table/model",
            "Agent table/model",
            "Task table/model",
            "Data persistence",
            "Relationships between tables"
        ],
        "Core Agents": [
            "File Organizer Agent",
            "Student Assistant Agent",
            "Email Automation Agent",
            "Web Navigator Agent",
            "Marketplace Connector",
            "Data Analysis Agent"
        ],
        "API Endpoints": [
            "Health check endpoint",
            "Agent management endpoints",
            "Task management endpoints",
            "Marketplace endpoints",
            "Analytics endpoints",
            "System status endpoint",
            "Desktop automation endpoints"
        ],
        "Web Features": [
            "Dashboard interface",
            "WebSocket support",
            "Real-time updates",
            "RESTful API structure"
        ],
        "Deployment": [
            "Requirements file",
            "Startup script",
            "Configuration management",
            "Error handling",
            "Logging system"
        ]
    }
    
    print("\n📋 FEATURE CHECKLIST FOR FULL VERSION")
    print("="*50)
    
    for category, items in checklist.items():
        print(f"\n{category}:")
        for item in items:
            print(f"   [ ] {item}")
    
    print("\n" + "="*50)
    print("🎯 TARGET: Complete all checkboxes for full-featured version")

def cleanup_disk_space():
    """Clean up disk space"""
    project_root = Path(__file__).parent
    
    print("🧹 CLEANING UP DISK SPACE")
    print("="*50)
    
    # Remove Python cache files
    cache_dirs = list(project_root.rglob("__pycache__"))
    for cache_dir in cache_dirs:
        try:
            shutil.rmtree(cache_dir)
            print(f"✅ Removed: {cache_dir.relative_to(project_root)}")
        except:
            pass
    
    # Remove .pyc files
    pyc_files = list(project_root.rglob("*.pyc"))
    for pyc in pyc_files:
        try:
            os.remove(pyc)
            print(f"✅ Removed: {pyc.relative_to(project_root)}")
        except:
            pass
    
    # Clear pip cache
    print("\n🗑️  Clearing pip cache...")
    os.system("python -m pip cache purge")
    
    # Check disk space
    import shutil
    total, used, free = shutil.disk_usage(project_root)
    
    print(f"\n💾 Disk Space:")
    print(f"   Total: {total // (2**30)} GB")
    print(f"   Used:  {used // (2**30)} GB")
    print(f"   Free:  {free // (2**30)} GB")
    
    return free

def create_full_version_plan():
    """Create a plan to build the full version"""
    print("\n🚀 FULL VERSION DEVELOPMENT PLAN")
    print("="*60)
    
    phases = {
        "Phase 1: Foundation": [
            "Backup current working version",
            "Create database schema (SQLAlchemy)",
            "Implement user authentication",
            "Set up configuration management"
        ],
        "Phase 2: Core Features": [
            "Build agent management system",
            "Implement task marketplace",
            "Create dashboard interface",
            "Add WebSocket support"
        ],
        "Phase 3: Advanced Features": [
            "Implement desktop automation",
            "Add AI agent integrations",
            "Create analytics system",
            "Build admin dashboard"
        ],
        "Phase 4: Production Ready": [
            "Error handling & logging",
            "Performance optimization",
            "Security hardening",
            "Deployment scripts"
        ]
    }
    
    for phase, tasks in phases.items():
        print(f"\n{phase}:")
        for i, task in enumerate(tasks, 1):
            print(f"   {i}. {task}")
    
    print("\n" + "="*60)
    print("📅 Estimated Timeline: 2-3 days")
    print("💡 Start with Phase 1 while current version is backed up")

if __name__ == "__main__":
    print("🔧 AGENTIC AI - MAINTENANCE UTILITY")
    print("="*50)
    
    # Check disk space first
    free_space = cleanup_disk_space()
    
    if free_space < 500 * 1024 * 1024:  # Less than 500MB free
        print("\n⚠️  WARNING: Low disk space! (< 500MB)")
        print("   Some packages may fail to install.")
        print("   Consider freeing up space before proceeding.")
    
    # Analyze current main.py
    stats = analyze_current_main()
    
    # Create feature checklist
    create_feature_checklist()
    
    # Create development plan
    create_full_version_plan()
    
    print("\n🎯 NEXT STEPS:")
    print("1. Run: python create_backup.py (to backup current version)")
    print("2. Review the feature checklist above")
    print("3. Free up disk space if needed")
    print("4. Start building full version phase by phase")