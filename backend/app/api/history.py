"""
Recognition History & Surveillance Events API Endpoints
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..db.models import RecognitionEvent

router = APIRouter(prefix="/recognition", tags=["Recognition History Logs"])

@router.get("/history")
def get_recognition_history(
    search: Optional[str] = None,
    camera: Optional[str] = None,
    status: Optional[str] = None,
    date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Searchable and filterable recognition event history table.
    Filters: Date, Camera, Person, Recognition Status.
    """
    query = db.query(RecognitionEvent)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (RecognitionEvent.person_name.ilike(search_filter)) |
            (RecognitionEvent.person_identifier.ilike(search_filter)) |
            (RecognitionEvent.event_id.ilike(search_filter)) |
            (RecognitionEvent.notes.ilike(search_filter))
        )
    if camera and camera != "All":
        query = query.filter(RecognitionEvent.camera_id.ilike(f"%{camera}%"))
    if status and status != "All":
        query = query.filter(RecognitionEvent.status == status)
    if date:
        query = query.filter(RecognitionEvent.date == date)

    events = query.order_by(RecognitionEvent.id.desc()).all()

    return [
        {
            "id": e.id,
            "event_id": e.event_id,
            "date": e.date,
            "time": e.time,
            "camera": e.camera_id,
            "person_id": e.person_identifier,
            "person_name": e.person_name,
            "similarity": e.similarity,
            "status": e.status,
            "screenshot": e.screenshot_url or "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
            "notes": e.notes
        }
        for e in events
    ]
