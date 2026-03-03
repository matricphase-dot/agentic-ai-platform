@echo off
echo ==============================================
echo 🤖 AI Agent Cloud Platform - Windows Setup
echo ==============================================
echo.

rem Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Please run this script as Administrator!
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo [1] Creating directory structure...

rem Create backend structure
mkdir backend\core\agent_container 2>nul
mkdir backend\core\communication 2>nul
mkdir backend\core\collaboration 2>nul
mkdir backend\core\tools 2>nul
mkdir backend\core\intelligence 2>nul
mkdir backend\core\security 2>nul
mkdir backend\api 2>nul
mkdir backend\database 2>nul
mkdir backend\middleware 2>nul
mkdir backend\utils 2>nul

rem Create infrastructure
mkdir infrastructure\kubernetes 2>nul
mkdir infrastructure\docker 2>nul
mkdir infrastructure\monitoring 2>nul
mkdir infrastructure\scripts 2>nul
mkdir infrastructure\nginx 2>nul

rem Create agent templates
mkdir agent-templates\base 2>nul
mkdir agent-templates\chat 2>nul
mkdir agent-templates\workflow 2>nul
mkdir agent-templates\analytics 2>nul
mkdir agent-templates\automation 2>nul
mkdir agent-templates\custom 2>nul

rem Create other directories
mkdir tests 2>nul
mkdir logs 2>nul
mkdir logs\api 2>nul
mkdir logs\agents 2>nul
mkdir logs\system 2>nul
mkdir data 2>nul
mkdir data\uploads 2>nul
mkdir data\cache 2>nul
mkdir data\backups 2>nul

echo [✓] Directory structure created

echo.
echo [2] Creating environment file...

if not exist ".env" (
    echo # AI Agent Cloud Platform Environment Variables > .env
    echo. >> .env
    echo # Application >> .env
    echo APP_NAME=AI Agent Cloud Platform >> .env
    echo APP_VERSION=1.0.0 >> .env
    echo NODE_ENV=development >> .env
    echo DEBUG=true >> .env
    echo LOG_LEVEL=DEBUG >> .env
    echo. >> .env
    echo # Server >> .env
    echo HOST=0.0.0.0 >> .env
    echo PORT=8080 >> .env
    echo. >> .env
    echo # Database >> .env
    echo DATABASE_URL=postgresql://agentic:agentic123@localhost:5432/agentic_cloud >> .env
    echo. >> .env
    echo # Redis >> .env
    echo REDIS_URL=redis://localhost:6379/0 >> .env
    echo. >> .env
    echo # Docker (Windows specific) >> .env
    echo DOCKER_HOST=npipe:////./pipe/docker_engine >> .env
    echo. >> .env
    echo # AI APIs >> .env
    echo OPENAI_API_KEY=your-openai-api-key-here >> .env
    echo ANTHROPIC_API_KEY=your-anthropic-api-key-here >> .env
    echo COHERE_API_KEY=your-cohere-api-key-here >> .env
    echo. >> .env
    echo # Security >> .env
    echo JWT_SECRET_KEY=dev-secret-key-change-in-production >> .env
    echo ENCRYPTION_KEY=dev-encryption-key-change-in-production >> .env
    echo. >> .env
    echo # Frontend >> .env
    echo FRONTEND_URL=http://localhost:3000 >> .env
    
    echo [✓] .env file created
) else (
    echo [i] .env file already exists
)

echo.
echo [3] Checking prerequisites...

rem Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed!
    echo Please install Python 3.11+ from: https://www.python.org/downloads/
    pause
    exit /b 1
)
python --version

rem Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed!
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)
docker --version

rem Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Docker Compose is not installed!
    echo Docker Compose is included with Docker Desktop for Windows
    echo Please make sure Docker Desktop is running
)

echo [✓] Prerequisites check completed

echo.
echo [4] Creating Python virtual environment...

rem Create virtual environment
python -m venv venv
if errorlevel 1 (
    echo [ERROR] Failed to create virtual environment
    pause
    exit /b 1
)

echo [✓] Virtual environment created

echo.
echo [5] Creating required files...

rem Create requirements.txt
echo # Core dependencies > requirements.txt
echo fastapi==0.104.1 >> requirements.txt
echo uvicorn[standard]==0.24.0 >> requirements.txt
echo pydantic==2.5.0 >> requirements.txt
echo python-multipart==0.0.6 >> requirements.txt
echo. >> requirements.txt
echo # Docker SDK >> requirements.txt
echo docker==6.1.3 >> requirements.txt
echo. >> requirements.txt
echo # Async/Concurrency >> requirements.txt
echo aiohttp==3.9.1 >> requirements.txt
echo aiofiles==23.2.1 >> requirements.txt
echo. >> requirements.txt
echo # Redis >> requirements.txt
echo redis==5.0.1 >> requirements.txt
echo. >> requirements.txt
echo # Database >> requirements.txt
echo asyncpg==0.29.0 >> requirements.txt
echo sqlalchemy==2.0.23 >> requirements.txt
echo. >> requirements.txt
echo # AI/ML >> requirements.txt
echo openai==1.3.0 >> requirements.txt
echo anthropic==0.7.4 >> requirements.txt
echo cohere==4.34 >> requirements.txt
echo. >> requirements.txt
echo # Utilities >> requirements.txt
echo python-dotenv==1.0.0 >> requirements.txt
echo pyyaml==6.0.1 >> requirements.txt
echo psutil==5.9.6 >> requirements.txt
echo websockets==12.0 >> requirements.txt
echo msgpack==1.0.7 >> requirements.txt

