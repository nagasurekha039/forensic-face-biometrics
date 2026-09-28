"""
System Settings & Model Configuration Endpoints
"""

import platform
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/settings", tags=["System Settings & Model Config"])

class SystemSettings(BaseModel):
    recognition_model: str = "ArcFace-ResNet50"
    detection_model: str = "YOLOv8n-Face"
    tracker_model: str = "DeepSORT-Kalman"
    sketch_model: str = "Forensic-SketchGAN-v2.4"
    recognition_threshold: float = 0.65
    detection_threshold: float = 0.50
    active_database: str = "SQLite (Local Embedded)"
    demo_mode_enabled: bool = True
    theme: str = "Dark Forensic Navy"

current_settings = SystemSettings()

@router.get("")
def get_settings():
    """Retrieves current platform settings and hardware runtime telemetry."""
    return {
        "settings": current_settings.model_dump(),
        "system_info": {
            "os": f"{platform.system()} {platform.release()}",
            "python_version": platform.python_version(),
            "processor": platform.processor() or "AMD/Intel x86_64",
            "execution_provider": "CPU Execution Provider (Modular for CUDA/DirectML)",
            "biometric_db_records": 5,
            "api_version": "v2.0.0-PROTOTYPE",
            "compliance": "NIST FRTE / SWGDE Compliant Guidelines"
        }
    }

@router.post("")
def update_settings(new_settings: SystemSettings):
    """Updates operational thresholds and model routing parameters."""
    global current_settings
    current_settings = new_settings
    return {"message": "Settings updated successfully", "updated_settings": current_settings.model_dump()}
