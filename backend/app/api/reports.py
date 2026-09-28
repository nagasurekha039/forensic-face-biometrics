"""
Forensic Report Generation API Endpoints
"""

from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..db.models import Person, RecognitionEvent, Camera, AuditLog
from ..schemas.forensic_schemas import ReportGenerateRequest

router = APIRouter(prefix="/reports", tags=["Forensic Investigation Reports"])

@router.get("")
def list_reports():
    """Returns sample pre-generated forensic case reports."""
    return [
        {
            "case_id": "CASE-2026-092",
            "title": "North Gate Perimeter Intrusion - Suspect Ghost Investigation",
            "date": "2026-09-27",
            "investigator": "Dr. Elena Vance, Ph.D. (FS-8821)",
            "status": "Under Forensic Review",
            "matched_subject": "Vikram 'Ghost' Malhotra (SUS-1049)",
            "similarity_score": 89.4,
            "cameras_involved": ["CAM-01 (North Gate)", "CAM-02 (Central Concourse)"],
            "sketch_candidate_id": "CAND-9821A"
        },
        {
            "case_id": "CASE-2026-088",
            "title": "Main Vault Corridor Unauthorized Access Probe",
            "date": "2026-09-26",
            "investigator": "Aiden Ross (BIO-7719)",
            "status": "Closed / Verified",
            "matched_subject": "Lucas Sterling (SUS-5511)",
            "similarity_score": 92.1,
            "cameras_involved": ["CAM-03 (Secure Vault)"],
            "sketch_candidate_id": "CAND-4412B"
        }
    ]

@router.post("")
def generate_report(payload: ReportGenerateRequest, db: Session = Depends(get_db)):
    """
    Generates a print/download-ready forensic examination report
    incorporating case metadata, sketch candidates, similarity metrics, and audit trail.
    """
    person = None
    if payload.matched_person_id:
        person = db.query(Person).filter(Person.person_id == payload.matched_person_id).first()

    recent_events = db.query(RecognitionEvent).order_by(RecognitionEvent.id.desc()).limit(3).all()

    report_data = {
        "report_id": f"REP-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}",
        "case_id": payload.case_id,
        "generated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "investigator": payload.investigator_name,
        "investigator_badge": "FS-8821",
        "jurisdiction": "Central Forensic Biometric Laboratory",
        "evidence_summary": {
            "sketch_candidate_id": payload.candidate_id or "CAND-9821A",
            "matched_person_id": person.person_id if person else (payload.matched_person_id or "SUS-1049"),
            "matched_person_name": person.name if person else "Vikram Malhotra",
            "similarity_percentage": payload.similarity_score or 89.4,
            "confidence_band": "High Algorithmic Probability (89.4%)",
            "biometric_distance_metric": "Cosine Metric Hypersphere 512-D"
        },
        "notes": payload.notes or "Composite sketch generated from witness audio statement. Algorithmic face matching flagged suspect with high probabilistic confidence.",
        "detection_history": [
            {
                "event_id": e.event_id,
                "timestamp": f"{e.date} {e.time}",
                "camera": e.camera_id,
                "similarity": e.similarity,
                "status": e.status
            }
            for e in recent_events
        ],
        "legal_advisory": (
            "NOTICE: In accordance with forensic scientific standards (SWGDE / ASTM E3115), "
            "automated facial recognition outputs represent investigative leads and do NOT "
            "constitute conclusive identification without peer-reviewed 1-to-1 morphological comparison."
        )
    }

    # Log to audit trail
    audit = AuditLog(
        user_id=payload.investigator_name,
        action="GENERATE_REPORT",
        target_resource=payload.case_id,
        details=f"Generated forensic report for case {payload.case_id}."
    )
    db.add(audit)
    db.commit()

    return report_data
