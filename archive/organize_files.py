#!/usr/bin/env python3
"""
Agentic AI File Organizer
Automatically organizes files into the folder structure
"""

import os
import shutil
import json
from pathlib import Path
from datetime import datetime

def organize_files():
    """Main organization function"""
    print("🤖 AGENTIC AI FILE ORGANIZER")
    print("="*50)
    
    # Get current script location
    script_dir = Path(__file__).parent
    
    # Load folder structure
    structure_file = script_dir / "folder_structure.json"
    if not structure_file.exists():
        print("❌ folder_structure.json not found!")
        return
    
    with open(structure_file, 'r') as f:
        folder_structure = json.load(f)
    
    # Define file type mappings
    file_type_categories = {
        # Documents
        ".pdf": ["Documents", "Work", "Reports"],
        ".doc": ["Documents", "Work", "Projects"],
        ".docx": ["Documents", "Work", "Projects"],
        ".txt": ["Documents", "Work", "Projects"],
        ".md": ["Documents", "Work", "Projects"],
        ".rtf": ["Documents", "Work", "Projects"],
        
        # Images
        ".jpg": ["Media", "Images", "Photos"],
        ".jpeg": ["Media", "Images", "Photos"],
        ".png": ["Media", "Images", "Screenshots"],
        ".gif": ["Media", "Images", "Wallpapers"],
        ".bmp": ["Media", "Images", "Photos"],
        ".svg": ["Media", "Images", "Wallpapers"],
        
        # Videos
        ".mp4": ["Media", "Videos", "Recordings"],
        ".avi": ["Media", "Videos", "Recordings"],
        ".mov": ["Media", "Videos", "Recordings"],
        ".mkv": ["Media", "Videos", "Movies"],
        
        # Audio
        ".mp3": ["Media", "Audio", "Music"],
        ".wav": ["Media", "Audio", "Recordings"],
        ".flac": ["Media", "Audio", "Music"],
        
        # Code
        ".py": ["Development", "Python", "Scripts"],
        ".js": ["Development", "Web", "JavaScript"],
        ".html": ["Development", "Web", "HTML_CSS"],
        ".css": ["Development", "Web", "HTML_CSS"],
        ".json": ["Development", "Data", "Datasets"],
        ".csv": ["Development", "Data", "Datasets"],
        
        # Archives
        ".zip": ["System", "Backups", "Daily"],
        ".rar": ["System", "Backups", "Daily"],
        ".7z": ["System", "Backups", "Daily"],
        ".tar": ["System", "Backups", "Weekly"],
        ".gz": ["System", "Backups", "Weekly"],
    }
    
    # Ask user for source directory
    source_dir = input("\n📁 Enter source directory to organize (or press Enter for Desktop): ").strip()
    if not source_dir:
        source_dir = str(Path.home() / "Desktop")
    
    source_path = Path(source_dir)
    if not source_path.exists():
        print(f"❌ Source directory not found: {source_dir}")
        return
    
    print(f"📂 Scanning: {source_dir}")
    
    # Scan and organize files
    organized_count = 0
    for file_path in source_path.iterdir():
        if file_path.is_file():
            extension = file_path.suffix.lower()
            
            if extension in file_type_categories:
                target_path = script_dir
                for folder in file_type_categories[extension]:
                    target_path = target_path / folder
                    target_path.mkdir(exist_ok=True)
                
                # Move file
                try:
                    shutil.move(str(file_path), str(target_path / file_path.name))
                    print(f"  ✅ {file_path.name} -> {target_path.name}/")
                    organized_count += 1
                except Exception as e:
                    print(f"  ❌ Failed to move {file_path.name}: {e}")
            else:
                # Put unknown files in System/Temp
                temp_dir = script_dir / "System" / "Temp"
                temp_dir.mkdir(exist_ok=True)
                try:
                    shutil.move(str(file_path), str(temp_dir / file_path.name))
                    print(f"  ⚠️  {file_path.name} -> System/Temp/ (unknown type)")
                    organized_count += 1
                except Exception as e:
                    print(f"  ❌ Failed to move {file_path.name}: {e}")
    
    # Summary
    print(f"\n📊 SUMMARY:")
    print(f"   Source: {source_dir}")
    print(f"   Files organized: {organized_count}")
    print(f"   Time: {datetime.now()}")
    print("\n✅ Organization complete!")
    print(f"\n📁 Check your organized files in: {script_dir}")

if __name__ == "__main__":
    organize_files()
