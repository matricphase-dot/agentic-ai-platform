@echo off 
echo Running final platform tests... 
 
echo 1. Starting server... 
start /B python launch.py 
timeout /t 5 
 
echo 2. Testing API endpoints... 
curl -X GET http://localhost:8000/health 
curl -X GET http://localhost:8000/agents 
 
echo 3. Testing agent creation... 
python -m agentic_sdk.cli create "TestAgent" 
 
echo 4. Testing web interface... 
start http://localhost:8000 
 
echo 5. Final validation... 
python tests/test_platform.py 
 
echo All tests completed! 
pause 
