@echo off 
echo Killing all processes on port 8000... 
for /f "tokens=5" %%a in ('netstat -ano | findstr :8000') do ( 
  echo Killing PID: %%a 
  taskkill /PID %%a /F 2>nul 
) 
timeout /t 2 
echo Starting fresh server... 
start cmd /k "cd /d D:\AGENTIC_AI && python launch.py" 
timeout /t 3 
echo Opening dashboard... 
start http://localhost:8000 
pause 
