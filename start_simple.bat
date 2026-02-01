:: D:\AGENTIC_AI\start_simple.bat
@echo off
chcp 65001 >nul

echo ========================================
echo    AGENTIC AI PLATFORM - SIMPLE START
echo ========================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from python.org
    pause
    exit /b 1
)

:: Create and activate virtual environment
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

:: Install ONLY ESSENTIAL packages
echo Installing essential packages...
pip install fastapi uvicorn sqlalchemy python-jose[cryptography] bcrypt pyautogui jinja2

:: Create necessary directories
echo Creating directories...
mkdir logs 2>nul
mkdir uploads 2>nul
mkdir static 2>nul
mkdir templates 2>nul

:: Go to CORE directory
cd /d "%~dp0"
cd CORE

echo.
echo ========================================
echo    STARTING SERVER ON PORT 8083
echo ========================================
echo.
echo Access URLs:
echo    Dashboard: http://localhost:8083/dashboard
echo    API Docs:  http://localhost:8083/api/docs
echo    Health:    http://localhost:8083/api/health
echo.
echo Press Ctrl+C to stop
echo ========================================

uvicorn main:app --host 0.0.0.0 --port 8083 --reload