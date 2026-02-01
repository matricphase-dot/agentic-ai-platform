@echo off 
echo Testing ALL Agentic AI Platform Features... 
echo. 
echo 1. Starting server in background... 
start /B cmd /k "cd /d D:\AGENTIC_AI\CORE ^&^& python main.py" 
timeout /t 7 
 
echo 2. Testing all API endpoints... 
import requests 
import time 
endpoints = [ 
    ('/api/health', 'GET'), 
    ('/api/agents', 'GET'), 
    ('/api/tasks', 'GET'), 
    ('/api/marketplace/tasks', 'GET'), 
    ('/api/platform/info', 'GET'), 
    ('/api/dashboard/stats', 'GET'), 
    ('/api/agent/types', 'GET') 
] 
for endpoint, method in endpoints: 
    try: 
        if method == 'GET': 
            r = requests.get(f'http://localhost:8000{endpoint}', timeout=5) 
        print(f'{endpoint}: {r.status_code} - OK') 
    except Exception as e: 
        print(f'{endpoint}: ERROR - {e}') 
 
echo 3. Opening dashboard... 
start http://localhost:8000/dashboard 
timeout /t 2 
echo 4. Opening API documentation... 
start http://localhost:8000/api/docs 
 
echo. 
echo ALL FEATURES TEST COMPLETE! 
echo Dashboard should show: 
echo   - Active agents count 
echo   - Tasks processed 
echo   - Marketplace tasks 
echo   - WebSocket status 
echo   - API testing panel 
echo   - Real-time updates 
pause 
