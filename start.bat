@echo off
echo Checking for existing processes on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Killing process %%a on port 5000...
    taskkill /PID %%a /F
)

echo Checking for existing processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Killing process %%a on port 3000...
    taskkill /PID %%a /F
)

echo Deleting .next folder...
if exist "frontend\.next" (
    rmdir /s /q "frontend\.next"
    echo .next folder deleted successfully.
) else (
    echo .next folder does not exist, skipping deletion.
)

echo Starting Narrator AI backend server...
start "Backend" cmd /c "cd backend && npm run dev"

timeout /t 2

echo Starting Narrator AI frontend...
start "Frontend" cmd /c "cd frontend && npm run dev"

echo Narrator AI is running!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo Press any key to stop all servers...

pause
taskkill /IM node.exe /F
