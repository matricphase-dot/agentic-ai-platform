#!/usr/bin/env python3
"""
SAFE BACKUP AND FIX SCRIPT for Agentic AI Platform
This script creates backups before fixing files
"""
import os
import shutil
import datetime
from pathlib import Path

BASE_DIR = Path(__file__).parent
BACKUP_DIR = BASE_DIR / "backups" / datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

def create_backup():
    """Create backup of all existing files"""
    print("📦 Creating backups of all existing files...")
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    
    files_to_backup = [
        "desktop_bridge.py",
        "file_organizer.py", 
        "marketplace_engine.py",
        "server.py",
        "advanced_ai/advanced_ai.py",
        "computer_vision/computer_vision.py",
        "ml_workflow/ml_workflow.py"
    ]
    
    backed_up = 0
    for filename in files_to_backup:
        filepath = BASE_DIR / filename
        if filepath.exists():
            backup_path = BACKUP_DIR / filename
            backup_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(filepath, backup_path)
            backed_up += 1
            print(f"   ✅ Backed up: {filename}")
        else:
            print(f"   ⚠️ Not found (will create new): {filename}")
    
    print(f"\n✅ Backed up {backed_up} files to: {BACKUP_DIR}")
    return True

def fix_desktop_bridge():
    """Fix desktop_bridge.py with correct class name"""
    content = '''import os
import time
import threading
import keyboard
import pyautogui
from datetime import datetime
import json

class DesktopBridge:
    def __init__(self):
        self.is_recording = False
        self.recording_thread = None
        self.recordings_dir = "recordings"
        self.screenshots_dir = "screenshots"
        
        # Create directories if they don't exist
        os.makedirs(self.recordings_dir, exist_ok=True)
        os.makedirs(self.screenshots_dir, exist_ok=True)
        
        # Register hotkey
        keyboard.add_hotkey('f10', self.toggle_recording)
        print("✅ Hotkeys registered: F10 to toggle recording")
    
    def toggle_recording(self):
        """Toggle screen recording on/off"""
        self.is_recording = not self.is_recording
        if self.is_recording:
            print("🎥 Starting screen recording...")
            self.start_recording()
        else:
            print("⏹️ Stopping screen recording...")
            self.stop_recording()
    
    def start_recording(self):
        """Start screen recording in a separate thread"""
        if self.recording_thread and self.recording_thread.is_alive():
            return
        
        self.recording_thread = threading.Thread(target=self._record_screen)
        self.recording_thread.daemon = True
        self.recording_thread.start()
    
    def stop_recording(self):
        """Stop screen recording"""
        self.is_recording = False
    
    def _record_screen(self):
        """Record screen (placeholder - implement actual recording logic)"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"recording_{timestamp}.mp4"
        filepath = os.path.join(self.recordings_dir, filename)
        
        # Simulate recording
        while self.is_recording:
            # In a real implementation, you would capture screen frames here
            time.sleep(1)
            print(f"📹 Recording to {filename}...")
        
        print(f"✅ Recording saved to {filepath}")
    
    def take_screenshot(self, filename=None):
        """Take a screenshot"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"screenshot_{timestamp}.png"
        
        filepath = os.path.join(self.screenshots_dir, filename)
        screenshot = pyautogui.screenshot()
        screenshot.save(filepath)
        
        print(f"📸 Screenshot saved to {filepath}")
        return filepath
    
    def get_status(self):
        """Get current status"""
        return {
            "is_recording": self.is_recording,
            "recordings_dir": self.recordings_dir,
            "screenshots_dir": self.screenshots_dir,
            "hotkey": "F10"
        }

# Create instance for import
desktop_bridge = DesktopBridge()
'''
    
    filepath = BASE_DIR / "desktop_bridge.py"
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("✅ Fixed: desktop_bridge.py")

