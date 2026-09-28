"""
Backend Configuration Settings
Forensic Face Biometrics Platform
"""

import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT = BASE_DIR.parent
DB_PATH = PROJECT_ROOT / "database" / "forensic.db"
UPLOADS_DIR = PROJECT_ROOT / "uploads"

class Settings(BaseModel):
    PROJECT_NAME: str = "SMART FORENSIC FACE SKETCH GENERATION AND REAL-TIME BIOMETRIC IDENTIFICATION"
    PROJECT_VERSION: str = "2.0.0-PROTOTYPE"
    API_V1_PREFIX: str = "/api"
    SECRET_KEY: str = "FORENSIC_SECURE_JWT_SECRET_KEY_BTECH_AIML_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 12  # 12 hours
    
    # SQLite default, modular for PostgreSQL (e.g. postgresql://user:password@localhost/forensic_db)
    SQLALCHEMY_DATABASE_URL: str = f"sqlite:///{DB_PATH}"
    
    # AI Default Parameters
    DEFAULT_RECOGNITION_THRESHOLD: float = 0.65
    DEFAULT_DETECTION_CONFIDENCE: float = 0.50
    EMBEDDING_DIMENSIONS: int = 512

settings = Settings()
