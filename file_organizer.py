#!/usr/bin/env python3
"""
FILE ORGANIZER - COMPLETE FILE MANAGEMENT SYSTEM
Working module with real file operations
"""

import os
import shutil
import json
import sqlite3
import hashlib
from datetime import datetime
from pathlib import Path
import mimetypes

class FileOrganizer:
    def __init__(self):
        self.db_path = "database/file_organizer.db"
        self.init_database()
        self.categories = {
            'images': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'],
            'documents': ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.xls', '.xlsx', '.ppt', '.pptx'],
            'videos': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'],
            'audio': ['.mp3', '.wav', '.flac', '.aac', '.ogg'],
            'archives': ['.zip', '.rar', '.7z', '.tar', '.gz'],
            'code': ['.py', '.js', '.html', '.css', '.java', '.cpp', '.c', '.php'],
            'data': ['.csv', '.json', '.xml', '.sql', '.db']
        }
    
    def init_database(self):
        """Initialize database for file tracking"""
        os.makedirs("database", exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT,
                original_path TEXT,
                new_path TEXT,
                file_type TEXT,
                size_bytes INTEGER,
                created_date TEXT,
                organized_date TEXT,
                category TEXT,
                hash TEXT UNIQUE
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS operations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                operation_type TEXT,
                details TEXT,
                timestamp TEXT,
                files_affected INTEGER
            )
        ''')
        conn.commit()
        conn.close()
        print("✅ File Organizer database initialized")
    
    def organize_files(self, source_dir=".", target_dir="organized"):
        """Organize files by type into categorized folders"""
        if not os.path.exists(source_dir):
            return {"success": False, "error": "Source directory not found"}
        
        os.makedirs(target_dir, exist_ok=True)
        
        organized_count = 0
        files_processed = []
        
        for item in os.listdir(source_dir):
            item_path = os.path.join(source_dir, item)
            
            if os.path.isfile(item_path):
                # Get file extension
                _, ext = os.path.splitext(item)
                ext = ext.lower()
                
                # Determine category
                category = "others"
                for cat, exts in self.categories.items():
                    if ext in exts:
                        category = cat
                        break
                
                # Create category folder
                category_dir = os.path.join(target_dir, category)
                os.makedirs(category_dir, exist_ok=True)
                
                # Generate new filename (avoid duplicates)
                base_name = os.path.splitext(item)[0]
                counter = 1
                new_filename = item
                while os.path.exists(os.path.join(category_dir, new_filename)):
                    new_filename = f"{base_name}_{counter}{ext}"
                    counter += 1
                
                # Move file
                new_path = os.path.join(category_dir, new_filename)
                shutil.move(item_path, new_path)
                
                # Calculate file hash
                file_hash = self.calculate_file_hash(new_path)
                
                # Record in database
                self.record_file_operation(
                    filename=item,
                    original_path=item_path,
                    new_path=new_path,
                    file_type=ext,
                    size=os.path.getsize(new_path),
                    category=category,
                    file_hash=file_hash
                )
                
                organized_count += 1
                files_processed.append({
                    "original": item,
                    "new_location": new_path,
                    "category": category
                })
        
        # Log operation
        self.log_operation("organize", f"Organized {organized_count} files", organized_count)
        
        return {
            "success": True,
            "organized_count": organized_count,
            "files_processed": files_processed,
            "target_directory": os.path.abspath(target_dir)
        }
    
    def find_duplicates(self, search_dir="."):
        """Find duplicate files by content hash"""
        if not os.path.exists(search_dir):
            return {"success": False, "error": "Directory not found"}
        
        hash_dict = {}
        duplicates = []
        
        for root, _, files in os.walk(search_dir):
            for file in files:
                file_path = os.path.join(root, file)
                try:
                    file_hash = self.calculate_file_hash(file_path)
                    
                    if file_hash in hash_dict:
                        duplicates.append({
                            "original": hash_dict[file_hash],
                            "duplicate": file_path,
                            "hash": file_hash,
                            "size": os.path.getsize(file_path)
                        })
                    else:
                        hash_dict[file_hash] = file_path
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
        
        self.log_operation("find_duplicates", f"Found {len(duplicates)} duplicates", len(duplicates))
        
        return {
            "success": True,
            "duplicates_found": len(duplicates),
            "duplicates": duplicates,
            "total_files_scanned": len(hash_dict) + len(duplicates)
        }
    
    def bulk_rename(self, directory=".", pattern="file_{counter}{extension}"):
        """Bulk rename files in a directory"""
        if not os.path.exists(directory):
            return {"success": False, "error": "Directory not found"}
        
        renamed_files = []
        counter = 1
        
        files = [f for f in os.listdir(directory) if os.path.isfile(os.path.join(directory, f))]
        files.sort()  # Sort alphabetically
        
        for filename in files:
            name, ext = os.path.splitext(filename)
            new_name = pattern.replace("{counter}", str(counter)).replace("{extension}", ext)
            new_name = new_name.replace("{original}", name)
            
            old_path = os.path.join(directory, filename)
            new_path = os.path.join(directory, new_name)
            
            # Ensure unique filename
            while os.path.exists(new_path):
                counter += 1
                new_name = pattern.replace("{counter}", str(counter)).replace("{extension}", ext)
                new_path = os.path.join(directory, new_name)
            
            os.rename(old_path, new_path)
            renamed_files.append({
                "old_name": filename,
                "new_name": new_name
            })
            counter += 1
        
        self.log_operation("bulk_rename", f"Renamed {len(renamed_files)} files", len(renamed_files))
        
        return {
            "success": True,
            "renamed_count": len(renamed_files),
            "renamed_files": renamed_files,
            "pattern_used": pattern
        }
    
    def calculate_file_hash(self, filepath):
        """Calculate MD5 hash of a file"""
        hash_md5 = hashlib.md5()
        try:
            with open(filepath, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_md5.update(chunk)
            return hash_md5.hexdigest()
        except Exception as e:
            return f"error_{os.path.basename(filepath)}"
    
    def record_file_operation(self, filename, original_path, new_path, file_type, size, category, file_hash):
        """Record file operation in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO files 
            (filename, original_path, new_path, file_type, size_bytes, created_date, organized_date, category, hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            filename,
            original_path,
            new_path,
            file_type,
            size,
            datetime.fromtimestamp(os.path.getctime(original_path)).isoformat(),
            datetime.now().isoformat(),
            category,
            file_hash
        ))
        
        conn.commit()
        conn.close()
    
    def log_operation(self, op_type, details, files_affected):
        """Log an operation"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO operations (operation_type, details, timestamp, files_affected)
            VALUES (?, ?, ?, ?)
        ''', (
            op_type,
            details,
            datetime.now().isoformat(),
            files_affected
        ))
        
        conn.commit()
        conn.close()
    
    def get_stats(self):
        """Get file organizer statistics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM files")
        total_files = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(DISTINCT category) FROM files")
        categories_used = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM operations")
        operations_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(size_bytes) FROM files")
        total_size = cursor.fetchone()[0] or 0
        
        conn.close()
        
        return {
            "total_files": total_files,
            "categories_used": categories_used,
            "operations_count": operations_count,
            "total_size_bytes": total_size,
            "total_size_mb": round(total_size / (1024*1024), 2),
            "last_updated": datetime.now().isoformat()
        }
    
    def clean_temp_files(self, directory=".", days_old=30):
        """Clean temporary files older than specified days"""
        import time
        
        if not os.path.exists(directory):
            return {"success": False, "error": "Directory not found"}
        
        temp_extensions = ['.tmp', '.temp', '.log', '.cache']
        deleted_files = []
        current_time = time.time()
        threshold = days_old * 24 * 60 * 60  # Convert days to seconds
        
        for root, _, files in os.walk(directory):
            for file in files:
                if any(file.endswith(ext) for ext in temp_extensions):
                    file_path = os.path.join(root, file)
                    file_age = current_time - os.path.getctime(file_path)
                    
                    if file_age > threshold:
                        try:
                            os.remove(file_path)
                            deleted_files.append({
                                "filename": file,
                                "path": file_path,
                                "age_days": round(file_age / (24*60*60), 1)
                            })
                        except Exception as e:
                            print(f"Error deleting {file_path}: {e}")
        
        self.log_operation("clean_temp", f"Cleaned {len(deleted_files)} temp files", len(deleted_files))
        
        return {
            "success": True,
            "deleted_count": len(deleted_files),
            "deleted_files": deleted_files,
            "days_threshold": days_old
        }

# Create singleton instance
file_organizer = FileOrganizer()

if __name__ == "__main__":
    print("🧪 Testing File Organizer...")
    stats = file_organizer.get_stats()
    print(f"📊 File Organizer Stats: {stats}")
    print("✅ File Organizer is ready!")