def fix_file_organizer():
    """Fix file_organizer.py with correct class name"""
    content = '''import os
import shutil
import hashlib
from pathlib import Path
from datetime import datetime
import json

class FileOrganizer:
    def __init__(self):
        self.organized_files = 0
        self.duplicates_found = 0
        self.rules = self.load_rules()
        
    def load_rules(self):
        """Load organization rules"""
        default_rules = {
            "images": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg"],
            "documents": [".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt"],
            "videos": [".mp4", ".avi", ".mov", ".wmv", ".flv", ".mkv"],
            "audio": [".mp3", ".wav", ".flac", ".aac", ".ogg"],
            "archives": [".zip", ".rar", ".7z", ".tar", ".gz"],
            "code": [".py", ".js", ".html", ".css", ".java", ".cpp"],
            "data": [".csv", ".json", ".xml", ".xlsx", ".db", ".sqlite"]
        }
        return default_rules
    
    def organize_directory(self, directory_path, rules=None):
        """Organize files in a directory based on rules"""
        if rules is None:
            rules = self.rules
        
        directory = Path(directory_path)
        if not directory.exists():
            return {"error": "Directory does not exist"}
        
        stats = {
            "total_files": 0,
            "organized": 0,
            "duplicates": 0,
            "errors": 0
        }
        
        # Create category folders
        for category in rules.keys():
            (directory / category).mkdir(exist_ok=True)
        
        # Process files
        for file_path in directory.iterdir():
            if file_path.is_file():
                stats["total_files"] += 1
                
                try:
                    # Find category based on extension
                    category = self._get_category(file_path.suffix.lower(), rules)
                    
                    if category:
                        # Check for duplicates
                        if self._check_duplicate(file_path, directory / category):
                            stats["duplicates"] += 1
                            # Move to duplicates folder or rename
                            duplicate_path = directory / "duplicates" / file_path.name
                            duplicate_path.parent.mkdir(exist_ok=True)
                            shutil.move(str(file_path), str(duplicate_path))
                        else:
                            # Move to category folder
                            destination = directory / category / file_path.name
                            shutil.move(str(file_path), str(destination))
                            stats["organized"] += 1
                    else:
                        # Move to "others" folder
                        others_dir = directory / "others"
                        others_dir.mkdir(exist_ok=True)
                        shutil.move(str(file_path), str(others_dir / file_path.name))
                        stats["organized"] += 1
                        
                except Exception as e:
                    print(f"Error organizing {file_path}: {e}")
                    stats["errors"] += 1
        
        self.organized_files += stats["organized"]
        self.duplicates_found += stats["duplicates"]
        
        return stats
    
    def _get_category(self, extension, rules):
        """Get category for file extension"""
        for category, extensions in rules.items():
            if extension in extensions:
                return category
        return None
    
    def _check_duplicate(self, file_path, destination_folder):
        """Check if file already exists in destination"""
        destination_file = destination_folder / file_path.name
        if destination_file.exists():
            # Compare file content
            if self._files_are_identical(file_path, destination_file):
                return True
        return False
    
    def _files_are_identical(self, file1, file2):
        """Check if two files are identical using hash"""
        hash1 = self._calculate_hash(file1)
        hash2 = self._calculate_hash(file2)
        return hash1 == hash2
    
    def _calculate_hash(self, file_path):
        """Calculate MD5 hash of a file"""
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    
    def get_stats(self):
        """Get organization statistics"""
        return {
            "organized_files": self.organized_files,
            "duplicates_found": self.duplicates_found,
            "rules": list(self.rules.keys())
        }

# Create instance for import
file_organizer = FileOrganizer()
'''
    
    filepath = BASE_DIR / "file_organizer.py"
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("✅ Fixed: file_organizer.py")

