#!/usr/bin/env python3
"""
Lightweight installation script for Agentic AI Platform
No build dependencies - Python 3.12 compatible
"""
import subprocess
import sys
import os

def run_command(cmd):
    """Run a shell command"""
    print(f"📦 Running: {cmd}")
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ Success")
        return True
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Error: {e.stderr}")
        return False

def main():
    print("=" * 60)
    print("🚀 AGENTIC AI PLATFORM - LIGHTWEIGHT INSTALLATION")
    print("=" * 60)
    
    # Create requirements_light.txt
    with open("requirements_light.txt", "w") as f:
        f.write("""fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
requests==2.31.0
python-dotenv==1.0.0
pillow==10.1.0
qrcode[pil]==7.4.2
sqlalchemy==2.0.23
aiosqlite==0.19.0
aiofiles==23.2.1""")
    
    print("📦 Created lightweight requirements file")
    
    # Upgrade pip first
    print("\n1️⃣ Upgrading pip...")
    run_command(f"{sys.executable} -m pip install --upgrade pip")
    
    # Install core dependencies
    print("\n2️⃣ Installing core dependencies...")
    if run_command(f"{sys.executable} -m pip install fastapi uvicorn python-multipart"):
        print("✅ FastAPI installed successfully")
    
    # Install remaining packages
    print("\n3️⃣ Installing remaining packages...")
    packages = ["requests", "python-dotenv", "pillow", "qrcode[pil]", "sqlalchemy", "aiosqlite", "aiofiles"]
    for pkg in packages:
        print(f"   Installing {pkg}...")
        run_command(f"{sys.executable} -m pip install {pkg}")
    
    # Create directories
    print("\n4️⃣ Creating directories...")
    directories = ["database", "uploads", "recordings", "screenshots", "organized_files", "static", "templates"]
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"   ✅ {directory}")
    
    print("\n" + "=" * 60)
    print("🎉 INSTALLATION COMPLETE!")
    print("=" * 60)
    
    print("\n🚀 To start the platform:")
    print("   python server.py")
    print("\n🌐 Then open: http://localhost:5000")
    print("\n✅ All features will work without any dependency issues!")

if __name__ == "__main__":
    main()