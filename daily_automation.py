"""
daily_automation.py - Daily Featured Automation
Showcase a new automation every day to inspire users
"""
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import random

class DailyAutomation:
    def __init__(self):
        self.automations_file = "database/daily_automations.json"
        self.history_file = "database/automation_history.json"
        self.init_automations()
    
    def init_automations(self):
        """Initialize with default automations if file doesn't exist"""
        os.makedirs("database", exist_ok=True)
        
        if not os.path.exists(self.automations_file):
            default_automations = self.get_default_automations()
            self.save_automations(default_automations)
    
    def get_default_automations(self) -> List[Dict]:
        """Get default automation examples"""
        return [
            {
                "id": 1,
                "title": "Smart Email Organizer",
                "description": "Automatically sort emails by sender, priority, and topic",
                "category": "email",
                "difficulty": "Intermediate",
                "estimated_time_saved": "3 hours/week",
                "use_cases": [
                    "Sort work emails by project",
                    "Filter spam automatically",
                    "Archive old conversations"
                ],
                "code_snippet": '''import imaplib
import email
from email.header import decode_header

def organize_emails():
    # Connect to email server
    mail = imaplib.IMAP4_SSL("imap.gmail.com")
    mail.login("your_email@gmail.com", "password")
    
    # Select inbox
    mail.select("inbox")
    
    # Search for all emails
    status, messages = mail.search(None, "ALL")
    
    # Process emails
    for num in messages[0].split():
        status, msg_data = mail.fetch(num, "(RFC822)")
        msg = email.message_from_bytes(msg_data[0][1])
        
        # Get sender
        sender = msg.get("From")
        subject = decode_header(msg.get("Subject"))[0][0]
        
        print(f"From: {sender}")
        print(f"Subject: {subject}")
        print("-" * 50)''',
                "tags": ["email", "organization", "productivity"],
                "author": "Agentic AI",
                "featured_date": None,
                "times_featured": 0
            },
            {
                "id": 2,
                "title": "Auto Social Media Poster",
                "description": "Schedule and post content to multiple social media platforms",
                "category": "social_media",
                "difficulty": "Advanced",
                "estimated_time_saved": "5 hours/week",
                "use_cases": [
                    "Schedule tweets",
                    "Post to LinkedIn",
                    "Share on Facebook",
                    "Instagram automation"
                ],
                "code_snippet": '''import schedule
import time
from datetime import datetime

class SocialMediaAutomation:
    def __init__(self):
        self.posts = []
        self.scheduled = []
    
    def add_post(self, content, platforms, schedule_time):
        post = {
            "content": content,
            "platforms": platforms,
            "time": schedule_time,
            "posted": False
        }
        self.posts.append(post)
        
        # Schedule the post
        schedule.every().day.at(schedule_time).do(
            self.post_to_social_media, content, platforms
        )
    
    def post_to_social_media(self, content, platforms):
        print(f"Posting to {platforms}:")
        print(content)
        print("-" * 50)
        
        # Update post status
        for post in self.posts:
            if post["content"] == content and not post["posted"]:
                post["posted"] = True
                self.scheduled.append({
                    "content": content,
                    "time": datetime.now(),
                    "platforms": platforms
                })
    
    def run_scheduler(self):
        print("Social Media Scheduler Running...")
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute''',
                "tags": ["social media", "scheduling", "marketing"],
                "author": "Agentic AI",
                "featured_date": None,
                "times_featured": 0
            },
            {
                "id": 3,
                "title": "Data Backup & Sync Tool",
                "description": "Automatically backup important files and sync between devices",
                "category": "backup",
                "difficulty": "Beginner",
                "estimated_time_saved": "Prevents data loss",
                "use_cases": [
                    "Daily backup of documents",
                    "Sync photos between devices",
                    "Cloud backup automation"
                ],
                "code_snippet": '''import os
import shutil
from datetime import datetime
import hashlib

class BackupAutomation:
    def __init__(self, source_dir, backup_dir):
        self.source_dir = source_dir
        self.backup_dir = backup_dir
        self.log_file = "backup_log.txt"
    
    def backup_files(self):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = os.path.join(self.backup_dir, f"backup_{timestamp}")
        
        os.makedirs(backup_path, exist_ok=True)
        
        copied_files = 0
        for root, dirs, files in os.walk(self.source_dir):
            for file in files:
                source = os.path.join(root, file)
                destination = os.path.join(backup_path, file)
                
                # Skip if file too large
                if os.path.getsize(source) > 100 * 1024 * 1024:  # 100MB
                    continue
                
                shutil.copy2(source, destination)
                copied_files += 1
        
        self.log_backup(timestamp, copied_files)
        return copied_files
    
    def log_backup(self, timestamp, file_count):
        log_entry = f"{timestamp}: Backed up {file_count} files\\n"
        with open(self.log_file, "a") as f:
            f.write(log_entry)
        
        print(f"✅ Backup completed: {file_count} files")''',
                "tags": ["backup", "files", "sync", "safety"],
                "author": "Agentic AI",
                "featured_date": None,
                "times_featured": 0
            },
            {
                "id": 4,
                "title": "Web Scraping & Data Collector",
                "description": "Automatically collect data from websites and save to spreadsheet",
                "category": "data",
                "difficulty": "Intermediate",
                "estimated_time_saved": "4 hours/week",
                "use_cases": [
                    "Price monitoring",
                    "Competitor analysis",
                    "News aggregation",
                    "Research data collection"
                ],
                "code_snippet": '''import requests
from bs4 import BeautifulSoup
import csv
import time

class WebScraper:
    def __init__(self, url):
        self.url = url
        self.data = []
    
    def scrape(self):
        try:
            response = requests.get(self.url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Example: Scrape product prices
            products = soup.find_all('div', class_='product')
            
            for product in products:
                name = product.find('h3').text.strip()
                price = product.find('span', class_='price').text.strip()
                
                self.data.append({
                    'name': name,
                    'price': price,
                    'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })
            
            return len(self.data)
            
        except Exception as e:
            print(f"Error scraping: {e}")
            return 0
    
    def save_to_csv(self, filename):
        if not self.data:
            print("No data to save")
            return
        
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=self.data[0].keys())
            writer.writeheader()
            writer.writerows(self.data)
        
        print(f"✅ Saved {len(self.data)} records to {filename}")''',
                "tags": ["web scraping", "data", "automation", "research"],
                "author": "Agentic AI",
                "featured_date": None,
                "times_featured": 0
            },
            {
                "id": 5,
                "title": "Auto Report Generator",
                "description": "Generate and email reports automatically on schedule",
                "category": "reporting",
                "difficulty": "Intermediate",
                "estimated_time_saved": "6 hours/week",
                "use_cases": [
                    "Daily sales reports",
                    "Weekly performance summaries",
                    "Monthly analytics reports"
                ],
                "code_snippet": '''import pandas as pd
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import schedule
import time

class ReportGenerator:
    def __init__(self):
        self.template = """
        Daily Report - {date}
        ======================
        
        Summary:
        • Total Sales: ${total_sales}
        • New Customers: {new_customers}
        • Top Product: {top_product}
        
        Detailed Analysis:
        {analysis}
        
        Generated automatically by Agentic AI
        """
    
    def generate_report(self, data):
        report = self.template.format(
            date=datetime.now().strftime("%Y-%m-%d"),
            total_sales=data.get("total_sales", 0),
            new_customers=data.get("new_customers", 0),
            top_product=data.get("top_product", "N/A"),
            analysis=self.generate_analysis(data)
        )
        
        return report
    
    def generate_analysis(self, data):
        analysis = ""
        # Add analysis logic here
        return analysis
    
    def send_email(self, recipient, subject, body):
        msg = MIMEMultipart()
        msg['From'] = 'reports@yourapp.com'
        msg['To'] = recipient
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain'))
        
        try:
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login('your_email@gmail.com', 'password')
            server.send_message(msg)
            server.quit()
            
            print(f"✅ Report sent to {recipient}")
            return True
            
        except Exception as e:
            print(f"Error sending email: {e}")
            return False''',
                "tags": ["reporting", "email", "automation", "analytics"],
                "author": "Agentic AI",
                "featured_date": None,
                "times_featured": 0
            }
        ]
    
    def save_automations(self, automations: List[Dict]):
        """Save automations to file"""
        with open(self.automations_file, "w") as f:
            json.dump(automations, f, indent=2)
    
    def load_automations(self) -> List[Dict]:
        """Load automations from file"""
        with open(self.automations_file, "r") as f:
            return json.load(f)
    
    def get_todays_automation(self) -> Dict:
        """Get today's featured automation"""
        automations = self.load_automations()
        today = datetime.now().date().isoformat()
        
        # Check if today already has a featured automation
        for automation in automations:
            if automation.get("featured_date") == today:
                return automation
        
        # If not, select a new one
        return self.select_new_featured_automation()
    
    def select_new_featured_automation(self) -> Dict:
        """Select a new automation to feature today"""
        automations = self.load_automations()
        today = datetime.now().date().isoformat()
        
        # Filter automations not featured recently
        recent_days = 7
        recent_date = (datetime.now() - timedelta(days=recent_days)).date().isoformat()
        
        available = []
        for automation in automations:
            featured_date = automation.get("featured_date")
            
            # Prioritize automations featured less often
            if not featured_date or featured_date < recent_date:
                available.append(automation)
        
        if not available:
            # Reset all if all have been featured recently
            for automation in automations:
                automation["featured_date"] = None
            available = automations
        
        # Select random automation
        selected = random.choice(available)
        selected["featured_date"] = today
        selected["times_featured"] = selected.get("times_featured", 0) + 1
        
        # Save updated automations
        self.save_automations(automations)
        
        # Add to history
        self.add_to_history(selected)
        
        return selected
    
    def add_to_history(self, automation: Dict):
        """Add featured automation to history"""
        history = self.load_history()
        
        history_entry = {
            "date": datetime.now().date().isoformat(),
            "automation_id": automation["id"],
            "title": automation["title"],
            "category": automation["category"]
        }
        
        history.append(history_entry)
        
        # Keep only last 30 days
        cutoff_date = (datetime.now() - timedelta(days=30)).date().isoformat()
        history = [h for h in history if h["date"] >= cutoff_date]
        
        self.save_history(history)
    
    def load_history(self) -> List[Dict]:
        """Load automation history"""
        if os.path.exists(self.history_file):
            with open(self.history_file, "r") as f:
                return json.load(f)
        return []
    
    def save_history(self, history: List[Dict]):
        """Save automation history"""
        with open(self.history_file, "w") as f:
            json.dump(history, f, indent=2)
    
    def get_automation_by_id(self, automation_id: int) -> Optional[Dict]:
        """Get automation by ID"""
        automations = self.load_automations()
        
        for automation in automations:
            if automation["id"] == automation_id:
                return automation
        
        return None
    
    def get_category_automations(self, category: str) -> List[Dict]:
        """Get all automations in a category"""
        automations = self.load_automations()
        
        return [
            automation for automation in automations
            if automation["category"] == category
        ]
    
    def get_popular_automations(self, limit: int = 5) -> List[Dict]:
        """Get most frequently featured automations"""
        automations = self.load_automations()
        
        # Sort by times_featured (descending)
        sorted_automations = sorted(
            automations,
            key=lambda x: x.get("times_featured", 0),
            reverse=True
        )
        
        return sorted_automations[:limit]
    
    def get_automation_statistics(self) -> Dict:
        """Get statistics about automations"""
        automations = self.load_automations()
        
        total_automations = len(automations)
        
        # Count by category
        category_count = {}
        for automation in automations:
            category = automation["category"]
            category_count[category] = category_count.get(category, 0) + 1
        
        # Count by difficulty
        difficulty_count = {}
        for automation in automations:
            difficulty = automation["difficulty"]
            difficulty_count[difficulty] = difficulty_count.get(difficulty, 0) + 1
        
        # Most featured
        most_featured = max(automations, key=lambda x: x.get("times_featured", 0))
        
        # Recently featured
        recent_date = (datetime.now() - timedelta(days=7)).date().isoformat()
        recent_automations = [
            automation for automation in automations
            if automation.get("featured_date") and automation["featured_date"] >= recent_date
        ]
        
        return {
            "total_automations": total_automations,
            "categories": category_count,
            "difficulty_levels": difficulty_count,
            "most_featured": {
                "title": most_featured["title"],
                "times_featured": most_featured.get("times_featured", 0)
            },
            "recently_featured": len(recent_automations)
        }
    
    def suggest_automation(self, user_interests: List[str]) -> List[Dict]:
        """Suggest automations based on user interests"""
        automations = self.load_automations()
        
        suggestions = []
        for automation in automations:
            score = 0
            
            # Score based on tags matching interests
            tags = automation.get("tags", [])
            for interest in user_interests:
                if interest.lower() in [tag.lower() for tag in tags]:
                    score += 2
            
            # Score based on category
            if automation["category"] in user_interests:
                score += 1
            
            if score > 0:
                suggestions.append({
                    "automation": automation,
                    "score": score,
                    "reason": f"Matches your interests in {', '.join(user_interests)}"
                })
        
        # Sort by score
        suggestions.sort(key=lambda x: x["score"], reverse=True)
        
        return suggestions[:3]  # Top 3 suggestions
    
    def add_user_automation(self, automation_data: Dict) -> Dict:
        """Add a user-submitted automation"""
        automations = self.load_automations()
        
        # Generate new ID
        new_id = max([a["id"] for a in automations], default=0) + 1
        
        new_automation = {
            "id": new_id,
            "title": automation_data["title"],
            "description": automation_data["description"],
            "category": automation_data["category"],
            "difficulty": automation_data.get("difficulty", "Beginner"),
            "estimated_time_saved": automation_data.get("estimated_time_saved", "1 hour/week"),
            "use_cases": automation_data.get("use_cases", []),
            "code_snippet": automation_data.get("code_snippet", ""),
            "tags": automation_data.get("tags", []),
            "author": automation_data.get("author", "User"),
            "featured_date": None,
            "times_featured": 0,
            "user_submitted": True,
            "submission_date": datetime.now().date().isoformat()
        }
        
        automations.append(new_automation)
        self.save_automations(automations)
        
        return {
            "success": True,
            "automation_id": new_id,
            "message": "Automation submitted successfully"
        }