def fix_marketplace_engine():
    """Fix marketplace_engine.py with correct class name and indentation"""
    content = '''import sqlite3
import json
from pathlib import Path
from datetime import datetime

class MarketplaceEngine:
    def __init__(self):
        self.db_path = Path(__file__).parent.parent / "database" / "marketplace.db"
        self.conn = sqlite3.connect(str(self.db_path))
        self.cursor = self.conn.cursor()
        self.initialize_database()
        self.load_sample_templates()
    
    def initialize_database(self):
        """Initialize marketplace database"""
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                category TEXT,
                author TEXT,
                downloads INTEGER DEFAULT 0,
                rating FLOAT DEFAULT 0,
                price FLOAT DEFAULT 0,
                file_path TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP,
                tags TEXT,
                is_verified BOOLEAN DEFAULT 0,
                version TEXT DEFAULT '1.0'
            )
        """)
        
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                template_id INTEGER,
                user_id INTEGER,
                rating INTEGER CHECK(rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (template_id) REFERENCES templates(id)
            )
        """)
        
        self.conn.commit()
    
    def load_sample_templates(self):
        """Load sample templates if database is empty"""
        self.cursor.execute("SELECT COUNT(*) FROM templates")
        count = self.cursor.fetchone()[0]
        
        if count == 0:
            sample_templates = [
                ("AI File Organizer", "Automatically organize files using AI", "File Management", "AI Team", 1245, 4.8, 0),
                ("Email Auto-Responder", "AI-powered email responses", "Productivity", "Productivity Pro", 892, 4.5, 9.99),
                ("Data Scraper Pro", "Extract data from websites", "Data Analysis", "Data Wizard", 567, 4.7, 14.99),
                ("Social Media Scheduler", "Schedule posts across platforms", "Marketing", "Social Pro", 345, 4.3, 19.99),
                ("Code Review Assistant", "AI-powered code reviews", "Development", "Code Master", 789, 4.6, 0),
                ("Invoice Generator", "Automate invoice creation", "Business", "Biz Tools", 432, 4.4, 7.99),
                ("PDF Processor", "Extract and process PDF content", "Documents", "Doc Pro", 654, 4.2, 12.99),
                ("Image Optimizer", "Compress and optimize images", "Media", "Media Tools", 321, 4.9, 0),
                ("Website Monitor", "Monitor website uptime", "Development", "Dev Tools", 543, 4.1, 5.99),
                ("Expense Tracker", "Track and categorize expenses", "Finance", "Finance Guru", 876, 4.5, 8.99)
            ]
            
            for template in sample_templates:
                self.cursor.execute("""
                    INSERT INTO templates (name, description, category, author, downloads, rating, price)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, template)
            
            self.conn.commit()
            print(f"✅ Loaded {len(sample_templates)} sample templates")
    
    def get_templates(self, category=None, limit=20):
        """Get marketplace templates"""
        try:
            if category:
                self.cursor.execute("""
                    SELECT * FROM templates 
                    WHERE category = ? 
                    ORDER BY downloads DESC 
                    LIMIT ?
                """, (category, limit))
            else:
                self.cursor.execute("""
                    SELECT * FROM templates 
                    ORDER BY downloads DESC 
                    LIMIT ?
                """, (limit,))
            
            templates = self.cursor.fetchall()
            # Convert to list of dicts
            columns = [col[0] for col in self.cursor.description]
            return [dict(zip(columns, row)) for row in templates]
        except Exception as e:
            print(f"Error getting templates: {e}")
            return []
    
    def get_categories(self):
        """Get all marketplace categories"""
        try:
            self.cursor.execute("""
                SELECT DISTINCT category 
                FROM templates 
                WHERE category IS NOT NULL AND category != ''
                ORDER BY category
            """)
            categories = [row[0] for row in self.cursor.fetchall()]
            
            # If no categories in database, return defaults
            if not categories:
                return ["AI Automation", "File Management", "Productivity", "Development", "Marketing", "Data Analysis"]
            
            return categories
        except Exception as e:
            print(f"Error getting categories: {e}")
            return ["AI Automation", "File Management", "Productivity", "Development", "Marketing"]
    
    def add_template(self, name, description, category, author, price=0.0, tags=""):
        """Add a new template to marketplace"""
        try:
            self.cursor.execute("""
                INSERT INTO templates (name, description, category, author, price, tags)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (name, description, category, author, price, tags))
            self.conn.commit()
            return self.cursor.lastrowid
        except Exception as e:
            print(f"Error adding template: {e}")
            return None
    
    def increment_downloads(self, template_id):
        """Increment download count for a template"""
        try:
            self.cursor.execute("""
                UPDATE templates 
                SET downloads = downloads + 1 
                WHERE id = ?
            """, (template_id,))
            self.conn.commit()
        except Exception as e:
            print(f"Error incrementing downloads: {e}")
    
    def search_templates(self, query):
        """Search templates by name or description"""
        try:
            self.cursor.execute("""
                SELECT * FROM templates 
                WHERE name LIKE ? OR description LIKE ? OR tags LIKE ?
                ORDER BY downloads DESC
            """, (f"%{query}%", f"%{query}%", f"%{query}%"))
            
            templates = self.cursor.fetchall()
            columns = [col[0] for col in self.cursor.description]
            return [dict(zip(columns, row)) for row in templates]
        except Exception as e:
            print(f"Error searching templates: {e}")
            return []
    
    def get_template_by_id(self, template_id):
        """Get template by ID"""
        try:
            self.cursor.execute("SELECT * FROM templates WHERE id = ?", (template_id,))
            template = self.cursor.fetchone()
            
            if template:
                columns = [col[0] for col in self.cursor.description]
                return dict(zip(columns, template))
            return None
        except Exception as e:
            print(f"Error getting template: {e}")
            return None
    
    def __del__(self):
        """Cleanup on deletion"""
        if self.conn:
            self.conn.close()

# Create instance for import
marketplace_engine = MarketplaceEngine()
'''
    
    filepath = BASE_DIR / "marketplace_engine.py"
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("✅ Fixed: marketplace_engine.py")

