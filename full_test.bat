@echo off 
echo ======================================== 
echo    AGENTIC AI PLATFORM COMPLETE TEST    
echo ======================================== 
 
echo Step 1: Killing old processes... 
taskkill /F /IM python.exe 2>nul 
taskkill /F /IM pythonw.exe 2>nul 
timeout /t 2 
 
echo Step 2: Starting server... 
start cmd /k "cd /d D:\AGENTIC_AI ^&^& title AGENTIC_AI_SERVER ^&^& python launch.py" 
timeout /t 5 
 
echo Step 3: Testing endpoints... 
import requests 
import time 
for i in range(10): 
    try: 
        r = requests.get('http://localhost:8000/api/health', timeout=2) 
        print(f'? Server is running! Status: {r.status_code}') 
        print(f'Response: {r.json()}') 
        break 
    except Exception as e: 
        print(f'Attempt {i+1}/10: Waiting for server...') 
        time.sleep(1) 
else: 
    print('? Server failed to start') 
 
echo Step 4: Testing dashboard... 
start http://localhost:8000/dashboard 
timeout /t 2 
 
echo Step 5: Testing all endpoints... 
import requests 
endpoints = ['/api/health', '/api/agents', '/api/founder', '/api/demo/student-founder-pitch'] 
for endpoint in endpoints: 
    try: 
        r = requests.get(f'http://localhost:8000{endpoint}', timeout=2) 
        print(f'? {endpoint}: {r.status_code}') 
    except Exception as e: 
        print(f'? {endpoint}: {e}') 
 
echo Step 6: Opening all interfaces... 
start http://localhost:8000/dashboard 
timeout /t 1 
start http://localhost:8000/api/docs 
timeout /t 1 
start http://localhost:8000/api/health 
 
echo. 
echo ? TEST COMPLETE! 
echo Platform should be running at: http://localhost:8000 
pause 
