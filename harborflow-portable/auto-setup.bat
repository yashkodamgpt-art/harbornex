@echo off
cd /d "%~dp0"
set PATH=%cd%\node;%PATH%

echo.
echo ========================================
echo        NexFlow Auto Setup
echo ========================================
echo.

REM === EDIT THESE VALUES ===
set API_URL=https://harbornex.dev/
set API_KEY=cmjio49ml0001nryblahkvhdj
REM =========================

echo Setting API URL: %API_URL%
node\node.exe bin\harbor.js connect %API_URL%

echo.
echo Setting API Key...
node\node.exe bin\harbor.js login %API_KEY%

echo.
echo ========================================
echo.
echo Configuration saved! Verifying:
echo.
node\node.exe bin\harbor.js config

echo.
echo Setup complete! You can now run:
echo   - start-gui.bat   (Opens GUI)
echo   - start-daemon.bat (Runs deployed apps)
echo.
pause
