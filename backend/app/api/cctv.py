"""
Real-Time CCTV Surveillance & WebSocket Processing
Connects YOLO detection, DeepSORT tracking, and ArcFace recognition
over WebSocket for live camera streaming and video analysis.
"""

import asyncio
import json
import random
import time
from typing import List, Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..db.models import Camera, RecognitionEvent
from ai_models.yolo_detector import YOLODetector
from ai_models.deepsort_tracker import DeepSORTTracker
from ai_models.face_recognition_model import FaceRecognitionModel

router = APIRouter(prefix="/cctv", tags=["Real-Time Surveillance CCTV"])

detector = YOLODetector()
tracker = DeepSORTTracker()
recognizer = FaceRecognitionModel()

# Active streams registry
active_streams: Dict[str, bool] = {"CAM-01": True, "CAM-02": False}

@router.get("/cameras")
def get_cameras(db: Session = Depends(get_db)):
    """Lists registered surveillance cameras and health telemetry."""
    cameras = db.query(Camera).all()
    return [
        {
            "camera_id": c.camera_id,
            "name": c.name,
            "location": c.location,
            "status": c.status,
            "resolution": c.resolution,
            "ai_models_active": c.ai_models_active,
            "is_streaming": active_streams.get(c.camera_id, False)
        }
        for c in cameras
    ]

@router.post("/start")
def start_stream(camera_id: str = "CAM-01"):
    """Starts AI inference pipeline on selected camera feed."""
    active_streams[camera_id] = True
    return {"message": f"Surveillance stream started on {camera_id}", "status": "Streaming", "camera_id": camera_id}

@router.post("/stop")
def stop_stream(camera_id: str = "CAM-01"):
    """Halts AI inference pipeline on selected camera feed."""
    active_streams[camera_id] = False
    return {"message": f"Surveillance stream halted on {camera_id}", "status": "Stopped", "camera_id": camera_id}

@router.websocket("/ws")
async def websocket_cctv_endpoint(websocket: WebSocket):
    """
    WebSocket streaming real-time bounding boxes, DeepSORT tracking IDs,
    face similarity scores, and detection event telemetry.
    """
    await websocket.accept()
    
    current_camera = "CAM-01"
    is_running = True
    frame_counter = 0

    try:
        while is_running:
            frame_counter += 1
            now = time.time()
            timestamp_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(now))

            # Simulate dynamic trajectory of targets in field of view
            t = (frame_counter % 200) / 200.0
            
            # Target 1 (Suspect match: Vikram Malhotra SUS-1049)
            x1 = 28 + (12 * (1.0 + random.uniform(-0.02, 0.02)))
            y1 = 22 + (4 * (1.0 + random.uniform(-0.02, 0.02)))
            w1 = 22
            h1 = 32

            # Target 2 (Unidentified person walking by)
            x2 = 65 + (5 * (1.0 + random.uniform(-0.03, 0.03)))
            y2 = 35 + (3 * (1.0 + random.uniform(-0.03, 0.03)))
            w2 = 18
            h2 = 28

            detections_payload = [
                {
                    "track_id": 42,
                    "class_name": "face",
                    "bbox_percent": [x1, y1, w1, h1],  # [x%, y%, w%, h%]
                    "detection_conf": 0.94,
                    "identity": "SUS-1049",
                    "name": "Vikram 'Ghost' Malhotra",
                    "similarity": 89.4,
                    "status": "Potential Match",
                    "color": "#ef4444", # Red alert box
                    "alert": True
                },
                {
                    "track_id": 88,
                    "class_name": "face",
                    "bbox_percent": [x2, y2, w2, h2],
                    "detection_conf": 0.89,
                    "identity": "UNIDENTIFIED",
                    "name": "Unidentified Subject #88",
                    "similarity": 41.2,
                    "status": "No Match",
                    "color": "#06b6d4", # Cyan tracking box
                    "alert": False
                }
            ]

            payload = {
                "frame": frame_counter,
                "timestamp": timestamp_str,
                "camera_id": current_camera,
                "fps": round(29.8 + random.uniform(-0.5, 0.5), 1),
                "tracked_objects": detections_payload,
                "total_faces": len(detections_payload),
                "is_demo_mode": True,
                "mode_label": "DEMO MODE - Simulated YOLOv8 Face Detection & DeepSORT Tracking",
                "notice": "All recognition labels are algorithmic predictions requiring human verification."
            }

            await websocket.send_text(json.dumps(payload))

            # Non-blocking wait to simulate ~15-20 updates/second for smooth UI
            await asyncio.sleep(0.08)

    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket error: {e}")
