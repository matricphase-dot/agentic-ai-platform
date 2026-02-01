import sqlite3
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