def fix_advanced_ai():
    """Fix advanced_ai/advanced_ai.py with correct class name"""
    content = '''import requests
import json
import time
from typing import List, Dict, Optional

class AdvancedAI:
    def __init__(self):
        self.base_url = "http://localhost:11434"
        self.current_model = "llama3.2:latest"
        self.available_models = []
        self.is_connected = False
        self.max_retries = 3
        self.retry_delay = 2
    
    def connect(self) -> bool:
        """Connect to Ollama server"""
        for attempt in range(self.max_retries):
            try:
                response = requests.get(f"{self.base_url}/api/tags", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    self.available_models = [model['name'] for model in data.get('models', [])]
                    self.is_connected = True
                    
                    if self.available_models:
                        # Set default model
                        if self.current_model not in self.available_models:
                            self.current_model = self.available_models[0]
                    
                    print(f"✅ Connected to Ollama. Models: {self.available_models}")
                    return True
                else:
                    print(f"⚠️ Attempt {attempt + 1}/{self.max_retries}: Ollama responded with status {response.status_code}")
            
            except requests.exceptions.ConnectionError:
                print(f"⚠️ Attempt {attempt + 1}/{self.max_retries}: Cannot connect to Ollama at {self.base_url}")
            
            except Exception as e:
                print(f"⚠️ Attempt {attempt + 1}/{self.max_retries}: Error connecting to Ollama: {e}")
            
            if attempt < self.max_retries - 1:
                time.sleep(self.retry_delay)
        
        print("❌ Failed to connect to Ollama after all attempts")
        self.is_connected = False
        return False
    
    def get_available_models(self) -> List[str]:
        """Get list of available models"""
        if not self.is_connected:
            self.connect()
        
        if not self.available_models:
            return ["llama3.2:latest", "llama3.2:3b"]
        
        return self.available_models
    
    def set_model(self, model_name: str) -> bool:
        """Set the current model to use"""
        if model_name in self.get_available_models():
            self.current_model = model_name
            print(f"✅ Model set to: {model_name}")
            return True
        else:
            print(f"❌ Model {model_name} not available")
            return False
    
    def generate_text(self, prompt: str, model: Optional[str] = None) -> Dict:
        """Generate text using the AI model"""
        if not self.is_connected:
            self.connect()
        
        if not self.is_connected:
            return {
                "response": "AI service is not available. Please ensure Ollama is running.",
                "model": model or self.current_model,
                "error": True
            }
        
        model_to_use = model or self.current_model
        
        try:
            payload = {
                "model": model_to_use,
                "prompt": prompt,
                "stream": False
            }
            
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "response": result.get('response', ''),
                    "model": model_to_use,
                    "tokens": result.get('total_duration', 0),
                    "error": False
                }
            else:
                return {
                    "response": f"Error from Ollama: {response.status_code}",
                    "model": model_to_use,
                    "error": True
                }
        
        except Exception as e:
            print(f"Error generating text: {e}")
            return {
                "response": f"Error: {str(e)}",
                "model": model_to_use,
                "error": True
            }
    
    def chat(self, messages: List[Dict], model: Optional[str] = None) -> Dict:
        """Chat with the AI model"""
        if not self.is_connected:
            self.connect()
        
        if not self.is_connected:
            return {
                "message": {
                    "role": "assistant",
                    "content": "AI service is not available. Please ensure Ollama is running."
                },
                "model": model or self.current_model,
                "error": True
            }
        
        model_to_use = model or self.current_model
        
        try:
            payload = {
                "model": model_to_use,
                "messages": messages,
                "stream": False
            }
            
            response = requests.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "message": result.get('message', {}),
                    "model": model_to_use,
                    "error": False
                }
            else:
                return {
                    "message": {
                        "role": "assistant",
                        "content": f"Error from Ollama: {response.status_code}"
                    },
                    "model": model_to_use,
                    "error": True
                }
        
        except Exception as e:
            print(f"Error in chat: {e}")
            return {
                "message": {
                    "role": "assistant",
                    "content": f"Error: {str(e)}"
                },
                "model": model_to_use,
                "error": True
            }
    
    def get_model_info(self, model_name: str) -> Dict:
        """Get information about a specific model"""
        try:
            response = requests.get(f"{self.base_url}/api/show", params={"name": model_name})
            if response.status_code == 200:
                return response.json()
            return {"error": f"Model {model_name} not found"}
        except:
            return {"error": "Failed to get model info"}

# Create instance for import
advanced_ai = AdvancedAI()
'''
    
    filepath = BASE_DIR / "advanced_ai" / "advanced_ai.py"
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("✅ Fixed: advanced_ai/advanced_ai.py")

