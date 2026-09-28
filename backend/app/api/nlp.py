"""
NLP Witness Description Feature Extraction API Endpoint
"""

from fastapi import APIRouter
from ..schemas.forensic_schemas import NLPExtractRequest
from ai_models.nlp_feature_extractor import NLPFeatureExtractor

router = APIRouter(prefix="/nlp", tags=["NLP Witness Statement Extraction"])

nlp_service = NLPFeatureExtractor()

@router.post("/extract-features")
def extract_features(payload: NLPExtractRequest):
    """
    Parses unstructured verbal witness statement (e.g. 'Male, approx 25 years old, oval face...')
    into structured facial attributes with confidence grading.
    """
    extracted = nlp_service.extract_attributes(payload.description)
    return extracted
