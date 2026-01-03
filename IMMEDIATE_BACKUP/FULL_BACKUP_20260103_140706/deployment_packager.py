# deployment_packager.py - SAFE DEPLOYMENT
import os
import json
import shutil
import zipfile
from pathlib import Path
from datetime import datetime

class DeploymentPackager:
    """Package system for safe deployment"""
    
    def __init__(self):
        self.project_root = Path(".")
        self.deployments_dir = self.project_root / "deployments"
        self.deployments_dir.mkdir(exist_ok=True)
    
    def create_deployment_package(self, package_name="agentic_ai", include_data=True):
        """Create deployment package"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        package_dir = self.deployments_dir / f"{package_name}_{timestamp}"
        package_dir.mkdir(exist_ok=True)
        
        print(f"📦 Creating deployment package: {package_name}")
        
        # Files to include
        include_patterns = [
            "*.py",
            "requirements.txt",
            "README.md",
            "templates/**/*",
            "static/**/*",
            "modules/**/*",
            "config/**/*"
        ]
        
        if include_data:
            include_patterns.extend([
                "recordings/**/*",
                "automations/**/*",
                "reports/**/*"
            ])
        
        # Copy files
        files_copied = 0
        for pattern in include_patterns:
            for file_path in self.project_root.glob(pattern):
                if file_path.is_file():
                    rel_path = file_path.relative_to(self.project_root)
                    dest_path = package_dir / rel_path
                    dest_path.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(file_path, dest_path)
                    files_copied += 1
        
        # Create deployment manifest
        manifest = {
            "package_name": package_name,
            "timestamp": timestamp,
            "files_included": files_copied,
            "system_version": "3.0.0",
            "features": self._get_feature_list(),
            "dependencies": self._get_dependencies()
        }
        
        manifest_file = package_dir / "deployment_manifest.json"
        with open(manifest_file, 'w') as f:
            json.dump(manifest, f, indent=2)
        
        # Create installer script
        self._create_installer(package_dir)
        
        # Create zip package
        zip_path = self.deployments_dir / f"{package_name}_{timestamp}.zip"
        self._create_zip(package_dir, zip_path)
        
        print(f"✅ Deployment package created: {zip_path}")
        print(f"📄 Files: {files_copied}")
        print(f"⚙️  Features: {', '.join(manifest['features'])}")
        
        return zip_path
    
    def create_minimal_package(self, features=None):
        """Create minimal package with selected features"""
        if features is None:
            features = ["web_dashboard", "file_organizer"]  # Default minimal
        
        print(f"🎯 Creating minimal package with features: {features}")
        
        # Create feature-based package
        package_name = f"agentic_ai_minimal_{'_'.join(features)}"
        return self.create_deployment_package(package_name, include_data=False)
    
    def create_docker_package(self):
        """Create Docker deployment package"""
        print("🐳 Creating Docker deployment package...")
        
        package_dir = self.deployments_dir / f"docker_package_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        package_dir.mkdir(exist_ok=True)
        
        # Create Dockerfile
        dockerfile_content = '''FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create necessary directories
RUN mkdir -p recordings automations reports

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
    CMD python -c "import requests; requests.get('http://localhost:8080/api/health')" || exit 1

# Run application
CMD ["python", "main.py"]
'''
        
        dockerfile_path = package_dir / "Dockerfile"
        with open(dockerfile_path, 'w') as f:
            f.write(dockerfile_content)
        
        # Copy essential files
        essential_files = [
            "main.py", "requirements.txt", "orchestrator.py",
            "templates/", "static/", "modules/", "config/"
        ]
        
        for item in essential_files:
            src_path = self.project_root / item
            dest_path = package_dir / item
            
            if src_path.exists():
                if src_path.is_dir():
                    shutil.copytree(src_path, dest_path, dirs_exist_ok=True)
                else:
                    shutil.copy2(src_path, dest_path)
        
        # Create docker-compose.yml
        compose_content = '''version: '3.8'

services:
  agentic-ai:
    build: .
    ports:
      - "8080:8080"
    volumes:
      - ./data:/app/data
      - ./recordings:/app/recordings
      - ./automations:/app/automations
    environment:
      - AGENTIC_PORT=8080
      - AGENTIC_ENV=production
    restart: unless-stopped
    
  # Optional: Add database service
  # database:
  #   image: postgres:13
  #   environment:
  #     POSTGRES_DB: agentic_ai
  #     POSTGRES_USER: agentic
  #     POSTGRES_PASSWORD: secret
  #   volumes:
  #     - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
'''
        
        compose_path = package_dir / "docker-compose.yml"
        with open(compose_path, 'w') as f:
            f.write(compose_content)
        
        # Create README
        readme_content = f'''# Agentic AI Platform - Docker Deployment

## Quick Start:
```bash
# Build and run
docker-compose up -d

# Access application
open http://localhost:8080

# View logs
docker-compose logs -f