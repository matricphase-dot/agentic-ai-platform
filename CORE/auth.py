# D:\AGENTIC_AI\core\auth.py
import os
import jwt
import bcrypt
import uuid
from datetime import datetime, timedelta
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
import sqlalchemy
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, Integer, DateTime, Boolean, JSON

# Database models
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    plan = Column(String(50), default="free")  # free, pro, enterprise
    api_key = Column(String(255), unique=True)
    credits = Column(Integer, default=1000)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    settings = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AuthManager:
    def __init__(self):
        self.security = HTTPBearer(auto_error=False)
        self.SECRET_KEY = os.getenv("JWT_SECRET", "dev-secret-change-in-production-2024")
        self.ALGORITHM = "HS256"
        self.API_KEY_HEADER = "X-API-Key"
        
    def hash_password(self, password: str) -> str:
        """Hash a password for storing"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a stored password against one provided by user"""
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    
    def create_access_token(self, user_id: str, email: str, plan: str = "free", expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(days=7)
        
        payload = {
            "sub": user_id,
            "email": email,
            "plan": plan,
            "type": "access",
            "exp": expire,
            "iat": datetime.utcnow()
        }
        
        token = jwt.encode(payload, self.SECRET_KEY, algorithm=self.ALGORITHM)
        return token
    
    def create_api_key(self, user_id: str) -> str:
        """Create API key for user"""
        api_key = f"ak_{uuid.uuid4().hex}_{uuid.uuid4().hex[:8]}"
        return api_key
    
    def verify_token(self, credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer())) -> Dict[str, Any]:
        """Verify JWT token and return payload"""
        if credentials is None:
            raise HTTPException(
                status_code=401,
                detail="Authentication required",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        token = credentials.credentials
        
        try:
            payload = jwt.decode(token, self.SECRET_KEY, algorithms=[self.ALGORITHM])
            user_id = payload.get("sub")
            
            if user_id is None:
                raise HTTPException(status_code=401, detail="Invalid token")
            
            # Check if token is expired
            exp = payload.get("exp")
            if exp and datetime.utcnow() > datetime.fromtimestamp(exp):
                raise HTTPException(status_code=401, detail="Token expired")
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")
    
    def verify_api_key(self, api_key: Optional[str] = None) -> Dict[str, Any]:
        """Verify API key and return user info"""
        if not api_key:
            raise HTTPException(status_code=401, detail="API key required")
        
        # In production, this would query the database
        # For now, we'll mock it
        if api_key.startswith("ak_"):
            return {
                "user_id": "api_user_123",
                "email": "api@example.com",
                "plan": "enterprise"
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid API key")

# Create global instance
auth_manager = AuthManager()