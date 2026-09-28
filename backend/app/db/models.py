"""
SQLAlchemy ORM Data Models for Forensic Face System
Modular schema compatible with SQLite and PostgreSQL.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(50), default="Forensic Investigator")  # Forensic Investigator, Biometric Analyst, Surveillance Officer, Admin
    badge_number = Column(String(50), default="FS-8821")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Person(Base):
    __tablename__ = "persons"

    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    alias = Column(String(100), default="None")
    age = Column(Integer, nullable=False)
    gender = Column(String(20), default="Male")
    description = Column(Text, nullable=True)
    photo_url = Column(Text, nullable=True)
    face_embedding_status = Column(String(50), default="Generated (512-D)")
    status = Column(String(50), default="Active Suspect") # Active Suspect, Person of Interest, Cleared, Witness
    date_added = Column(DateTime, default=datetime.utcnow)
    last_detected = Column(DateTime, nullable=True)
    tags = Column(String(255), default="High Priority, Criminal Record")

    embeddings = relationship("FaceEmbedding", back_populates="person", cascade="all, delete-orphan")
    events = relationship("RecognitionEvent", back_populates="person")

class FaceEmbedding(Base):
    __tablename__ = "face_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("persons.id"), nullable=False)
    vector_json = Column(Text, nullable=False)  # Serialized 512-dim vector float array
    model_name = Column(String(100), default="ArcFace-ResNet50")
    dimensions = Column(Integer, default=512)
    created_at = Column(DateTime, default=datetime.utcnow)

    person = relationship("Person", back_populates="embeddings")

class RecognitionEvent(Base):
    __tablename__ = "recognition_events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(50), unique=True, index=True, nullable=False)
    date = Column(String(20), nullable=False) # YYYY-MM-DD
    time = Column(String(20), nullable=False) # HH:MM:SS
    camera_id = Column(String(50), nullable=False) # e.g. CAM-01 (Sector 4 North)
    person_id = Column(Integer, ForeignKey("persons.id"), nullable=True)
    person_identifier = Column(String(50), default="UNKNOWN")
    person_name = Column(String(100), default="Unidentified Subject")
    similarity = Column(Float, nullable=False) # Percentage 0-100
    status = Column(String(50), default="Potential Match") # Verified Match, Potential Match, Inconclusive, False Positive
    screenshot_url = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    person = relationship("Person", back_populates="events")

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    location = Column(String(150), nullable=False)
    stream_url = Column(String(255), default="webcam://0")
    status = Column(String(30), default="Online") # Online, Offline, Calibrating
    resolution = Column(String(30), default="1080p @ 30 FPS")
    ai_models_active = Column(String(100), default="YOLOv8 + DeepSORT + ArcFace")
    last_ping = Column(DateTime, default=datetime.utcnow)

class GeneratedCandidate(Base):
    __tablename__ = "generated_candidates"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String(50), unique=True, index=True, nullable=False)
    case_id = Column(String(50), default="CASE-2026-092")
    image_url = Column(Text, nullable=False)
    attributes_json = Column(Text, nullable=False)
    seed = Column(Integer, default=42)
    witness_id = Column(String(50), default="WITNESS-01")
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String(50), default="INVESTIGATOR-01")
    action = Column(String(100), nullable=False)
    target_resource = Column(String(100), nullable=False)
    ip_address = Column(String(50), default="127.0.0.1")
    details = Column(Text, nullable=True)
