@echo off
cd /d "%~dp0"
set PATH=%cd%\node;%PATH%

echo.
echo ========================================
echo        NexFlow Auto Setup
echo ========================================
echo.

REM === EDIT THESE VALUES ===
set API_URL=http://10.0.177.38:3000
set API_KEY=cmjgx1vi20001sv9e39hmebm4
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
