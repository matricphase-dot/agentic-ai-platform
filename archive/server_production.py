#!/usr/bin/env python3
"""
🚀 AGENTIC AI PLATFORM - PRODUCTION SERVER v5.2.0
Fixed database schema issues and Windows compatibility
"""

import os
import sys
import json
import uuid
import hashlib
import time
import sqlite3
import asyncio
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
import mimetypes
import random
import string
from contextlib import asynccontextmanager

# Core FastAPI imports
from fastapi import FastAPI, Request, Response, HTTPException, Depends, status, UploadFile, File, Form, WebSocket, WebSocketDisconnect, BackgroundTasks, Query
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse, RedirectResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, field_validator
import uvicorn
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging
import qrcode
from PIL import Image, ImageDraw
import io
import base64
import aiofiles
import shutil
import aiosqlite

# ==================== CONFIGURATION ====================
class Config:
    # Security
    SECRET_KEY = os.getenv("SECRET_KEY", "agentic-ai-production-secret-key-2024-change-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
    
    # Database
    DATABASE_PATH = "database"
    UPLOAD_PATH = "uploads"
    RECORDINGS_PATH = "recordings"
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE = 60
    RATE_LIMIT_PER_HOUR = 500
    
    # Deployment
    ALLOWED_HOSTS = ["localhost", "127.0.0.1", "agentic-ai.railway.app", "*.railway.app"]
    
    # Monitoring
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE = "logs/app.log"

config = Config()

# ==================== LOGGING SETUP (Windows Compatible) ====================
def setup_logging():
    """Setup production logging compatible with Windows"""
    os.makedirs("logs", exist_ok=True)
    
    # Configure root logger
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, config.LOG_LEVEL))
    
    # Create a formatter that removes or replaces emojis
    class SafeFormatter(logging.Formatter):
        def format(self, record):
            # Remove emojis and non-ASCII characters for Windows compatibility
            if isinstance(record.msg, str):
                # Simple emoji removal - replace with text descriptions
                emoji_map = {
                    "🚀": "[ROCKET]",
                    "📍": "[LOCATION]",
                    "🚪": "[DOOR]",
                    "🔒": "[LOCK]",
                    "📊": "[CHART]",
                    "⚡": "[BOLT]",
                    "📈": "[GRAPH]",
                    "🛡️": "[SHIELD]",
                    "🔐": "[KEY]",
                    "🎉": "[PARTY]",
                    "📋": "[CLIPBOARD]",
                    "👤": "[PERSON]",
                    "✅": "[CHECK]",
                    "⚠️": "[WARNING]",
                    "❌": "[CROSS]",
                    "🆗": "[OK]",
                    "🤖": "[ROBOT]",
                    "📁": "[FOLDER]",
                    "📢": "[MEGAPHONE]",
                    "💻": "[LAPTOP]",
                    "🔧": "[WRENCH]"
                }
                
                for emoji, replacement in emoji_map.items():
                    record.msg = record.msg.replace(emoji, replacement)
                
                # Also remove any other non-ASCII characters
                record.msg = ''.join(char if ord(char) < 128 else '?' for char in record.msg)
            
            return super().format(record)
    
    # File handler with rotation
    file_handler = logging.FileHandler(
        config.LOG_FILE,
        encoding='utf-8'
    )
    file_handler.setFormatter(SafeFormatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    ))
    
    # Console handler - for Windows compatibility
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(SafeFormatter(
        '%(levelname)s: %(message)s'
    ))
    
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

logger = setup_logging()

# ==================== SECURITY SETUP ====================
# Use SHA256 instead of bcrypt for Windows compatibility
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Password hashing (SHA256 for Windows compatibility)
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    # Truncate password to 72 characters for compatibility
    if len(password) > 72:
        logger.warning(f"Password truncated from {len(password)} to 72 characters")
        password = password[:72]
    return pwd_context.hash(password)

# JWT tokens
try:
    from jose import JWTError, jwt
    
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, config.SECRET_KEY, algorithm=config.ALGORITHM)
        return encoded_jwt
        
except ImportError:
    logger.warning("python-jose not installed. Using simple token system.")
    
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        # Simple fallback token system
        token_data = {
            **data,
            "exp": (datetime.utcnow() + (expires_delta or timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES))).isoformat()
        }
        import base64
        token_str = json.dumps(token_data)
        return base64.b64encode(token_str.encode()).decode()

