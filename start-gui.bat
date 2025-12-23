@echo off
echo ========================================
echo      HarborFlow GUI - Portable
echo ========================================
echo.

REM Set paths relative to this script
set HARBOR_ROOT=%~dp0
set PATH=%HARBOR_ROOT%node;%PATH%

echo Starting HarborFlow GUI...
node "%HARBOR_ROOT%gui\server.js"
