@echo off 
echo ==================================================== 
echo         AGENTIC AI PLATFORM - COMPLETE LAUNCH        
echo ==================================================== 
echo. 
echo Step 1: Checking directories... 
if not exist "templates\dashboard.html" ( 
  echo Creating dashboard template... 
  copy "%~dp0dashboard_template.html" "templates\dashboard.html" 2>nul 
) 
 
echo Step 2: Creating required directories... 
mkdir logs 2>nul 
mkdir database 2>nul 
mkdir static 2>nul 
mkdir backups 2>nul 
 
echo Step 3: Starting the platform... 
echo. 
echo Opening platform dashboard at: 
echo   http://localhost:8000/dashboard 
echo   http://localhost:8000/api/health 
echo   http://localhost:8000/api/docs 
echo. 
start http://localhost:8000/dashboard 
start http://localhost:8000/api/docs 
timeout /t 3 
 
echo Step 4: Launching server... 
cd CORE 
python main.py 
pause 
