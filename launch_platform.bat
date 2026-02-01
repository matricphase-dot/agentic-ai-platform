REM D:\AGENTIC_AI\launch_platform.bat
@echo off
chcp 65001 > nul
echo ========================================
echo    AGENTIC AI PLATFORM - LAUNCH
echo ========================================
echo.

REM Kill any existing process on port 8080
netstat -ano | findstr :8080 > nul
if %errorlevel% equ 0 (
    echo Port 8080 is in use. Closing existing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do taskkill /PID %%a /F
    timeout /t 2 /nobreak > nul
)

REM Check Python
python --version
if errorlevel 1 (
    echo ERROR: Python not found!
    pause
    exit /b 1
)

REM Check if main.py exists
if not exist "CORE\main.py" (
    echo ERROR: CORE\main.py not found!
    pause
    exit /b 1
)

echo Creating necessary directories...
if not exist "database" mkdir database
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads

echo Installing required packages...
pip install websocket-client colorama > nul 2>&1

echo.
echo Starting Agentic AI Platform...
echo Server will run on: http://localhost:8080
echo Dashboard: http://localhost:8080/dashboard
echo API Docs: http://localhost:8080/api/docs
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
python CORE\main.py

if errorlevel 1 (
    echo.
    echo ERROR: Server failed to start!
    echo.
    echo Common issues:
    echo 1. Missing dependencies - run: pip install -r requirements.txt
    echo 2. Port conflict - another app using port 8080
    echo 3. Python version must be 3.8+
    echo.
    pause
)