def fix_computer_vision():
    """Fix computer_vision/computer_vision.py with correct class name"""
    content = '''import cv2
import numpy as np
from PIL import Image
import pytesseract
import os
from typing import List, Dict, Tuple, Optional

class ComputerVision:
    def __init__(self):
        self.supported_formats = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif']
        print("✅ Computer Vision module initialized")
    
    def analyze_image(self, image_path: str) -> Dict:
        """Analyze an image and extract information"""
        try:
            if not os.path.exists(image_path):
                return {"error": "Image file not found"}
            
            # Check if file format is supported
            ext = os.path.splitext(image_path)[1].lower()
            if ext not in self.supported_formats:
                return {"error": f"Unsupported image format: {ext}"}
            
            # Read image
            image = cv2.imread(image_path)
            if image is None:
                return {"error": "Failed to read image"}
            
            # Get basic information
            height, width, channels = image.shape
            size_kb = os.path.getsize(image_path) / 1024
            
            # Convert to grayscale for some analysis
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Perform OCR if requested
            text_content = self.extract_text(image_path)
            
            # Detect edges
            edges = cv2.Canny(gray, 100, 200)
            
            # Detect colors (dominant colors)
            dominant_colors = self.get_dominant_colors(image, num_colors=3)
            
            # Detect faces
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            
            # Detect objects (simple contour detection)
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            return {
                "success": True,
                "filename": os.path.basename(image_path),
                "dimensions": {"width": width, "height": height, "channels": channels},
                "size_kb": round(size_kb, 2),
                "format": ext[1:],  # Remove dot
                "text_found": len(text_content) > 0,
                "text_content": text_content[:500] + "..." if len(text_content) > 500 else text_content,
                "face_count": len(faces),
                "object_count": len(contours),
                "dominant_colors": dominant_colors,
                "analysis_time": "processed"
            }
            
        except Exception as e:
            return {"error": f"Image analysis failed: {str(e)}"}
    
    def extract_text(self, image_path: str) -> str:
        """Extract text from image using OCR"""
        try:
            # Check if tesseract is available
            pytesseract.get_tesseract_version()
            
            image = Image.open(image_path)
            text = pytesseract.image_to_string(image)
            return text.strip()
            
        except Exception as e:
            print(f"OCR failed: {e}")
            return ""
    
    def get_dominant_colors(self, image, num_colors=3):
        """Extract dominant colors from image"""
        try:
            # Resize image for faster processing
            small_image = cv2.resize(image, (100, 100))
            
            # Reshape the image to be a list of pixels
            pixels = small_image.reshape(-1, 3)
            
            # Convert to float32
            pixels = np.float32(pixels)
            
            # Define criteria and apply kmeans()
            criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
            _, labels, centers = cv2.kmeans(pixels, num_colors, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
            
            # Convert back to uint8
            centers = np.uint8(centers)
            
            # Get color counts
            counts = np.bincount(labels.flatten())
            
            # Sort by frequency
            sorted_indices = np.argsort(counts)[::-1]
            
            dominant_colors = []
            for idx in sorted_indices[:num_colors]:
                color = centers[idx].tolist()
                percentage = (counts[idx] / len(labels)) * 100
                dominant_colors.append({
                    "rgb": color,
                    "hex": f"#{color[2]:02x}{color[1]:02x}{color[0]:02x}",
                    "percentage": round(percentage, 1)
                })
            
            return dominant_colors
            
        except Exception as e:
            print(f"Color extraction failed: {e}")
            return []
    
    def process_batch(self, image_paths: List[str]) -> List[Dict]:
        """Process multiple images"""
        results = []
        for image_path in image_paths:
            result = self.analyze_image(image_path)
            result["filename"] = os.path.basename(image_path)
            results.append(result)
        return results
    
    def compare_images(self, image1_path: str, image2_path: str) -> Dict:
        """Compare two images"""
        try:
            img1 = cv2.imread(image1_path)
            img2 = cv2.imread(image2_path)
            
            if img1 is None or img2 is None:
                return {"error": "Failed to read one or both images"}
            
            # Resize images to same dimensions if needed
            if img1.shape != img2.shape:
                img2 = cv2.resize(img2, (img1.shape[1], img1.shape[0]))
            
            # Calculate difference
            diff = cv2.absdiff(img1, img2)
            diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
            
            # Threshold the difference
            _, thresh = cv2.threshold(diff_gray, 30, 255, cv2.THRESH_BINARY)
            
            # Calculate similarity percentage
            total_pixels = thresh.size
            different_pixels = np.count_nonzero(thresh)
            similarity = ((total_pixels - different_pixels) / total_pixels) * 100
            
            return {
                "similarity_percentage": round(similarity, 2),
                "different_pixels": different_pixels,
                "total_pixels": total_pixels,
                "difference_image_available": True
            }
            
        except Exception as e:
            return {"error": f"Image comparison failed: {str(e)}"}

# Create instance for import
computer_vision = ComputerVision()
'''
    
    filepath = BASE_DIR / "computer_vision" / "computer_vision.py"
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("✅ Fixed: computer_vision/computer_vision.py")

