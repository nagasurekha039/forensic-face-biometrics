"""
Forensic AI Face Sketch Generation & Real-Time Biometric Identification Platform
FastAPI Application Entry Point
Academic B.Tech AIML Final Year Project
"""

import sys
from pathlib import Path

# Add project root and backend directory to python path
current_dir = Path(__file__).resolve().parent
project_root = current_dir.parent
sys.path.insert(0, str(current_dir))
sys.path.insert(0, str(project_root))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.init_db import init_database
from app.api import (
    auth, sketch, nlp, voice, recognition,
    persons, history, cctv, reports, settings as sys_settings
)

# Initialize FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Academic B.Tech AIML Project: Smart Forensic Face Sketch Generation "
        "and Real-Time Biometric Identification using GANs, ArcFace, YOLO, DeepSORT, "
        "and NLP witness statement processing."
    ),
    version=settings.PROJECT_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for React Vite Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(sketch.router, prefix=settings.API_V1_PREFIX)
app.include_router(nlp.router, prefix=settings.API_V1_PREFIX)
app.include_router(voice.router, prefix=settings.API_V1_PREFIX)
app.include_router(recognition.router, prefix=settings.API_V1_PREFIX)
app.include_router(persons.router, prefix=settings.API_V1_PREFIX)
app.include_router(history.router, prefix=settings.API_V1_PREFIX)
app.include_router(cctv.router, prefix=settings.API_V1_PREFIX)
app.include_router(reports.router, prefix=settings.API_V1_PREFIX)
app.include_router(sys_settings.router, prefix=settings.API_V1_PREFIX)

@app.on_event("startup")
async def on_startup():
    """Ensure database schema is created and seeded with reference forensic suspect data."""
    init_database()

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "status": "Operational",
        "docs_url": "/docs",
        "demo_mode": True,
        "ethics_statement": (
            "NOTICE: Biometric identification algorithms produce probabilistic similarity scores. "
            "Forensic conclusions require qualified human expert verification under ISO/IEC 19794 & ASTM standards."
        )
    }

@app.get("/health")
def health_check():
    return {
        "status": "Healthy",
        "services": {
            "sketch_gan": "Online (Modular)",
            "arcface_embedder": "Online (Modular)",
            "yolo_detector": "Online (Modular)",
            "deepsort_tracker": "Online (Modular)",
            "nlp_parser": "Online (Modular)",
            "speech_stt": "Online (Modular)",
            "reconstruction_3d": "Online (Modular)"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
