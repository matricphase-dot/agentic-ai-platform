#!/usr/bin/env python3
"""
Quick install script for Agentic AI Platform
"""
import os
import subprocess
import sys

def install_dependencies():
    print("📦 Installing dependencies...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)

def create_directories():
    print("📁 Creating directories...")
    directories = ["database", "uploads", "recordings", "screenshots", "organized_files", "static", "templates"]
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"  ✅ Created: {directory}")

def main():
    print("=" * 60)
    print("🚀 AGENTIC AI PLATFORM - INSTALLATION")
    print("=" * 60)
    
    try:
        create_directories()
        install_dependencies()
        
        print("\n" + "=" * 60)
        print("✅ INSTALLATION COMPLETE!")
        print("=" * 60)
        print("\n🚀 To start the platform:")
        print("   python server.py")
        print("\n🌐 Then open: http://localhost:5000")
        print("\n🔑 Default credentials:")
        print("   Username: admin")
        print("   Password: (none required)")
        
    except Exception as e:
        print(f"\n❌ Installation failed: {e}")
        print("\n💡 Try manually: pip install -r requirements.txt")

if __name__ == "__main__":
    main()