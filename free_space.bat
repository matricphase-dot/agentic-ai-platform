:: D:\AGENTIC_AI\free_space.bat
@echo off
echo ========================================
echo    FREEING UP DISK SPACE
echo ========================================
echo.

echo 1. Cleaning pip cache...
python -m pip cache purge

echo 2. Removing unnecessary files...
del /q /s *.pyc 2>nul
del /q /s *.log 2>nul
del /q /s __pycache__ 2>nul
rmdir /s /q __pycache__ 2>nul

echo 3. Removing old virtual environments...
rmdir /s /q venv_old 2>nul
rmdir /s /q env 2>nul

echo 4. Clearing temp files...
del /q /s %TEMP%\*.* 2>nul

echo.
echo ✅ Disk cleanup complete!
echo.
pause