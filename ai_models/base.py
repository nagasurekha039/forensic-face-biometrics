"""
Forensic AI and Computer Vision - Base Interface Definitions
Academic B.Tech AIML Project Modular Architecture

This module specifies abstract interfaces for:
- GAN Sketch Generation (StyleGAN2 / CycleGAN / Pix2Pix)
- Face Recognition (ArcFace / FaceNet / Cosine Embedding Matching)
- Object & Face Detection (YOLOv8 / YOLOv9)
- Multi-Object Tracking (DeepSORT / ByteTrack)
- Natural Language Facial Feature Extraction (NLP / LLM / Regex-Grammar)
- Speech-to-Text Transcription (Whisper / SpeechRecognition)
- Age Progression & Regression (Morphological Age GAN)
- Facial Attribute Editing (StarGAN / AttGAN)
- 3D Face Reconstruction (PRNet / 3DDFA / Mediapipe 3D mesh)
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional, Tuple
import numpy as np

class BaseSketchGenerator(ABC):
    """Abstract interface for Forensic Face Sketch Synthesis."""
    
    @abstractmethod
    def generate(self, attributes: Dict[str, Any], seed: Optional[int] = None) -> Dict[str, Any]:
        """
        Generate a forensic sketch candidate based on attributes.
        Returns metadata including image base64/url, landmark coords, and generation params.
        """
        pass

    @abstractmethod
    def generate_candidates(self, attributes: Dict[str, Any], count: int = 4) -> List[Dict[str, Any]]:
        """Generate multiple varied forensic candidates for witness cross-selection."""
        pass


class BaseFaceRecognizer(ABC):
    """Abstract interface for ArcFace / FaceNet 512-dim embedding extraction & verification."""
    
    @abstractmethod
    def extract_embedding(self, image_data: bytes) -> np.ndarray:
        """Extract a 512-dimensional normalized facial feature vector."""
        pass

    @abstractmethod
    def compare_faces(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Calculate cosine similarity score between two facial embeddings [0.0 - 1.0]."""
        pass

    @abstractmethod
    def identify(self, query_embedding: np.ndarray, reference_database: List[Dict[str, Any]], threshold: float = 0.65) -> Dict[str, Any]:
        """Identify query against reference database, returning top ranked matches."""
        pass


class BaseDetector(ABC):
    """Abstract interface for YOLO Face & Person Detection."""
    
    @abstractmethod
    def detect(self, image_array: np.ndarray, conf_threshold: float = 0.5) -> List[Dict[str, Any]]:
        """
        Detect faces / persons in a video frame.
        Returns bounding boxes [x1, y1, x2, y2], class_name, and confidence score.
        """
        pass


class BaseTracker(ABC):
    """Abstract interface for DeepSORT Multi-Object Tracking."""
    
    @abstractmethod
    def update(self, detections: List[Dict[str, Any]], frame: np.ndarray) -> List[Dict[str, Any]]:
        """
        Update tracker with current frame detections.
        Returns tracked objects with persistent tracking_id, bbox, and velocity.
        """
        pass


class BaseNLPFeatureExtractor(ABC):
    """Abstract interface for converting witness verbal/textual statements into structured attributes."""
    
    @abstractmethod
    def extract_attributes(self, text: str) -> Dict[str, Any]:
        """
        Extract structured facial attributes (gender, age, hair, eyes, nose, lips, beard, marks)
        from witness text.
        """
        pass


class BaseSpeechToText(ABC):
    """Abstract interface for Speech-to-Text conversion for voice-guided sketch synthesis."""
    
    @abstractmethod
    def transcribe(self, audio_bytes: bytes, language: str = "en") -> Dict[str, Any]:
        """Convert speech audio recording into raw transcript text."""
        pass


class BaseAgeProgression(ABC):
    """Abstract interface for Age Progression and Regression (+/- 30 years)."""
    
    @abstractmethod
    def morph_age(self, image_data: bytes, target_age: int, current_age: int) -> Dict[str, Any]:
        """Apply morphological age progression or regression to a facial image/sketch."""
        pass


class BaseAttributeEditor(ABC):
    """Abstract interface for facial attribute editing (glasses, beard, hairstyle)."""
    
    @abstractmethod
    def edit_attribute(self, image_data: bytes, modifications: Dict[str, Any]) -> Dict[str, Any]:
        """Apply targeted attribute changes to an existing forensic face."""
        pass


class Base3DReconstruction(ABC):
    """Abstract interface for 3D Face Reconstruction from 2D composite sketch."""
    
    @abstractmethod
    def reconstruct_3d_mesh(self, image_data: bytes) -> Dict[str, Any]:
        """
        Extract 3D facial landmarks and 3D depth point cloud / triangular mesh
        for multi-angle forensic viewing.
        """
        pass
