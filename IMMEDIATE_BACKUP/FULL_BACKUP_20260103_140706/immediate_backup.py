# immediate_backup.py - DO THIS FIRST!
import shutil
import datetime
from pathlib import Path

# Get current workspace
workspace = Path.cwd()

# Create backup of EVERYTHING
backup_name = f"FULL_BACKUP_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
backup_dir = workspace / "IMMEDIATE_BACKUP" / backup_name
backup_dir.mkdir(parents=True, exist_ok=True)

# Copy all files
for item in workspace.iterdir():
    if item.name not in ["IMMEDIATE_BACKUP", "__pycache__"]:
        dest = backup_dir / item.name
        if item.is_dir():
            shutil.copytree(item, dest, dirs_exist_ok=True)
        else:
            shutil.copy2(item, dest)

print(f"✅ FULL BACKUP CREATED: {backup_dir}")
print("📁 Your files are now SAFE in IMMEDIATE_BACKUP/ folder")