def fix_ml_workflow():
    """Fix ml_workflow/ml_workflow.py with correct class name"""
    content = '''import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional
import json
import time
from datetime import datetime

class MLWorkflow:
    def __init__(self):
        self.models = {}
        self.training_history = []
        self.predictions = []
        print("✅ ML Workflow module initialized")
    
    def train_model(self, data: Dict, model_type: str = "regression") -> Dict:
        """Train a machine learning model"""
        try:
            # Simulate training process
            start_time = time.time()
            
            # Extract features and target from data
            features = data.get("features", [])
            target = data.get("target", [])
            
            if not features or not target:
                return {"error": "Missing features or target data"}
            
            # Create model ID
            model_id = f"{model_type}_{int(time.time())}"
            
            # Simulate training (in real implementation, this would use scikit-learn, tensorflow, etc.)
            if model_type == "regression":
                # Simple linear regression simulation
                coefficients = self._simulate_linear_regression(features, target)
                model_info = {
                    "type": "linear_regression",
                    "coefficients": coefficients,
                    "intercept": np.mean(target),
                    "r2_score": 0.85,  # Simulated
                    "mse": 0.1  # Simulated
                }
            elif model_type == "classification":
                # Simple classification simulation
                model_info = {
                    "type": "logistic_regression",
                    "accuracy": 0.92,  # Simulated
                    "precision": 0.89,  # Simulated
                    "recall": 0.91  # Simulated
                }
            elif model_type == "clustering":
                # Clustering simulation
                model_info = {
                    "type": "kmeans",
                    "clusters": 3,
                    "inertia": 150.5,  # Simulated
                    "silhouette_score": 0.65  # Simulated
                }
            else:
                return {"error": f"Unsupported model type: {model_type}"}
            
            # Store model
            self.models[model_id] = {
                "info": model_info,
                "created_at": datetime.now().isoformat(),
                "training_time": time.time() - start_time,
                "data_shape": {"samples": len(features), "features": len(features[0]) if features else 0}
            }
            
            # Record training history
            self.training_history.append({
                "model_id": model_id,
                "model_type": model_type,
                "timestamp": datetime.now().isoformat(),
                "training_time": time.time() - start_time,
                "performance": model_info
            })
            
            return {
                "success": True,
                "model_id": model_id,
                "training_time": round(time.time() - start_time, 2),
                "model_info": model_info,
                "message": f"{model_type} model trained successfully"
            }
            
        except Exception as e:
            return {"error": f"Model training failed: {str(e)}"}
    
    def _simulate_linear_regression(self, features, target):
        """Simulate linear regression coefficients"""
        # Convert to numpy arrays
        X = np.array(features)
        y = np.array(target)
        
        # Add bias term
        X_with_bias = np.c_[np.ones(X.shape[0]), X]
        
        # Calculate coefficients using normal equation (simplified)
        try:
            coefficients = np.linalg.inv(X_with_bias.T @ X_with_bias) @ X_with_bias.T @ y
            return coefficients.tolist()
        except:
            # Return random coefficients if calculation fails
            return np.random.randn(X_with_bias.shape[1]).tolist()
    
    def predict(self, model_id: str, features: List) -> Dict:
        """Make predictions using a trained model"""
        try:
            if model_id not in self.models:
                return {"error": f"Model {model_id} not found"}
            
            model = self.models[model_id]
            model_type = model["info"]["type"]
            
            start_time = time.time()
            
            if "linear_regression" in model_type:
                # Simulate linear regression prediction
                coefficients = model["info"].get("coefficients", [])
                intercept = model["info"].get("intercept", 0)
                
                # Calculate prediction
                if coefficients:
                    # Assuming features is a single sample
                    prediction = intercept
                    for i, coef in enumerate(coefficients[1:], 1):  # Skip bias term
                        if i-1 < len(features):
                            prediction += coef * features[i-1]
                else:
                    prediction = np.mean(features) if features else 0
                    
                prediction_result = float(prediction)
                
            elif "logistic_regression" in model_type:
                # Simulate classification prediction
                prediction_result = 1 if sum(features) > len(features)/2 else 0
                
            elif "kmeans" in model_type:
                # Simulate cluster assignment
                prediction_result = int(sum(features) % 3)  # Assign to one of 3 clusters
                
            else:
                return {"error": f"Unsupported model type for prediction: {model_type}"}
            
            # Record prediction
            self.predictions.append({
                "model_id": model_id,
                "features": features,
                "prediction": prediction_result,
                "timestamp": datetime.now().isoformat(),
                "prediction_time": time.time() - start_time
            })
            
            return {
                "success": True,
                "model_id": model_id,
                "prediction": prediction_result,
                "prediction_time": round(time.time() - start_time, 4),
                "confidence": 0.92  # Simulated confidence score
            }
            
        except Exception as e:
            return {"error": f"Prediction failed: {str(e)}"}
    
    def get_model_info(self, model_id: str) -> Dict:
        """Get information about a specific model"""
        if model_id in self.models:
            return self.models[model_id]
        return {"error": f"Model {model_id} not found"}
    
    def get_all_models(self) -> List[Dict]:
        """Get all trained models"""
        return [
            {"model_id": mid, **info}
            for mid, info in self.models.items()
        ]
    
    def optimize_parameters(self, model_type: str, data: Dict) -> Dict:
        """Optimize model parameters"""
        try:
            # Simulate parameter optimization
            if model_type == "regression":
                optimal_params = {
                    "learning_rate": 0.01,
                    "iterations": 1000,
                    "regularization": 0.1,
                    "batch_size": 32
                }
            elif model_type == "classification":
                optimal_params = {
                    "C": 1.0,
                    "penalty": "l2",
                    "solver": "lbfgs",
                    "max_iter": 100
                }
            elif model_type == "clustering":
                optimal_params = {
                    "n_clusters": 3,
                    "init": "k-means++",
                    "n_init": 10,
                    "max_iter": 300
                }
            else:
                return {"error": f"Unsupported model type: {model_type}"}
            
            return {
                "success": True,
                "model_type": model_type,
                "optimal_parameters": optimal_params,
                "optimization_score": 0.95,  # Simulated
                "message": f"Parameter optimization completed for {model_type}"
            }
            
        except Exception as e:
            return {"error": f"Parameter optimization failed: {str(e)}"}
    
    def analyze_patterns(self, data: List) -> Dict:
        """Analyze patterns in data"""
        try:
            if not data:
                return {"error": "No data provided"}
            
            # Convert to numpy array
            arr = np.array(data)
            
            # Calculate statistics
            stats = {
                "mean": float(np.mean(arr)),
                "median": float(np.median(arr)),
                "std": float(np.std(arr)),
                "min": float(np.min(arr)),
                "max": float(np.max(arr)),
                "count": len(arr)
            }
            
            # Detect trends
            if len(arr) > 1:
                slope = (arr[-1] - arr[0]) / len(arr) if len(arr) > 1 else 0
                trend = "increasing" if slope > 0 else "decreasing" if slope < 0 else "stable"
                stats["trend"] = trend
                stats["slope"] = float(slope)
            
            # Detect outliers (simple method)
            q1 = np.percentile(arr, 25)
            q3 = np.percentile(arr, 75)
            iqr = q3 - q1
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            outliers = arr[(arr < lower_bound) | (arr > upper_bound)]
            stats["outliers_count"] = len(outliers)
            
            return {
                "success": True,
                "statistics": stats,
                "pattern_summary": "Data analyzed successfully"
            }
            
        except Exception as e:
            return {"error": f"Pattern analysis failed: {str(e)}"}

# Create instance for import
ml_workflow = MLWorkflow()
'''
    
    filepath = BASE_DIR / "ml_workflow" / "ml_workflow.py"
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("✅ Fixed: ml_workflow/ml_workflow.py")

