@echo off 
echo ============================================ 
echo    AGENTIC AI - FULL SYSTEM TEST            
echo ============================================ 
timeout /t 1 
 
echo Starting FastAPI server... 
start /B python CORE\main.py 
timeout /t 5 
 
echo Testing API Endpoints... 
 
echo Opening Dashboard... 
start http://localhost:8080/dashboard 
start http://localhost:8080/api/docs 
 
echo Press any key to stop testing... 
pause 
