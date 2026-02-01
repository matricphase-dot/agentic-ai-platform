@echo off 
echo ================================================= 
echo ================================================= 
 
echo STEP 1: Killing all conflicting processes... 
taskkill /F /IM python.exe 2>nul 
taskkill /F /IM pythonw.exe 2>nul 
netstat -ano | findstr :8000 > port_processes.txt 
for /f "tokens=5" %%a in (port_processes.txt) do ( 
  echo Killing PID: %%a 
  taskkill /PID %%a /F 2>nul 
) 
del port_processes.txt 2>nul 
timeout /t 3 
 
echo STEP 2: Fixing SDK syntax error... 
cd agentic_sdk 
if exist __init__.py copy __init__.py __init__.py.backup 
echo # Fixed Agentic SDK 
echo import sys 
echo import os 
echo import json 
echo import asyncio 
echo import logging 
echo. 
echo try: 
echo     import colorama 
echo     colorama.init() 
echo except ImportError: 
echo     pass 
echo. 
echo __all__ = ["AgentBase", "AgentRegistry", "register_action"] 
cd .. 
 
echo STEP 3: Starting server on CLEAN port 8002... 
start cmd /k "cd /d D:\AGENTIC_AI && title AGENTIC_SERVER_8002 && python launch.py --port 8002" 
timeout /t 5 
 
echo STEP 4: Testing connection... 
import requests 
import time 
for i in range(10): 
    try: 
        r = requests.get('http://localhost:8002/health', timeout=2) 
        print(f'Success! Status: {r.status_code}') 
        print(f'Response: {r.json()}') 
        break 
    except Exception as e: 
        print(f'Attempt {i+1}/10 failed: {e}') 
        time.sleep(1) 
else: 
    print('Could not connect to server') 
 
echo STEP 5: Opening dashboard... 
start http://localhost:8002 
 
echo. 
echo === INSTRUCTIONS === 
echo 1. Check if server started in new window 
echo 2. Check if dashboard opened in browser 
echo 3. If dashboard shows, test all features 
echo 4. Report any errors you see 
pause 
