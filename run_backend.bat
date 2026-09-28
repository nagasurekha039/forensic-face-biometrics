@echo off
echo ========================================================
echo Starting Forensic Biometrics FastAPI Backend...
echo ========================================================
cd backend
if not exist "venv\Scripts\activate.bat" (
    echo Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate
)
echo Initializing Database and AI Models...
python -m app.db.init_db
echo Launching Uvicorn ASGI Server on http://localhost:8000 ...
uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
