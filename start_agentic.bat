@echo off
chcp 65001 >nul
title 🚀 Agentic AI Platform with Ollama
echo ============================================
echo 🤖 AGENTIC AI PLATFORM WITH OLLAMA INTEGRATION
echo ============================================
echo.

REM 1. Check if Ollama is running
echo Checking Ollama service...
curl -s http://localhost:11434/api/tags > nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ Ollama is RUNNING!
    python -c "import requests; import json; r=requests.get('http://localhost:11434/api/tags', timeout=3); models=[m['name'] for m in r.json().get('models',[])]; print('   Models:', models if models else 'No models loaded')"
) else (
    echo ❌ Ollama NOT running. Starting it...
)

REM 2. Start Ollama if not running
tasklist | findstr /i "ollama.exe" >nul
if errorlevel 1 (
    echo.
    echo Starting Ollama from installed location...
    
    REM Try different possible locations
    if exist "C:\Users\user\AppData\Roaming\ollama app.exe\ollama.exe" (
        start "" "C:\Users\user\AppData\Roaming\ollama app.exe\ollama.exe"
    ) else if exist "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" (
        start "" "%LOCALAPPDATA%\Programs\Ollama\ollama.exe"
    ) else if exist "%USERPROFILE%\AppData\Local\Programs\Ollama\ollama.exe" (
        start "" "%USERPROFILE%\AppData\Local\Programs\Ollama\ollama.exe"
    ) else (
        echo ❌ Ollama executable not found!
        echo Please start Ollama manually from your installation.
    )
    
    timeout /t 5 /nobreak
    echo ✅ Ollama started!
)

REM 3. Test Ollama connection
echo.
echo Testing Ollama connection...
python -c "
import requests
try:
    response = requests.get('http://localhost:11434/api/tags', timeout=5)
    if response.status_code == 200:
        print('✅ SUCCESS: Ollama is accessible')
        import json
        data = response.json()
        models = data.get('models', [])
        if models:
            model_names = [m['name'] for m in models]
            print(f'   Available models: {model_names}')
        else:
            print('   ⚠️ No models loaded yet')
    else:
        print(f'⚠️ Ollama responded with error: {response.status_code}')
except Exception as e:
    print(f'❌ Cannot connect to Ollama: {e}')
"

REM 4. Start Agentic AI Platform
echo.
echo 🌐 Starting Agentic AI Platform...
echo Dashboard: http://localhost:5000
echo AI Automation: http://localhost:5000/ai-automation
echo Ollama API: http://localhost:11434
echo ============================================
echo.

python server.py
pause