@echo off
echo ============================================
echo   HarborFlow Portable Package Creator
echo ============================================
echo.

cd /d "%~dp0"

set OUTPUT=harborflow-portable
set ZIP=%OUTPUT%.zip

echo Creating package folder...
if exist %OUTPUT% rmdir /s /q %OUTPUT%
mkdir %OUTPUT%

echo Copying GUI files...
xcopy /E /I gui %OUTPUT%\gui >nul

echo Copying portable Node.js...
xcopy /E /I node %OUTPUT%\node >nul

echo Creating start script...
(
echo @echo off
echo cd /d "%%~dp0"
echo echo Starting HarborFlow GUI...
echo set PATH=%%cd%%\node;%%PATH%%
echo node\node.exe gui\server.js
echo pause
) > %OUTPUT%\start-harborflow.bat

echo.
echo Creating ZIP file...
if exist %ZIP% del %ZIP%

powershell -Command "Compress-Archive -Path '%OUTPUT%\*' -DestinationPath '%ZIP%' -Force"

echo.
echo ============================================
echo   Package created: %ZIP%
echo ============================================
echo.
echo Send this ZIP to any Windows PC!
echo Extract and run start-harborflow.bat
echo.
pause
