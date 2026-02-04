"""
Database service for initialization and admin user creation
"""

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.config import settings
import logging

logger = logging.getLogger(__name__)

def init_database():
    """Initialize database connection"""
    try:
        db = SessionLocal()
        # Test connection
        db.execute("SELECT 1")
        db.close()
        logger.info("Database connection established")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise

def create_admin_user():
    """Create admin user if not exists"""
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if not admin:
            admin = User(
                email=settings.ADMIN_EMAIL,
                username="admin",
                full_name="System Administrator",
                is_admin=True,
                is_active=True
            )
            admin.set_password(settings.ADMIN_PASSWORD)
            db.add(admin)
            db.commit()
            logger.info("Admin user created successfully")
        else:
            logger.info("Admin user already exists")
    except Exception as e:
        logger.error(f"Failed to create admin user: {e}")
        db.rollback()
        raise
    finally:
        db.close()