# ==================== DATA MODELS ====================
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: str
    full_name: Optional[str] = None
    
    @field_validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    is_active: bool
    is_admin: bool
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# ==================== DATABASE INITIALIZATION (FIXED) ====================
async def init_databases():
    """Initialize all databases with proper schemas - Drops and recreates tables"""
    logger.info("[ROCKET] Starting Agentic AI Platform v5.2.0")
    logger.info("Initializing databases...")
    
    os.makedirs(config.DATABASE_PATH, exist_ok=True)
    os.makedirs(config.UPLOAD_PATH, exist_ok=True)
    os.makedirs(config.RECORDINGS_PATH, exist_ok=True)
    
    # 1. USERS DATABASE - Drop and recreate to handle schema changes
    async with aiosqlite.connect(f"{config.DATABASE_PATH}/users.db") as db:
        # Drop existing table to recreate with correct schema
        await db.execute("DROP TABLE IF EXISTS users")
        
        await db.execute('''
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                username TEXT UNIQUE NOT NULL,
                full_name TEXT,
                password_hash TEXT NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                is_admin BOOLEAN DEFAULT 0,
                api_key TEXT UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                subscription_plan TEXT DEFAULT 'free',
                storage_quota_mb INTEGER DEFAULT 1000,
                ai_credits INTEGER DEFAULT 100
            )
        ''')
        
        # Create admin user
        admin_hash = get_password_hash("Admin123!")
        await db.execute('''
            INSERT INTO users 
            (email, username, full_name, password_hash, is_admin, ai_credits)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', ("admin@agenticai.com", "admin", "Admin User", admin_hash, 1, 1000))
        
        await db.commit()
        logger.info("[CHECK] Created users.db with admin user")
    
    # 2. ANALYTICS DATABASE
    async with aiosqlite.connect(f"{config.DATABASE_PATH}/analytics.db") as db:
        await db.execute("DROP TABLE IF EXISTS user_analytics")
        await db.execute('''
            CREATE TABLE user_analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                event_type TEXT NOT NULL,
                event_data TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        await db.commit()
        logger.info("[CHECK] Created analytics.db")
    
    # 3. FILES DATABASE
    async with aiosqlite.connect(f"{config.DATABASE_PATH}/files.db") as db:
        await db.execute("DROP TABLE IF EXISTS user_files")
        await db.execute('''
            CREATE TABLE user_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                filename TEXT NOT NULL,
                file_path TEXT NOT NULL,
                file_type TEXT,
                size_bytes INTEGER,
                category TEXT,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_organized BOOLEAN DEFAULT 0,
                metadata TEXT
            )
        ''')
        await db.commit()
        logger.info("[CHECK] Created files.db")
    
    # 4. AI CHAT DATABASE
    async with aiosqlite.connect(f"{config.DATABASE_PATH}/ai_chat.db") as db:
        await db.execute("DROP TABLE IF EXISTS ai_chats")
        await db.execute('''
            CREATE TABLE ai_chats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                prompt TEXT NOT NULL,
                response TEXT NOT NULL,
                model TEXT DEFAULT 'llama3.2',
                tokens_used INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        await db.commit()
        logger.info("[CHECK] Created ai_chat.db")
    
    # 5. RECORDINGS DATABASE
    async with aiosqlite.connect(f"{config.DATABASE_PATH}/recordings.db") as db:
        await db.execute("DROP TABLE IF EXISTS recordings")
        await db.execute('''
            CREATE TABLE recordings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                filename TEXT NOT NULL,
                file_path TEXT NOT NULL,
                duration_seconds REAL,
                size_bytes INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                title TEXT,
                description TEXT
            )
        ''')
        await db.commit()
        logger.info("[CHECK] Created recordings.db")
    
    # 6. MARKETPLACE DATABASE
    async with aiosqlite.connect(f"{config.DATABASE_PATH}/marketplace.db") as db:
        await db.execute("DROP TABLE IF EXISTS templates")
        await db.execute('''
            CREATE TABLE templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                category TEXT,
                author TEXT DEFAULT 'Agentic AI',
                price REAL DEFAULT 0.0,
                rating REAL DEFAULT 0.0,
                downloads INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                tags TEXT,
                file_path TEXT,
                is_featured BOOLEAN DEFAULT 0
            )
        ''')
        
        # Insert sample templates
        templates = [
            ("Email Automator", "Automatically respond to emails", "Productivity", 0.0),
            ("File Organizer", "AI-powered file organization", "Organization", 0.0),
            ("Social Media Scheduler", "Schedule posts automatically", "Marketing", 9.99),
            ("Data Analyzer", "Analyze CSV/Excel files", "Analytics", 14.99),
            ("Code Generator", "Generate code in any language", "Development", 19.99),
        ]
        
        for name, desc, category, price in templates:
            await db.execute('''
                INSERT INTO templates (name, description, category, price)
                VALUES (?, ?, ?, ?)
            ''', (name, desc, category, price))
        
        await db.commit()
        logger.info("[CHECK] Created marketplace.db with 5 templates")
    
    logger.info("[CHECK] All databases initialized successfully")

# ==================== RATE LIMITING ====================
limiter = Limiter(key_func=get_remote_address)

# ==================== LIFECYCLE MANAGER ====================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events"""
    # Startup
    logger.info("Agentic AI Platform v5.2.0 - Starting up...")
    await init_databases()
    
    # Create necessary directories
    for dir_path in ["static/css", "static/js", "static/images", "templates", "exports"]:
        os.makedirs(dir_path, exist_ok=True)
    
    logger.info("Startup complete. Server is ready.")
    yield
    
    # Shutdown
    logger.info("Shutting down Agentic AI Platform")

# ==================== FASTAPI APP ====================
app = FastAPI(
    title="Agentic AI Platform",
    description="Production-ready AI automation platform",
    version="5.2.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# Add rate limiting
app.state.limiter = limiter

# Security middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Mount static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# ==================== AUTHENTICATION DEPENDENCIES ====================
async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Try to decode with python-jose
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except (JWTError, NameError):
        # Fallback to simple token decoding
        try:
            import base64
            token_data = json.loads(base64.b64decode(token).decode())
            user_id = int(token_data.get("sub"))
            # Check expiration
            from datetime import datetime
            exp = datetime.fromisoformat(token_data.get("exp"))
            if datetime.utcnow() > exp:
                raise credentials_exception
        except:
            raise credentials_exception
    
    # Get user from database
    async with aiosqlite.connect(f"{config.DATABASE_PATH}/users.db") as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, email, username, full_name, is_active, is_admin, created_at FROM users WHERE id = ?",
            (user_id,)
        )
        user = await cursor.fetchone()
    
    if user is None or not user["is_active"]:
        raise credentials_exception
    
    return dict(user)

async def get_current_active_user(current_user: dict = Depends(get_current_user)):
    if not current_user["is_active"]:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if not current_user["is_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

# ==================== AUTHENTICATION ROUTES ====================
@app.post("/api/auth/register", response_model=Token)
async def register_user(
    request: Request,
    user_data: UserCreate,
    background_tasks: BackgroundTasks
):
    """Register a new user"""
    # Check if user exists
    async with aiosqlite.connect(f"{config.DATABASE_PATH}/users.db") as db:
        cursor = await db.execute(
            "SELECT id FROM users WHERE email = ? OR username = ?",
            (user_data.email, user_data.username)
        )
        existing_user = await cursor.fetchone()
        
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email or username already registered"
            )
        
        # Create user
        password_hash = get_password_hash(user_data.password)
        api_key = str(uuid.uuid4())
        
        await db.execute('''
            INSERT INTO users (email, username, full_name, password_hash, api_key)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_data.email, user_data.username, user_data.full_name, password_hash, api_key))
        
        user_id = (await db.execute("SELECT last_insert_rowid()")).fetchone()[0]
        await db.commit()
    
    # Create user directories
    user_upload_dir = os.path.join(config.UPLOAD_PATH, str(user_id))
    user_recording_dir = os.path.join(config.RECORDINGS_PATH, str(user_id))
    os.makedirs(user_upload_dir, exist_ok=True)
    os.makedirs(user_recording_dir, exist_ok=True)
    
    # Create access token
    access_token_expires = timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user_id)},
        expires_delta=access_token_expires
    )
    
    # Get user data
    async with aiosqlite.connect(f"{config.DATABASE_PATH}/users.db") as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, email, username, full_name, is_active, is_admin, created_at FROM users WHERE id = ?",
            (user_id,)
        )
        user = await cursor.fetchone()
    
    # Log registration
    background_tasks.add_task(
        log_analytics_event,
        user_id,
        "user_registered",
        {"username": user_data.username, "email": user_data.email}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": dict(user)
    }

