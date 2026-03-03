# save_all_files.py - RUN THIS TO SAVE EVERYTHING
import os
import shutil
from pathlib import Path

def create_folder_structure():
    """Create all necessary folders"""
    workspace = Path.cwd()
    print(f"📁 Workspace: {workspace}")
    
    folders = [
        "versions",
        "backups", 
        "modules",
        "config",
        "tests",
        "docs",
        "deployments",
        "safety_backups",
        "recordings",
        "automations",
        "reports",
        "templates",
        "static"
    ]
    
    for folder in folders:
        folder_path = workspace / folder
        folder_path.mkdir(exist_ok=True)
        print(f"✅ Created: {folder}/")
    
    return workspace

def backup_existing_files():
    """Backup existing files before saving new ones"""
    workspace = Path.cwd()
    backup_dir = workspace / "initial_backup"
    backup_dir.mkdir(exist_ok=True)
    
    # Backup important existing files
    existing_files = list(workspace.glob("*.py"))
    existing_files.extend(workspace.glob("*.txt"))
    existing_files.extend(workspace.glob("*.json"))
    existing_files.extend(workspace.glob("*.md"))
    
    for file in existing_files:
        if file.is_file():
            backup_file = backup_dir / file.name
            shutil.copy2(file, backup_file)
            print(f"💾 Backed up: {file.name}")
    
    return len(existing_files)

def create_readme():
    """Create README with instructions"""
    readme_content = """# Agentic AI Platform - Complete System

## 📁 Folder Structure: