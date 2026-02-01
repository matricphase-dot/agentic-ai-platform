# unified_dashboard.py - Everything in One Place
import os
import json
import sys
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends, status, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
import bcrypt
import jwt
import secrets

# Database imports
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

# ========== DATABASE SETUP ==========
Base = declarative_base()
engine = create_engine('sqlite:///agentic_database.db')
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True)
    hashed_password = Column(String(200), nullable=False)
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def verify_password(self, password: str) -> bool:
        return bcrypt.checkpw(password.encode('utf-8'), self.hashed_password.encode('utf-8'))

class Workflow(Base):
    __tablename__ = "workflows"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    tasks = Column(JSON)
    schedule = Column(String(50))
    is_active = Column(Boolean, default=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# ========== YOUR ORIGINAL FILE ORGANIZER ==========
class LegacyOrganizer:
    """Your original file organizer - fully preserved"""
    
    @staticmethod
    def get_workspace_info():
        """Get information about the original workspace"""
        workspace = Path.cwd()
        return {
            "path": str(workspace),
            "exists": workspace.exists(),
            "folders": list(workspace.glob("*")),
            "has_organizer": (workspace / "organize_files.py").exists()
        }
    
    @staticmethod
    def run_organizer(source_dir: str = None, org_type: str = "by_type"):
        """Run your original organize_files.py"""
        workspace = Path.cwd()
        organizer = workspace / "organize_files.py"
        
        if not organizer.exists():
            return {"error": "Original organizer not found"}
        
        # Use subprocess to run the original script
        try:
            cmd = [sys.executable, str(organizer)]
            if source_dir:
                # We need to pass input to the script
                process = subprocess.Popen(
                    cmd,
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                # Send source directory as input
                output, error = process.communicate(input=source_dir + "\n")
                return {"output": output, "error": error}
            else:
                result = subprocess.run(cmd, capture_output=True, text=True)
                return {"output": result.stdout, "error": result.stderr}
        except Exception as e:
            return {"error": str(e)}
    
    @staticmethod
    def get_folder_structure():
        """Get the folder structure from folder_structure.json"""
        workspace = Path.cwd()
        structure_file = workspace / "folder_structure.json"
        
        if structure_file.exists():
            with open(structure_file, 'r') as f:
                return json.load(f)
        return {}
    
    @staticmethod
    def get_readme():
        """Get the README.md content"""
        workspace = Path.cwd()
        readme_file = workspace / "README.md"
        
        if readme_file.exists():
            with open(readme_file, 'r', encoding='utf-8') as f:
                return f.read()
        return ""

# ========== FASTAPI APP ==========
app = FastAPI(title="Agentic AI Unified Platform")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Templates
templates = Jinja2Templates(directory="templates")

# Create templates directory if not exists
Path("templates").mkdir(exist_ok=True)
Path("static").mkdir(exist_ok=True)

# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Secret key for JWT
SECRET_KEY = secrets.token_hex(32)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(request: Request, db: Session = Depends(get_db)):
    """Get current user from session or token"""
    token = request.cookies.get("auth_token")
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            username = payload.get("sub")
            user = db.query(User).filter(User.username == username).first()
            if user:
                return user
        except:
            pass
    
    # Check session
    user_id = request.session.get("user_id")
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            return user
    
    raise HTTPException(status_code=401, detail="Not authenticated")

# ========== AUTH ROUTES ==========
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Home page - shows login or dashboard"""
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/api/login")
async def login(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    """Login endpoint"""
    user = db.query(User).filter(User.username == username).first()
    
    if not user or not user.verify_password(password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create token
    token = jwt.encode({"sub": user.username}, SECRET_KEY, algorithm="HS256")
    
    response = RedirectResponse(url="/dashboard", status_code=302)
    response.set_cookie(key="auth_token", value=token)
    return response

@app.post("/api/register")
async def register(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    full_name: str = Form(None),
    db: Session = Depends(get_db)
):
    """Register new user"""
    # Check if user exists
    existing = db.query(User).filter(
        (User.username == username) | (User.email == email)
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    # Create user
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    user = User(
        username=username,
        email=email,
        hashed_password=hashed.decode('utf-8'),
        full_name=full_name
    )
    
    db.add(user)
    db.commit()
    
    # Auto login
    token = jwt.encode({"sub": user.username}, SECRET_KEY, algorithm="HS256")
    response = RedirectResponse(url="/dashboard", status_code=302)
    response.set_cookie(key="auth_token", value=token)
    return response

@app.get("/logout")
async def logout():
    """Logout user"""
    response = RedirectResponse(url="/", status_code=302)
    response.delete_cookie(key="auth_token")
    return response

# ========== DASHBOARD ROUTES ==========
@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request, user: User = Depends(get_current_user)):
    """Main dashboard"""
    # Get legacy system info
    legacy = LegacyOrganizer()
    workspace_info = legacy.get_workspace_info()
    folder_structure = legacy.get_folder_structure()
    
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "user": user,
        "workspace": workspace_info,
        "folder_structure": folder_structure
    })

@app.get("/api/legacy/organize")
async def organize_files_api(
    source: str = None,
    user: User = Depends(get_current_user)
):
    """Run the original file organizer"""
    result = LegacyOrganizer.run_organizer(source)
    return result

@app.get("/api/legacy/structure")
async def get_structure(user: User = Depends(get_current_user)):
    """Get folder structure"""
    structure = LegacyOrganizer.get_folder_structure()
    return {"structure": structure}

@app.get("/api/legacy/readme")
async def get_readme(user: User = Depends(get_current_user)):
    """Get README content"""
    content = LegacyOrganizer.get_readme()
    return {"content": content}

@app.post("/api/workflows")
async def create_workflow(
    name: str = Form(...),
    description: str = Form(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new workflow"""
    workflow = Workflow(
        name=name,
        description=description,
        tasks=[],
        owner_id=user.id
    )
    
    db.add(workflow)
    db.commit()
    
    return {"message": "Workflow created", "id": workflow.id}

@app.get("/api/workflows")
async def get_workflows(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user's workflows"""
    workflows = db.query(Workflow).filter(Workflow.owner_id == user.id).all()
    return {"workflows": workflows}

@app.get("/api/stats")
async def get_stats(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get system statistics"""
    workflows_count = db.query(Workflow).filter(Workflow.owner_id == user.id).count()
    
    # Get legacy info
    legacy = LegacyOrganizer()
    workspace_info = legacy.get_workspace_info()
    
    return {
        "user": {
            "username": user.username,
            "email": user.email,
            "is_admin": user.is_admin
        },
        "workflows": workflows_count,
        "workspace": {
            "path": workspace_info.get("path", ""),
            "has_organizer": workspace_info.get("has_organizer", False)
        }
    }

# ========== INITIAL SETUP ==========
def initialize_system():
    """Initialize the system on first run"""
    db = SessionLocal()
    
    # Check if admin exists
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        # Create admin
        password = "admin123"
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        admin = User(
            username="admin",
            email="admin@agentic.ai",
            hashed_password=hashed.decode('utf-8'),
            full_name="System Administrator",
            is_admin=True
        )
        db.add(admin)
        db.commit()
        print("✅ Admin user created: admin / admin123")
    
    # Check if we're in the right directory
    workspace = Path.cwd()
    if not (workspace / "organize_files.py").exists():
        print("⚠️  Warning: Original organize_files.py not found in current directory")
        print(f"   Current directory: {workspace}")
    
    db.close()

# ========== CREATE TEMPLATES ==========
def create_templates():
    """Create HTML templates"""
    
    # Create index.html
    index_html = '''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Agentic AI Platform</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .auth-container {
                background: white;
                border-radius: 20px;
                padding: 40px;
                width: 100%;
                max-width: 400px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            
            .auth-header {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .auth-header h1 {
                font-size: 2em;
                color: #333;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            
            .auth-header p {
                color: #666;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 8px;
                color: #555;
                font-weight: 500;
            }
            
            .form-control {
                width: 100%;
                padding: 12px 15px;
                border: 2px solid #e2e8f0;
                border-radius: 10px;
                font-size: 16px;
                transition: border-color 0.3s ease;
            }
            
            .form-control:focus {
                outline: none;
                border-color: #667eea;
            }
            
            .btn {
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            }
            
            .auth-switch {
                text-align: center;
                margin-top: 20px;
                color: #666;
            }
            
            .auth-switch a {
                color: #667eea;
                text-decoration: none;
                font-weight: 600;
            }
            
            .auth-switch a:hover {
                text-decoration: underline;
            }
            
            .demo-credentials {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 10px;
                margin-top: 20px;
                text-align: center;
                border: 2px solid #e9ecef;
            }
            
            .demo-credentials p {
                color: #666;
                margin-bottom: 5px;
            }
            
            .demo-credentials strong {
                color: #333;
            }
            
            .tab-container {
                display: flex;
                margin-bottom: 20px;
                border-bottom: 2px solid #e9ecef;
            }
            
            .tab {
                flex: 1;
                padding: 15px;
                text-align: center;
                cursor: pointer;
                color: #666;
                font-weight: 500;
                transition: all 0.3s ease;
            }
            
            .tab.active {
                color: #667eea;
                border-bottom: 3px solid #667eea;
            }
            
            .tab-content {
                display: none;
            }
            
            .tab-content.active {
                display: block;
            }
        </style>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    </head>
    <body>
        <div class="auth-container">
            <div class="auth-header">
                <h1><i class="fas fa-robot"></i> Agentic AI</h1>
                <p>Unified Automation Platform</p>
            </div>
            
            <div class="tab-container">
                <div class="tab active" onclick="showTab('login')">Login</div>
                <div class="tab" onclick="showTab('register')">Register</div>
            </div>
            
            <!-- Login Form -->
            <div id="loginTab" class="tab-content active">
                <form action="/api/login" method="POST">
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" name="username" class="form-control" placeholder="Enter username" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" name="password" class="form-control" placeholder="Enter password" required>
                    </div>
                    
                    <button type="submit" class="btn">
                        <i class="fas fa-sign-in-alt"></i> Sign In
                    </button>
                </form>
                
                <div class="demo-credentials">
                    <p>Demo Credentials:</p>
                    <p><strong>admin</strong> / admin123</p>
                </div>
            </div>
            
            <!-- Register Form -->
            <div id="registerTab" class="tab-content">
                <form action="/api/register" method="POST">
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" name="username" class="form-control" placeholder="Choose username" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" name="email" class="form-control" placeholder="your@email.com" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" name="full_name" class="form-control" placeholder="Your full name">
                    </div>
                    
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" name="password" class="form-control" placeholder="Create password" required>
                    </div>
                    
                    <button type="submit" class="btn">
                        <i class="fas fa-user-plus"></i> Create Account
                    </button>
                </form>
            </div>
        </div>
        
        <script>
            function showTab(tabName) {
                // Update tabs
                document.querySelectorAll('.tab').forEach(tab => {
                    tab.classList.remove('active');
                });
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Show selected tab
                document.querySelector(`.tab:nth-child(${tabName === 'login' ? 1 : 2})`).classList.add('active');
                document.getElementById(tabName + 'Tab').classList.add('active');
            }
            
            // Auto-focus first input
            document.addEventListener('DOMContentLoaded', () => {
                document.querySelector('input[name="username"]')?.focus();
            });
        </script>
    </body>
    </html>
    '''
    
    # Create dashboard.html
    dashboard_html = '''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Agentic AI Dashboard</title>
        <style>
            :root {
                --primary: #667eea;
                --primary-dark: #5a67d8;
                --secondary: #764ba2;
                --light: #f8f9fa;
                --dark: #343a40;
                --success: #28a745;
                --warning: #ffc107;
                --danger: #dc3545;
            }
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #f5f7fb;
                color: #333;
            }
            
            /* Header */
            .header {
                background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
                color: white;
                padding: 20px 30px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            
            .logo {
                display: flex;
                align-items: center;
                gap: 15px;
                font-size: 1.5em;
                font-weight: 700;
            }
            
            .logo i {
                font-size: 1.8em;
            }
            
            .user-menu {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            
            .user-info {
                text-align: right;
            }
            
            .user-name {
                font-weight: 600;
                font-size: 1.1em;
            }
            
            .user-email {
                font-size: 0.9em;
                opacity: 0.9;
            }
            
            .logout-btn {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 8px 15px;
                border-radius: 20px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 500;
                transition: background 0.3s ease;
            }
            
            .logout-btn:hover {
                background: rgba(255,255,255,0.3);
            }
            
            /* Navigation */
            .nav {
                background: white;
                padding: 15px 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                display: flex;
                gap: 20px;
                border-bottom: 2px solid #e9ecef;
            }
            
            .nav-item {
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                color: #666;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .nav-item:hover {
                background: #f8f9fa;
                color: var(--primary);
            }
            
            .nav-item.active {
                background: var(--primary);
                color: white;
            }
            
            /* Main Content */
            .main-content {
                padding: 30px;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .section {
                display: none;
                animation: fadeIn 0.5s ease;
            }
            
            .section.active {
                display: block;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            /* Cards */
            .cards-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 25px;
                margin-bottom: 40px;
            }
            
            .card {
                background: white;
                border-radius: 15px;
                padding: 25px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.05);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            .card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            
            .card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #f1f3f9;
            }
            
            .card-title {
                font-size: 1.3em;
                font-weight: 600;
                color: var(--dark);
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .card-title i {
                color: var(--primary);
            }
            
            /* Forms */
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-label {
                display: block;
                margin-bottom: 8px;
                color: #555;
                font-weight: 500;
            }
            
            .form-control {
                width: 100%;
                padding: 12px 15px;
                border: 2px solid #e2e8f0;
                border-radius: 10px;
                font-size: 16px;
                transition: border-color 0.3s ease;
            }
            
            .form-control:focus {
                outline: none;
                border-color: var(--primary);
            }
            
            textarea.form-control {
                min-height: 100px;
                resize: vertical;
                font-family: monospace;
            }
            
            /* Buttons */
            .btn {
                padding: 12px 25px;
                border-radius: 10px;
                border: none;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 10px;
            }
            
            .btn-primary {
                background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
                color: white;
            }
            
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            }
            
            .btn-success {
                background: var(--success);
                color: white;
            }
            
            .btn-warning {
                background: var(--warning);
                color: #212529;
            }
            
            .btn-danger {
                background: var(--danger);
                color: white;
            }
            
            /* Stats */
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            
            .stat-card {
                background: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                box-shadow: 0 3px 10px rgba(0,0,0,0.05);
            }
            
            .stat-number {
                font-size: 2.5em;
                font-weight: 700;
                color: var(--primary);
                margin-bottom: 10px;
            }
            
            .stat-label {
                color: #666;
                font-size: 0.9em;
            }
            
            /* Workspace Info */
            .workspace-info {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                margin-top: 20px;
                border: 2px dashed #dee2e6;
            }
            
            .workspace-info h4 {
                margin-bottom: 15px;
                color: var(--dark);
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .info-item {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
                padding: 10px;
                background: white;
                border-radius: 8px;
                border-left: 4px solid var(--primary);
            }
            
            .info-item i {
                color: var(--primary);
                width: 20px;
            }
            
            /* Log Output */
            .log-output {
                background: #1a1a1a;
                color: #00ff00;
                font-family: 'Courier New', monospace;
                padding: 15px;
                border-radius: 10px;
                max-height: 300px;
                overflow-y: auto;
                white-space: pre-wrap;
                font-size: 0.9em;
                margin-top: 20px;
            }
            
            /* Folder Structure */
            .folder-structure {
                background: white;
                border-radius: 10px;
                padding: 20px;
                margin-top: 20px;
                max-height: 400px;
                overflow-y: auto;
                border: 2px solid #e9ecef;
            }
            
            .folder-item {
                padding: 8px 0;
                border-bottom: 1px solid #f1f3f9;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .folder-item:last-child {
                border-bottom: none;
            }
            
            .folder-item i {
                color: #ffc107;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .header {
                    flex-direction: column;
                    gap: 15px;
                    text-align: center;
                }
                
                .user-info {
                    text-align: center;
                }
                
                .nav {
                    overflow-x: auto;
                    padding: 10px;
                }
                
                .main-content {
                    padding: 15px;
                }
                
                .cards-grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    </head>
    <body>
        <!-- Header -->
        <div class="header">
            <div class="logo">
                <i class="fas fa-robot"></i>
                <span>Agentic AI Dashboard</span>
            </div>
            
            <div class="user-menu">
                <div class="user-info">
                    <div class="user-name" id="userName">Loading...</div>
                    <div class="user-email" id="userEmail">Loading...</div>
                </div>
                <a href="/logout" class="logout-btn">
                    <i class="fas fa-sign-out-alt"></i>
                    Logout
                </a>
            </div>
        </div>
        
        <!-- Navigation -->
        <div class="nav">
            <div class="nav-item active" onclick="showSection('dashboard')">
                <i class="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
            </div>
            <div class="nav-item" onclick="showSection('organizer')">
                <i class="fas fa-folder-open"></i>
                <span>File Organizer</span>
            </div>
            <div class="nav-item" onclick="showSection('workflows')">
                <i class="fas fa-project-diagram"></i>
                <span>Workflows</span>
            </div>
            <div class="nav-item" onclick="showSection('structure')">
                <i class="fas fa-sitemap"></i>
                <span>Folder Structure</span>
            </div>
            <div class="nav-item" onclick="showSection('docs')">
                <i class="fas fa-book"></i>
                <span>Documentation</span>
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="main-content">
            <!-- Dashboard Section -->
            <div id="dashboardSection" class="section active">
                <h2>Welcome to Agentic AI Platform</h2>
                <p style="color: #666; margin-bottom: 30px;">Your unified automation workspace</p>
                
                <div class="cards-grid">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fas fa-tachometer-alt"></i>
                                <span>System Status</span>
                            </div>
                        </div>
                        <div class="stats-grid" id="systemStats">
                            <!-- Stats will be loaded here -->
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fas fa-bolt"></i>
                                <span>Quick Actions</span>
                            </div>
                        </div>
                        <div style="display: grid; gap: 15px; margin-top: 20px;">
                            <button class="btn btn-primary" onclick="showSection('organizer')">
                                <i class="fas fa-play"></i> Run File Organizer
                            </button>
                            <button class="btn btn-warning" onclick="refreshStats()">
                                <i class="fas fa-sync"></i> Refresh System
                            </button>
                            <button class="btn btn-success" onclick="showSection('workflows')">
                                <i class="fas fa-plus"></i> Create Workflow
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <i class="fas fa-info-circle"></i>
                            <span>Workspace Information</span>
                        </div>
                    </div>
                    <div class="workspace-info" id="workspaceInfo">
                        <!-- Workspace info will be loaded here -->
                    </div>
                </div>
            </div>
            
            <!-- File Organizer Section -->
            <div id="organizerSection" class="section">
                <h2>File Organizer</h2>
                <p style="color: #666; margin-bottom: 30px;">Organize files using the original Agentic AI system</p>
                
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <i class="fas fa-cogs"></i>
                            <span>Organize Files</span>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Source Directory</label>
                        <input type="text" id="sourcePath" class="form-control" 
                               value="{{ workspace.path if workspace else '' }}" 
                               placeholder="C:\Users\user\Desktop">
                        <small style="color: #666; margin-top: 5px; display: block;">
                            Leave empty to use current workspace
                        </small>
                    </div>
                    
                    <button class="btn btn-primary" onclick="runOrganizer()">
                        <i class="fas fa-play"></i> Start Organization
                    </button>
                    
                    <div class="log-output" id="organizerOutput">
                        Output will appear here...
                    </div>
                </div>
            </div>
            
            <!-- Workflows Section -->
            <div id="workflowsSection" class="section">
                <h2>Workflow Management</h2>
                <p style="color: #666; margin-bottom: 30px;">Create and manage automated workflows</p>
                
                <div class="cards-grid">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fas fa-plus-circle"></i>
                                <span>Create New Workflow</span>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Workflow Name</label>
                            <input type="text" id="workflowName" class="form-control" 
                                   placeholder="Daily Backup">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <textarea id="workflowDesc" class="form-control" 
                                      placeholder="What does this workflow do?"></textarea>
                        </div>
                        
                        <button class="btn btn-primary" onclick="createWorkflow()">
                            <i class="fas fa-save"></i> Save Workflow
                        </button>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fas fa-list"></i>
                                <span>My Workflows</span>
                            </div>
                        </div>
                        
                        <div id="workflowsList" style="margin-top: 20px;">
                            <!-- Workflows will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Folder Structure Section -->
            <div id="structureSection" class="section">
                <h2>Folder Structure</h2>
                <p style="color: #666; margin-bottom: 30px;">View and manage your workspace organization</p>
                
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <i class="fas fa-folder-tree"></i>
                            <span>Current Structure</span>
                        </div>
                        <button class="btn btn-primary" onclick="loadStructure()">
                            <i class="fas fa-sync"></i> Refresh
                        </button>
                    </div>
                    
                    <div class="folder-structure" id="folderStructure">
                        <!-- Folder structure will be loaded here -->
                    </div>
                </div>
            </div>
            
            <!-- Documentation Section -->
            <div id="docsSection" class="section">
                <h2>Documentation</h2>
                <p style="color: #666; margin-bottom: 30px;">System documentation and guides</p>
                
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <i class="fas fa-book"></i>
                            <span>System README</span>
                        </div>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; font-family: monospace; white-space: pre-wrap; max-height: 500px; overflow-y: auto;" id="readmeContent">
                        Loading documentation...
                    </div>
                </div>
            </div>
        </div>
        
        <script>
            // Global state
            let currentUser = null;
            
            // Show section
            function showSection(sectionId) {
                // Hide all sections
                document.querySelectorAll('.section').forEach(section => {
                    section.classList.remove('active');
                });
                
                // Update active nav
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                event.target.classList.add('active');
                
                // Show selected section
                document.getElementById(sectionId + 'Section').classList.add('active');
                
                // Load section data
                switch(sectionId) {
                    case 'dashboard':
                        loadDashboard();
                        break;
                    case 'structure':
                        loadStructure();
                        break;
                    case 'workflows':
                        loadWorkflows();
                        break;
                    case 'docs':
                        loadDocs();
                        break;
                }
            }
            
            // Load dashboard data
            async function loadDashboard() {
                try {
                    const response = await fetch('/api/stats');
                    const data = await response.json();
                    
                    currentUser = data.user;
                    
                    // Update user info
                    document.getElementById('userName').textContent = currentUser.username;
                    document.getElementById('userEmail').textContent = currentUser.email;
                    
                    // Update stats
                    const statsDiv = document.getElementById('systemStats');
                    statsDiv.innerHTML = `
                        <div class="stat-card">
                            <div class="stat-number">${data.workflows}</div>
                            <div class="stat-label">Workflows</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${data.workspace.has_organizer ? '✅' : '❌'}</div>
                            <div class="stat-label">Organizer Ready</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">24/7</div>
                            <div class="stat-label">Uptime</div>
                        </div>
                    `;
                    
                    // Update workspace info
                    const workspaceDiv = document.getElementById('workspaceInfo');
                    workspaceDiv.innerHTML = `
                        <h4><i class="fas fa-folder"></i> Workspace Location</h4>
                        <div class="info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${data.workspace.path}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-robot"></i>
                            <span>File Organizer: ${data.workspace.has_organizer ? 'Available' : 'Not Found'}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-user"></i>
                            <span>Logged in as: ${currentUser.username} ${currentUser.is_admin ? '(Admin)' : ''}</span>
                        </div>
                    `;
                    
                } catch (error) {
                    console.error('Failed to load dashboard:', error);
                }
            }
            
            // Run file organizer
            async function runOrganizer() {
                const sourcePath = document.getElementById('sourcePath').value;
                const outputDiv = document.getElementById('organizerOutput');
                
                outputDiv.textContent = 'Starting file organization...';
                
                try {
                    const response = await fetch(`/api/legacy/organize${sourcePath ? `?source=${encodeURIComponent(sourcePath)}` : ''}`);
                    const result = await response.json();
                    
                    if (result.output) {
                        outputDiv.textContent = result.output;
                    } else if (result.error) {
                        outputDiv.textContent = 'Error: ' + result.error;
                    }
                } catch (error) {
                    outputDiv.textContent = 'Failed to run organizer: ' + error.message;
                }
            }
            
            // Load folder structure
            async function loadStructure() {
                try {
                    const response = await fetch('/api/legacy/structure');
                    const data = await response.json();
                    
                    const structureDiv = document.getElementById('folderStructure');
                    structureDiv.innerHTML = '';
                    
                    if (data.structure) {
                        function renderStructure(obj, indent = 0) {
                            let html = '';
                            for (const [key, value] of Object.entries(obj)) {
                                html += `<div class="folder-item" style="padding-left: ${indent * 20}px;">
                                    <i class="fas fa-folder"></i>
                                    <span>${key}</span>
                                </div>`;
                                
                                if (typeof value === 'object') {
                                    html += renderStructure(value, indent + 1);
                                } else if (Array.isArray(value)) {
                                    value.forEach(item => {
                                        html += `<div class="folder-item" style="padding-left: ${(indent + 1) * 20}px;">
                                            <i class="fas fa-folder"></i>
                                            <span>${item}</span>
                                        </div>`;
                                    });
                                }
                            }
                            return html;
                        }
                        
                        structureDiv.innerHTML = renderStructure(data.structure);
                    } else {
                        structureDiv.innerHTML = '<p>No folder structure found. Run the organizer first.</p>';
                    }
                } catch (error) {
                    console.error('Failed to load structure:', error);
                }
            }
            
            // Load workflows
            async function loadWorkflows() {
                try {
                    const response = await fetch('/api/workflows');
                    const data = await response.json();
                    
                    const workflowsDiv = document.getElementById('workflowsList');
                    
                    if (data.workflows && data.workflows.length > 0) {
                        workflowsDiv.innerHTML = '';
                        data.workflows.forEach(workflow => {
                            workflowsDiv.innerHTML += `
                                <div style="padding: 15px; background: white; border-radius: 10px; margin-bottom: 10px; border: 2px solid #e9ecef;">
                                    <strong>${workflow.name}</strong>
                                    <p style="color: #666; margin: 10px 0;">${workflow.description || 'No description'}</p>
                                    <div style="font-size: 0.9em; color: #888;">
                                        Created: ${new Date(workflow.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            `;
                        });
                    } else {
                        workflowsDiv.innerHTML = '<p>No workflows yet. Create one to get started!</p>';
                    }
                } catch (error) {
                    console.error('Failed to load workflows:', error);
                }
            }
            
            // Create workflow
            async function createWorkflow() {
                const name = document.getElementById('workflowName').value;
                const description = document.getElementById('workflowDesc').value;
                
                if (!name) {
                    alert('Please enter a workflow name');
                    return;
                }
                
                try {
                    const formData = new FormData();
                    formData.append('name', name);
                    formData.append('description', description);
                    
                    const response = await fetch('/api/workflows', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const result = await response.json();
                    alert('Workflow created successfully!');
                    
                    // Clear form
                    document.getElementById('workflowName').value = '';
                    document.getElementById('workflowDesc').value = '';
                    
                    // Reload workflows
                    loadWorkflows();
                    
                } catch (error) {
                    alert('Failed to create workflow: ' + error.message);
                }
            }
            
            // Load documentation
            async function loadDocs() {
                try {
                    const response = await fetch('/api/legacy/readme');
                    const data = await response.json();
                    
                    document.getElementById('readmeContent').textContent = data.content || 'No documentation found';
                } catch (error) {
                    console.error('Failed to load docs:', error);
                }
            }
            
            // Refresh stats
            function refreshStats() {
                loadDashboard();
                alert('System refreshed!');
            }
            
            // Initialize on load
            document.addEventListener('DOMContentLoaded', () => {
                loadDashboard();
                loadStructure();
                loadWorkflows();
                loadDocs();
            });
        </script>
    </body>
    </html>
    '''
    
    # Write templates
    (Path("templates") / "index.html").write_text(index_html, encoding='utf-8')
    (Path("templates") / "dashboard.html").write_text(dashboard_html, encoding='utf-8')
    
    print("✅ HTML templates created")

# ========== MAIN ==========
if __name__ == "__main__":
    print("🤖 AGENTIC AI UNIFIED PLATFORM")
    print("="*60)
    
    # Create templates
    create_templates()
    
    # Initialize system
    initialize_system()
    
    print("\n✅ System initialized successfully!")
    print("\n🚀 Starting server on: http://localhost:8000")
    print("\n🔑 Login with:")
    print("   • Username: admin")
    print("   • Password: admin123")
    print("\n📁 Your workspace:", Path.cwd())
    
    # Start server
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)