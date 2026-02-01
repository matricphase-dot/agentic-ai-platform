# D:\AGENTIC_AI\src\agentic_ai\__init__.py
"""
Agentic AI Platform - Unified AI Agent Management System
Version: 3.0.0 Production
"""

__version__ = "3.0.0"
__author__ = "Agentic AI Team"
__license__ = "Proprietary"
__description__ = "Unified platform for managing AI agents with 6+ built-in agents"

from .app import create_app, run_server

__all__ = ['create_app', 'run_server', '__version__']