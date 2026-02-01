@echo off 
echo ======================================== 
echo       FIXING ALL IMPORT ERRORS          
echo ======================================== 
 
echo Step 1: Checking CORE structure... 
dir CORE\*.py /b 
 
echo Step 2: Creating server.py from main.py... 
copy CORE\main.py CORE\server.py 
 
echo Step 3: Fixing launch.py... 
echo import uvicorn 
echo import sys 
echo import os 
echo sys.path.append(os.path.dirname(os.path.abspath(__file__))) 
echo. 
echo try: 
echo     from CORE.server import app 
echo     print(\"? Using CORE.server\") 
echo except ImportError: 
echo     try: 
echo         from CORE.main import app 
echo         print(\"? Using CORE.main\") 
echo     except ImportError: 
echo         print(\"? No app found in CORE\") 
echo         exit(1) 
echo. 
echo if __name__ == \"__main__\": 
echo     print(\"?? Starting Agentic AI Platform on port 8002...\") 
echo     print(\"?? Dashboard: http://localhost:8002\") 
echo     print(\"?? API Docs: http://localhost:8002/docs\") 
echo     uvicorn.run(app, host=\"0.0.0.0\", port=8002) 
 
echo Step 4: Testing the fix... 
try:  
    from CORE.server import app  
    print('SUCCESS: app imported from CORE.server')  
except Exception as e:  
    print(f'ERROR: {e}')  
 
echo Step 5: Starting server... 
start cmd /k "cd /d D:\AGENTIC_AI ^&^& title AGENTIC_AI_SERVER ^&^& python launch.py" 
timeout /t 5 
 
echo Step 6: Testing connection... 
import requests  
import time  
for i in range(5):  
    try:  
        r = requests.get('http://localhost:8002/health', timeout=2)  
        print(f'? Server is running! Status: {r.status_code}')  
        print(f'Response: {r.json()}')  
        break  
    except:  
        print(f'Attempt {i+1}/5: Waiting...')  
        time.sleep(1)  
else:  
    print('? Server did not start')  
 
echo Step 7: Opening dashboard... 
start http://localhost:8002 
 
pause 
