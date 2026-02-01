@echo off
chcp 65001 > nul
echo ========================================
echo    AGENTIC AI PLATFORM - LAUNCHER
echo ========================================
echo.

REM Kill existing processes on port 8080
echo Checking for existing processes on port 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do (
    echo Killing process PID: %%a
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 2 /nobreak >nul

REM Create necessary directories
echo Creating directories...
if not exist "screenshots" mkdir screenshots
if not exist "static/screenshots" mkdir static/screenshots
if not exist "uploads" mkdir uploads
if not exist "backups" mkdir backups
if not exist "logs" mkdir logs

REM Start the server
echo Starting Agentic AI Platform...
echo.
echo 🌐 Dashboard: http://localhost:8080/dashboard
echo 📚 API Docs: http://localhost:8080/api/docs
echo 🏥 Health Check: http://localhost:8080/api/health
echo 🔌 WebSocket: ws://localhost:8080/ws
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Run the server
python CORE\main.py

if errorlevel 1 (
    echo.
    echo ❌ Server failed to start!
    echo.
    echo Common issues:
    echo 1. Missing dependencies - run: pip install -r requirements.txt
    echo 2. Another app using port 8080
    echo 3. Python version must be 3.8+
    echo.
    pause
)
