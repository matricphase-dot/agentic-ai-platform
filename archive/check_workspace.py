# check_workspace.py
import os
from pathlib import Path

workspace = Path.cwd()
print(f"📍 Workspace: {workspace}")
print("="*60)

print("\n📄 FILES:")
for item in sorted(workspace.iterdir()):
    if item.is_file():
        size = item.stat().st_size
        print(f"  • {item.name:30} ({size:,} bytes)")

print("\n📁 DIRECTORIES:")
for item in sorted(workspace.iterdir()):
    if item.is_dir() and item.name not in [".git", "__pycache__"]:
        file_count = len(list(item.rglob("*")))
        print(f"  • {item.name}/")
        # List first 5 files in directory
        files = list(item.glob("*"))
        for f in files[:5]:
            if f.is_file():
                print(f"      - {f.name}")
        if file_count > 5:
            print(f"      ... and {file_count - 5} more")

print("\n" + "="*60)
print("🎯 Run these git commands:")
print("   git add .")
print("   git commit -m 'Your message'")
print("   git push -u origin main")
