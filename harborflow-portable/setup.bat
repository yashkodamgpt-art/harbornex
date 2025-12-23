@echo off
cd /d "%~dp0"
set PATH=%cd%\node;%PATH%

echo.
echo ========================================
echo        NexFlow Setup
echo ========================================
echo.

if "%~1"=="" (
    echo Usage:
    echo   setup.bat connect http://10.0.177.38:3000    - Set API URL
    echo   setup.bat login cmjgx1vi20001sv9e39hmebm4      - Set API key
    echo   setup.bat config               - Show config
    echo.
    pause
    exit /b
)

if "%~1"=="connect" (
    node\node.exe bin\harbor.js connect %2
    pause
    exit /b
)

if "%~1"=="login" (
    node\node.exe bin\harbor.js login %2
    pause
    exit /b
)

if "%~1"=="config" (
    node\node.exe bin\harbor.js config
    pause
    exit /b
)

echo Unknown command: %1
pause
