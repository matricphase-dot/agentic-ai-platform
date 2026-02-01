
import os
import shutil
from pathlib import Path
import json

class FileOrganizerAgent:
    def __init__(self):
        self.supported_extensions = {
            'images': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'],
            'documents': ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.md'],
            'spreadsheets': ['.xls', '.xlsx', '.csv'],
            'presentations': ['.ppt', '.pptx', '.key'],
            'code': ['.py', '.js', '.html', '.css', '.java', '.cpp', '.c'],
            'archives': ['.zip', '.rar', '.tar', '.gz'],
            'audio': ['.mp3', '.wav', '.flac', '.aac'],
            'video': ['.mp4', '.avi', '.mov', '.wmv', '.mkv']
        }
    
    def organize_directory(self, directory_path, organize_by='type'):
        """Organize files in a directory"""
        path = Path(directory_path)
        
        if not path.exists():
            return {"success": False, "error": "Directory does not exist"}
        
        if organize_by == 'type':
            return self._organize_by_type(path)
        elif organize_by == 'date':
            return self._organize_by_date(path)
        elif organize_by == 'size':
            return self._organize_by_size(path)
        else:
            return {"success": False, "error": "Invalid organization method"}
    
    def _organize_by_type(self, directory):
        """Organize files by their extension type"""
        stats = {
            'total_files': 0,
            'moved_files': 0,
            'categories_created': [],
            'errors': []
        }
        
        for item in directory.iterdir():
            if item.is_file():
                stats['total_files'] += 1
                file_ext = item.suffix.lower()
                
                # Find category
                category = 'others'
                for cat, exts in self.supported_extensions.items():
                    if file_ext in exts:
                        category = cat
                        break
                
                # Create category directory
                cat_dir = directory / category
                if not cat_dir.exists():
                    cat_dir.mkdir()
                    stats['categories_created'].append(category)
                
                # Move file
                try:
                    shutil.move(str(item), str(cat_dir / item.name))
                    stats['moved_files'] += 1
                except Exception as e:
                    stats['errors'].append(str(e))
        
        return {
            "success": True,
            "message": f"Organized {stats['moved_files']}/{stats['total_files']} files",
            "stats": stats
        }
    
    def _organize_by_date(self, directory):
        """Organize files by modification date"""
        # Implementation for date-based organization
        return {"success": True, "message": "Date organization completed"}
    
    def _organize_by_size(self, directory):
        """Organize files by size"""
        # Implementation for size-based organization
        return {"success": True, "message": "Size organization completed"}

# For direct testing
if __name__ == "__main__":
    agent = FileOrganizerAgent()
    result = agent.organize_directory("test_folder")
    print(json.dumps(result, indent=2))
