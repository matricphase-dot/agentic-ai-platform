@echo off 
echo ======================================== 
echo   AGENTIC AI COMPLETE PLATFORM TEST     
echo ======================================== 
 
echo [1/10] Testing Python installation... 
python --version 
if errorlevel 1 ( 
  echo ERROR: Python not found! 
  pause 
  exit /b 1 
) 
 
echo [2/10] Testing dependencies... 
pip list | findstr fastapi 
pip list | findstr uvicorn 
 
echo [3/10] Starting server... 
start /B cmd /k "cd /d D:\AGENTIC_AI && python launch.py && pause" 
timeout /t 5 
 
echo [4/10] Testing health endpoint... 
curl -X GET http://localhost:8000/health 
if errorlevel 1 ( 
  echo WARNING: curl not found, using Python instead... 
  python -c "import urllib.request; print(urllib.request.urlopen('http://localhost:8000/health').read().decode())" 
) 
 
echo [5/10] Testing dashboard... 
start http://localhost:8000 
timeout /t 3 
 
echo [6/10] Testing API documentation... 
start http://localhost:8000/docs 
timeout /t 2 
 
echo [7/10] Testing database... 
import sqlite3 
conn = sqlite3.connect('database/agentic.db') 
c = conn.cursor() 
c.execute('SELECT name FROM sqlite_master WHERE type=\"table\"') 
tables = c.fetchall() 
print(f'Found {len(tables)} tables: {tables}') 
 
echo [8/10] Testing example agents... 
if exist examples\student_assistant.py ( 
  python examples\student_assistant.py 
) else ( 
  echo WARNING: Example agents not found 
) 
 
echo [9/10] Testing file structure... 
dir CORE\*.py 
dir agentic_sdk\*.py 
dir examples\*.py 
 
echo [10/10] Final status... 
echo. 
echo === TEST COMPLETE === 
echo 1. Server should be running 
echo 2. Dashboard should be open in browser 
echo 3. Check all tabs work 
echo 4. Try creating a test agent 
echo. 
pause 
