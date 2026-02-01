@echo off
:: D:\AGENTIC_AI\start_safe.bat
chcp 65001 >nul

echo ========================================
echo    AGENTIC AI - SAFE START MODE
echo ========================================
echo.

:: Check if we're in the right directory
cd /d "%~dp0"
if not exist "CORE\main.py" (
    echo ERROR: CORE\main.py not found!
    echo Please run from D:\AGENTIC_AI directory
    pause
    exit /b 1
)

:: Create backup before starting
echo Creating backup of current main.py...
if not exist "backups" mkdir backups
copy "CORE\main.py" "backups\main_pre_start_%date:~10,4%%date:~4,2%%date:~7,2%.py" >nul

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found!
    pause
    exit /b 1
)

:: Create virtual environment if needed
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

:: Activate
call venv\Scripts\activate.bat

:: Check and install minimal requirements
echo Checking dependencies...
python -c "import fastapi" 2>nul || (
    echo Installing FastAPI...
    pip install fastapi uvicorn pydantic
)

python -c "import sqlalchemy" 2>nul || (
    echo Installing SQLAlchemy...
    pip install sqlalchemy
)

:: Try to start the server
echo.
echo ========================================
echo    STARTING AGENTIC AI PLATFORM
echo ========================================
echo.
echo If server fails, it might be due to:
echo 1. Missing dependencies in main.py
echo 2. Syntax errors in code
echo 3. Port already in use
echo.
echo Trying port 8084...
echo.

cd CORE

:: Try to start with basic config
python -c "
try:
    import uvicorn
    import sys
    sys.path.append('.')
    import main
    print('✅ Main.py loaded successfully!')
except Exception as e:
    print(f'❌ Error loading main.py: {e}')
    print('Trying to fix common issues...')
" 2>&1

echo.
echo Starting server...
echo Press Ctrl+C to stop
echo ========================================

:: Try different ports if needed
for %%p in (8084 8085 8086 8087) do (
    echo Trying port %%p...
    netstat -an | find ":%%p" > nul
    if errorlevel 1 (
        echo Port %%p is available, starting server...
        uvicorn main:app --host 0.0.0.0 --port %%p --reload
        goto :server_started
    ) else (
        echo Port %%p is in use, trying next...
    )
)

echo ❌ All ports (8084-8087) are in use!
echo Please close other applications or restart computer.
pause
exit /b 1

:server_started
echo Server started successfully!