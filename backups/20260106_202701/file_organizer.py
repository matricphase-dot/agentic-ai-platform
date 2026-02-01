"""
COMPLETE FILE ORGANIZER MODULE
Real file system operations with intelligent organization
"""
import os
import shutil
import hashlib
import json
import time
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Tuple, Optional
import mimetypes
from dataclasses import dataclass, asdict

@dataclass
class FileInfo:
    """File metadata information"""
    path: str
    name: str
    size: int
    type: str
    extension: str
    created: datetime
    modified: datetime
    hash: str = ""
    tags: List[str] = None

class FileOrganizerEngine:  # RENAMED FROM SmartFileOrganizer
    """Intelligent file organization system"""
    
    def __init__(self, base_path: str = None):
        self.base_path = Path(base_path) if base_path else Path.home() / "AgenticOrganizer"
        self.base_path.mkdir(exist_ok=True)
        self.rules = self._load_rules()
        self.file_cache = {}
        
    def _load_rules(self) -> Dict:
        """Load organization rules from config"""
        rules_file = self.base_path / "organization_rules.json"
        default_rules = {
            "documents": [".pdf", ".doc", ".docx", ".txt", ".rtf"],
            "images": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg"],
            "videos": [".mp4", ".avi", ".mov", ".mkv", ".wmv"],
            "audio": [".mp3", ".wav", ".flac", ".aac", ".ogg"],
            "archives": [".zip", ".rar", ".7z", ".tar", ".gz"],
            "code": [".py", ".js", ".html", ".css", ".java", ".cpp"],
            "data": [".csv", ".json", ".xml", ".sql", ".db"]
        }
        
        if rules_file.exists():
            with open(rules_file, 'r') as f:
                return json.load(f)
        return default_rules
    
    def organize_by_type(self, source_dir: str, target_dir: str = None) -> Dict:
        """Organize files by type"""
        if not target_dir:
            target_dir = self.base_path
            
        source = Path(source_dir)
        target = Path(target_dir)
        
        if not source.exists():
            raise FileNotFoundError(f"Source directory not found: {source_dir}")
        
        results = {"total_files": 0, "organized": 0, "errors": [], "moved_files": []}
        
        for file_path in source.rglob("*"):
            if file_path.is_file():
                results["total_files"] += 1
                try:
                    file_info = self._get_file_info(file_path)
                    category = self._categorize_file(file_info)
                    
                    category_dir = target / category
                    category_dir.mkdir(exist_ok=True)
                    
                    new_path = category_dir / file_path.name
                    if new_path.exists():
                        new_path = self._get_unique_path(new_path)
                    
                    shutil.move(str(file_path), str(new_path))
                    results["organized"] += 1
                    results["moved_files"].append({
                        "original": str(file_path),
                        "new": str(new_path),
                        "category": category
                    })
                except Exception as e:
                    results["errors"].append({"file": str(file_path), "error": str(e)})
        
        return results
    
    def find_duplicates(self, directory: str, method: str = "hash") -> List[List[str]]:
        """Find duplicate files"""
        directory = Path(directory)
        file_groups = {}
        duplicates = []
        
        for file_path in directory.rglob("*"):
            if file_path.is_file():
                try:
                    if method == "hash":
                        key = self._get_file_hash(file_path)
                    elif method == "size":
                        key = file_path.stat().st_size
                    elif method == "name":
                        key = file_path.name.lower()
                    else:
                        key = self._get_file_hash(file_path)
                    
                    if key not in file_groups:
                        file_groups[key] = []
                    file_groups[key].append(str(file_path))
                except Exception:
                    continue
        
        for key, files in file_groups.items():
            if len(files) > 1:
                duplicates.append(files)
        
        return duplicates
    
    def bulk_rename(self, directory: str, pattern: str, start_num: int = 1) -> Dict:
        """Bulk rename files"""
        directory = Path(directory)
        results = {"renamed": [], "errors": [], "total": 0}
        
        files = sorted([f for f in directory.iterdir() if f.is_file()])
        results["total"] = len(files)
        
        for idx, file_path in enumerate(files, start=start_num):
            try:
                file_info = self._get_file_info(file_path)
                
                new_name = pattern
                new_name = new_name.replace("{num}", str(idx).zfill(3))
                new_name = new_name.replace("{ext}", file_info.extension[1:])
                new_name = new_name.replace("{date}", datetime.now().strftime("%Y%m%d"))
                new_name = new_name.replace("{name}", file_info.name)
                
                if not new_name.endswith(file_info.extension):
                    new_name += file_info.extension
                
                new_path = directory / new_name
                new_path = self._get_unique_path(new_path)
                
                file_path.rename(new_path)
                results["renamed"].append({"old": str(file_path), "new": str(new_path)})
                
            except Exception as e:
                results["errors"].append({"file": str(file_path), "error": str(e)})
        
        return results
    
    def analyze_storage(self, directory: str) -> Dict:
        """Analyze storage usage"""
        directory = Path(directory)
        analysis = {
            "total_size": 0, "file_count": 0, "by_type": {},
            "by_size_range": {"small": 0, "medium": 0, "large": 0},
            "oldest_file": None, "newest_file": None
        }
        
        oldest_time = float('inf')
        newest_time = 0
        
        for file_path in directory.rglob("*"):
            if file_path.is_file():
                try:
                    file_info = self._get_file_info(file_path)
                    analysis["file_count"] += 1
                    analysis["total_size"] += file_info.size
                    
                    file_type = file_info.type
                    if file_type not in analysis["by_type"]:
                        analysis["by_type"][file_type] = {"count": 0, "size": 0}
                    analysis["by_type"][file_type]["count"] += 1
                    analysis["by_type"][file_type]["size"] += file_info.size
                    
                    if file_info.size < 1024 * 1024:
                        analysis["by_size_range"]["small"] += 1
                    elif file_info.size < 100 * 1024 * 1024:
                        analysis["by_size_range"]["medium"] += 1
                    else:
                        analysis["by_size_range"]["large"] += 1
                    
                    created_time = file_info.created.timestamp()
                    if created_time < oldest_time:
                        oldest_time = created_time
                        analysis["oldest_file"] = asdict(file_info)
                    if created_time > newest_time:
                        newest_time = created_time
                        analysis["newest_file"] = asdict(file_info)
                        
                except Exception:
                    continue
        
        return analysis
    
    def _get_file_info(self, file_path: Path) -> FileInfo:
        """Get detailed file information"""
        stat = file_path.stat()
        
        mime_type, _ = mimetypes.guess_type(file_path)
        file_type = mime_type.split('/')[0] if mime_type else "unknown"
        extension = file_path.suffix.lower()
        
        return FileInfo(
            path=str(file_path),
            name=file_path.name,
            size=stat.st_size,
            type=file_type,
            extension=extension,
            created=datetime.fromtimestamp(stat.st_ctime),
            modified=datetime.fromtimestamp(stat.st_mtime),
            hash=self._get_file_hash(file_path),
            tags=[]
        )
    
    def _get_file_hash(self, file_path: Path, algorithm: str = "md5") -> str:
        """Calculate file hash"""
        hash_func = hashlib.new(algorithm)
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_func.update(chunk)
        return hash_func.hexdigest()
    
    def _categorize_file(self, file_info: FileInfo) -> str:
        """Categorize file based on extension"""
        for category, extensions in self.rules.items():
            if file_info.extension in extensions:
                return category
        return "other"
    
    def _get_unique_path(self, path: Path) -> Path:
        """Get unique path if file exists"""
        if not path.exists():
            return path
        counter = 1
        while True:
            new_path = path.parent / f"{path.stem}_{counter}{path.suffix}"
            if not new_path.exists():
                return new_path
            counter += 1

# Alias for backward compatibility
SmartFileOrganizer = FileOrganizerEngine

# Quick utility functions
def organize_files(source: str, target: str = None, method: str = "type") -> Dict:
    """Quick file organization"""
    organizer = FileOrganizerEngine()
    if method == "type":
        return organizer.organize_by_type(source, target)
    elif method == "date":
        # Add date-based organization if needed
        pass
    else:
        raise ValueError(f"Unknown method: {method}")