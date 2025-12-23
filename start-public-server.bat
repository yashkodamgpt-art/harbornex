@echo off
echo ============================================
echo   Harbor Cloud - Public Access via Tunnel
echo ============================================
echo.
echo Starting web server and creating public tunnel...
echo.

cd /d "%~dp0"

:: Start the web server
start /b cmd /c "cd web && set PATH=%cd%\..\node;%PATH% && npm run dev"

:: Wait for server to start
timeout /t 5 /nobreak >nul

:: Download and run cloudflared if not exists
if not exist cloudflared.exe (
    echo Downloading Cloudflare tunnel...
    curl -L -o cloudflared.exe https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
)

echo.
echo Starting Cloudflare tunnel...
echo Your public URL will appear below:
echo.
cloudflared.exe tunnel --url http://localhost:3000

pause
