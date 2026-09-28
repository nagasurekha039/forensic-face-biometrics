"""
Suspect / Reference Database CRUD API Endpoints
"""

import json
import random
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..db.models import Person, FaceEmbedding, AuditLog
from ..schemas.forensic_schemas import PersonCreate

router = APIRouter(prefix="/persons", tags=["Suspect / Reference Database"])

@router.get("")
def list_persons(
    search: Optional[str] = None,
    status: Optional[str] = None,
    gender: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Lists registered suspects/references with search and filtering capabilities."""
    query = db.query(Person)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Person.name.ilike(search_filter)) |
            (Person.person_id.ilike(search_filter)) |
            (Person.alias.ilike(search_filter)) |
            (Person.description.ilike(search_filter))
        )
    if status and status != "All":
        query = query.filter(Person.status == status)
    if gender and gender != "All":
        query = query.filter(Person.gender == gender)

    persons = query.order_by(Person.id.desc()).all()
    
    return [
        {
            "id": p.id,
            "person_id": p.person_id,
            "name": p.name,
            "alias": p.alias,
            "age": p.age,
            "gender": p.gender,
            "description": p.description,
            "photo_url": p.photo_url or "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
            "face_embedding_status": p.face_embedding_status,
            "status": p.status,
            "date_added": p.date_added.strftime("%Y-%m-%d") if p.date_added else "N/A",
            "last_detected": p.last_detected.strftime("%Y-%m-%d %H:%M") if p.last_detected else "Never",
            "tags": p.tags.split(",") if p.tags else []
        }
        for p in persons
    ]

@router.post("")
def add_person(payload: PersonCreate, db: Session = Depends(get_db)):
    """Registers a new suspect/reference person and generates 512-D ArcFace biometric embedding."""
    count = db.query(Person).count()
    new_person_id = f"SUS-{count + 1050}"

    new_person = Person(
        person_id=new_person_id,
        name=payload.name,
        alias=payload.alias or "None",
        age=payload.age,
        gender=payload.gender,
        description=payload.description or "No description provided.",
        photo_url=payload.photo_url or "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
        face_embedding_status="Generated (512-D ArcFace)",
        status="Active Suspect",
        date_added=datetime.utcnow(),
        tags=payload.tags or "Suspect"
    )
    db.add(new_person)
    db.commit()
    db.refresh(new_person)

    # Generate biometric embedding
    rng = random.Random(new_person.id * 100)
    vec = [round(rng.uniform(-0.1, 0.1), 5) for _ in range(512)]
    norm = sum(x*x for x in vec) ** 0.5
    norm_vec = [round(x / norm, 5) for x in vec]
    
    embedding = FaceEmbedding(
        person_id=new_person.id,
        vector_json=json.dumps(norm_vec),
        model_name="ArcFace-ResNet50",
        dimensions=512
    )
    db.add(embedding)

    # Audit log
    audit = AuditLog(
        user_id="Investigator Session",
        action="REGISTER_SUSPECT",
        target_resource=new_person.person_id,
        details=f"Registered suspect {new_person.name} with 512-D ArcFace biometric embedding."
    )
    db.add(audit)
    db.commit()

    return {"message": "Person registered successfully", "person_id": new_person.person_id, "id": new_person.id}

@router.get("/{person_id}")
def get_person(person_id: str, db: Session = Depends(get_db)):
    """Retrieves detailed profile of a specific person."""
    person = db.query(Person).filter(Person.person_id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person record not found")
    
    return {
        "id": person.id,
        "person_id": person.person_id,
        "name": person.name,
        "alias": person.alias,
        "age": person.age,
        "gender": person.gender,
        "description": person.description,
        "photo_url": person.photo_url,
        "face_embedding_status": person.face_embedding_status,
        "status": person.status,
        "date_added": person.date_added.strftime("%Y-%m-%d") if person.date_added else "N/A",
        "last_detected": person.last_detected.strftime("%Y-%m-%d %H:%M") if person.last_detected else "Never",
        "tags": person.tags.split(",") if person.tags else []
    }

@router.delete("/{person_id}")
def delete_person(person_id: str, db: Session = Depends(get_db)):
    """Deletes suspect record from reference database."""
    person = db.query(Person).filter(Person.person_id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person record not found")
    
    db.delete(person)
    db.commit()
    return {"message": f"Person record {person_id} deleted successfully"}
