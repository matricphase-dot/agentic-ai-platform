#!/usr/bin/env python3
"""Quick setup script for Agentic AI Platform Phase 1"""

import os
import sys
from sqlalchemy import create_engine, Column, Integer, String, Boolean, JSON, Text, DateTime, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import uuid
from datetime import datetime

# Create database engine (using SQLite for quick development)
DATABASE_URL = "sqlite:///./agentic_dev.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

Base = declarative_base()

# Define the API Connector model
class APIConnector(Base):
    __tablename__ = "api_connectors"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)
    provider = Column(String(100), nullable=False)
    base_url = Column(Text, nullable=False)
    auth_type = Column(String(20), nullable=False)
    auth_config = Column(JSON, default={})
    openapi_schema = Column(JSON)
    available_actions = Column(JSON, default=[])
    is_verified = Column(Boolean, default=False)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow())

class UserAPICredential(Base):
    __tablename__ = "user_api_credentials"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer)
    connector_id = Column(String)
    encrypted_credentials = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow())

# Create all tables
Base.metadata.create_all(bind=engine)

print("✅ Database tables created successfully!")
print(f"Database: {DATABASE_URL}")

# Create a test connector
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

test_connector = APIConnector(
    name="Stripe Test Connector",
    provider="stripe",
    base_url="https://api.stripe.com/v1",
    auth_type="api_key",
    is_verified=True
)

db.add(test_connector)
db.commit()

print("✅ Test connector created successfully!")
print(f"Connector ID: {test_connector.id}")

# Close connection
db.close()
