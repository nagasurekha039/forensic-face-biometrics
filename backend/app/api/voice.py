"""
Voice-Guided Speech-to-Text Endpoint
"""

from fastapi import APIRouter
from ..schemas.forensic_schemas import VoiceTranscribeRequest
from ai_models.speech_to_text import SpeechToTextService
from ai_models.nlp_feature_extractor import NLPFeatureExtractor

router = APIRouter(prefix="/voice", tags=["Voice-Guided Audio Speech-to-Text"])

stt_service = SpeechToTextService()
nlp_service = NLPFeatureExtractor()

@router.post("/transcribe")
def transcribe_voice(payload: VoiceTranscribeRequest):
    """
    Transcribes witness spoken testimony from audio input and automatically runs NLP
    attribute parsing to facilitate instant voice-guided face reconstruction.
    """
    audio_bytes = payload.audio_base64.encode() if payload.audio_base64 else b""
    transcription_result = stt_service.transcribe(audio_bytes, language=payload.language)
    
    # Automatically extract attributes from the transcribed text
    extracted_attributes = nlp_service.extract_attributes(transcription_result["transcript"])

    return {
        "transcription": transcription_result,
        "extracted_attributes": extracted_attributes,
        "is_simulated": True,
        "status_label": "DEMO / SIMULATED RESULT - Speech Transcription & NLP Extraction Pipeline"
    }
