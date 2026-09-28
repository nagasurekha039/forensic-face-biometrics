"""
Database Seed and Initialization Script
Populates initial tables with forensic records, suspect profiles, cameras, and audit logs.
"""

import json
from datetime import datetime, timedelta
from .database import engine, Base, SessionLocal
from .models import User, Person, FaceEmbedding, RecognitionEvent, Camera, GeneratedCandidate, AuditLog
from ..core.security import hash_password

def init_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if database is already seeded
        if db.query(User).first():
            print("Database already contains data, skipping seed.")
            return

        print("Seeding forensic database...")

        # 1. Seed Users
        admin_user = User(
            username="investigator",
            hashed_password=hash_password("forensic2026"),
            full_name="Dr. Elena Vance, Ph.D.",
            role="Lead Forensic Examiner",
            badge_number="FSL-9082",
            is_active=True
        )
        officer_user = User(
            username="surveillance",
            hashed_password=hash_password("surveillance2026"),
            full_name="Officer Marcus Kane",
            role="Surveillance Officer",
            badge_number="SURV-3104",
            is_active=True
        )
        analyst_user = User(
            username="analyst",
            hashed_password=hash_password("analyst2026"),
            full_name="Aiden Ross",
            role="Biometric Data Analyst",
            badge_number="BIO-7719",
            is_active=True
        )
        db.add_all([admin_user, officer_user, analyst_user])

        # 2. Seed Reference Suspects
        sample_persons = [
            Person(
                person_id="SUS-1049",
                name="Vikram 'Ghost' Malhotra",
                alias="The Architect",
                age=34,
                gender="Male",
                description="Male, 34 years old, oval jawline, short trimmed black hair, thick eyebrows, sharp nose, light stubble. Suspected in cyber financial fraud.",
                photo_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
                face_embedding_status="Generated (512-D ArcFace)",
                status="Active Suspect",
                date_added=datetime.utcnow() - timedelta(days=45),
                last_detected=datetime.utcnow() - timedelta(hours=3),
                tags="High Priority, Cyber Crime"
            ),
            Person(
                person_id="SUS-2081",
                name="Dmitri Rostova",
                alias="Cipher",
                age=41,
                gender="Male",
                description="Square jaw, dark brown slicked hair, deep-set eyes, thin lips, pronounced scar on right cheek.",
                photo_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
                face_embedding_status="Generated (512-D ArcFace)",
                status="Active Suspect",
                date_added=datetime.utcnow() - timedelta(days=60),
                last_detected=datetime.utcnow() - timedelta(days=2),
                tags="Interpol Red Notice, Forgery"
            ),
            Person(
                person_id="SUS-3190",
                name="Sophia Chen",
                alias="Kitsune",
                age=27,
                gender="Female",
                description="Heart-shaped face, straight black hair, almond eyes, arched thin eyebrows, small button nose, full lips.",
                photo_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                face_embedding_status="Generated (512-D ArcFace)",
                status="Person of Interest",
                date_added=datetime.utcnow() - timedelta(days=12),
                last_detected=datetime.utcnow() - timedelta(hours=14),
                tags="Surveillance Watchlist"
            ),
            Person(
                person_id="SUS-4402",
                name="Amara Okafor",
                alias="Shadow",
                age=31,
                gender="Female",
                description="Oval face, curly braided hair, dark skin tone, expressive round eyes, full lips, no facial marks.",
                photo_url="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80",
                face_embedding_status="Generated (512-D ArcFace)",
                status="Person of Interest",
                date_added=datetime.utcnow() - timedelta(days=90),
                last_detected=datetime.utcnow() - timedelta(days=5),
                tags="Counter-Terrorism Watch"
            ),
            Person(
                person_id="SUS-5511",
                name="Lucas Sterling",
                alias="Silver",
                age=48,
                gender="Male",
                description="Oblong face, receding salt-and-pepper hair, thick eyebrows, rectangular glasses, full graying beard.",
                photo_url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
                face_embedding_status="Generated (512-D ArcFace)",
                status="Active Suspect",
                date_added=datetime.utcnow() - timedelta(days=120),
                last_detected=datetime.utcnow() - timedelta(hours=1),
                tags="Armed & Dangerous, Extortion"
            )
        ]
        db.add_all(sample_persons)
        db.commit()

        # Seed Face Embeddings for each person (512 normalized floats)
        import random
        for p in sample_persons:
            db.refresh(p)
            # Create synthetic 512-dim embedding
            rng = random.Random(p.id * 100)
            vec = [round(rng.uniform(-0.1, 0.1), 5) for _ in range(512)]
            norm = sum(x*x for x in vec) ** 0.5
            norm_vec = [round(x / norm, 5) for x in vec]
            
            emb = FaceEmbedding(
                person_id=p.id,
                vector_json=json.dumps(norm_vec),
                model_name="ArcFace-ResNet50",
                dimensions=512
            )
            db.add(emb)

        # 3. Seed Cameras
        cameras = [
            Camera(
                camera_id="CAM-01",
                name="North Gate Terminal Entry",
                location="Sector 4 - Perimeter North Gate",
                stream_url="webcam://0",
                status="Online",
                resolution="1080p @ 30 FPS",
                ai_models_active="YOLOv8 + DeepSORT + ArcFace"
            ),
            Camera(
                camera_id="CAM-02",
                name="Central Transit Concourse",
                location="Main Passenger Hub - Concourse B",
                stream_url="rtsp://demo-surveillance/cam02",
                status="Online",
                resolution="4K @ 24 FPS",
                ai_models_active="YOLOv8 + DeepSORT + ArcFace"
            ),
            Camera(
                camera_id="CAM-03",
                name="Secure Vault Corridor",
                location="Level -2 High Security Wing",
                stream_url="rtsp://demo-surveillance/cam03",
                status="Online",
                resolution="1080p @ 60 FPS",
                ai_models_active="YOLOv8 + ArcFace (Zero-Loss Mode)"
            ),
            Camera(
                camera_id="CAM-04",
                name="South Parking Checkpoint",
                location="Exterior Vehicle Gate 3",
                stream_url="rtsp://demo-surveillance/cam04",
                status="Offline",
                resolution="720p @ 15 FPS",
                ai_models_active="YOLOv8 Detection Only"
            )
        ]
        db.add_all(cameras)

        # 4. Seed Recognition Events
        events = [
            RecognitionEvent(
                event_id="EVT-9921",
                date="2026-09-27",
                time="14:32:05",
                camera_id="CAM-01 (North Gate)",
                person_identifier="SUS-1049",
                person_name="Vikram 'Ghost' Malhotra",
                similarity=89.4,
                status="Potential Match",
                screenshot_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
                notes="Facial match flagged during vehicle checkpoint transit. DeepSORT track ID #42."
            ),
            RecognitionEvent(
                event_id="EVT-9920",
                date="2026-09-27",
                time="13:10:44",
                camera_id="CAM-02 (Central Concourse)",
                person_identifier="SUS-5511",
                person_name="Lucas Sterling",
                similarity=92.1,
                status="Verified Match",
                screenshot_url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
                notes="Automated facial landmark alignment matched gallery reference with 92.1% cosine confidence."
            ),
            RecognitionEvent(
                event_id="EVT-9919",
                date="2026-09-27",
                time="11:45:19",
                camera_id="CAM-01 (North Gate)",
                person_identifier="SUS-3190",
                person_name="Sophia Chen",
                similarity=76.8,
                status="Potential Match",
                screenshot_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                notes="Angle at 28 degrees yaw. Candidate alerted to surveillance control."
            ),
            RecognitionEvent(
                event_id="EVT-9918",
                date="2026-09-26",
                time="22:15:02",
                camera_id="CAM-03 (Secure Corridor)",
                person_identifier="SUS-2081",
                person_name="Dmitri Rostova",
                similarity=64.2,
                status="Inconclusive",
                screenshot_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
                notes="Low lighting IR illumination. Score below primary match threshold (65%)."
            ),
            RecognitionEvent(
                event_id="EVT-9917",
                date="2026-09-26",
                time="19:04:33",
                camera_id="CAM-02 (Central Concourse)",
                person_identifier="SUS-1049",
                person_name="Vikram 'Ghost' Malhotra",
                similarity=87.5,
                status="Potential Match",
                screenshot_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
                notes="Correlated with automated sketch generated from witness #14 report."
            )
        ]
        db.add_all(events)

        # 5. Seed Audit Logs
        logs = [
            AuditLog(
                user_id="Dr. Elena Vance (FS-8821)",
                action="SYSTEM_INIT",
                target_resource="Database & AI Modules",
                ip_address="127.0.0.1",
                details="Initialized Forensic Biometrics SQLite database with ArcFace, YOLO, and GAN Sketch modules."
            ),
            AuditLog(
                user_id="Dr. Elena Vance (FS-8821)",
                action="BIOMETRIC_SEARCH",
                target_resource="Gallery Query SUS-1049",
                ip_address="192.168.1.104",
                details="Executed 512-D cosine similarity probe across 5 suspect embeddings."
            ),
            AuditLog(
                user_id="Officer Marcus Kane (SURV-3104)",
                action="SURVEILLANCE_CONNECT",
                target_resource="CAM-01 / CAM-02",
                ip_address="192.168.1.105",
                details="Live video stream initiated with YOLOv8 inference and DeepSORT tracking."
            )
        ]
        db.add_all(logs)

        db.commit()
        print("Database successfully initialized and seeded with forensic records.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
