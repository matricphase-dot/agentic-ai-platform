"""
Agentic AI Platform - Product Launch Setup Script
Fixed version with proper database handling
"""

import os
import sqlite3
import json
from pathlib import Path
from datetime import datetime

class ProductLaunchSetup:
    def __init__(self, project_path):
        self.project_root = Path(project_path)
        self.database_dir = self.project_root / "database"
        self.templates_dir = self.project_root / "templates"
        self.static_dir = self.project_root / "static"
        
    def create_directories(self):
        """Create necessary directories"""
        directories = [
            self.database_dir,
            self.templates_dir,
            self.templates_dir / "auth",
            self.templates_dir / "admin",
            self.static_dir / "css",
            self.static_dir / "js",
            self.static_dir / "images"
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            print(f"✅ Created directory: {directory}")
            
    def create_databases(self):
        """Create and initialize all databases"""
        print("\n📊 Creating databases...")
        
        # Ensure database directory exists
        self.database_dir.mkdir(exist_ok=True)
        
        # 1. Users Database
        users_db = self.database_dir / "users.db"
        
        # Remove existing users.db if it exists to avoid schema conflicts
        if users_db.exists():
            print("⚠️  Removing old users.db to avoid schema conflicts...")
            users_db.unlink()
        
        conn = sqlite3.connect(users_db)
        c = conn.cursor()
        
        c.execute('''CREATE TABLE users
                    (id INTEGER PRIMARY KEY AUTOINCREMENT,
                     email TEXT UNIQUE NOT NULL,
                     password TEXT NOT NULL,
                     name TEXT,
                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                     last_login TIMESTAMP,
                     is_admin BOOLEAN DEFAULT 0)''')
        
        # Add admin user
        c.execute("INSERT INTO users (email, password, name, is_admin) VALUES (?, ?, ?, ?)",
                 ('admin@agenticai.com', 'Admin123!', 'Admin User', 1))
        
        # Add demo user
        c.execute("INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
                 ('demo@agenticai.com', 'Demo123!', 'Demo User'))
        
        conn.commit()
        conn.close()
        print(f"✅ Created users.db")
        print("   👤 Admin: admin@agenticai.com / Admin123!")
        print("   👤 Demo: demo@agenticai.com / Demo123!")
        
        # 2. Marketplace Database
        marketplace_db = self.database_dir / "marketplace.db"
        
        # Remove if exists
        if marketplace_db.exists():
            marketplace_db.unlink()
            
        conn = sqlite3.connect(marketplace_db)
        c = conn.cursor()
        
        c.execute('''CREATE TABLE templates
                    (id INTEGER PRIMARY KEY AUTOINCREMENT,
                     name TEXT NOT NULL,
                     category TEXT,
                     description TEXT,
                     price REAL DEFAULT 0.0,
                     rating REAL DEFAULT 0.0,
                     downloads INTEGER DEFAULT 0,
                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
        
        # Add sample templates
        templates = [
            ('Email Responder', 'Communication', 'AI-powered email response automation', 49.99, 4.8, 120),
            ('Social Media Scheduler', 'Marketing', 'Automated social media posting', 29.99, 4.5, 85),
            ('Data Analyzer', 'Analytics', 'Automated data analysis and reporting', 79.99, 4.9, 45),
            ('Content Generator', 'Content', 'AI content creation automation', 59.99, 4.7, 150),
            ('File Organizer', 'Productivity', 'Automated file organization system', 39.99, 4.6, 90)
        ]
        
        c.executemany("INSERT INTO templates (name, category, description, price, rating, downloads) VALUES (?, ?, ?, ?, ?, ?)", templates)
        conn.commit()
        conn.close()
        print(f"✅ Created marketplace.db with 5 templates")
        
        # 3. Analytics Database
        analytics_db = self.database_dir / "analytics.db"
        
        # Remove if exists
        if analytics_db.exists():
            analytics_db.unlink()
            
        conn = sqlite3.connect(analytics_db)
        c = conn.cursor()
        
        c.execute('''CREATE TABLE analytics
                    (id INTEGER PRIMARY KEY AUTOINCREMENT,
                     user_id INTEGER,
                     endpoint TEXT,
                     timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                     duration REAL,
                     status_code INTEGER)''')
        conn.commit()
        conn.close()
        print(f"✅ Created analytics.db")
        
        # 4. Automations Database
        automations_db = self.database_dir / "automations.db"
        
        # Remove if exists
        if automations_db.exists():
            automations_db.unlink()
            
        conn = sqlite3.connect(automations_db)
        c = conn.cursor()
        
        c.execute('''CREATE TABLE automations
                    (id INTEGER PRIMARY KEY AUTOINCREMENT,
                     user_id INTEGER,
                     name TEXT NOT NULL,
                     type TEXT,
                     status TEXT DEFAULT 'active',
                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                     last_run TIMESTAMP,
                     run_count INTEGER DEFAULT 0)''')
        conn.commit()
        conn.close()
        print(f"✅ Created automations.db")
        
    def create_simple_login(self):
        """Create simple login page"""
        login_html = """<!DOCTYPE html>
<html>
<head>
    <title>Login - Agentic AI</title>
    <style>
        body { font-family: Arial; background: #667eea; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .login-box { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); width: 300px; }
        h2 { text-align: center; color: #333; }
        input { display: block; width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
        button { background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; width: 100%; }
        a { color: #667eea; text-decoration: none; }
        p { text-align: center; }
    </style>
</head>
<body>
    <div class="login-box">
        <h2>Agentic AI Login</h2>
        <form id="loginForm">
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
        <p style="margin-top: 20px; font-size: 12px;">
            Admin: admin@agenticai.com / Admin123!<br>
            Demo: demo@agenticai.com / Demo123!
        </p>
        <p>
            <a href="/register">Register</a> | 
            <a href="/product_hunt">Product Hunt</a>
        </p>
    </div>
    <script>
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({email, password})
                });
                const data = await response.json();
                if (data.success) {
                    window.location.href = '/dashboard';
                } else {
                    alert('Login failed: ' + data.message);
                }
            } catch (error) {
                alert('Network error. Make sure the server is running.');
            }
        });
    </script>
</body>
</html>"""
        
        auth_dir = self.templates_dir / "auth"
        auth_dir.mkdir(exist_ok=True)
        (auth_dir / "login.html").write_text(login_html)
        print("✅ Created login.html")
        
    def create_simple_register(self):
        """Create simple register page"""
        register_html = """<!DOCTYPE html>
<html>
<head>
    <title>Register - Agentic AI</title>
    <style>
        body { font-family: Arial; background: #4facfe; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .register-box { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); width: 300px; }
        h2 { text-align: center; color: #333; }
        input { display: block; width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
        button { background: #4facfe; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; width: 100%; }
        a { color: #4facfe; text-decoration: none; }
        p { text-align: center; }
    </style>
</head>
<body>
    <div class="register-box">
        <h2>Register for Agentic AI</h2>
        <form id="registerForm">
            <input type="text" id="name" placeholder="Name" required>
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Password (min 8 chars)" required>
            <button type="submit">Create Account</button>
        </form>
        <p style="margin-top: 20px;">
            <a href="/login">Already have an account? Login</a>
        </p>
    </div>
    <script>
        document.getElementById('registerForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (password.length < 8) {
                alert('Password must be at least 8 characters');
                return;
            }
            
            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({name, email, password})
                });
                const data = await response.json();
                if (data.success) {
                    alert('Registration successful! Redirecting to login...');
                    window.location.href = '/login';
                } else {
                    alert('Registration failed: ' + data.message);
                }
            } catch (error) {
                alert('Network error. Make sure the server is running.');
            }
        });
    </script>
</body>
</html>"""
        
        auth_dir = self.templates_dir / "auth"
        auth_dir.mkdir(exist_ok=True)
        (auth_dir / "register.html").write_text(register_html)
        print("✅ Created register.html")
        
    def create_simple_product_hunt(self):
        """Create simple Product Hunt page"""
        product_hunt_html = """<!DOCTYPE html>
<html>
<head>
    <title>🚀 Launching on Product Hunt!</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #ff6b6b, #ff8e53); color: white; }
        .container { max-width: 800px; margin: 0 auto; padding: 40px; text-align: center; }
        h1 { font-size: 48px; margin-bottom: 20px; }
        .cta { background: white; color: #ff6b6b; padding: 15px 30px; border-radius: 50px; text-decoration: none; font-weight: bold; display: inline-block; margin: 20px; }
        .features { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 40px 0; }
        .feature { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; }
        @media (max-width: 600px) {
            .features { grid-template-columns: 1fr; }
            h1 { font-size: 36px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div style="background: #da552f; display: inline-block; padding: 10px 20px; border-radius: 20px; margin-bottom: 20px;">
            🚀 LAUNCHING ON PRODUCT HUNT
        </div>
        
        <h1>Agentic AI Platform</h1>
        <p style="font-size: 20px;">No-Code AI Automation for Everyone</p>
        
        <div>
            <a href="/login" class="cta">🚀 Try It Free</a>
            <a href="#features" class="cta">✨ See Features</a>
        </div>
        
        <div class="features" id="features">
            <div class="feature">
                <h3>🤖 No-Code Builder</h3>
                <p>Drag-and-drop AI agent creation</p>
            </div>
            <div class="feature">
                <h3>🚀 One-Click Deploy</h3>
                <p>Deploy automations instantly</p>
            </div>
            <div class="feature">
                <h3>📊 Real-Time Analytics</h3>
                <p>Monitor performance live</p>
            </div>
            <div class="feature">
                <h3>🔄 50+ Templates</h3>
                <p>Pre-built automation templates</p>
            </div>
        </div>
        
        <div style="margin-top: 40px;">
            <h2>Ready to Automate?</h2>
            <a href="/register" class="cta" style="font-size: 20px; padding: 20px 40px;">🎉 Get Started Free</a>
        </div>
    </div>
</body>
</html>"""
        
        (self.templates_dir / "product_hunt.html").write_text(product_hunt_html)
        print("✅ Created product_hunt.html")
        
    def create_simple_admin(self):
        """Create simple admin dashboard"""
        admin_html = """<!DOCTYPE html>
<html>
<head>
    <title>Admin Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; }
        .header { background: #667eea; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
        .main { display: flex; }
        .sidebar { width: 200px; background: #f5f5f5; padding: 20px; min-height: calc(100vh - 70px); }
        .content { flex: 1; padding: 20px; }
        .stat { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); margin: 10px; }
        a { color: #667eea; text-decoration: none; }
        button { background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Admin Dashboard</h1>
        <div>
            <a href="/dashboard" style="color: white; margin-right: 20px;">User Dashboard</a>
            <a href="/product_hunt" style="color: white; margin-right: 20px;">Product Hunt</a>
            <a href="/logout" style="color: white;">Logout</a>
        </div>
    </div>
    
    <div class="main">
        <div class="sidebar">
            <h3>Navigation</h3>
            <a href="/admin">Overview</a><br><br>
            <a href="#users">Users</a><br><br>
            <a href="#templates">Templates</a><br><br>
            <a href="/product_hunt">Product Hunt</a>
        </div>
        
        <div class="content">
            <h2>Platform Overview</h2>
            <div style="display: flex; flex-wrap: wrap;">
                <div class="stat">
                    <h3>Total Users</h3>
                    <p id="totalUsers">3</p>
                </div>
                <div class="stat">
                    <h3>Active Automations</h3>
                    <p id="activeAutomations">5</p>
                </div>
            </div>
            
            <div style="margin-top: 30px;">
                <button onclick="refreshData()">Refresh Data</button>
                <button onclick="window.location.href='/product_hunt'">View Product Hunt</button>
                <button onclick="window.location.href='/'">Go to Home</button>
            </div>
        </div>
    </div>
    
    <script>
        function refreshData() {
            document.getElementById('totalUsers').textContent = 'Loading...';
            document.getElementById('activeAutomations').textContent = 'Loading...';
            
            // Simulate loading data
            setTimeout(() => {
                document.getElementById('totalUsers').textContent = '3';
                document.getElementById('activeAutomations').textContent = '5';
                alert('Data refreshed!');
            }, 500);
        }
    </script>
</body>
</html>"""
        
        admin_dir = self.templates_dir / "admin"
        admin_dir.mkdir(exist_ok=True)
        (admin_dir / "dashboard.html").write_text(admin_html)
        print("✅ Created admin dashboard.html")
        
    def create_other_simple_templates(self):
        """Create other simple templates"""
        templates = {
            "desktop-recorder.html": "<h1>🎥 Desktop Recorder</h1><p>Record and automate desktop tasks.</p><br><a href='/dashboard'>Back to Dashboard</a>",
            "file-organizer.html": "<h1>📁 File Organizer</h1><p>Automatically organize files with AI.</p><br><a href='/dashboard'>Back to Dashboard</a>",
            "ai-automation.html": "<h1>🤖 AI Automation</h1><p>Build AI workflows without code.</p><br><a href='/dashboard'>Back to Dashboard</a>",
            "marketplace.html": "<h1>🛒 Marketplace</h1><p>Browse AI templates.</p><br><a href='/dashboard'>Back to Dashboard</a>",
            "analytics.html": "<h1>📊 Analytics</h1><p>View platform analytics.</p><br><a href='/dashboard'>Back to Dashboard</a>",
            "mobile.html": "<h1>📱 Mobile</h1><p>Mobile automation interface.</p><br><a href='/dashboard'>Back to Dashboard</a>",
            "settings.html": "<h1>⚙️ Settings</h1><p>Configure your settings.</p><br><a href='/dashboard'>Back to Dashboard</a>",
            "profile.html": "<h1>👤 Profile</h1><p>User profile page.</p><br><a href='/dashboard'>Back to Dashboard</a>",
            "help.html": "<h1>❓ Help</h1><p>Get help and support.</p><br><a href='/dashboard'>Back to Dashboard</a>",
            "landing.html": """<!DOCTYPE html>
<html>
<head>
    <title>Agentic AI Platform</title>
    <style>
        body { font-family: Arial; text-align: center; padding: 50px; }
        h1 { color: #667eea; }
        .cta { background: #667eea; color: white; padding: 15px 30px; border-radius: 5px; text-decoration: none; }
    </style>
</head>
<body>
    <h1>🤖 Agentic AI Platform</h1>
    <p>No-code platform to build, deploy, and monitor AI automation agents</p>
    <a href="/login" class="cta">Get Started</a><br><br>
    <a href="/product_hunt">🚀 View Product Hunt Launch</a>
</body>
</html>"""
        }
        
        for filename, content in templates.items():
            if filename == "landing.html":
                (self.templates_dir / filename).write_text(content)
            else:
                (self.templates_dir / filename).write_text(f"<!DOCTYPE html><html><head><title>{filename}</title><style>body{{font-family:Arial;padding:20px;}}</style></head><body>{content}</body></html>")
            print(f"✅ Created {filename}")
            
    def create_deployment_files(self):
        """Create deployment configuration files"""
        print("\n🚀 Creating deployment files...")
        
        # .gitignore
        gitignore_content = """__pycache__/
*.pyc
*.db
.DS_Store
env/
venv/
.env
*.log
instance/"""
        
        (self.project_root / ".gitignore").write_text(gitignore_content)
        print("✅ Created .gitignore")
        
        # railway.json
        railway_content = """{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python server.py"
  }
}"""
        
        (self.project_root / "railway.json").write_text(railway_content)
        print("✅ Created railway.json")
        
        # Procfile
        (self.project_root / "Procfile").write_text("web: python server.py")
        print("✅ Created Procfile")
        
        # requirements.txt
        requirements = """flask>=2.3.0
flask-cors>=4.0.0"""
        
        (self.project_root / "requirements.txt").write_text(requirements)
        print("✅ Created requirements.txt")
        
        # SERVER_UPDATES.txt
        updates = """IMPORTANT: Update server.py with these changes:

1. Add these imports at the top:
   from flask_cors import CORS
   from werkzeug.security import generate_password_hash, check_password_hash

2. Add after Flask app initialization:
   app.secret_key = 'agentic_ai_secret_key_2025'
   CORS(app)

3. Add authentication routes:
   - /login (GET and POST)
   - /register (GET and POST) 
   - /logout

4. Add page routes:
   - /product_hunt
   - /admin
   - /desktop-recorder
   - /file-organizer
   - /ai-automation
   - /marketplace
   - /analytics
   - /mobile
   - /settings
   - /profile
   - /help
   - /landing

5. Update the main execution section:
   port = int(os.environ.get('PORT', 5000))
   app.run(host='0.0.0.0', port=port, debug=True)

6. Make sure to add database initialization code."""
        
        (self.project_root / "SERVER_UPDATES.txt").write_text(updates)
        print("✅ Created SERVER_UPDATES.txt")
        
        # QUICK_START_GUIDE.md
        guide = """# Agentic AI Platform - Quick Start Guide

## 🚀 Quick Setup

1. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt