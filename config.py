# D:\AGENTIC_AI\config.py
"""
Agentic AI Platform Configuration
Founder: Aditya Mehra
Version: 4.0.0 (Student Founder Edition)
"""

import os
from pathlib import Path
from typing import Dict, Any

# Project paths
PROJECT_ROOT = Path(__file__).parent
CORE_DIR = PROJECT_ROOT / "CORE"
SDK_DIR = PROJECT_ROOT / "agentic_sdk"
EXAMPLES_DIR = PROJECT_ROOT / "examples"
TEMPLATES_DIR = PROJECT_ROOT / "templates"
STATIC_DIR = PROJECT_ROOT / "static"
DATABASE_DIR = PROJECT_ROOT / "database"
LOGS_DIR = PROJECT_ROOT / "logs"
BACKUP_DIR = PROJECT_ROOT / "backups"

# Platform configuration
PLATFORM_CONFIG = {
    "name": "Agentic AI Platform",
    "version": "4.0.0",
    "founder": "Aditya Mehra",
    "founder_role": "2nd Year B.Tech Student",
    "tagline": "The Operating System for AI Agents",
    "description": "Universal platform where AI agents learn, collaborate, and automate any digital task",
    
    # Technical specs
    "completion_percentage": 92,
    "working_modules": [
        "Core Infrastructure (100%)",
        "Agent System (100%)", 
        "Marketplace (100%)",
        "Universal Agent API (90%)",
        "Training Gym (95%)",
        "Agent SDK (90% structure)",
        "Web Dashboard (100%)"
    ],
    
    # Deployment
    "port": 8000,
    "host": "0.0.0.0",
    "debug": True,
    
    # Database
    "database_path": str(DATABASE_DIR / "agentic_database.db"),
    "marketplace_db": str(DATABASE_DIR / "marketplace.db"),
    "training_db": str(DATABASE_DIR / "demonstrations.db"),
    
    # Founder info for investor materials
    "founder_info": {
        "name": "Aditya Mehra",
        "education": "B.Tech Computer Science (2nd Year)",
        "expertise": ["AI/ML", "Full-stack Development", "Distributed Systems"],
        "background": "Built multiple AI projects including computer vision systems and NLP applications",
        "vision": "Democratize AI automation for businesses of all sizes",
        "contact": "aditya@agentic.ai"
    }
}

# Ensure all directories exist
def setup_directories():
    """Create all required directories"""
    directories = [
        CORE_DIR, SDK_DIR, EXAMPLES_DIR, TEMPLATES_DIR, STATIC_DIR,
        DATABASE_DIR, LOGS_DIR, BACKUP_DIR, 
        STATIC_DIR / "css", STATIC_DIR / "js", STATIC_DIR / "images",
        EXAMPLES_DIR / "basic", EXAMPLES_DIR / "advanced",
        LOGS_DIR / "app", LOGS_DIR / "errors",
        BACKUP_DIR / "daily", BACKUP_DIR / "weekly"
    ]
    
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
        print(f"✅ Created: {directory}")
    
    print("\n✅ All directories created successfully!")

if __name__ == "__main__":
    setup_directories()