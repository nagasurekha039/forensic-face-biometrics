"""
AI Face Sketch Synthesis & Morphological Editing Endpoints
"""

import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException
from ..schemas.forensic_schemas import (
    SketchGenerateRequest, MultipleCandidatesRequest,
    AgeProgressionRequest, AttributeEditRequest
)

# AI Models imports
from ai_models.gan_sketch_generator import GANSketchGenerator
from ai_models.age_progression import AgeProgressionService
from ai_models.attribute_editor import AttributeEditor
from ai_models.reconstruction_3d import Reconstruction3DService

router = APIRouter(prefix="/sketch", tags=["AI Forensic Sketch Synthesis"])

sketch_generator = GANSketchGenerator()
age_service = AgeProgressionService()
attr_editor = AttributeEditor()
reconstruction_service = Reconstruction3DService()

@router.post("/generate")
def generate_sketch(payload: SketchGenerateRequest):
    """
    Generates a single forensic face sketch from structured facial attributes.
    Supports GAN latent exploration seed.
    """
    attrs = payload.attributes.model_dump()
    result = sketch_generator.generate(attrs, seed=payload.seed)
    return result

@router.post("/candidates")
def generate_candidates(payload: MultipleCandidatesRequest):
    """
    Generates a grid of multiple varied forensic face candidates (4 to 8)
    for witness comparative cross-examination.
    """
    attrs = payload.attributes.model_dump()
    candidates = sketch_generator.generate_candidates(attrs, count=payload.count)
    return {
        "count": len(candidates),
        "candidates": candidates,
        "is_simulated": True,
        "status_label": "DEMO / SIMULATED RESULT - Parametric Latent Multi-Candidate Grid"
    }

@router.post("/age-progression")
def age_progression(payload: AgeProgressionRequest):
    """
    Applies age progression or regression to forensic composite.
    Simulates craniofacial structural aging over +/- 10, 20, 30 years.
    """
    attrs = payload.attributes.model_dump() if payload.attributes else {}
    result = age_service.morph_age(
        image_data=payload.image_url,
        target_age=payload.target_age,
        current_age=payload.current_age,
        base_attributes=attrs
    )
    return result

@router.post("/edit-attribute")
def edit_attribute(payload: AttributeEditRequest):
    """
    Applies targeted facial attribute modifications (e.g. glasses, facial hair, hairstyle)
    while preserving facial landmark identity.
    """
    current_attrs = payload.current_attributes.model_dump() if payload.current_attributes else None
    result = attr_editor.edit_attribute(
        image_data=payload.image_url,
        modifications=payload.modifications,
        current_attributes=current_attrs
    )
    return result

@router.post("/reconstruction-3d")
def reconstruct_3d_face():
    """
    Extracts 3D facial landmarks and wireframe geometry for multi-angle forensic viewing.
    """
    result = reconstruction_service.reconstruct_3d_mesh()
    return result
