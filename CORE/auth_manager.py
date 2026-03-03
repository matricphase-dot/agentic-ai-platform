"""
Auth Manager - Handles authentication and authorization
"""
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class AuthManager:
    def __init__(self):
        self.sessions = {}
        self.session_timeout = timedelta(hours=24)
        logger.info("Auth Manager initialized")
    
    def hash_password(self, password: str) -> str:
        """Hash a password"""
        salt = secrets.token_hex(16)
        hash_obj = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        )
        return f"{salt}${hash_obj.hex()}"
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify a password"""
        try:
            salt, hash_value = hashed.split('$')
            test_hash = hashlib.pbkdf2_hmac(
                'sha256',
                password.encode('utf-8'),
                salt.encode('utf-8'),
                100000
            )
            return test_hash.hex() == hash_value
        except:
            return False
    
    def create_session(self, user_id: int, user_data: Dict[str, Any]) -> str:
        """Create a new session"""
        session_id = secrets.token_urlsafe(32)
        
        self.sessions[session_id] = {
            "user_id": user_id,
            "user_data": user_data,
            "created_at": datetime.now(),
            "last_activity": datetime.now()
        }
        
        logger.info(f"Session created for user {user_id}")
        return session_id
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session data"""
        session = self.sessions.get(session_id)
        
        if session:
            # Check if session is expired
            if datetime.now() - session["last_activity"] > self.session_timeout:
                del self.sessions[session_id]
                logger.info(f"Session expired: {session_id}")
                return None
            
            # Update last activity
            session["last_activity"] = datetime.now()
            return session
        
        return None
    
    def invalidate_session(self, session_id: str):
        """Invalidate a session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            logger.info(f"Session invalidated: {session_id}")
    
    def cleanup_expired_sessions(self):
        """Clean up expired sessions"""
        now = datetime.now()
        expired = []
        
        for session_id, session in self.sessions.items():
            if now - session["last_activity"] > self.session_timeout:
                expired.append(session_id)
        
        for session_id in expired:
            del self.sessions[session_id]
        
        if expired:
            logger.info(f"Cleaned up {len(expired)} expired sessions")