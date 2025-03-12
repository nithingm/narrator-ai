@echo off
echo Checking for existing processes on port 5000...
setlocal enabledelayedexpansion
set "pids="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    if not "%%a"=="0" set "pids=!pids! %%a"
)
for %%a in (!pids!) do (
    echo Found process %%a on port 5000. Killing...
    taskkill /PID %%a /F >nul 2>&1 && echo Process %%a terminated. || echo Process %%a was not running.
)
endlocal

echo Checking for existing processes on port 3000...
setlocal enabledelayedexpansion
set "pids="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    if not "%%a"=="0" set "pids=!pids! %%a"
)
for %%a in (!pids!) do (
    echo Found process %%a on port 3000. Killing...
    taskkill /PID %%a /F >nul 2>&1 && echo Process %%a terminated. || echo Process %%a was not running.
)
endlocal

if "%1"=="--skip-next" (
    echo Skipping .next deletion...
) else (
    echo Deleting .next folder...
    if exist "frontend\.next" (
        rmdir /s /q "frontend\.next"
        echo .next folder deleted successfully.
    ) else (
        echo .next folder does not exist, skipping deletion.
    )
)

echo Starting Narrator AI backend server...
start "Backend" cmd /c "cd backend && npx ts-node index.ts"

ping -n 3 127.0.0.1 >nul

echo Starting Narrator AI frontend...
start "Frontend" cmd /c "cd frontend && npm run dev"

echo ====================================
echo       Narrator AI is running!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo ====================================
echo Press any key to stop all servers...

pause

tasklist | findstr /I "node.exe" >nul
if %errorlevel%==0 (
    taskkill /IM node.exe /F >nul 2>&1
    echo Backend and frontend stopped.
) else (
    echo No running Node.js processes found.
)
