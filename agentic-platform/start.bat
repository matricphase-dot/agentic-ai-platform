@echo off
echo ========================================
echo    AGENTIC AI PLATFORM - START
echo ========================================
echo.

REM Start Backend
start cmd /k "cd /d D:\AGENTIC_AI\agentic-platform\backend && venv\Scripts\activate && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

REM Start Frontend
start cmd /k "cd /d D:\AGENTIC_AI\agentic-platform\frontend && npm run dev"

echo.
echo ✅ Backend: http://localhost:8000
echo ✅ Frontend: http://localhost:3000
echo ✅ API Docs: http://localhost:8000/docs
echo.
echo Demo Credentials:
echo Email: admin@agenticai.com
echo Password: Admin123!
echo.
pause