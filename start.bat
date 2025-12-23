@echo off
echo ========================================
echo       HARBOR - Portable Edition
echo ========================================
echo.

REM Set paths relative to this script
set HARBOR_ROOT=%~dp0
set PATH=%HARBOR_ROOT%node;%HARBOR_ROOT%git\bin;%PATH%

echo [1/2] Starting Harbor Cloud (Dashboard)...
cd /d "%HARBOR_ROOT%web"
start "Harbor Cloud" cmd /k "npm run dev"

echo.
echo ========================================
echo  Harbor is starting!
echo.
echo  Dashboard: http://localhost:3000
echo  Data:      %HARBOR_ROOT%data
echo ========================================
echo.
echo Press any key to exit this window...
pause > nul
