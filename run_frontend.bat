@echo off
echo ========================================================
echo Starting Forensic Biometrics React Frontend...
echo ========================================================
cd frontend
if not exist "node_modules" (
    echo Installing node modules...
    npm install
)
echo Launching Vite Dev Server on http://localhost:5173 ...
npm run dev
pause
