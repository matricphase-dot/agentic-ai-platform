@echo off 
echo ====================================== 
echo    ?? AGENTIC AI PRODUCTION LAUNCH     
echo ====================================== 
 
echo [1/5] Starting monitoring... 
call monitoring\setup_grafana.bat 
 
echo [2/5] Starting database... 
python utils\init_db.py --production 
 
echo [3/5] Starting server... 
start /B python launch.py --production 
timeout /t 3 
 
echo [4/5] Opening dashboard... 
start http://localhost:8000 
 
echo [5/5] Platform ready! 
echo. 
echo ?? Dashboard: http://localhost:8000 
echo ?? Monitoring: http://localhost:3000 
echo ?? API Docs: http://localhost:8000/docs 
echo. 
pause 
