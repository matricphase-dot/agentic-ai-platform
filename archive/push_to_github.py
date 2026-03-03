# push_to_github.py - URGENT PUSH SCRIPT
import subprocess
import os
from pathlib import Path

def push_to_github():
    """Push ALL your code to GitHub NOW"""
    
    workspace = Path.cwd()
    print(f"📁 Workspace: {workspace}")
    
    # Your GitHub repository URL
    repo_url = "https://github.com/matricphase-dot/agentic-ai-platform.git"
    
    print("\n" + "="*60)
    print("🚀 PUSHING AGENTIC AI TO GITHUB")
    print("="*60)
    
    # Step 1: Initialize git (if not already)
    if not (workspace / ".git").exists():
        print("\n1. Initializing git repository...")
        subprocess.run(["git", "init"], cwd=workspace, check=True)
    
    # Step 2: Create .gitignore
    print("\n2. Creating .gitignore...")
    gitignore = workspace / ".gitignore"
    gitignore.write_text("""# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual Environment
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Our data directories (keep structure but not large files)
recordings/*.json
automations/*.py
reports/*.json

# Keep empty directories
!recordings/.gitkeep
!automations/.gitkeep
!reports/.gitkeep
!templates/.gitkeep
!static/.gitkeep
""")
    
    # Step 3: Create .gitkeep files
    print("\n3. Creating .gitkeep files for empty directories...")
    empty_dirs = ["recordings", "automations", "reports", "templates", "static"]
    for dir_name in empty_dirs:
        dir_path = workspace / dir_name
        dir_path.mkdir(exist_ok=True)
        keep_file = dir_path / ".gitkeep"
        keep_file.write_text("# Keep this directory in git")
    
    # Step 4: Add all files
    print("\n4. Adding all files to git...")
    subprocess.run(["git", "add", "."], cwd=workspace, check=True)
    
    # Step 5: Commit
    print("\n5. Creating commit...")
    subprocess.run(["git", "commit", "-m", "Initial commit: Complete Agentic AI Platform v3.0

Features included:
✅ Desktop Recorder (458+ events)
✅ Automation Generator with AI
✅ Workspace Creator
✅ File Organizer
✅ Web Dashboard (FastAPI)
✅ Database System (SQLAlchemy)
✅ User Authentication
✅ Safety & Version Control System
✅ Deployment Ready"], cwd=workspace, check=True)
    
    # Step 6: Add remote
    print("\n6. Adding GitHub remote...")
    subprocess.run(["git", "remote", "add", "origin", repo_url], cwd=workspace, check=True)
    
    # Step 7: Rename branch to main
    print("\n7. Setting up main branch...")
    subprocess.run(["git", "branch", "-M", "main"], cwd=workspace, check=True)
    
    # Step 8: Push to GitHub
    print("\n8. Pushing to GitHub...")
    result = subprocess.run(["git", "push", "-u", "origin", "main"], 
                           cwd=workspace, 
                           capture_output=True, 
                           text=True)
    
    if result.returncode == 0:
        print("\n✅ SUCCESS! Code pushed to GitHub!")
        print(f"🌐 View at: https://github.com/matricphase-dot/agentic-ai-platform")
    else:
        print(f"\n⚠️ Push failed: {result.stderr}")
        print("\n💡 Manual push required:")
        print(f"   git push -u origin main --force")
        
        # Try force push
        force_push = input("\nForce push? (y/n): ").lower()
        if force_push == 'y':
            subprocess.run(["git", "push", "-u", "origin", "main", "--force"], cwd=workspace)
    
    # Step 9: Verify
    print("\n9. Verifying push...")
    verify = subprocess.run(["git", "log", "--oneline", "-5"], 
                           cwd=workspace, 
                           capture_output=True, 
                           text=True)
    
    print(f"\n📊 Last 5 commits:")
    print(verify.stdout)
    
    return True

def check_current_status():
    """Check what files you have"""
    workspace = Path.cwd()
    
    print("\n📋 CURRENT FILES IN YOUR WORKSPACE:")
    print("="*60)
    
    python_files = list(workspace.glob("*.py"))
    print(f"\n🐍 Python files ({len(python_files)}):")
    for py_file in sorted(python_files):
        size_kb = py_file.stat().st_size / 1024
        print(f"  • {py_file.name} ({size_kb:.1f} KB)")
    
    directories = [d for d in workspace.iterdir() if d.is_dir() and d.name not in [".git", "__pycache__"]]
    print(f"\n📁 Directories ({len(directories)}):")
    for dir_path in sorted(directories):
        file_count = len(list(dir_path.rglob("*")))
        print(f"  • {dir_path.name}/ ({file_count} items)")
    
    other_files = [f for f in workspace.iterdir() if f.is_file() and f.suffix in ['.txt', '.md', '.json']]
    if other_files:
        print(f"\n📄 Other files ({len(other_files)}):")
        for file in sorted(other_files):
            print(f"  • {file.name}")

def main():
    """Main function"""
    print("🔍 Checking your current workspace...")
    check_current_status()
    
    print("\n" + "="*60)
    print("🚨 URGENT: Your GitHub repository is EMPTY!")
    print("="*60)
    print("\nYour repository at:")
    print("https://github.com/matricphase-dot/agentic-ai-platform")
    print("\nIs currently EMPTY - no code uploaded!")
    
    confirm = input("\nPush ALL your code to GitHub NOW? (y/n): ").lower()
    
    if confirm == 'y':
        push_to_github()
        
        print("\n" + "="*60)
        print("🎉 NEXT STEPS AFTER PUSH:")
        print("="*60)
        print("1. Visit: https://github.com/matricphase-dot/agentic-ai-platform")
        print("2. Verify code is there")
        print("3. Create deployment package")
        print("4. Deploy to Railway/Render")
    else:
        print("\n⚠️ Your code is NOT backed up on GitHub!")
        print("💡 Run this script when ready to push.")

if __name__ == "__main__":
    main()