rem Create the main agent runtime file
(
echo import docker
echo import asyncio
echo import json
echo import uuid
echo import logging
echo import aiohttp
echo import time
echo from typing import Dict, List, Any, Optional, Tuple
echo from dataclasses import dataclass, field
echo from datetime import datetime, timedelta
echo from enum import Enum
echo import psutil
echo import os
echo import platform
echo.
echo # Configure logging
echo logging.basicConfig(level=logging.INFO)
echo logger = logging.getLogger(__name(__file__^))
echo.
echo class ContainerStatus(Enum^):
echo     """Agent container status"""
echo     CREATED = "created"
echo     STARTING = "starting"
echo     RUNNING = "running"
echo     PAUSED = "paused"
echo     STOPPING = "stopping"
echo     STOPPED = "stopped"
echo     ERROR = "error"
echo     HEALTHY = "healthy"
echo     UNHEALTHY = "unhealthy"
echo.
echo # More code will be added here...
) > backend\core\agent_container\agent_runtime.py

echo [✓] Basic files created

echo.
echo [6] Creating Docker Compose file...

(
echo version: '3.8'
echo.
echo services:
echo   # PostgreSQL Database
echo   postgres:
echo     image: postgres:15-alpine
echo     container_name: agentic-postgres
echo     environment:
echo       POSTGRES_USER: agentic
echo       POSTGRES_PASSWORD: agentic123
echo       POSTGRES_DB: agentic_cloud
echo     ports:
echo       - "5432:5432"
echo     volumes:
echo       - postgres_data:/var/lib/postgresql/data
echo     networks:
echo       - agentic-network
echo     healthcheck:
echo       test: ["CMD-SHELL", "pg_isready -U agentic"]
echo       interval: 10s
echo       timeout: 5s
echo       retries: 5
echo.
echo   # Redis Cache
echo   redis:
echo     image: redis:7-alpine
echo     container_name: agentic-redis
echo     ports:
echo       - "6379:6379"
echo     volumes:
echo       - redis_data:/data
echo     networks:
echo       - agentic-network
echo     command: redis-server --appendonly yes
echo     healthcheck:
echo       test: ["CMD", "redis-cli", "ping"]
echo       interval: 10s
echo       timeout: 5s
echo       retries: 5
echo.
echo   # AI Agent API
echo   api:
echo     build:
echo       context: ./backend
echo       dockerfile: ../infrastructure/docker/api.Dockerfile
echo     container_name: agentic-api
echo     ports:
echo       - "8080:8080"
echo     environment:
echo       - NODE_ENV=development
echo       - DATABASE_URL=postgresql://agentic:agentic123@postgres:5432/agentic_cloud
echo       - REDIS_URL=redis://redis:6379/0
echo       - DOCKER_HOST=npipe:////./pipe/docker_engine
echo       - OPENAI_API_KEY=^${OPENAI_API_KEY:-sk-dummy-key^}
echo     volumes:
echo       - ./backend:/app
echo       - //var/run/docker.sock:/var/run/docker.sock
echo       - api_logs:/app/logs
echo     depends_on:
echo       postgres:
echo         condition: service_healthy
echo       redis:
echo         condition: service_healthy
echo     networks:
echo       - agentic-network
echo     restart: unless-stopped
echo.
echo volumes:
echo   postgres_data:
echo   redis_data:
echo   api_logs:
echo.
echo networks:
echo   agentic-network:
echo     driver: bridge
) > docker-compose.yml

echo [✓] Docker Compose file created

echo.
echo [7] Creating README.md...

(
echo # 🤖 AI Agent Cloud Platform - Windows Setup
echo.
echo ## Quick Start
echo.
echo 1. **Install prerequisites:**
echo    - Docker Desktop for Windows
echo    - Python 3.11+
echo    - Git
echo.
echo 2. **Clone the repository:**
echo    ```bash
echo    git clone https://github.com/agentic/ai-agent-cloud.git
echo    cd ai-agent-cloud
echo    ```
echo.
echo 3. **Run the setup script:**
echo    ```cmd
echo    setup_windows.bat
echo    ```
echo.
echo 4. **Install Python dependencies:**
echo    ```cmd
echo    venv\Scripts\activate
echo    pip install -r requirements.txt
echo    ```
echo.
echo 5. **Update .env file:**
echo    - Edit `.env` and add your OpenAI API key
echo    - Add other API keys as needed
echo.
echo 6. **Start the services:**
echo    ```cmd
echo    docker-compose up -d
echo    ```
echo.
echo 7. **Access the platform:**
echo    - API: http://localhost:8080
echo    - API Docs: http://localhost:8080/api/docs
echo    - Health Check: http://localhost:8080/health
echo.
echo ## Windows Specific Notes
echo.
echo - Docker on Windows uses named pipes: `npipe:////./pipe/docker_engine`
echo - Volume mounts use Windows paths: `D:\path\to\project:/app`
echo - Use PowerShell for better scripting support
) > README.md

echo [✓] README.md created

echo.
echo ==============================================
echo 🎉 Setup Complete!
echo ==============================================
echo.
echo Next steps:
echo 1. Edit .env file and add your API keys
echo 2. Activate virtual environment: venv\Scripts\activate
echo 3. Install Python packages: pip install -r requirements.txt
echo 4. Start Docker Desktop
echo 5. Run: docker-compose up -d
echo 6. Access: http://localhost:8080
echo.
echo Need help? Check README.md for more details
pause