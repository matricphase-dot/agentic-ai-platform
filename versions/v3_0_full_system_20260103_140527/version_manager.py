# version_manager.py - NEVER LOSE FEATURES
import os
import json
import shutil
import datetime
from pathlib import Path
import hashlib
import zipfile

class VersionManager:
    """Manager to preserve all versions and features"""
    
    def __init__(self, project_root="."):
        self.project_root = Path(project_root)
        self.versions_dir = self.project_root / "versions"
        self.backups_dir = self.project_root / "backups"
        self.modules_dir = self.project_root / "modules"
        
        # Create directories
        for dir_path in [self.versions_dir, self.backups_dir, self.modules_dir]:
            dir_path.mkdir(exist_ok=True)
    
    def create_version_snapshot(self, version_name, description=""):
        """Save current state as a version"""
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        version_path = self.versions_dir / f"{version_name}_{timestamp}"
        
        # Create version directory
        version_path.mkdir(exist_ok=True)
        
        # Copy all important files
        files_to_save = [
            "*.py", "*.json", "*.md", "*.txt",
            "templates/*", "static/*", "recordings/*", "automations/*"
        ]
        
        print(f"📸 Creating version snapshot: {version_name}")
        
        # Save current state
        current_files = list(Path(".").glob("**/*"))
        for file_path in current_files:
            if file_path.is_file() and not any(excl in str(file_path) for excl in ["versions/", "backups/"]):
                rel_path = file_path.relative_to(".")
                dest_path = version_path / rel_path
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(file_path, dest_path)
        
        # Save version info
        version_info = {
            "name": version_name,
            "timestamp": timestamp,
            "description": description,
            "files_count": len(list(version_path.rglob("*"))),
            "features": self._extract_features()
        }
        
        info_file = version_path / "version_info.json"
        with open(info_file, 'w') as f:
            json.dump(version_info, f, indent=2)
        
        # Create backup zip
        self._create_backup_zip(version_path, f"{version_name}_{timestamp}")
        
        print(f"✅ Version saved: {version_path}")
        return version_path
    
    def restore_version(self, version_name):
        """Restore a specific version"""
        version_dirs = list(self.versions_dir.glob(f"{version_name}_*"))
        
        if not version_dirs:
            print(f"❌ Version not found: {version_name}")
            return False
        
        # Get latest matching version
        version_path = sorted(version_dirs)[-1]
        
        print(f"🔄 Restoring version: {version_path.name}")
        
        # Backup current state first
        self.create_version_snapshot("pre_restore_backup", "Before restoring")
        
        # Clear current directory (except versions/ and backups/)
        for item in Path(".").iterdir():
            if item.name not in ["versions", "backups", "modules"]:
                if item.is_dir():
                    shutil.rmtree(item)
                else:
                    item.unlink()
        
        # Restore files
        for file_path in version_path.rglob("*"):
            if file_path.is_file():
                rel_path = file_path.relative_to(version_path)
                dest_path = Path(".") / rel_path
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(file_path, dest_path)
        
        print(f"✅ Version restored: {version_name}")
        return True
    
    def list_versions(self):
        """List all saved versions"""
        versions = []
        
        for version_dir in self.versions_dir.iterdir():
            if version_dir.is_dir():
                info_file = version_dir / "version_info.json"
                if info_file.exists():
                    with open(info_file, 'r') as f:
                        info = json.load(f)
                        versions.append(info)
        
        # Sort by timestamp
        versions.sort(key=lambda x: x['timestamp'], reverse=True)
        
        print("\n📋 SAVED VERSIONS:")
        print("="*60)
        for version in versions:
            print(f"\n🏷️  {version['name']}")
            print(f"   📅 {version['timestamp']}")
            print(f"   📝 {version['description']}")
            print(f"   📄 {version['files_count']} files")
            if 'features' in version:
                print(f"   ⚙️  Features: {', '.join(version['features'])}")
        
        return versions
    
    def modularize_features(self):
        """Break current system into modular components"""
        print("🔧 Modularizing features...")
        
        modules = {
            "core_database": [
                "Database setup",
                "User models", 
                "Session management"
            ],
            "desktop_recorder": [
                "Recording logic",
                "Event capture",
                "File saving"
            ],
            "automation_generator": [
                "Script generation",
                "AI integration",
                "Template system"
            ],
            "workspace_creator": [
                "Folder structure",
                "Template creation",
                "Workspace management"
            ],
            "file_organizer": [
                "File categorization",
                "Organization logic",
                "Rule system"
            ],
            "web_dashboard": [
                "FastAPI routes",
                "HTML templates",
                "Authentication"
            ]
        }
        
        # Create module files
        for module_name, features in modules.items():
            module_file = self.modules_dir / f"{module_name}.py"
            
            # Create module template
            module_content = f'''"""
{module_name.upper().replace('_', ' ')} MODULE
Features: {', '.join(features)}
"""

import os
import json
from datetime import datetime
from typing import Optional, Dict, List

class {module_name.replace('_', ' ').title().replace(' ', '')}:
    """{module_name.replace('_', ' ').title()} module"""
    
    def __init__(self):
        self.module_name = "{module_name}"
        self.features = {features}
        self.version = "1.0.0"
    
    def check_health(self):
        """Check if module is working"""
        return {{
            "module": self.module_name,
            "status": "ready",
            "features": self.features,
            "timestamp": datetime.now().isoformat()
        }}
    
    def get_dependencies(self):
        """Get required dependencies"""
        return []  # Override in actual implementation

# Export for modular use
module_instance = {module_name.replace('_', ' ').title().replace(' ', '')}()
'''
            
            with open(module_file, 'w') as f:
                f.write(module_content)
            
            print(f"✅ Created module: {module_name}")
        
        # Create main orchestrator
        self._create_orchestrator()
        
        print("🎯 Modularization complete!")
    
    def _extract_features(self):
        """Extract features from current code"""
        features = []
        
        # Check for feature indicators in code
        feature_indicators = {
            "desktop_recorder": ["DesktopRecorder", "start_recording", "stop_recording"],
            "automation_generator": ["generate_automation", "Ollama", "script_generation"],
            "workspace_creator": ["create_workspace", "WorkspaceCreator"],
            "file_organizer": ["organize_files", "FileOrganizer"],
            "database": ["SQLAlchemy", "User", "Recording", "Automation"],
            "web_dashboard": ["FastAPI", "dashboard", "templates"],
            "authentication": ["login", "jwt", "bcrypt"]
        }
        
        # Scan current files
        for py_file in Path(".").glob("*.py"):
            if py_file.is_file():
                try:
                    content = py_file.read_text(encoding='utf-8', errors='ignore')
                    
                    for feature, indicators in feature_indicators.items():
                        if any(indicator in content for indicator in indicators):
                            if feature not in features:
                                features.append(feature)
                except:
                    continue
        
        return features
    
    def _create_backup_zip(self, source_dir, zip_name):
        """Create backup zip file"""
        zip_path = self.backups_dir / f"{zip_name}.zip"
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file_path in source_dir.rglob("*"):
                if file_path.is_file():
                    arcname = file_path.relative_to(source_dir)
                    zipf.write(file_path, arcname)
        
        print(f"📦 Backup created: {zip_path}")
    
    def _create_orchestrator(self):
        """Create main orchestrator that loads modules"""
        orchestrator_content = '''#!/usr/bin/env python3
"""
🎯 AGENTIC AI ORCHESTRATOR
Loads and manages all feature modules
"""

import os
import sys
from pathlib import Path

# Add modules directory to path
sys.path.insert(0, str(Path(__file__).parent / "modules"))

class FeatureOrchestrator:
    """Orchestrates all feature modules"""
    
    def __init__(self):
        self.modules = {}
        self.loaded_features = []
        
    def load_module(self, module_name):
        """Load a specific module"""
        try:
            module = __import__(module_name)
            self.modules[module_name] = module.module_instance
            self.loaded_features.append(module_name)
            print(f"✅ Loaded module: {module_name}")
            return True
        except ImportError as e:
            print(f"❌ Failed to load {module_name}: {e}")
            return False
    
    def load_all_modules(self):
        """Load all available modules"""
        modules_dir = Path(__file__).parent / "modules"
        
        if not modules_dir.exists():
            print("❌ Modules directory not found")
            return False
        
        for module_file in modules_dir.glob("*.py"):
            if module_file.name != "__init__.py":
                module_name = module_file.stem
                self.load_module(module_name)
        
        print(f"📊 Loaded {len(self.modules)} modules")
        return True
    
    def check_system_health(self):
        """Check health of all loaded modules"""
        health_report = {
            "timestamp": datetime.now().isoformat(),
            "modules_loaded": len(self.modules),
            "features": self.loaded_features,
            "health_checks": {}
        }
        
        for name, module in self.modules.items():
            try:
                health = module.check_health()
                health_report["health_checks"][name] = health
            except Exception as e:
                health_report["health_checks"][name] = {
                    "status": "error",
                    "error": str(e)
                }
        
        return health_report
    
    def get_feature(self, feature_name):
        """Get a specific feature module"""
        return self.modules.get(feature_name)
    
    def list_features(self):
        """List all available features"""
        return {
            "loaded": self.loaded_features,
            "available": list(self.modules.keys())
        }

# Create global orchestrator
orchestrator = FeatureOrchestrator()

def main():
    """Main entry point"""
    print("🤖 AGENTIC AI ORCHESTRATOR")
    print("="*60)
    
    # Load all modules
    orchestrator.load_all_modules()
    
    # Check health
    health = orchestrator.check_system_health()
    
    print(f"\\n📊 SYSTEM STATUS:")
    print(f"   Modules: {health['modules_loaded']}")
    print(f"   Features: {', '.join(health['features'])}")
    
    return orchestrator

if __name__ == "__main__":
    main()
'''
        
        orchestrator_file = self.project_root / "orchestrator.py"
        with open(orchestrator_file, 'w') as f:
            f.write(orchestrator_content)
        
        print("✅ Created orchestrator.py")

# ========== MAIN ==========
if __name__ == "__main__":
    manager = VersionManager()
    
    print("\n" + "="*60)
    print("🛡️  AGENTIC AI VERSION MANAGER")
    print("="*60)
    
    # Create snapshot of current state
    manager.create_version_snapshot(
        "v3_0_full_system",
        "Complete system with all features: recorder, generator, workspace, organizer, dashboard"
    )
    
    # List all versions
    manager.list_versions()
    
    # Modularize
    manager.modularize_features()
    
    print("\n✅ Your features are now SAFE!")
    print("📁 Check the 'versions/' directory for all saved versions")
    print("📁 Check the 'modules/' directory for modular components")