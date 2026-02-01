@echo off
echo ========================================
echo AGENTIC AI PLATFORM - COMPLETE VERSION
echo ========================================
echo.

echo Stopping existing server...
taskkill /F /IM python.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Creating required directories...
if not exist "screenshots" mkdir screenshots
if not exist "static\screenshots" mkdir "static\screenshots"
if not exist "uploads" mkdir uploads
if not exist "backups" mkdir backups
if not exist "logs" mkdir logs
if not exist "templates" mkdir templates

echo.
echo Setting up virtual environment...
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate

echo.
echo Installing dependencies...
pip install --upgrade pip
pip install fastapi==0.104.1 uvicorn[standard]==0.24.0 sqlalchemy==2.0.23
pip install pyautogui==0.9.54 psutil==5.9.6 pillow==10.1.0 jinja2==3.1.2 websockets==12.0
pip install python-jose[cryptography]==3.3.0 passlib[bcrypt]==1.7.4 python-multipart==0.0.6
pip install python-dotenv==1.0.0 pydantic==2.5.0

echo.
echo Starting Agentic AI Platform...
echo.
echo ✅ DASHBOARD: http://localhost:8084/dashboard
echo 📚 API DOCS: http://localhost:8084/api/docs
echo 🩺 HEALTH: http://localhost:8084/api/health
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn CORE.main:app --host 0.0.0.0 --port 8084 --reload

pause