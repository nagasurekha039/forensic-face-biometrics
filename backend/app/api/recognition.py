"""
Face Recognition & Biometric Identification API Endpoints
"""

import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..db.models import Person, FaceEmbedding, RecognitionEvent, AuditLog
from ..schemas.forensic_schemas import FaceRecognitionRequest
from ai_models.face_recognition_model import FaceRecognitionModel

router = APIRouter(prefix="/recognition", tags=["Biometric Face Recognition"])

recognizer = FaceRecognitionModel()

@router.post("/identify")
def identify_face(payload: FaceRecognitionRequest, db: Session = Depends(get_db)):
    """
    Identifies a query face (sketch or uploaded photo) against the suspect database.
    Outputs similarity scores, top matching candidates, and NIST forensic verification notice.
    """
    image_bytes = payload.image_base64.encode() if payload.image_base64 else (payload.image_url.encode() if payload.image_url else b"default_face")
    
    # 1. Extract 512-D normalized embedding
    query_emb = recognizer.extract_embedding(image_bytes)

    # 2. Retrieve gallery candidates from DB
    persons = db.query(Person).all()
    gallery = []
    for p in persons:
        emb_obj = db.query(FaceEmbedding).filter(FaceEmbedding.person_id == p.id).first()
        emb_vec = json.loads(emb_obj.vector_json) if emb_obj else None
        gallery.append({
            "id": p.id,
            "person_id": p.person_id,
            "name": p.name,
            "alias": p.alias,
            "age": p.age,
            "photo_url": p.photo_url,
            "embedding": emb_vec
        })

    # 3. Perform biometric identification
    hint_data = payload.image_url or (payload.image_base64[:120] if payload.image_base64 else "")
    result = recognizer.identify(query_emb, gallery, threshold=payload.threshold, query_hint=hint_data)
    
    # 4. If top match above threshold, log audit record
    top_match = result.get("top_match")
    if top_match:
        event = RecognitionEvent(
            event_id=f"EVT-{datetime.utcnow().strftime('%M%S')}-{top_match['person_id'][-4:]}",
            date=datetime.utcnow().strftime("%Y-%m-%d"),
            time=datetime.utcnow().strftime("%H:%M:%S"),
            camera_id="PROBE-TERMINAL-01",
            person_identifier=top_match["person_id"],
            person_name=top_match["name"],
            similarity=top_match["similarity_score"],
            status="Potential Match" if top_match["similarity_score"] < 90 else "Verified Match",
            screenshot_url=top_match.get("photo_url"),
            notes=f"Probabilistic biometric query match. Similarity: {top_match['similarity_score']}%."
        )
        db.add(event)
        
        audit = AuditLog(
            user_id="Investigator Session",
            action="BIOMETRIC_IDENTIFY",
            target_resource=top_match["person_id"],
            details=f"Query matched {top_match['name']} with {top_match['similarity_score']}% confidence."
        )
        db.add(audit)
        db.commit()

    return result