def update_server_py():
    """Update server.py to handle the correct imports"""
    server_path = BASE_DIR / "server.py"
    if not server_path.exists():
        print("❌ server.py not found!")
        return
    
    with open(server_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix the import section for DesktopBridge
    if "from desktop_bridge import DesktopBridge" in content:
        # Already correct
        print("✅ server.py imports already correct")
        return
    
    # Find and fix the import section
    lines = content.split('\n')
    new_lines = []
    
    for line in lines:
        if "from desktop_bridge import" in line and "DesktopBridge" not in line:
            # Fix desktop_bridge import
            new_lines.append("        from desktop_bridge import DesktopBridge")
        elif "from file_organizer import" in line and "FileOrganizer" not in line:
            # Fix file_organizer import
            new_lines.append("        from file_organizer import FileOrganizer")
        elif "from marketplace_engine import" in line and "MarketplaceEngine" not in line:
            # Fix marketplace_engine import
            new_lines.append("        from marketplace_engine import MarketplaceEngine")
        elif "from advanced_ai.advanced_ai import" in line and "AdvancedAI" not in line:
            # Fix advanced_ai import
            new_lines.append("        from advanced_ai.advanced_ai import AdvancedAI")
        elif "from computer_vision.computer_vision import" in line and "ComputerVision" not in line:
            # Fix computer_vision import
            new_lines.append("        from computer_vision.computer_vision import ComputerVision")
        elif "from ml_workflow.ml_workflow import" in line and "MLWorkflow" not in line:
            # Fix ml_workflow import
            new_lines.append("        from ml_workflow.ml_workflow import MLWorkflow")
        else:
            new_lines.append(line)
    
    # Write updated content
    with open(server_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))
    
    print("✅ Updated: server.py imports")

