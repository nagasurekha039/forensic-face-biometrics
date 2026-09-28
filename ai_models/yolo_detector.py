"""
YOLO Person and Face Detection Module
Academic B.Tech AIML Project - Forensic Face System

Provides bounding box detection, confidence scores, and multi-class classification
(Person, Face) for CCTV surveillance streams.

TODO for Production/Advanced Research:
- Load Ultralytics YOLOv8x or YOLOv9 face model (yolov8n-face.pt)
- Enable TensorRT / OpenVINO execution provider for high FPS CCTV decoding
"""

import random
import numpy as np
from typing import Dict, Any, List
from .base import BaseDetector

class YOLODetector(BaseDetector):
    def __init__(self):
        self.model_name = "YOLOv8-Face/Person-Forensic (Demo Pipeline)"
        self.classes = ["person", "face"]
        self.is_simulated = True

    def detect(self, image_array: Any = None, conf_threshold: float = 0.45) -> List[Dict[str, Any]]:
        """
        Simulates / executes YOLO face and person detection on a frame.
        Returns normalized and pixel bounding boxes [x1, y1, x2, y2].
        """
        # If image array is provided, in a full pipeline we pass through cv2.dnn or ultralytics YOLO
        # For academic laptop demo without GPU, generate realistic bounding detections
        rng = random.Random()
        
        detections = [
            {
                "bbox": [180, 110, 310, 270],  # [x1, y1, x2, y2]
                "class_name": "face",
                "confidence": round(rng.uniform(0.85, 0.98), 3),
                "is_primary": True
            },
            {
                "bbox": [120, 90, 370, 480],
                "class_name": "person",
                "confidence": round(rng.uniform(0.88, 0.96), 3),
                "is_primary": False
            }
        ]
        
        # Filter by threshold
        valid = [d for d in detections if d["confidence"] >= conf_threshold]
        return valid
