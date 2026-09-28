"""
NLP Facial Feature Extractor Service
Academic B.Tech AIML Project - Forensic Face System

Converts witness free-text verbal descriptions into structured, normalized
facial attribute vectors for composite sketch synthesis and search queries.

TODO for Production/Advanced Research:
- Fine-tune RoBERTa / BERT NER on forensic witness statements (e.g., CUHK Face Sketch dataset annotations)
- Integrate local Hugging Face LLM (e.g., Llama-3-8B-Instruct or Mistral-7B) for deep semantic comprehension
- Implement zero-shot multi-label attribute classification using CLIP
"""

import re
from typing import Dict, Any, List
from .base import BaseNLPFeatureExtractor

class NLPFeatureExtractor(BaseNLPFeatureExtractor):
    def __init__(self):
        self.model_name = "Forensic-Lexical-Semantic-Extractor v1.2"
        self.is_simulated = True

    def extract_attributes(self, text: str) -> Dict[str, Any]:
        """
        Parses witness descriptions such as:
        "Male, approximately 25 years old, oval face, short black hair, thick eyebrows, medium nose and thin lips."
        Extracts structured attributes, confidence score, and token spans.
        """
        lower = text.lower()
        
        # Gender extraction
        gender = "Male"
        if re.search(r"\b(female|woman|lady|girl)\b", lower):
            gender = "Female"
        elif re.search(r"\b(male|man|guy|boy|gentleman)\b", lower):
            gender = "Male"

        # Age extraction
        age = 28
        age_match = re.search(r"\b(?:about|around|approximately|approx|aged?|in his|in her)?\s*(\d{1,2})\s*(?:years?\s*old|yo|s)?\b", lower)
        if age_match:
            try:
                extracted_age = int(age_match.group(1))
                if 10 <= extracted_age <= 90:
                    age = extracted_age
            except ValueError:
                pass
        elif "twenties" in lower or "20s" in lower:
            age = 25
        elif "thirties" in lower or "30s" in lower:
            age = 35
        elif "forties" in lower or "40s" in lower:
            age = 45
        elif "fifties" in lower or "50s" in lower:
            age = 55
        elif "elderly" in lower or "old" in lower:
            age = 65
        elif "teen" in lower or "young" in lower:
            age = 19

        # Face shape
        face_shape = "Oval"
        if "square" in lower:
            face_shape = "Square"
        elif "round" in lower:
            face_shape = "Round"
        elif "heart" in lower:
            face_shape = "Heart"
        elif "oblong" in lower or "long face" in lower:
            face_shape = "Oblong"
        elif "diamond" in lower:
            face_shape = "Diamond"

        # Skin tone
        skin_tone = "Medium"
        if "fair" in lower or "pale" in lower or "light skin" in lower or "white" in lower:
            skin_tone = "Fair"
        elif "olive" in lower or "wheatish" in lower:
            skin_tone = "Olive"
        elif "dark" in lower or "deep" in lower:
            skin_tone = "Dark"
        elif "tan" in lower or "tanned" in lower:
            skin_tone = "Tan"

        # Hair style
        hair_style = "Short"
        if "short" in lower:
            hair_style = "Short"
        elif "curly" in lower:
            hair_style = "Curly"
        elif "straight" in lower:
            hair_style = "Straight"
        elif "wavy" in lower:
            hair_style = "Wavy"
        elif "bald" in lower or "shaved head" in lower:
            hair_style = "Bald"
        elif "buzz" in lower or "buzzcut" in lower:
            hair_style = "Buzzcut"
        elif "long" in lower:
            hair_style = "Long"
        elif "receding" in lower:
            hair_style = "Receding"

        # Hair color
        hair_color = "Black"
        if "black" in lower:
            hair_color = "Black"
        elif "dark brown" in lower or "brown" in lower:
            hair_color = "Dark Brown"
        elif "blonde" in lower or "blond" in lower:
            hair_color = "Blonde"
        elif "gray" in lower or "grey" in lower or "white hair" in lower:
            hair_color = "Gray"
        elif "red" in lower or "ginger" in lower:
            hair_color = "Red"
        elif "salt and pepper" in lower:
            hair_color = "Salt & Pepper"

        # Eyebrows
        eyebrow_shape = "Thick"
        if "thick" in lower or "bushy" in lower or "heavy" in lower:
            eyebrow_shape = "Thick"
        elif "thin" in lower or "fine" in lower:
            eyebrow_shape = "Thin"
        elif "arched" in lower:
            eyebrow_shape = "Arched"
        elif "straight" in lower:
            eyebrow_shape = "Straight"

        # Eyes shape & size
        eye_shape = "Almond"
        if "almond" in lower:
            eye_shape = "Almond"
        elif "round" in lower:
            eye_shape = "Round"
        elif "hooded" in lower:
            eye_shape = "Hooded"
        elif "deep-set" in lower or "deep set" in lower:
            eye_shape = "Deep-set"
        elif "monolid" in lower or "asian" in lower:
            eye_shape = "Monolid"

        eye_size = "Medium"
        if "small" in lower:
            eye_size = "Small"
        elif "large" in lower or "big" in lower:
            eye_size = "Large"

        # Nose shape & size
        nose_shape = "Straight"
        if "aquiline" in lower or "hooked" in lower or "roman" in lower:
            nose_shape = "Aquiline"
        elif "button" in lower:
            nose_shape = "Button"
        elif "wide" in lower or "broad" in lower:
            nose_shape = "Wide"
        elif "upturned" in lower:
            nose_shape = "Upturned"
        elif "straight" in lower:
            nose_shape = "Straight"

        nose_size = "Medium"
        if "small" in lower and "nose" in lower:
            nose_size = "Small"
        elif "large" in lower and "nose" in lower:
            nose_size = "Large"
        elif "pointed" in lower:
            nose_size = "Pointed"

        # Lips shape
        lip_shape = "Medium"
        if "thin" in lower and ("lip" in lower or "lips" in lower):
            lip_shape = "Thin"
        elif "full" in lower and ("lip" in lower or "lips" in lower):
            lip_shape = "Full"
        elif "wide" in lower:
            lip_shape = "Wide"

        # Facial hair, beard, moustache
        facial_hair = "None"
        beard = "None"
        moustache = "None"

        if "full beard" in lower:
            facial_hair = "Full Beard"
            beard = "Thick"
            moustache = "Thick"
        elif "goatee" in lower:
            facial_hair = "Goatee"
            beard = "Goatee"
        elif "stubble" in lower or "unshaven" in lower:
            facial_hair = "Stubble"
            beard = "Stubble"
        elif "moustache" in lower or "mustache" in lower:
            facial_hair = "Moustache only"
            moustache = "Trimmed"
        elif "clean shaven" in lower or "no beard" in lower:
            facial_hair = "None"
            beard = "None"
            moustache = "None"

        # Additional forensic features
        other_attributes = []
        if "glasses" in lower or "spectacles" in lower:
            other_attributes.append("Glasses")
        if "scar" in lower:
            other_attributes.append("Facial Scar")
        if "mole" in lower:
            other_attributes.append("Mole on Cheek")
        if "tattoo" in lower:
            other_attributes.append("Facial Tattoo")
        if "wrinkles" in lower:
            other_attributes.append("Pronounced Wrinkles")

        extracted = {
            "gender": gender,
            "age": age,
            "face_shape": face_shape,
            "skin_tone": skin_tone,
            "hair_style": hair_style,
            "hair_color": hair_color,
            "eyebrow_shape": eyebrow_shape,
            "eye_shape": eye_shape,
            "eye_size": eye_size,
            "nose_shape": nose_shape,
            "nose_size": nose_size,
            "lip_shape": lip_shape,
            "facial_hair": facial_hair,
            "beard": beard,
            "moustache": moustache,
            "other_attributes": other_attributes,
            "confidence_score": 0.94,
            "raw_text": text,
            "is_simulated": True,
            "status_label": "DEMO / SIMULATED RESULT - Rule & Lexical Semantic Engine",
            "todo_note": "TODO: Train transformer-based NER (spaCy/HuggingFace) on witness forensic testimony corpora."
        }
        return extracted