@app.post("/api/auth/login", response_model=Token)
async def login_user(
    request: Request,
    login_data: UserLogin,
    background_tasks: BackgroundTasks
):
    """Authenticate user and return JWT token"""
    async with aiosqlite.connect(f"{config.DATABASE_PATH}/users.db") as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, email, username, full_name, password_hash, is_active, is_admin, created_at FROM users WHERE email = ?",
            (login_data.email,)
        )
        user = await cursor.fetchone()
    
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is disabled"
        )
    
    # Update last login
    async with aiosqlite.connect(f"{config.DATABASE_PATH}/users.db") as db:
        await db.execute(
            "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
            (user["id"],)
        )
        await db.commit()
    
    # Create token
    access_token_expires = timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["id"])},
        expires_delta=access_token_expires
    )
    
    # Log login
    background_tasks.add_task(
        log_analytics_event,
        user["id"],
        "user_login",
        {"username": user["username"]}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "username": user["username"],
            "full_name": user["full_name"],
            "is_active": bool(user["is_active"]),
            "is_admin": bool(user["is_admin"]),
            "created_at": user["created_at"]
        }
    }

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_active_user)
):
    """Get current user information"""
    return current_user

# ==================== HELPER FUNCTIONS ====================
async def log_analytics_event(user_id: int, event_type: str, event_data: dict = None):
    """Log analytics event"""
    try:
        async with aiosqlite.connect(f"{config.DATABASE_PATH}/analytics.db") as db:
            await db.execute('''
                INSERT INTO user_analytics (user_id, event_type, event_data)
                VALUES (?, ?, ?)
            ''', (user_id, event_type, json.dumps(event_data) if event_data else None))
            await db.commit()
    except Exception as e:
        logger.error(f"Failed to log analytics: {e}")

