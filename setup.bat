@echo off
echo ========================================
echo 🚀 AGENTIC AI PLATFORM - QUICK SETUP
echo ========================================

echo 📦 Installing dependencies...
pip install fastapi uvicorn python-multipart requests aiofiles --quiet

echo 📁 Creating directories...
mkdir database 2>nul
mkdir uploads 2>nul
mkdir recordings 2>nul
mkdir screenshots 2>nul
mkdir static\css 2>nul
mkdir static\js 2>nul
mkdir templates 2>nul

echo 🚀 Starting server...
echo.
echo ✅ Platform is starting on: http://localhost:5000
echo 📊 Dashboard: http://localhost:5000
echo 🔧 API Docs: http://localhost:5000/docs
echo.
echo ⚠️  Press Ctrl+C to stop the server
echo.

python server.py