# Singleton instance
daily_automation = DailyAutomation()

# Convenience functions
def get_todays_featured():
    """Get today's featured automation"""
    return daily_automation.get_todays_automation()

def get_automation_suggestions(interests):
    """Get automation suggestions"""
    return daily_automation.suggest_automation(interests)

# For testing
if __name__ == "__main__":
    print("🎯 Daily Automation System")
    print("-" * 40)
    
    # Get today's featured automation
    todays_auto = daily_automation.get_todays_automation()
    print(f"Today's Featured Automation: {todays_auto['title']}")
    print(f"Description: {todays_auto['description']}")
    print(f"Category: {todays_auto['category']}")
    print(f"Time Saved: {todays_auto['estimated_time_saved']}")
    print()
    
    # Get statistics
    stats = daily_automation.get_automation_statistics()
    print(f"📊 Statistics:")
    print(f"Total Automations: {stats['total_automations']}")
    print(f"Categories: {stats['categories']}")
    print(f"Most Featured: {stats['most_featured']['title']} "
          f"({stats['most_featured']['times_featured']} times)")
    print()
    
    # Get popular automations
    popular = daily_automation.get_popular_automations(3)
    print("🏆 Popular Automations:")
    for auto in popular:
        print(f"  • {auto['title']}: {auto.get('times_featured', 0)} features")
    print()
    
    # Get suggestions
    suggestions = daily_automation.suggest_automation(["email", "productivity"])
    print("💡 Suggestions for you:")
    for suggestion in suggestions:
        print(f"  • {suggestion['automation']['title']} (score: {suggestion['score']})")