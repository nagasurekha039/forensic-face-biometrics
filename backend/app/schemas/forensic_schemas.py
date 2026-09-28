"""
Pydantic Schemas for API Serialization and Input Validation
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# Authentication
class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    role: str
    badge_number: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Facial Attributes for Forensic Sketch
class FacialAttributes(BaseModel):
    gender: str = "Male"
    age: int = Field(28, ge=5, le=100)
    face_shape: str = "Oval"
    skin_tone: str = "Medium"
    hair_style: str = "Short"
    hair_color: str = "Black"
    eyebrow_shape: str = "Thick"
    eye_shape: str = "Almond"
    eye_size: str = "Medium"
    nose_shape: str = "Straight"
    nose_size: str = "Medium"
    lip_shape: str = "Medium"
    facial_hair: str = "None"
    beard: str = "None"
    moustache: str = "None"
    other_attributes: List[str] = []

class SketchGenerateRequest(BaseModel):
    attributes: FacialAttributes
    seed: Optional[int] = None

class MultipleCandidatesRequest(BaseModel):
    attributes: FacialAttributes
    count: int = 4

class NLPExtractRequest(BaseModel):
    description: str

class VoiceTranscribeRequest(BaseModel):
    audio_base64: Optional[str] = None
    language: str = "en"

class FaceRecognitionRequest(BaseModel):
    image_base64: Optional[str] = None
    image_url: Optional[str] = None
    threshold: float = 0.65

class PersonCreate(BaseModel):
    name: str
    alias: Optional[str] = "None"
    age: int
    gender: str = "Male"
    description: Optional[str] = None
    photo_url: Optional[str] = None
    tags: Optional[str] = "Suspect"

class AgeProgressionRequest(BaseModel):
    current_age: int
    target_age: int
    attributes: Optional[FacialAttributes] = None
    image_url: Optional[str] = None

class AttributeEditRequest(BaseModel):
    modifications: Dict[str, Any]
    current_attributes: Optional[FacialAttributes] = None
    image_url: Optional[str] = None

class ReportGenerateRequest(BaseModel):
    case_id: str
    investigator_name: str
    candidate_id: Optional[str] = None
    matched_person_id: Optional[str] = None
    similarity_score: Optional[float] = None
    notes: Optional[str] = None
    include_cctv_logs: bool = True