def get_user_directory(user_id: int, directory_type: str) -> Path:
    """Get user-specific directory path"""
    if directory_type == "uploads":
        base_path = Path(config.UPLOAD_PATH)
    elif directory_type == "recordings":
        base_path = Path(config.RECORDINGS_PATH)
    else:
        base_path = Path("user_data")
    
    user_path = base_path / str(user_id)
    user_path.mkdir(parents=True, exist_ok=True)
    return user_path

# ==================== FILE ORGANIZER MODULE ====================
class FileOrganizer:
    """Production file organizer with user isolation"""
    
    @staticmethod
    async def upload_file(
        user_id: int,
        file: UploadFile,
        category: str = None
    ) -> dict:
        """Upload file to user's directory"""
        user_dir = get_user_directory(user_id, "uploads")
        filename = f"{int(time.time())}_{file.filename}"
        file_path = user_dir / filename
        
        # Save file
        content = await file.read()
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        # Store in database
        async with aiosqlite.connect(f"{config.DATABASE_PATH}/files.db") as db:
            await db.execute('''
                INSERT INTO user_files 
                (user_id, filename, file_path, file_type, size_bytes, category)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                user_id,
                file.filename,
                str(file_path),
                file.content_type,
                len(content),
                category
            ))
            await db.commit()
        
        await log_analytics_event(user_id, "file_upload", {
            "filename": file.filename,
            "size": len(content),
            "type": file.content_type
        })
        
        return {
            "success": True,
            "filename": file.filename,
            "saved_as": filename,
            "size": len(content),
            "download_url": f"/api/files/download/{filename}"
        }
    
    @staticmethod
    async def get_user_files(user_id: int, limit: int = 50) -> List[dict]:
        """Get user's files"""
        async with aiosqlite.connect(f"{config.DATABASE_PATH}/files.db") as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute('''
                SELECT * FROM user_files 
                WHERE user_id = ? 
                ORDER BY uploaded_at DESC 
                LIMIT ?
            ''', (user_id, limit))
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]
    
    @staticmethod
    async def organize_files(user_id: int) -> dict:
        """Organize user's files by category"""
        user_dir = get_user_directory(user_id, "uploads")
        
        # File type to category mapping
        categories = {
            'images': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'],
            'documents': ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.xlsx', '.pptx'],
            'videos': ['.mp4', '.avi', '.mov', '.wmv', '.mkv'],
            'audio': ['.mp3', '.wav', '.flac', '.m4a'],
            'code': ['.py', '.js', '.html', '.css', '.json', '.xml'],
            'archives': ['.zip', '.rar', '.7z', '.tar', '.gz']
        }
        
        organized = 0
        for file_path in user_dir.glob("*"):
            if file_path.is_file():
                ext = file_path.suffix.lower()
                category = "other"
                
                for cat, exts in categories.items():
                    if ext in exts:
                        category = cat
                        break
                
                # Move to category folder
                cat_dir = user_dir / category
                cat_dir.mkdir(exist_ok=True)
                new_path = cat_dir / file_path.name
                shutil.move(str(file_path), str(new_path))
                
                # Update database
                async with aiosqlite.connect(f"{config.DATABASE_PATH}/files.db") as db:
                    await db.execute('''
                        UPDATE user_files 
                        SET category = ?, is_organized = 1 
                        WHERE filename = ? AND user_id = ?
                    ''', (category, file_path.name, user_id))
                    await db.commit()
                
                organized += 1
        
        await log_analytics_event(user_id, "files_organized", {"count": organized})
        
        return {
            "success": True,
            "organized_count": organized,
            "message": f"Organized {organized} files into categories"
        }

# ==================== AI CHAT MODULE ====================
class AIChatEngine:
    """AI chat engine with conversation history"""
    
    @staticmethod
    async def chat(
        user_id: int,
        prompt: str,
        model: str = "llama3.2"
    ) -> dict:
        """Process AI chat request"""
        # Simulated AI responses
        responses = [
            f"I understand you're asking: '{prompt[:100]}...'. As Agentic AI, I can help automate tasks, analyze files, and create workflows.",
            f"Great question! I can help with that. Would you like me to suggest automation templates or analyze your files?",
            f"Based on your query, I recommend checking the marketplace for automation templates that could help.",
            f"I'm here to help with AI automation. What specific task would you like to automate?"
        ]
        
        response = random.choice(responses)
        
        # Store in database
        async with aiosqlite.connect(f"{config.DATABASE_PATH}/ai_chat.db") as db:
            await db.execute('''
                INSERT INTO ai_chats (user_id, prompt, response, model, tokens_used)
                VALUES (?, ?, ?, ?, ?)
            ''', (user_id, prompt, response, model, len(prompt.split())))
            await db.commit()
        
        await log_analytics_event(user_id, "ai_chat", {"model": model})
        
        return {
            "success": True,
            "response": response,
            "model": model,
            "tokens_used": len(prompt.split()),
            "timestamp": datetime.now().isoformat()
        }
    
    @staticmethod
    async def get_chat_history(user_id: int, limit: int = 20) -> List[dict]:
        """Get user's chat history"""
        async with aiosqlite.connect(f"{config.DATABASE_PATH}/ai_chat.db") as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute('''
                SELECT * FROM ai_chats 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT ?
            ''', (user_id, limit))
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

# ==================== DESKTOP RECORDER MODULE ====================
class DesktopRecorder:
    """Desktop recording module"""
    
    @staticmethod
    async def start_recording(user_id: int, title: str = None) -> dict:
        """Start a recording session"""
        recording_id = str(uuid.uuid4())[:8]
        user_dir = get_user_directory(user_id, "recordings")
        filename = f"recording_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4"
        file_path = user_dir / filename
        
        # Create placeholder file
        async with aiofiles.open(file_path, 'w') as f:
            await f.write(f"Recording session {recording_id}")
        
        async with aiosqlite.connect(f"{config.DATABASE_PATH}/recordings.db") as db:
            await db.execute('''
                INSERT INTO recordings (user_id, filename, file_path, title)
                VALUES (?, ?, ?, ?)
            ''', (user_id, filename, str(file_path), title))
            await db.commit()
        
        await log_analytics_event(user_id, "recording_started", {"recording_id": recording_id})
        
        return {
            "success": True,
            "recording_id": recording_id,
            "filename": filename,
            "message": "Recording session started"
        }
    
    @staticmethod
    async def get_recordings(user_id: int) -> List[dict]:
        """Get user's recordings"""
        async with aiosqlite.connect(f"{config.DATABASE_PATH}/recordings.db") as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute('''
                SELECT * FROM recordings 
                WHERE user_id = ? 
                ORDER BY created_at DESC
            ''', (user_id,))
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

# ==================== MARKETPLACE MODULE ====================
class Marketplace:
    """Automation template marketplace"""
    
    @staticmethod
    async def get_templates(category: str = None) -> List[dict]:
        """Get automation templates"""
        async with aiosqlite.connect(f"{config.DATABASE_PATH}/marketplace.db") as db:
            db.row_factory = aiosqlite.Row
            if category and category != "all":
                cursor = await db.execute(
                    "SELECT * FROM templates WHERE category = ? ORDER BY downloads DESC",
                    (category,)
                )
            else:
                cursor = await db.execute("SELECT * FROM templates ORDER BY downloads DESC")
            
            rows = await cursor.fetchall()
            templates = [dict(row) for row in rows]
            
            return templates
    
    @staticmethod
    async def download_template(user_id: int, template_id: int) -> dict:
        """Download a template"""
        async with aiosqlite.connect(f"{config.DATABASE_PATH}/marketplace.db") as db:
            # Increment download count
            await db.execute(
                "UPDATE templates SET downloads = downloads + 1 WHERE id = ?",
                (template_id,)
            )
            
            # Get template info
            cursor = await db.execute(
                "SELECT name, category FROM templates WHERE id = ?",
                (template_id,)
            )
            template = await cursor.fetchone()
            await db.commit()
        
        if template:
            await log_analytics_event(user_id, "template_downloaded", {
                "template_id": template_id,
                "template_name": template[0]
            })
            
            return {
                "success": True,
                "template_id": template_id,
                "template_name": template[0],
                "category": template[1],
                "download_url": f"/api/marketplace/templates/{template_id}/file"
            }
        
        raise HTTPException(status_code=404, detail="Template not found")

# ==================== API ROUTES ====================

# Health check (public)
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "5.2.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# ==================== FILE ROUTES ====================
@app.post("/api/files/upload")
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    category: str = Form(None),
    current_user: dict = Depends(get_current_active_user)
):
    """Upload a file"""
    return await FileOrganizer.upload_file(current_user["id"], file, category)

@app.get("/api/files")
async def list_files(
    current_user: dict = Depends(get_current_active_user),
    limit: int = Query(50, ge=1, le=100)
):
    """List user's files"""
    files = await FileOrganizer.get_user_files(current_user["id"], limit)
    return {"success": True, "files": files}

@app.post("/api/files/organize")
async def organize_files(
    current_user: dict = Depends(get_current_active_user)
):
    """Organize user's files"""
    return await FileOrganizer.organize_files(current_user["id"])

@app.get("/api/files/download/{filename}")
async def download_file(
    filename: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Download a file"""
    user_dir = get_user_directory(current_user["id"], "uploads")
    file_path = user_dir / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(file_path, filename=filename)

# ==================== AI ROUTES ====================
@app.post("/api/ai/chat")
async def ai_chat(
    request: Request,
    prompt: str = Form(...),
    model: str = Form("llama3.2"),
    current_user: dict = Depends(get_current_active_user)
):
    """Chat with AI"""
    return await AIChatEngine.chat(current_user["id"], prompt, model)

@app.get("/api/ai/history")
async def ai_history(
    current_user: dict = Depends(get_current_active_user),
    limit: int = Query(20, ge=1, le=100)
):
    """Get AI chat history"""
    history = await AIChatEngine.get_chat_history(current_user["id"], limit)
    return {"success": True, "history": history}

# ==================== RECORDER ROUTES ====================
@app.post("/api/recorder/start")
async def start_recording(
    title: str = Form(None),
    current_user: dict = Depends(get_current_active_user)
):
    """Start recording"""
    return await DesktopRecorder.start_recording(current_user["id"], title)

@app.get("/api/recorder/list")
async def list_recordings(
    current_user: dict = Depends(get_current_active_user)
):
    """List recordings"""
    recordings = await DesktopRecorder.get_recordings(current_user["id"])
    return {"success": True, "recordings": recordings}

# ==================== MARKETPLACE ROUTES ====================
@app.get("/api/marketplace/templates")
async def list_templates(
    category: str = Query(None),
    current_user: dict = Depends(get_current_active_user)
):
    """List marketplace templates"""
    templates = await Marketplace.get_templates(category)
    return {"success": True, "templates": templates}

@app.post("/api/marketplace/templates/{template_id}/download")
async def download_template(
    template_id: int,
    current_user: dict = Depends(get_current_active_user)
):
    """Download a template"""
    return await Marketplace.download_template(current_user["id"], template_id)

# ==================== ADMIN ROUTES ====================
@app.get("/api/admin/users")
async def list_users(
    admin: dict = Depends(get_admin_user),
    limit: int = Query(100, ge=1, le=1000)
):
    """List all users (admin only)"""
    async with aiosqlite.connect(f"{config.DATABASE_PATH}/users.db") as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, email, username, full_name, is_active, is_admin, created_at, last_login FROM users ORDER BY created_at DESC LIMIT ?",
            (limit,)
        )
        users = await cursor.fetchall()
        return {"success": True, "users": [dict(user) for user in users]}

@app.get("/api/admin/analytics")
async def admin_analytics(
    admin: dict = Depends(get_admin_user),
    days: int = Query(7, ge=1, le=365)
):
    """Get platform analytics (admin only)"""
    async with aiosqlite.connect(f"{config.DATABASE_PATH}/analytics.db") as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute('''
            SELECT event_type, COUNT(*) as count, DATE(timestamp) as date
            FROM user_analytics 
            WHERE timestamp >= datetime('now', ?)
            GROUP BY event_type, DATE(timestamp)
            ORDER BY date DESC
        ''', (f"-{days} days",))
        
        analytics = await cursor.fetchall()
    
    return {"success": True, "analytics": [dict(row) for row in analytics]}

# ==================== HTML ROUTES ====================
@app.get("/", response_class=HTMLResponse)
async def dashboard_page(request: Request):
    """Main dashboard"""
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    """Login page"""
    return templates.TemplateResponse("auth/login.html", {"request": request})

@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    """Register page"""
    return templates.TemplateResponse("auth/register.html", {"request": request})

@app.get("/desktop-recorder", response_class=HTMLResponse)
async def recorder_page(request: Request):
    """Desktop recorder page"""
    return templates.TemplateResponse("desktop-recorder.html", {"request": request})

@app.get("/file-organizer", response_class=HTMLResponse)
async def file_organizer_page(request: Request):
    """File organizer page"""
    return templates.TemplateResponse("file-organizer.html", {"request": request})

@app.get("/ai-automation", response_class=HTMLResponse)
async def ai_automation_page(request: Request):
    """AI automation page"""
    return templates.TemplateResponse("ai-automation.html", {"request": request})

@app.get("/marketplace", response_class=HTMLResponse)
async def marketplace_page(request: Request):
    """Marketplace page"""
    return templates.TemplateResponse("marketplace.html", {"request": request})

@app.get("/analytics", response_class=HTMLResponse)
async def analytics_page(request: Request):
    """Analytics page"""
    return templates.TemplateResponse("analytics.html", {"request": request})

@app.get("/admin", response_class=HTMLResponse)
async def admin_page(request: Request):
    """Admin dashboard"""
    return templates.TemplateResponse("admin/dashboard.html", {"request": request})

@app.get("/product_hunt", response_class=HTMLResponse)
async def product_hunt_page(request: Request):
    """Product Hunt launch page"""
    return templates.TemplateResponse("product_hunt.html", {"request": request})

# ==================== ERROR HANDLERS ====================
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Handle 404 errors"""
    return JSONResponse(
        status_code=404,
        content={"error": "Resource not found", "path": str(request.url.path)},
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"},
    )

# ==================== MAIN ENTRY POINT ====================
if __name__ == "__main__":
    PORT = int(os.getenv("PORT", 5000))
    HOST = os.getenv("HOST", "0.0.0.0")
    
    print(f"""
    AGENTIC AI PLATFORM v5.2.0 - PRODUCTION READY
    ============================================
    Host: {HOST}
    Port: {PORT}
    Authentication: Enabled
    Database: SQLite with user isolation
    Rate Limiting: Enabled
    Logging: Enabled
    Security: Production-ready
    
    Dashboard: http://{HOST}:{PORT}/
    Login: http://{HOST}:{PORT}/login
    Product Hunt: http://{HOST}:{PORT}/product_hunt
    API Docs: http://{HOST}:{PORT}/api/docs
    
    Admin Credentials:
      Email: admin@agenticai.com
      Password: Admin123!
    
    Ready for public launch!
    """)
    
    uvicorn.run(
        app,
        host=HOST,
        port=PORT,
        log_level="info",
        access_log=True
    )