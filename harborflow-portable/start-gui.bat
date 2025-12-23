@echo off
cd /d "%~dp0"
echo.
echo ========================================
echo        NexFlow Desktop
echo ========================================
echo.
set PATH=%cd%\node;%PATH%

echo Starting GUI Server...
start "NexFlow GUI" node\node.exe gui\server.js

echo GUI started at http://localhost:9876
echo.
echo Press any key to close this window...
pause > nul
