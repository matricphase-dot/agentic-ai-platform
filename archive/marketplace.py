"""
marketplace.py - Automation Template Marketplace
Free automation templates for users to download and use
"""
import sqlite3
import json
import os
from datetime import datetime
from typing import List, Dict, Optional

class AutomationMarketplace:
    def __init__(self):
        self.db_path = "database/marketplace.db"
        self.templates_dir = "templates/automations"
        self.init_database()
        self.ensure_starter_templates()
    
    def init_database(self):
        """Initialize the marketplace database"""
        os.makedirs("database", exist_ok=True)
        os.makedirs(self.templates_dir, exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Templates table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                category TEXT,
                difficulty TEXT,
                time_saved TEXT,
                code TEXT NOT NULL,
                author TEXT DEFAULT 'Agentic AI',
                downloads INTEGER DEFAULT 0,
                rating REAL DEFAULT 0,
                tags TEXT,
                featured INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # User downloads table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_downloads (
                user_id TEXT,
                template_id INTEGER,
                downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, template_id)
            )
''')
        
        # Template reviews table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                template_id INTEGER,
                user_id TEXT,
                rating INTEGER,
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        
        print(f"✅ Marketplace database initialized at {self.db_path}")
    
    def ensure_starter_templates(self):
        """Add starter templates if database is empty"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM templates")
        count = cursor.fetchone()[0]
        
        if count == 0:
            print("Adding starter templates to marketplace...")
            starter_templates = self.get_starter_templates()
            
            for template in starter_templates:
                # Save template file
                template_file = f"{self.templates_dir}/{template['filename']}"
                with open(template_file, "w") as f:
                    f.write(template["code"])
                
                # Insert into database
                cursor.execute('''
                    INSERT INTO templates (
                        title, description, category, difficulty, 
                        time_saved, code, author, tags, featured
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    template["title"],
                    template["description"],
                    template["category"],
                    template["difficulty"],
                    template["time_saved"],
                    template["code"],
                    template["author"],
                    template["tags"],
                    1 if template.get("featured") else 0
                ))
            
            conn.commit()
            print(f"✅ Added {len(starter_templates)} starter templates")
        
        conn.close()
    
    def get_starter_templates(self) -> List[Dict]:
        """Get starter automation templates"""
        return [
            {
                "title": "Smart File Organizer",
                "description": "Automatically organize files by type, date, and size",
                "category": "file_management",
                "difficulty": "Beginner",
                "time_saved": "2 hours/week",
                "filename": "file_organizer.py",
                "author": "Agentic AI",
                "tags": "file,organize,automation",
                "featured": True,
                "code": '''"""
Smart File Organizer
Automatically organizes files in a directory by type, date, and size.
"""

import os
import shutil
from datetime import datetime
import time

def organize_by_type(source_dir, destination_dir=None):
    """
    Organize files by their extension type.
    
    Args:
        source_dir: Directory to organize
        destination_dir: Where to move organized files (defaults to source_dir/Organized)
    """
    if destination_dir is None:
        destination_dir = os.path.join(source_dir, "Organized")
    
    # Create category folders
    categories = {
        "Images": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg"],
        "Documents": [".pdf", ".doc", ".docx", ".txt", ".rtf", ".xls", ".xlsx"],
        "Videos": [".mp4", ".avi", ".mov", ".mkv", ".wmv"],
        "Audio": [".mp3", ".wav", ".flac", ".aac"],
        "Archives": [".zip", ".rar", ".7z", ".tar", ".gz"],
        "Code": [".py", ".js", ".html", ".css", ".java", ".cpp"],
        "Executables": [".exe", ".msi", ".bat", ".sh"]
    }
    
    # Create destination directories
    os.makedirs(destination_dir, exist_ok=True)
    for category in categories:
        os.makedirs(os.path.join(destination_dir, category), exist_ok=True)
    
    # Process files
    organized_count = 0
    for filename in os.listdir(source_dir):
        filepath = os.path.join(source_dir, filename)
        
        # Skip directories
        if os.path.isdir(filepath):
            continue
        
        # Get file extension
        _, extension = os.path.splitext(filename)
        extension = extension.lower()
        
        # Find category
        moved = False
        for category, extensions in categories.items():
            if extension in extensions:
                dest_path = os.path.join(destination_dir, category, filename)
                
                # Avoid overwriting
                if os.path.exists(dest_path):
                    name, ext = os.path.splitext(filename)
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    dest_path = os.path.join(destination_dir, category, f"{name}_{timestamp}{ext}")
                
                shutil.move(filepath, dest_path)
                print(f"📁 Moved {filename} to {category}/")
                organized_count += 1
                moved = True
                break
        
        # If no category found, put in "Other"
        if not moved:
            other_dir = os.path.join(destination_dir, "Other")
            os.makedirs(other_dir, exist_ok=True)
            shutil.move(filepath, os.path.join(other_dir, filename))
            print(f"📁 Moved {filename} to Other/")
            organized_count += 1
    
    return organized_count

def organize_by_date(source_dir, destination_dir=None):
    """
    Organize files by their creation/modification date.
    """
    if destination_dir is None:
        destination_dir = os.path.join(source_dir, "Organized_By_Date")
    
    os.makedirs(destination_dir, exist_ok=True)
    
    organized_count = 0
    for filename in os.listdir(source_dir):
        filepath = os.path.join(source_dir, filename)
        
        if os.path.isdir(filepath):
            continue
        
        # Get file modification time
        mod_time = os.path.getmtime(filepath)
        date_str = datetime.fromtimestamp(mod_time).strftime("%Y-%m-%d")
        
        # Create date folder
        date_dir = os.path.join(destination_dir, date_str)
        os.makedirs(date_dir, exist_ok=True)
        
        # Move file
        shutil.move(filepath, os.path.join(date_dir, filename))
        print(f"📅 Organized {filename} by date: {date_str}")
        organized_count += 1
    
    return organized_count

def organize_by_size(source_dir, destination_dir=None):
    """
    Organize files by their size.
    """
    if destination_dir is None:
        destination_dir = os.path.join(source_dir, "Organized_By_Size")
    
    os.makedirs(destination_dir, exist_ok=True)
    
    # Size categories in bytes
    size_categories = {
        "Tiny (< 1MB)": 1024 * 1024,
        "Small (1-10MB)": 10 * 1024 * 1024,
        "Medium (10-100MB)": 100 * 1024 * 1024,
        "Large (100MB-1GB)": 1024 * 1024 * 1024,
        "Huge (> 1GB)": float('inf')
    }
    
    # Create category folders
    for category in size_categories:
        os.makedirs(os.path.join(destination_dir, category), exist_ok=True)
    
    organized_count = 0
    for filename in os.listdir(source_dir):
        filepath = os.path.join(source_dir, filename)
        
        if os.path.isdir(filepath):
            continue
        
        # Get file size
        size = os.path.getsize(filepath)
        
        # Find category
        for category, max_size in size_categories.items():
            if size < max_size:
                dest_path = os.path.join(destination_dir, category, filename)
                shutil.move(filepath, dest_path)
                print(f"📏 Organized {filename} by size: {category}")
                organized_count += 1
                break
    
    return organized_count

def main():
    """Main function to run file organization"""
    print("="*50)
    print("📁 SMART FILE ORGANIZER")
    print("="*50)
    
    # Get source directory
    source_dir = input("Enter directory to organize (press Enter for current): ").strip()
    if not source_dir:
        source_dir = os.getcwd()
    
    if not os.path.exists(source_dir):
        print(f"❌ Directory not found: {source_dir}")
        return
    
    print(f"📂 Organizing: {source_dir}")
    print()
    
    # Choose organization method
    print("Choose organization method:")
    print("1. By File Type")
    print("2. By Date")
    print("3. By Size")
    print("4. All Methods")
    
    choice = input("Enter choice (1-4): ").strip()
    
    total_organized = 0
    
    if choice == "1":
        total_organized = organize_by_type(source_dir)
    elif choice == "2":
        total_organized = organize_by_date(source_dir)
    elif choice == "3":
        total_organized = organize_by_size(source_dir)
    elif choice == "4":
        total_organized = 0
        total_organized += organize_by_type(source_dir)
        total_organized += organize_by_date(source_dir)
        total_organized += organize_by_size(source_dir)
    else:
        print("❌ Invalid choice")
        return
    
    print()
    print("="*50)
    print(f"✅ Organized {total_organized} files successfully!")
    print("="*50)

if __name__ == "__main__":
    main()
'''
            },
            {
                "title": "Auto Screenshot Taker",
                "description": "Take scheduled screenshots and organize them automatically",
                "category": "productivity",
                "difficulty": "Intermediate",
                "time_saved": "1 hour/week",
                "filename": "screenshot_taker.py",
                "author": "Agentic AI",
                "tags": "screenshot,automation,productivity",
                "featured": True,
                "code": '''"""
Auto Screenshot Taker
Takes scheduled screenshots and organizes them automatically.
"""

import pyautogui
import time
import os
from datetime import datetime
import schedule
import threading

class ScreenshotAutomation:
    def __init__(self, output_dir="screenshots"):
        self.output_dir = output_dir
        self.running = False
        self.create_output_structure()
    
    def create_output_structure(self):
        """Create organized directory structure for screenshots"""
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Create date-based folders
        today = datetime.now().strftime("%Y-%m-%d")
        self.today_dir = os.path.join(self.output_dir, today)
        os.makedirs(self.today_dir, exist_ok=True)
        
        # Create category folders
        categories = ["Work", "Personal", "Meetings", "Research", "Other"]
        for category in categories:
            os.makedirs(os.path.join(self.today_dir, category), exist_ok=True)
        
        print(f"📁 Screenshots will be saved to: {self.today_dir}")
    
    def take_screenshot(self, category="Work", note=""):
        """Take a screenshot and save it with metadata"""
        try:
            # Create timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # Create filename
            if note:
                filename = f"{category}_{timestamp}_{note}.png"
            else:
                filename = f"{category}_{timestamp}.png"
            
            # Full path
            filepath = os.path.join(self.today_dir, category, filename)
            
            # Take screenshot
            screenshot = pyautogui.screenshot()
            screenshot.save(filepath)
            
            # Log the action
            log_entry = f"[{datetime.now().strftime('%H:%M:%S')}] Screenshot: {filename}"
            print(log_entry)
            
            # Save to log file
            with open(os.path.join(self.output_dir, "screenshot_log.txt"), "a") as f:
                f.write(log_entry + "\\n")
            
            return filepath
            
        except Exception as e:
            print(f"❌ Error taking screenshot: {e}")
            return None
    
    def scheduled_screenshot(self, interval_minutes=60, category="Work"):
        """Take screenshots at regular intervals"""
        def job():
            print(f"📸 Taking scheduled screenshot ({category})...")
            self.take_screenshot(category, "scheduled")
        
        # Schedule the job
        schedule.every(interval_minutes).minutes.do(job)
        
        print(f"⏰ Scheduled screenshot every {interval_minutes} minutes")
        return job
    
    def start(self):
        """Start the automation"""
        self.running = True
        print("🚀 Starting screenshot automation...")
        print("Press Ctrl+C to stop")
        
        # Run scheduled tasks in background
        def run_schedule():
            while self.running:
                schedule.run_pending()
                time.sleep(1)
        
        schedule_thread = threading.Thread(target=run_schedule, daemon=True)
        schedule_thread.start()
        
        # Keep main thread alive
        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            self.stop()
    
    def stop(self):
        """Stop the automation"""
        self.running = False
        print("🛑 Screenshot automation stopped")
    
    def manual_screenshot(self):
        """Take a manual screenshot with user input"""
        print("\\n📸 Manual Screenshot")
        print("-" * 30)
        
        print("Categories:")
        print("1. Work")
        print("2. Personal")
        print("3. Meetings")
        print("4. Research")
        print("5. Other")
        
        category_choice = input("Select category (1-5): ").strip()
        categories = ["Work", "Personal", "Meetings", "Research", "Other"]
        
        if category_choice in ["1", "2", "3", "4", "5"]:
            category = categories[int(category_choice) - 1]
            note = input("Add a note (optional): ").strip()
            
            filepath = self.take_screenshot(category, note)
            if filepath:
                print(f"✅ Screenshot saved: {filepath}")
        else:
            print("❌ Invalid choice")

def main():
    """Main function"""
    print("="*50)
    print("📸 AUTO SCREENSHOT TAKER")
    print("="*50)
    
    automator = ScreenshotAutomation()
    
    while True:
        print("\\nOptions:")
        print("1. Take manual screenshot")
        print("2. Start scheduled screenshots (every hour)")
        print("3. Start scheduled screenshots (every 30 minutes)")
        print("4. Start scheduled screenshots (every 15 minutes)")
        print("5. Stop automation")
        print("6. Exit")
        
        choice = input("Enter choice (1-6): ").strip()
        
        if choice == "1":
            automator.manual_screenshot()
        elif choice == "2":
            automator.scheduled_screenshot(60, "Work")
            print("✅ Scheduled hourly screenshots")
        elif choice == "3":
            automator.scheduled_screenshot(30, "Work")
            print("✅ Scheduled 30-minute screenshots")
        elif choice == "4":
            automator.scheduled_screenshot(15, "Work")
            print("✅ Scheduled 15-minute screenshots")
        elif choice == "5":
            automator.stop()
        elif choice == "6":
            automator.stop()
            break
        else:
            print("❌ Invalid choice")

if __name__ == "__main__":
    main()
'''
            },
            {
                "title": "Website Automation Bot",
                "description": "Automate repetitive browser tasks like form filling, scraping, and clicking",
                "category": "web_automation",
                "difficulty": "Intermediate",
                "time_saved": "5 hours/week",
                "filename": "web_automation.py",
                "author": "Agentic AI",
                "tags": "browser,automation,web,scraping",
                "featured": True,
                "code": '''"""
Website Automation Bot
Automates repetitive browser tasks like form filling, scraping, and clicking.
"""

import pyautogui
import time
import webbrowser
import keyboard
from datetime import datetime
import os

class WebAutomation:
    def __init__(self):
        self.browser = "chrome"  # Change to "firefox" or "edge" as needed
        self.delay = 1  # Default delay between actions
        self.log_file = "web_automation_log.txt"
    
    def open_browser(self, url=None):
        """Open browser and navigate to URL"""
        print(f"🌐 Opening {self.browser} browser...")
        
        # Open browser
        pyautogui.hotkey('win', 'r')
        time.sleep(0.5)
        pyautogui.write(self.browser)
        pyautogui.press('enter')
        time.sleep(3)
        
        # Navigate to URL if provided
        if url:
            pyautogui.hotkey('ctrl', 'l')  # Focus address bar
            time.sleep(0.5)
            pyautogui.write(url)
            pyautogui.press('enter')
            time.sleep(2)
        
        self.log_action(f"Opened browser: {url if url else 'homepage'}")
    
    def login_automation(self, url, username, password, username_field="username", password_field="password"):
        """Automate login process"""
        print(f"🔐 Logging into {url}")
        
        self.open_browser(url)
        time.sleep(self.delay * 2)
        
        # Fill username
        pyautogui.press('tab')  # Navigate to first field
        time.sleep(0.5)
        pyautogui.write(username)
        
        # Fill password
        pyautogui.press('tab')
        time.sleep(0.5)
        pyautogui.write(password)
        
        # Submit
        pyautogui.press('enter')
        time.sleep(self.delay * 2)
        
        self.log_action(f"Logged into {url}")
        return True
    
    def form_filler(self, form_data):
        """
        Fill a web form with provided data.
        
        Args:
            form_data: Dictionary with field names and values
        """
        print("📝 Filling form...")
        
        for field, value in form_data.items():
            print(f"  {field}: {value}")
            pyautogui.write(str(value))
            pyautogui.press('tab')
            time.sleep(0.3)
        
        self.log_action(f"Filled form with {len(form_data)} fields")
    
    def screenshot_page(self, filename=None):
        """Take screenshot of current page"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"web_screenshot_{timestamp}.png"
        
        # Create screenshots directory
        os.makedirs("web_screenshots", exist_ok=True)
        filepath = os.path.join("web_screenshots", filename)
        
        screenshot = pyautogui.screenshot()
        screenshot.save(filepath)
        
        print(f"📸 Screenshot saved: {filepath}")
        self.log_action(f"Took screenshot: {filename}")
        
        return filepath
    
    def scrape_data(self, x, y, width, height):
        """
        Simple data scraping by taking screenshot of specific area.
        For advanced scraping, use Selenium or BeautifulSoup.
        """
        print("🔍 Scraping data from screen area...")
        
        # Take screenshot of specific area
        screenshot = pyautogui.screenshot(region=(x, y, width, height))
        
        # Save for analysis
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"scraped_data_{timestamp}.png"
        os.makedirs("scraped_data", exist_ok=True)
        filepath = os.path.join("scraped_data", filename)
        screenshot.save(filepath)
        
        self.log_action(f"Scraped data from area: {x},{y},{width},{height}")
        
        return filepath
    
    def click_element(self, x, y, clicks=1, button='left'):
        """Click at specific coordinates"""
        print(f"🖱️ Clicking at ({x}, {y})")
        
        # Move mouse to position
        pyautogui.moveTo(x, y, duration=0.5)
        time.sleep(0.5)
        
        # Click
        pyautogui.click(x, y, clicks=clicks, button=button)
        time.sleep(self.delay)
        
        self.log_action(f"Clicked at ({x}, {y})")
    
    def type_text(self, text, delay=0.1):
        """Type text with optional delay between keystrokes"""
        print(f"⌨️ Typing: {text[:50]}..." if len(text) > 50 else f"⌨️ Typing: {text}")
        
        pyautogui.write(text, interval=delay)
        self.log_action(f"Typed text: {text[:30]}...")
    
    def log_action(self, action):
        """Log automation action"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {action}"
        
        print(f"📝 {log_entry}")
        
        # Save to log file
        with open(self.log_file, "a") as f:
            f.write(log_entry + "\\n")
    
    def emergency_stop(self):
        """Emergency stop function"""
        print("🛑 EMERGENCY STOP ACTIVATED")
        print("Automation stopped. Press Ctrl+C to exit completely.")
        
        # Log emergency stop
        self.log_action("EMERGENCY STOP - Automation halted")
        
        # You can add cleanup actions here
        raise SystemExit

def main():
    """Main function with example usage"""
    print("="*50)
    print("🌐 WEBSITE AUTOMATION BOT")
    print("="*50)
    
    bot = WebAutomation()
    
    # Set up emergency stop hotkey
    keyboard.add_hotkey('esc', bot.emergency_stop)
    print("⚠️  Press ESC for emergency stop")
    print()
    
    # Example: Login automation
    print("Example 1: Login Automation")
    print("-" * 30)
    
    url = input("Enter login URL: ").strip()
    username = input("Enter username: ").strip()
    password = input("Enter password: ").strip()
    
    if url and username and password:
        print("\\nStarting login automation in 5 seconds...")
        print("Switch to this window to stop automation.")
        time.sleep(5)
        
        try:
            bot.login_automation(url, username, password)
            print("✅ Login automation completed")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    # Example: Form filling
    print("\\nExample 2: Form Filling")
    print("-" * 30)
    
    form_data = {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "123-456-7890",
        "message": "This is an automated message from Agentic AI."
    }
    
    print("Form data prepared. Ready to fill? (y/n)")
    if input().lower() == 'y':
        print("Starting form filling in 3 seconds...")
        time.sleep(3)
        
        bot.form_filler(form_data)
        print("✅ Form filling completed")
    
    print("\\n🎉 Automation examples completed!")
    print("Check log file for details:", bot.log_file)

if __name__ == "__main__":
    main()
'''
            },
            {
                "title": "Data Backup Automation",
                "description": "Automatically backup important files to multiple locations",
                "category": "backup",
                "difficulty": "Beginner",
                "time_saved": "Prevents data loss",
                "filename": "backup_automation.py",
                "author": "Agentic AI",
                "tags": "backup,files,safety",
                "code": '''"""
Data Backup Automation
Automatically backup important files to multiple locations.
"""

import os
import shutil
import zipfile
from datetime import datetime
import time
import hashlib

class BackupAutomation:
    def __init__(self):
        self.backup_history = []
        self.config_file = "backup_config.json"
    
    def backup_files(self, source_dirs, destination_dir, backup_name=None):
        """
        Backup files from source directories to destination.
        
        Args:
            source_dirs: List of source directories
            destination_dir: Where to save backup
            backup_name: Name for backup folder (default: backup_YYYYMMDD_HHMMSS)
        """
        if backup_name is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_name = f"backup_{timestamp}"
        
        backup_path = os.path.join(destination_dir, backup_name)
        os.makedirs(backup_path, exist_ok=True)
        
        total_files = 0
        total_size = 0
        
        print(f"📦 Creating backup: {backup_name}")
        print(f"📍 Destination: {backup_path}")
        print("-" * 50)
        
        for source_dir in source_dirs:
            if not os.path.exists(source_dir):
                print(f"❌ Source not found: {source_dir}")
                continue
            
            # Create subdirectory in backup
            source_name = os.path.basename(source_dir)
            if not source_name:
                source_name = "root"
            
            dest_subdir = os.path.join(backup_path, source_name)
            os.makedirs(dest_subdir, exist_ok=True)
            
            print(f"📁 Backing up: {source_dir}")
            
            # Copy files
            file_count, size = self.copy_directory(source_dir, dest_subdir)
            total_files += file_count
            total_size += size
            
            print(f"   ✅ Copied {file_count} files ({size/1024/1024:.1f} MB)")
        
        # Create backup info file
        info = {
            "backup_name": backup_name,
            "timestamp": datetime.now().isoformat(),
            "source_dirs": source_dirs,
            "destination": backup_path,
            "total_files": total_files,
            "total_size_mb": total_size / (1024 * 1024),
            "checksum": self.calculate_checksum(backup_path)
        }
        
        info_file = os.path.join(backup_path, "backup_info.txt")
        with open(info_file, "w") as f:
            for key, value in info.items():
                f.write(f"{key}: {value}\\n")
        
        # Add to history
        self.backup_history.append(info)
        self.save_history()
        
        print("=" * 50)
        print(f"✅ Backup completed successfully!")
        print(f"📊 Files: {total_files}")
        print(f"💾 Size: {total_size/1024/1024:.1f} MB")
        print(f"📝 Info: {info_file}")
        
        return info
    
    def copy_directory(self, source, destination):
        """Copy directory recursively, return file count and total size"""
        file_count = 0
        total_size = 0
        
        for root, dirs, files in os.walk(source):
            # Create corresponding directories
            rel_path = os.path.relpath(root, source)
            dest_dir = os.path.join(destination, rel_path)
            os.makedirs(dest_dir, exist_ok=True)
            
            # Copy files
            for file in files:
                source_file = os.path.join(root, file)
                dest_file = os.path.join(dest_dir, file)
                
                # Skip large files (> 1GB) or specific extensions
                if os.path.getsize(source_file) > 1024 * 1024 * 1024:  # 1GB
                    print(f"   ⚠️ Skipping large file: {file}")
                    continue
                
                shutil.copy2(source_file, dest_file)
                file_count += 1
                total_size += os.path.getsize(source_file)
        
        return file_count, total_size
    
    def create_zip_backup(self, source_dirs, zip_path):
        """Create a ZIP backup"""
        print(f"🗜 Creating ZIP backup: {zip_path}")
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            total_files = 0
            
            for source_dir in source_dirs:
                for root, dirs, files in os.walk(source_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, os.path.join(source_dir, '..'))
                        zipf.write(file_path, arcname)
                        total_files += 1
            
            print(f"✅ ZIP created with {total_files} files")
            return total_files
    
    def calculate_checksum(self, directory):
        """Calculate checksum for backup verification"""
        print("🔍 Calculating checksum...")
        
        hash_md5 = hashlib.md5()
        
        for root, dirs, files in os.walk(directory):
            for file in sorted(files):  # Sort for consistency
                filepath = os.path.join(root, file)
                with open(filepath, 'rb') as f:
                    for chunk in iter(lambda: f.read(4096), b""):
                        hash_md5.update(chunk)
        
        return hash_md5.hexdigest()
    
    def schedule_backup(self, source_dirs, destination_dir, interval_hours=24):
        """Schedule regular backups"""
        import schedule
        
        def job():
            print(f"⏰ Running scheduled backup...")
            self.backup_files(source_dirs, destination_dir)
        
        # Schedule the backup
        schedule.every(interval_hours).hours.do(job)
        
        print(f"✅ Scheduled backup every {interval_hours} hours")
        print("The backup will run in the background.")
        
        # Run scheduler
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    def save_history(self):
        """Save backup history"""
        history_file = "backup_history.json"
        
        # Simple text format for now
        with open(history_file, "w") as f:
            for backup in self.backup_history[-10:]:  # Keep last 10
                f.write(f"{backup['timestamp']} - {backup['backup_name']}\\n")
                f.write(f"  Files: {backup['total_files']}, Size: {backup['total_size_mb']:.1f} MB\\n")
                f.write(f"  Checksum: {backup['checksum']}\\n")
                f.write("-" * 40 + "\\n")
    
    def restore_backup(self, backup_path, restore_location):
        """Restore files from backup"""
        print(f"🔄 Restoring from backup: {backup_path}")
        
        if not os.path.exists(backup_path):
            print(f"❌ Backup not found: {backup_path}")
            return False
        
        # Check if it's a ZIP file
        if backup_path.endswith('.zip'):
            with zipfile.ZipFile(backup_path, 'r') as zipf:
                zipf.extractall(restore_location)
                print(f"✅ Restored ZIP backup to: {restore_location}")
        else:
            # Directory backup
            for item in os.listdir(backup_path):
                source = os.path.join(backup_path, item)
                destination = os.path.join(restore_location, item)
                
                if os.path.isdir(source):
                    shutil.copytree(source, destination, dirs_exist_ok=True)
                else:
                    shutil.copy2(source, destination)
            
            print(f"✅ Restored directory backup to: {restore_location}")
        
        return True

def main():
    """Main function"""
    print("="*50)
    print("💾 DATA BACKUP AUTOMATION")
    print("="*50)
    
    automator = BackupAutomation()
    
    # Common backup locations
    common_sources = [
        os.path.expanduser("~/Documents"),
        os.path.expanduser("~/Desktop"),
        os.path.expanduser("~/Pictures"),
    ]
    
    # Common destinations
    common_destinations = [
        os.path.expanduser("~/Backups"),
        "D:/Backups" if os.path.exists("D:/") else None,
        "E:/Backups" if os.path.exists("E:/") else None,
    ]
    
    # Filter out None destinations
    destinations = [d for d in common_destinations if d and os.path.exists(os.path.dirname(d))]
    
    if not destinations:
        destinations = [os.path.join(os.getcwd(), "Backups")]
    
    print("\\nQuick Backup Options:")
    print("1. Backup Documents, Desktop, and Pictures")
    print("2. Backup specific folder")
    print("3. Create ZIP backup")
    print("4. Restore from backup")
    print("5. Schedule automatic backups")
    
    choice = input("\\nEnter choice (1-5): ").strip()
    
    if choice == "1":
        dest = destinations[0]
        automator.backup_files(common_sources, dest)
    elif choice == "2":
        folder = input("Enter folder path to backup: ").strip()
        if os.path.exists(folder):
            dest = destinations[0]
            automator.backup_files([folder], dest)
        else:
            print("❌ Folder not found")
    elif choice == "3":
        dest = destinations[0]
        zip_name = f"backup_{datetime.now().strftime('%Y%m%d')}.zip"
        zip_path = os.path.join(dest, zip_name)
        automator.create_zip_backup(common_sources, zip_path)
    elif choice == "4":
        backup_path = input("Enter backup path to restore: ").strip()
        restore_to = input("Enter restore location: ").strip()
        if not restore_to:
            restore_to = os.getcwd()
        automator.restore_backup(backup_path, restore_to)
    elif choice == "5":
        print("Scheduling daily backup...")
        dest = destinations[0]
        automator.schedule_backup(common_sources, dest, 24)
    else:
        print("❌ Invalid choice")

if __name__ == "__main__":
    main()
'''
            },
            {
                "title": "Email Auto-Responder",
                "description": "Automatically respond to emails based on rules and templates",
                "category": "email",
                "difficulty": "Advanced",
                "time_saved": "3 hours/week",
                "filename": "email_responder.py",
                "author": "Agentic AI",
                "tags": "email,automation,response",
                "code": '''"""
Email Auto-Responder
Automatically respond to emails based on rules and templates.
Note: This is a template that needs to be adapted for your email provider.
"""

import time
from datetime import datetime
import json
import os

class EmailAutoResponder:
    def __init__(self):
        self.templates_file = "email_templates.json"
        self.rules_file = "email_rules.json"
        self.log_file = "email_responses.log"
        
        self.load_templates()
        self.load_rules()
    
    def load_templates(self):
        """Load email response templates"""
        default_templates = {
            "out_of_office": {
                "subject": "Out of Office - {sender_name}",
                "body": """Dear {sender_name},

Thank you for your email. I am currently out of the office with limited access to email.

I will return on {return_date} and will respond to your message as soon as possible.

For urgent matters, please contact {contact_person} at {contact_email}.

Best regards,
{your_name}"""
            },
            "thank_you": {
                "subject": "Thank you for your email",
                "body": """Hi {sender_name},

Thank you for reaching out. I have received your email and will get back to you within 24-48 hours.

If this is urgent, please reply with URGENT in the subject line.

Best regards,
{your_name}"""
            },
            "meeting_request": {
                "subject": "Re: Meeting Request",
                "body": """Hi {sender_name},

Thank you for the meeting request. Here are my available times:

1. {date1} at {time1}
2. {date2} at {time2}
3. {date3} at {time3}

Please let me know which works best for you.

Best regards,
{your_name}"""
            }
        }
        
        if os.path.exists(self.templates_file):
            with open(self.templates_file, "r") as f:
                self.templates = json.load(f)
        else:
            self.templates = default_templates
            self.save_templates()
    
    def load_rules(self):
        """Load email response rules"""
        default_rules = [
            {
                "name": "Out of Office",
                "keywords": ["out of office", "vacation", "holiday", "away"],
                "template": "out_of_office",
                "enabled": True
            },
            {
                "name": "Thank You",
                "keywords": ["inquiry", "question", "hello", "hi"],
                "template": "thank_you",
                "enabled": True
            },
            {
                "name": "Meeting Request",
                "keywords": ["meeting", "schedule", "call", "appointment"],
                "template": "meeting_request",
                "enabled": True
            }
        ]
        
        if os.path.exists(self.rules_file):
            with open(self.rules_file, "r") as f:
                self.rules = json.load(f)
        else:
            self.rules = default_rules
            self.save_rules()
    
    def save_templates(self):
        """Save templates to file"""
        with open(self.templates_file, "w") as f:
            json.dump(self.templates, f, indent=2)
    
    def save_rules(self):
        """Save rules to file"""
        with open(self.rules_file, "w") as f:
            json.dump(self.rules, f, indent=2)
    
    def create_template(self, name, subject, body):
        """Create new email template"""
        self.templates[name] = {
            "subject": subject,
            "body": body
        }
        self.save_templates()
        print(f"✅ Template '{name}' created")
    
    def create_rule(self, name, keywords, template_name, enabled=True):
        """Create new response rule"""
        rule = {
            "name": name,
            "keywords": keywords,
            "template": template_name,
            "enabled": enabled
        }
        self.rules.append(rule)
        self.save_rules()
        print(f"✅ Rule '{name}' created")
    
    def process_email(self, sender, subject, body):
        """
        Process incoming email and generate response.
        This is a simulation - integrate with your email provider's API.
        """
        print(f"📧 Processing email from: {sender}")
        print(f"Subject: {subject}")
        
        # Find matching rule
        matched_rule = None
        email_text = f"{subject} {body}".lower()
        
        for rule in self.rules:
            if not rule.get("enabled", True):
                continue
            
            for keyword in rule["keywords"]:
                if keyword.lower() in email_text:
                    matched_rule = rule
                    break
            
            if matched_rule:
                break
        
        if matched_rule:
            template_name = matched_rule["template"]
            template = self.templates.get(template_name)
            
            if template:
                # Fill template variables
                response_subject = template["subject"].format(
                    sender_name=sender.split('@')[0].title()
                )
                
                response_body = template["body"].format(
                    sender_name=sender.split('@')[0].title(),
                    your_name="Your Name",
                    return_date="Monday",
                    contact_person="Colleague",
                    contact_email="colleague@example.com",
                    date1="Monday",
                    time1="10:00 AM",
                    date2="Tuesday",
                    time2="2:00 PM",
                    date3="Wednesday",
                    time3="4:00 PM"
                )
                
                # Log the response
                self.log_response(sender, matched_rule["name"])
                
                return {
                    "success": True,
                    "rule": matched_rule["name"],
                    "template": template_name,
                    "subject": response_subject,
                    "body": response_body
                }
        
        return {
            "success": False,
            "message": "No matching rule found"
        }
    
    def log_response(self, sender, rule_name):
        """Log automated response"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] Auto-response to {sender} using rule: {rule_name}"
        
        print(f"📝 {log_entry}")
        
        with open(self.log_file, "a") as f:
            f.write(log_entry + "\\n")
    
    def simulate_incoming_emails(self):
        """Simulate incoming emails for testing"""
        test_emails = [
            {
                "sender": "client@example.com",
                "subject": "Meeting Request",
                "body": "Can we schedule a meeting next week?"
            },
            {
                "sender": "colleague@company.com",
                "subject": "Quick question",
                "body": "Hi, I have a question about the project."
            },
            {
                "sender": "friend@personal.com",
                "subject": "Vacation plans",
                "body": "I'll be out of office next month."
            }
        ]
        
        print("📧 Simulating incoming emails...")
        print("-" * 50)
        
        for email in test_emails:
            response = self.process_email(
                email["sender"],
                email["subject"],
                email["body"]
            )
            
            if response["success"]:
                print(f"✅ Auto-response generated for {email['sender']}")
                print(f"   Rule: {response['rule']}")
                print(f"   Subject: {response['subject']}")
                print()
            else:
                print(f"❌ No response for {email['sender']}")
                print(f"   {response['message']}")
                print()
            
            time.sleep(1)

def main():
    """Main function"""
    print("="*50)
    print("📧 EMAIL AUTO-RESPONDER")
    print("="*50)
    print("Note: This is a template. You need to integrate with your email provider.")
    print()
    
    responder = EmailAutoResponder()
    
    while True:
        print("\\nOptions:")
        print("1. View templates")
        print("2. View rules")
        print("3. Create new template")
        print("4. Create new rule")
        print("5. Test with simulated emails")
        print("6. Exit")
        
        choice = input("\\nEnter choice (1-6): ").strip()
        
        if choice == "1":
            print("\\n📋 Email Templates:")
            print("-" * 30)
            for name, template in responder.templates.items():
                print(f"{name}:")
                print(f"  Subject: {template['subject'][:50]}...")
                print(f"  Body preview: {template['body'][:100]}...")
                print()
        
        elif choice == "2":
            print("\\n⚙️ Email Rules:")
            print("-" * 30)
            for rule in responder.rules:
                status = "✅ Enabled" if rule.get("enabled", True) else "❌ Disabled"
                print(f"{rule['name']} ({status})")
                print(f"  Keywords: {', '.join(rule['keywords'])}")
                print(f"  Template: {rule['template']}")
                print()
        
        elif choice == "3":
            print("\\nCreate New Template")
            name = input("Template name: ").strip()
            subject = input("Subject template: ").strip()
            print("Body template (end with empty line):")
            
            lines = []
            while True:
                line = input()
                if line == "":
                    break
                lines.append(line)
            
            body = "\\n".join(lines)
            responder.create_template(name, subject, body)
        
        elif choice == "4":
            print("\\nCreate New Rule")
            name = input("Rule name: ").strip()
            keywords_input = input("Keywords (comma-separated): ").strip()
            keywords = [k.strip() for k in keywords_input.split(",")]
            template = input("Template name: ").strip()
            
            if template in responder.templates:
                responder.create_rule(name, keywords, template)
            else:
                print(f"❌ Template '{template}' not found")
        
        elif choice == "5":
            responder.simulate_incoming_emails()
        
        elif choice == "6":
            print("Goodbye!")
            break
        
        else:
            print("❌ Invalid choice")

if __name__ == "__main__":
    main()
'''
            }
        ]
    
    def get_templates(self, category: Optional[str] = None, 
                     search: Optional[str] = None,
                     limit: int = 50) -> List[Dict]:
        """Get automation templates with optional filtering"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        query = "SELECT * FROM templates WHERE 1=1"
        params = []
        
        if category:
            query += " AND category = ?"
            params.append(category)
        
        if search:
            query += " AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)"
            search_term = f"%{search}%"
            params.extend([search_term, search_term, search_term])
        
        query += " ORDER BY downloads DESC, featured DESC LIMIT ?"
        params.append(limit)
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        templates = []
        for row in rows:
            template = dict(row)
            
            # Convert tags string to list
            if template["tags"]:
                template["tags"] = [tag.strip() for tag in template["tags"].split(",")]
            else:
                template["tags"] = []
            
            # Get file content if exists
            template_file = f"{self.templates_dir}/{template['id']}.py"
            if os.path.exists(template_file):
                with open(template_file, "r") as f:
                    template["code"] = f.read()
            
            templates.append(template)
        
        conn.close()
        return templates
    
    def get_template_by_id(self, template_id: int) -> Optional[Dict]:
        """Get a specific template by ID"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM templates WHERE id = ?", (template_id,))
        row = cursor.fetchone()
        
        if row:
            template = dict(row)
            
            # Get file content
            template_file = f"{self.templates_dir}/{template_id}.py"
            if os.path.exists(template_file):
                with open(template_file, "r") as f:
                    template["code"] = f.read()
            
            # Increment download count
            cursor.execute(
                "UPDATE templates SET downloads = downloads + 1 WHERE id = ?",
                (template_id,)
            )
            conn.commit()
            
            conn.close()
            return template
        
        conn.close()
        return None
    
    def download_template(self, user_id: str, template_id: int) -> Dict:
        """User downloads a template"""
        template = self.get_template_by_id(template_id)
        
        if not template:
            return {
                "success": False,
                "error": "Template not found"
            }
        
        # Record download
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO user_downloads (user_id, template_id)
                VALUES (?, ?)
            ''', (user_id, template_id))
            
            conn.commit()
            
            return {
                "success": True,
                "template": template,
                "message": f"Downloaded '{template['title']}' successfully"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
        finally:
            conn.close()
    
    def get_popular_categories(self) -> List[Dict]:
        """Get popular template categories"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT category, COUNT(*) as count, SUM(downloads) as total_downloads
            FROM templates 
            WHERE category IS NOT NULL 
            GROUP BY category 
            ORDER BY total_downloads DESC
        ''')
        
        categories = []
        for row in cursor.fetchall():
            categories.append({
                "name": row[0],
                "template_count": row[1],
                "total_downloads": row[2]
            })
        
        conn.close()
        return categories
    
    def get_featured_templates(self) -> List[Dict]:
        """Get featured templates"""
        return self.get_templates(limit=10)
    
    def submit_template(self, template_data: Dict) -> Dict:
        """Submit a new template to the marketplace"""
        required_fields = ["title", "description", "category", "code", "author"]
        
        # Validate required fields
        for field in required_fields:
            if field not in template_data:
                return {
                    "success": False,
                    "error": f"Missing required field: {field}"
                }
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Insert template
            cursor.execute('''
                INSERT INTO templates (
                    title, description, category, difficulty, 
                    time_saved, code, author, tags
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                template_data["title"],
                template_data["description"],
                template_data["category"],
                template_data.get("difficulty", "Beginner"),
                template_data.get("time_saved", "1 hour/week"),
                template_data["code"],
                template_data["author"],
                template_data.get("tags", "")
            ))
            
            template_id = cursor.lastrowid
            
            # Save template file
            template_file = f"{self.templates_dir}/{template_id}.py"
            with open(template_file, "w") as f:
                f.write(template_data["code"])
            
            conn.commit()
            
            return {
                "success": True,
                "template_id": template_id,
                "message": "Template submitted successfully"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
        finally:
            conn.close()
    
    def get_statistics(self) -> Dict:
        """Get marketplace statistics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM templates")
        total_templates = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(downloads) FROM templates")
        total_downloads = cursor.fetchone()[0] or 0
        
        cursor.execute("SELECT COUNT(DISTINCT user_id) FROM user_downloads")
        unique_users = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM templates WHERE featured = 1")
        featured_count = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            "total_templates": total_templates,
            "total_downloads": total_downloads,
            "unique_users": unique_users,
            "featured_templates": featured_count,
            "popular_categories": self.get_popular_categories()
        }

# For testing
if __name__ == "__main__":
    marketplace = AutomationMarketplace()
    
    print("📊 Marketplace Statistics:")
    stats = marketplace.get_statistics()
    for key, value in stats.items():
        if isinstance(value, list):
            print(f"  {key}:")
            for item in value[:3]:
                print(f"    - {item['name']}: {item['template_count']} templates")
        else:
            print(f"  {key}: {value}")
    
    print("\n🔍 Getting templates...")
    templates = marketplace.get_templates(limit=3)
    print(f"Found {len(templates)} templates:")
    
    for template in templates:
        print(f"\n📄 {template['title']}")
        print(f"   {template['description']}")
        print(f"   Category: {template['category']}")
        print(f"   Downloads: {template['downloads']}")