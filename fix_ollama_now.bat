@echo off
echo 🚀 EMERGENCY OLLAMA FIX
echo ========================
echo.

echo 1. Checking if Ollama processes are running...
tasklist | findstr /i ollama
if %errorlevel% equ 0 (
    echo ❌ Found Ollama processes. Killing them...
    taskkill /f /im ollama.exe 2>nul
    timeout /t 2 /nobreak
)

echo.
echo 2. Looking for Ollama installation...
set OLLAMA_FOUND=0

if exist "C:\Users\user\AppData\Roaming\ollama app.exe\ollama.exe" (
    echo ✅ Found: C:\Users\user\AppData\Roaming\ollama app.exe\
    set OLLAMA_PATH=C:\Users\user\AppData\Roaming\ollama app.exe
    set OLLAMA_FOUND=1
    goto :START_OLLAMA
)

if exist "%USERPROFILE%\AppData\Local\Programs\Ollama\ollama.exe" (
    echo ✅ Found: %USERPROFILE%\AppData\Local\Programs\Ollama\
    set OLLAMA_PATH=%USERPROFILE%\AppData\Local\Programs\Ollama
    set OLLAMA_FOUND=1
    goto :START_OLLAMA
)

if exist "C:\Program Files\Ollama\ollama.exe" (
    echo ✅ Found: C:\Program Files\Ollama\
    set OLLAMA_PATH=C:\Program Files\Ollama
    set OLLAMA_FOUND=1
    goto :START_OLLAMA
)

echo ❌ Could not find Ollama installation!
echo.
echo Please download Ollama from: https://ollama.com/download/windows
echo Then run the installer and restart this script.
pause
exit /b 1

:START_OLLAMA
echo.
echo 3. Starting Ollama from: %OLLAMA_PATH%
start "" "%OLLAMA_PATH%\ollama.exe"
echo ✅ Ollama started!

echo.
echo 4. Waiting 15 seconds for Ollama to initialize...
timeout /t 15 /nobreak

echo.
echo 5. Testing Ollama connection...
python test_ollama.py

echo.
echo 6. If Ollama is working, starting Agentic AI Platform...
echo    Dashboard: http://localhost:5000
echo    AI Automation: http://localhost:5000/ai-automation
echo.
python server.py

pause