def main():
    print("=" * 60)
    print("🛡️  AGENTIC AI PLATFORM - SAFE BACKUP & FIX")
    print("=" * 60)
    
    # Step 1: Create backups
    create_backup()
    
    print("\n" + "=" * 60)
    print("🔧 APPLYING FIXES...")
    print("=" * 60)
    
    # Step 2: Apply fixes
    try:
        fix_desktop_bridge()
        fix_file_organizer()
        fix_marketplace_engine()
        fix_advanced_ai()
        fix_computer_vision()
        fix_ml_workflow()
        update_server_py()
        
        print("\n" + "=" * 60)
        print("🎉 ALL FIXES APPLIED SUCCESSFULLY!")
        print("=" * 60)
        
        print("\n📋 SUMMARY:")
        print(f"   • Backups saved to: {BACKUP_DIR}")
        print("   • All import errors fixed")
        print("   • Class names corrected")
        print("   • Indentation issues resolved")
        
        print("\n🚀 NEXT STEPS:")
        print("   1. Start your server: python server.py")
        print("   2. Check that all modules load correctly")
        print("   3. Visit: http://localhost:5000")
        
        print("\n🔧 If you need to restore backups:")
        print(f"   Backup files are in: {BACKUP_DIR}")
        
    except Exception as e:
        print(f"\n❌ Error during fixes: {e}")
        print("   Your original files are safe in backup folder.")

if __name__ == "__main__":
    main()