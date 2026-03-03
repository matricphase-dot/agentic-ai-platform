# D:\AGENTIC_AI\create_backup_fixed.py
import os
import shutil
import datetime
import json
from pathlib import Path

def backup_current_main():
    """Backup current main.py with timestamp"""
    project_root = Path(__file__).parent
    core_dir = project_root / "CORE"
    backup_dir = project_root / "backups"
    
    # Create backup directory if it doesn't exist
    backup_dir.mkdir(exist_ok=True)
    
    # Current main.py path
    main_py = core_dir / "main.py"
    
    if not main_py.exists():
        print("ERROR: main.py not found at:", main_py)
        return False
    
    # Create timestamp
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Backup file name
    backup_file = backup_dir / f"main_backup_{timestamp}.py"
    
    try:
        # Copy the file
        shutil.copy2(main_py, backup_file)
        
        # Get file size
        file_size = os.path.getsize(backup_file) / 1024  # KB
        
        print("=" * 60)
        print("BACKUP CREATED SUCCESSFULLY!")
        print("=" * 60)
        print(f"Backup location: {backup_file}")
        print(f"Backup size: {file_size:.2f} KB")
        print(f"Backup time: {timestamp}")
        print(f"Original file: {main_py}")
        
        return True
        
    except Exception as e:
        print(f"ERROR creating backup: {e}")
        return False

def create_simple_restore_script():
    """Create a simple restore script without emojis or special characters"""
    restore_script = """# D:\\AGENTIC_AI\\restore_backup_simple.py
import os
import shutil
import sys
import datetime
from pathlib import Path

def list_backups():
    '''List all available backups'''
    backup_dir = Path(__file__).parent / "backups"
    
    if not backup_dir.exists():
        print("ERROR: No backup directory found!")
        return []
    
    try:
        backups = list(backup_dir.glob("main_backup_*.py"))
        backups.sort(key=os.path.getmtime, reverse=True)
        
        print("Available backups:")
        for i, backup in enumerate(backups, 1):
            mtime = datetime.datetime.fromtimestamp(os.path.getmtime(backup))
            size = os.path.getsize(backup) / 1024
            print(f"{i}. {backup.name} - {mtime.strftime('%Y-%m-%d %H:%M')} - {size:.1f} KB")
        
        return backups
    except Exception as e:
        print(f"ERROR listing backups: {e}")
        return []

def restore_backup(backup_number=None):
    '''Restore a backup to main.py'''
    
    backups = list_backups()
    
    if not backups:
        return False
    
    if backup_number is None:
        # Restore the latest
        backup_to_restore = backups[0]
    else:
        try:
            backup_to_restore = backups[backup_number-1]
        except IndexError:
            print(f"ERROR: Invalid backup number. Choose 1-{len(backups)}")
            return False
    
    # Create backup of current main.py first
    core_dir = Path(__file__).parent / "CORE"
    current_main = core_dir / "main.py"
    
    try:
        if current_main.exists():
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_dir = Path(__file__).parent / "backups"
            backup_dir.mkdir(exist_ok=True)
            
            # Backup current version
            current_backup = backup_dir / f"main_current_{timestamp}.py"
            shutil.copy2(current_main, current_backup)
            print(f"SUCCESS: Current main.py backed up to: {current_backup.name}")
        
        # Restore the chosen backup
        shutil.copy2(backup_to_restore, current_main)
        
        print("=" * 60)
        print("BACKUP RESTORED SUCCESSFULLY!")
        print("=" * 60)
        print(f"Restored from: {backup_to_restore.name}")
        print(f"Restored to: {current_main}")
        
        return True
        
    except Exception as e:
        print(f"ERROR restoring backup: {e}")
        return False

if __name__ == "__main__":
    print("AGENTIC AI - BACKUP RESTORATION TOOL")
    print("=" * 50)
    
    backups = list_backups()
    
    if backups:
        print("\\nSelect a backup to restore:")
        for i, backup in enumerate(backups, 1):
            mtime = datetime.datetime.fromtimestamp(os.path.getmtime(backup))
            print(f"{i}. {backup.name} ({mtime.strftime('%Y-%m-%d %H:%M')})")
        
        print("\\nOptions:")
        print("  'latest' - Restore most recent backup")
        print("  'list'   - Show backups again")
        print("  'exit'   - Exit without restoring")
        
        choice = input("\\nYour choice: ").strip().lower()
        
        if choice == 'latest' or choice == '':
            restore_backup(1)
        elif choice == 'list':
            list_backups()
        elif choice == 'exit':
            print("Exiting...")
        elif choice.isdigit():
            restore_backup(int(choice))
        else:
            print("ERROR: Invalid choice")
    else:
        print("ERROR: No backups found!")
"""
    
    try:
        with open(Path(__file__).parent / "restore_backup_simple.py", "w", encoding='utf-8') as f:
            f.write(restore_script)
        print("\\nSUCCESS: Created restore script: restore_backup_simple.py")
        return True
    except Exception as e:
        print(f"ERROR creating restore script: {e}")
        return False

if __name__ == "__main__":
    print("AGENTIC AI - MAIN.PY BACKUP UTILITY (FIXED)")
    print("=" * 50)
    
    if backup_current_main():
        if create_simple_restore_script():
            print("\\nSUCCESS: Backup completed successfully!")
            print("\\nTo restore a backup later, run:")
            print("   python restore_backup_simple.py")
        else:
            print("\\nWARNING: Backup created but restore script failed")
    else:
        print("ERROR: Backup failed!")