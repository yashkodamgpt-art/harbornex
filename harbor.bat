@echo off
REM HarborFlow CLI - Portable wrapper
set HARBOR_ROOT=%~dp0
set PATH=%HARBOR_ROOT%node;%PATH%
node "%HARBOR_ROOT%bin\harbor.js" %*
