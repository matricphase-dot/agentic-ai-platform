@echo off
echo 🚀 Fixing Ollama Integration...
echo ===============================

REM 1. Check if Ollama service is running
echo Checking Ollama service...
curl -s http://localhost:11434/api/tags > nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ Ollama service is RUNNING!
    goto :OLLAMA_RUNNING
)

REM 2. Start Ollama from found location
echo ⚠️ Ollama service not running. Starting it...
start "" "C:\Users\user\AppData\Roaming\ollama app.exe\ollama.exe"

REM 3. Wait for service to start
echo Waiting 10 seconds for Ollama to start...
timeout /t 10 /nobreak

:OLLAMA_RUNNING
echo.
echo 🤖 Testing Ollama connection...
python -c "
import requests
try:
    response = requests.get('http://localhost:11434/api/tags', timeout=5)
    if response.status_code == 200:
        print('✅ SUCCESS: Ollama is accessible at http://localhost:11434')
        models = response.json().get('models', [])
        print(f'📦 Available models: {[m[\"name\"] for m in models]}')
    else:
        print('❌ Ollama responded but with error')
except Exception as e:
    print(f'❌ Cannot connect to Ollama: {e}')
"

echo.
echo 🎉 Ollama setup complete!
echo Use: http://localhost:11434/api/generate
pause