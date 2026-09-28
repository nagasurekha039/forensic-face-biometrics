@echo off
echo ========================================================
echo Starting SMART FORENSIC FACE BIOMETRICS PLATFORM (Full-Stack)
echo ========================================================
start "Forensic AI Backend" cmd /k run_backend.bat
timeout /t 3 /nobreak >nul
start "Forensic AI Frontend" cmd /k run_frontend.bat
echo Both services launched!
echo Backend:  http://localhost:8000 (Swagger: http://localhost:8000/docs)
echo Frontend: http://localhost:5173
pause
