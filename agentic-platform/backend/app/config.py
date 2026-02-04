"""
Configuration management for Agentic AI Platform
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings  # Changed from pydantic
from pydantic import Field, field_validator  # Updated import

class Settings(BaseSettings):
    # OpenAI Configuration
    OPENAI_API_KEY: str = Field(default="", description="OpenAI API Key")
    OPENAI_MODEL: str = Field(default="gpt-4-turbo-preview", description="OpenAI Model")
    OPENAI_MAX_TOKENS: int = Field(default=1000, description="Max tokens for OpenAI")
    OPENAI_TEMPERATURE: float = Field(default=0.7, description="Temperature for OpenAI")
    
    # Database Configuration
    DATABASE_URL: str = Field(default="sqlite:///./agentic.db", description="Database URL")
    
    # JWT Authentication
    SECRET_KEY: str = Field(default="your-super-secret-key-change-this-in-production", description="JWT Secret Key")
    ALGORITHM: str = Field(default="HS256", description="JWT Algorithm")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=1440, description="Access token expire minutes")
    
    # CORS Configuration
    ALLOWED_ORIGINS: str = Field(default="http://localhost:3000", description="Allowed origins for CORS")
    
    # Admin User
    ADMIN_EMAIL: str = Field(default="admin@agenticai.com", description="Admin email")
    ADMIN_PASSWORD: str = Field(default="Admin123!", description="Admin password")
    
    # Server Configuration
    HOST: str = Field(default="0.0.0.0", description="Server host")
    PORT: int = Field(default=8000, description="Server port")
    DEBUG: bool = Field(default=False, description="Debug mode")
    ENVIRONMENT: str = Field(default="development", description="Environment")
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=60, description="Rate limit per minute")
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", description="Log level")
    LOG_FILE: Optional[str] = Field(default=None, description="Log file path")
    
    # Application URLs
    FRONTEND_URL: str = Field(default="http://localhost:3000", description="Frontend URL")
    BACKEND_URL: str = Field(default="http://localhost:8000", description="Backend URL")
    
    # Feature Flags
    ENABLE_PAYMENTS: bool = Field(default=False, description="Enable payments")
    ENABLE_TEAM_FEATURES: bool = Field(default=False, description="Enable team features")
    
    @field_validator("DATABASE_URL")
    @classmethod
    def fix_postgres_url(cls, v: str) -> str:
        """Fix postgres:// to postgresql:// for SQLAlchemy"""
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

# Create settings instance
settings = Settings()