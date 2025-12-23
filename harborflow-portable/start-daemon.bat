@echo off
cd /d "%~dp0"
echo.
echo ========================================
echo        NexFlow Daemon
echo ========================================
echo.
set PATH=%cd%\node;%PATH%

echo Before running, make sure you have:
echo   1. API URL configured (run 'login' first)
echo   2. API Key configured
echo.

echo Starting Daemon...
node\node.exe bin\harbor.js start

echo.
pause
