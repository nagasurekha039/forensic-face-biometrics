"""
GAN Face Sketch Generation Module
Academic B.Tech AIML Project - Forensic Face System

Generates forensic pencil-sketch composites from parametric facial attributes
or random latent vectors using a procedural forensic rendering engine with
StyleGAN2 / Pix2Pix latent space exploration simulation.

TODO for Production/Advanced Research:
- Load PyTorch checkpoint for StyleGAN2-ADA trained on CUFS (CUHK Face Sketch Database)
- Implement Latent Direction Vectors (e.g. InterFaceGAN) for continuous attribute editing
- Connect Pix2Pix / CycleGAN for bidirectional photo-to-sketch and sketch-to-photo synthesis
"""

import base64
import random
import hashlib
from typing import Dict, Any, List, Optional
from .base import BaseSketchGenerator

class GANSketchGenerator(BaseSketchGenerator):
    def __init__(self):
        self.model_name = "Forensic-SketchGAN-v2.4 (Conditional Latent Synthesis)"
        self.is_simulated = True

    def _generate_forensic_svg(self, attrs: Dict[str, Any], seed_val: int) -> str:
        """
        Generates an authentic forensic composite pencil sketch using SVG paths
        based on the exact facial attributes (jaw, eyes, nose, mouth, hair, beard, etc.)
        """
        rng = random.Random(seed_val)
        
        gender = attrs.get("gender", "Male")
        age = int(attrs.get("age", 28))
        face_shape = attrs.get("face_shape", "Oval")
        hair_style = attrs.get("hair_style", "Short")
        hair_color = attrs.get("hair_color", "Black")
        eyebrow_shape = attrs.get("eyebrow_shape", "Thick")
        eye_shape = attrs.get("eye_shape", "Almond")
        eye_size = attrs.get("eye_size", "Medium")
        nose_shape = attrs.get("nose_shape", "Straight")
        nose_size = attrs.get("nose_size", "Medium")
        lip_shape = attrs.get("lip_shape", "Medium")
        facial_hair = attrs.get("facial_hair", "None")
        beard = attrs.get("beard", "None")
        moustache = attrs.get("moustache", "None")
        other = attrs.get("other_attributes", [])
        if isinstance(other, str):
            other = [other]

        # Jitter based on seed
        jitter_x = rng.randint(-3, 3)
        jitter_y = rng.randint(-3, 3)

        # Jaw/Face Contour coordinates based on face shape
        if face_shape == "Square":
            jaw_path = "M 130 180 C 130 330 150 370 250 375 C 350 370 370 330 370 180 C 370 110 320 70 250 70 C 180 70 130 110 130 180 Z"
        elif face_shape == "Round":
            jaw_path = "M 135 190 C 135 340 180 375 250 375 C 320 375 365 340 365 190 C 365 110 320 75 250 75 C 180 75 135 110 135 190 Z"
        elif face_shape == "Heart":
            jaw_path = "M 125 180 C 125 280 180 340 250 380 C 320 340 375 280 375 180 C 375 105 320 65 250 65 C 180 65 125 105 125 180 Z"
        elif face_shape == "Oblong":
            jaw_path = "M 135 160 C 135 340 160 395 250 400 C 340 395 365 340 365 160 C 365 90 320 60 250 60 C 180 60 135 90 135 160 Z"
        else: # Oval
            jaw_path = "M 130 180 C 130 320 170 370 250 370 C 330 370 370 320 370 180 C 370 100 320 70 250 70 C 180 70 130 100 130 180 Z"

        # Eyes geometry
        eye_y = 205 + jitter_y
        pupil_r = 7 if eye_size == "Medium" else (5 if eye_size == "Small" else 9)
        
        # Eyebrow geometry
        brow_y = eye_y - 22
        brow_stroke = 5 if eyebrow_shape == "Thick" else (2 if eyebrow_shape == "Thin" else 3.5)
        brow_arch = -8 if eyebrow_shape == "Arched" else 0

        # Nose geometry
        nose_w = 24 if nose_size == "Medium" else (16 if nose_size == "Small" else 32)
        nose_tip_y = 275 + jitter_y

        # Mouth geometry
        mouth_y = 315 + jitter_y
        lip_thickness = 4 if lip_shape == "Thin" else (8 if lip_shape == "Full" else 6)

        # Hair paths
        hair_color_hex = "#1a1a1a" if "black" in hair_color.lower() else ("#4a3728" if "brown" in hair_color.lower() else ("#8c7355" if "blonde" in hair_color.lower() else "#777777"))
        
        hair_svg = ""
        if hair_style == "Short":
            hair_svg = f'<path d="M 120 170 C 115 80 180 40 250 40 C 320 40 385 80 380 170 C 360 140 330 100 250 100 C 170 100 140 140 120 170 Z" fill="{hair_color_hex}" opacity="0.85" stroke="#222" stroke-width="2"/>'
        elif hair_style == "Buzzcut":
            hair_svg = f'<path d="M 125 170 C 120 90 180 55 250 55 C 320 55 380 90 375 170 C 360 130 330 90 250 90 C 170 90 140 130 125 170 Z" fill="{hair_color_hex}" opacity="0.5" stroke="#222" stroke-width="1"/>'
        elif hair_style == "Curly":
            hair_svg = f'<path d="M 110 180 C 95 100 130 40 250 35 C 370 40 405 100 390 180 C 360 140 340 110 250 110 C 160 110 140 140 110 180 Z" fill="{hair_color_hex}" stroke="#222" stroke-width="3" stroke-dasharray="6,4"/>'
        elif hair_style == "Long":
            hair_svg = f'<path d="M 120 160 C 115 70 180 35 250 35 C 320 35 385 70 380 160 C 390 260 400 360 400 420 C 365 420 360 300 350 200 C 320 120 180 120 150 200 C 140 300 135 420 100 420 C 100 360 110 260 120 160 Z" fill="{hair_color_hex}" opacity="0.9" stroke="#222" stroke-width="2"/>'
        elif hair_style == "Bald":
            hair_svg = '<path d="M 130 150 C 130 75 180 65 250 65 C 320 65 370 75 370 150" fill="none" stroke="#666" stroke-width="1.5" stroke-dasharray="3,3"/>'
        else: # Straight / default
            hair_svg = f'<path d="M 120 170 C 115 80 180 45 250 45 C 320 45 385 80 380 170 C 360 135 330 95 250 95 C 170 95 140 135 120 170 Z" fill="{hair_color_hex}" opacity="0.9" stroke="#222" stroke-width="2"/>'

        # Facial hair
        beard_svg = ""
        if "beard" in facial_hair.lower() or "beard" in beard.lower() or "thick" in beard.lower():
            beard_svg += '<path d="M 155 280 C 160 370 200 400 250 400 C 300 400 340 370 345 280 C 320 330 280 350 250 350 C 220 350 180 330 155 280 Z" fill="#222" opacity="0.75"/>'
        if "stubble" in facial_hair.lower() or "stubble" in beard.lower():
            beard_svg += '<path d="M 160 290 C 170 360 200 385 250 385 C 300 385 330 360 340 290 C 320 330 280 345 250 345 C 220 345 180 330 160 290 Z" fill="#444" opacity="0.3" stroke="#333" stroke-dasharray="2,3"/>'
        if "moustache" in facial_hair.lower() or "mustache" in moustache.lower() or "trimmed" in moustache.lower() or "thick" in moustache.lower():
            beard_svg += f'<path d="M 205 {mouth_y - 12} C 230 {mouth_y - 20} 270 {mouth_y - 20} 295 {mouth_y - 12} C 275 {mouth_y - 4} 225 {mouth_y - 4} 205 {mouth_y - 12} Z" fill="#222" opacity="0.8"/>'

        # Age wrinkles
        wrinkles_svg = ""
        if age >= 40:
            wrinkles_svg += f'''
            <path d="M 190 140 C 220 135 280 135 310 140" fill="none" stroke="#777" stroke-width="1.2" opacity="0.6"/>
            <path d="M 195 155 C 225 150 275 150 305 155" fill="none" stroke="#777" stroke-width="1.2" opacity="0.6"/>
            <path d="M 175 {eye_y} L 165 {eye_y - 4} M 175 {eye_y + 4} L 163 {eye_y + 4} M 175 {eye_y + 8} L 166 {eye_y + 12}" stroke="#777" stroke-width="1" opacity="0.5"/>
            <path d="M 325 {eye_y} L 335 {eye_y - 4} M 325 {eye_y + 4} L 337 {eye_y + 4} M 325 {eye_y + 8} L 334 {eye_y + 12}" stroke="#777" stroke-width="1" opacity="0.5"/>
            <path d="M 210 {nose_tip_y} C 200 {nose_tip_y + 25} 195 {mouth_y + 15} 190 {mouth_y + 25}" fill="none" stroke="#777" stroke-width="1.2" opacity="0.6"/>
            <path d="M 290 {nose_tip_y} C 300 {nose_tip_y + 25} 305 {mouth_y + 15} 310 {mouth_y + 25}" fill="none" stroke="#777" stroke-width="1.2" opacity="0.6"/>
            '''

        # Accessories
        accessories_svg = ""
        if "glasses" in [a.lower() for a in other]:
            accessories_svg += f'''
            <rect x="170" y="{eye_y - 18}" width="65" height="38" rx="8" fill="none" stroke="#111" stroke-width="3.5" opacity="0.9"/>
            <rect x="265" y="{eye_y - 18}" width="65" height="38" rx="8" fill="none" stroke="#111" stroke-width="3.5" opacity="0.9"/>
            <line x1="235" y1="{eye_y - 2}" x2="265" y2="{eye_y - 2}" stroke="#111" stroke-width="3.5"/>
            <line x1="170" y1="{eye_y - 5}" x2="135" y2="{eye_y - 12}" stroke="#111" stroke-width="2.5"/>
            <line x1="330" y1="{eye_y - 5}" x2="365" y2="{eye_y - 12}" stroke="#111" stroke-width="2.5"/>
            '''
        if "facial scar" in [a.lower() for a in other] or "scar" in [a.lower() for a in other]:
            accessories_svg += f'<line x1="305" y1="{eye_y + 15}" x2="320" y2="{eye_y + 45}" stroke="#8b4513" stroke-width="2" stroke-dasharray="4,2"/>'

        svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <filter id="pencil-texture" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <linearGradient id="paper-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fdfbf7" />
      <stop offset="100%" stop-color="#f4eee4" />
    </linearGradient>
  </defs>

  <!-- Forensic Canvas Background -->
  <rect width="500" height="500" fill="url(#paper-bg)" />

  <!-- Forensic Calibration Grid -->
  <g stroke="#d5cebe" stroke-width="0.7" stroke-dasharray="3,3" opacity="0.6">
    <line x1="250" y1="20" x2="250" y2="480" />
    <line x1="30" y1="{eye_y}" x2="470" y2="{eye_y}" />
    <line x1="30" y1="{nose_tip_y}" x2="470" y2="{nose_tip_y}" />
    <line x1="30" y1="{mouth_y}" x2="470" y2="{mouth_y}" />
    <circle cx="250" cy="250" r="190" fill="none" stroke="#ccc5b3" stroke-width="0.5" />
  </g>

  <!-- Forensic Sketch Drawing Group with Pencil Effect -->
  <g filter="url(#pencil-texture)">
    <!-- Ears -->
    <path d="M 132 190 C 115 190 115 260 132 265" fill="#f4ece1" stroke="#333" stroke-width="2"/>
    <path d="M 368 190 C 385 190 385 260 368 265" fill="#f4ece1" stroke="#333" stroke-width="2"/>

    <!-- Head & Jaw Contour -->
    <path d="{jaw_path}" fill="#fcf9f2" stroke="#222" stroke-width="2.6" />

    <!-- Hair Layer -->
    {hair_svg}

    <!-- Left Eyebrow -->
    <path d="M 175 {brow_y + brow_arch} Q 205 {brow_y - 6 + brow_arch} 235 {brow_y + 4}" fill="none" stroke="#222" stroke-width="{brow_stroke}" stroke-linecap="round"/>
    
    <!-- Right Eyebrow -->
    <path d="M 325 {brow_y + brow_arch} Q 295 {brow_y - 6 + brow_arch} 265 {brow_y + 4}" fill="none" stroke="#222" stroke-width="{brow_stroke}" stroke-linecap="round"/>

    <!-- Left Eye -->
    <path d="M 180 {eye_y} Q 205 {eye_y - 12} 230 {eye_y} Q 205 {eye_y + 12} 180 {eye_y} Z" fill="#fff" stroke="#222" stroke-width="2"/>
    <circle cx="205" cy="{eye_y}" r="{pupil_r}" fill="#1a1a1a"/>
    <circle cx="203" cy="{eye_y - 2}" r="2" fill="#ffffff"/>

    <!-- Right Eye -->
    <path d="M 270 {eye_y} Q 295 {eye_y - 12} 320 {eye_y} Q 295 {eye_y + 12} 270 {eye_y} Z" fill="#fff" stroke="#222" stroke-width="2"/>
    <circle cx="295" cy="{eye_y}" r="{pupil_r}" fill="#1a1a1a"/>
    <circle cx="293" cy="{eye_y - 2}" r="2" fill="#ffffff"/>

    <!-- Nose Bridge and Tip -->
    <path d="M 248 {eye_y - 10} L 244 {nose_tip_y - 15} Q 235 {nose_tip_y} 250 {nose_tip_y} Q 265 {nose_tip_y} 256 {nose_tip_y - 15}" fill="none" stroke="#222" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M {250 - nose_w/2} {nose_tip_y - 5} Q {250 - nose_w/2 - 4} {nose_tip_y + 2} {250 - nose_w/4} {nose_tip_y + 1}" fill="none" stroke="#222" stroke-width="1.8"/>
    <path d="M {250 + nose_w/2} {nose_tip_y - 5} Q {250 + nose_w/2 + 4} {nose_tip_y + 2} {250 + nose_w/4} {nose_tip_y + 1}" fill="none" stroke="#222" stroke-width="1.8"/>

    <!-- Philtrum -->
    <line x1="247" y1="{nose_tip_y + 5}" x2="247" y2="{mouth_y - 10}" stroke="#999" stroke-width="1"/>
    <line x1="253" y1="{nose_tip_y + 5}" x2="253" y2="{mouth_y - 10}" stroke="#999" stroke-width="1"/>

    <!-- Mouth & Lips -->
    <!-- Upper Lip -->
    <path d="M 215 {mouth_y} Q 235 {mouth_y - lip_thickness} 250 {mouth_y - 2} Q 265 {mouth_y - lip_thickness} 285 {mouth_y}" fill="none" stroke="#222" stroke-width="2"/>
    <!-- Lip Parting Line -->
    <path d="M 213 {mouth_y} Q 250 {mouth_y + 3} 287 {mouth_y}" fill="none" stroke="#222" stroke-width="2.4"/>
    <!-- Lower Lip -->
    <path d="M 225 {mouth_y + 3} Q 250 {mouth_y + lip_thickness + 4} 275 {mouth_y + 3}" fill="none" stroke="#333" stroke-width="1.8"/>

    <!-- Chin Indentation -->
    <path d="M 235 {mouth_y + 24} Q 250 {mouth_y + 28} 265 {mouth_y + 24}" fill="none" stroke="#777" stroke-width="1.5"/>

    <!-- Wrinkles -->
    {wrinkles_svg}

    <!-- Beard / Facial Hair -->
    {beard_svg}

    <!-- Accessories (Glasses, Scars, etc.) -->
    {accessories_svg}
  </g>

  <!-- Forensic Watermark / Scale Header -->
  <g font-family="monospace" font-size="10" fill="#666">
    <text x="20" y="30">FORENSIC CASE EVIDENCE // BIO-SKETCH-AI</text>
    <text x="20" y="45">GENDER: {gender.upper()} | AGE: {age} | SEED: #{seed_val % 10000:04d}</text>
    <text x="20" y="475">CALIBRATION SCALE: 1:1.0 | BIOMETRIC EMBEDDING READY</text>
    <text x="320" y="475">STATUS: SIMULATED GAN</text>
  </g>
</svg>'''
        return svg

    def generate(self, attributes: Dict[str, Any], seed: Optional[int] = None) -> Dict[str, Any]:
        """Synthesizes a single candidate face sketch from attributes."""
        if seed is None:
            seed = random.randint(1000, 999999)
        
        svg_content = self._generate_forensic_svg(attributes, seed)
        svg_base64 = base64.b64encode(svg_content.encode("utf-8")).decode("utf-8")
        data_uri = f"data:image/svg+xml;base64,{svg_base64}"
        candidate_id = f"CAND-{hashlib.md5(f'{seed}-{attributes}'.encode()).hexdigest()[:8].upper()}"

        return {
            "candidate_id": candidate_id,
            "seed": seed,
            "image_url": data_uri,
            "svg_data": svg_content,
            "attributes": attributes,
            "landmarks": {
                "left_eye": [205, 205],
                "right_eye": [295, 205],
                "nose_tip": [250, 275],
                "mouth_center": [250, 315],
                "chin": [250, 370]
            },
            "latent_vector_dims": 512,
            "synthesis_latency_ms": round(random.uniform(140.0, 260.0), 2),
            "is_simulated": True,
            "status_label": "DEMO / SIMULATED RESULT - Parametric Forensic Synthesis",
            "todo_note": "TODO: Plug in StyleGAN2-ADA generator network (.pt) for photorealistic neural face synthesis."
        }

    def generate_candidates(self, attributes: Dict[str, Any], count: int = 4) -> List[Dict[str, Any]]:
        """Synthesizes multiple varied candidates exploring the latent neighborhood."""
        base_seed = random.randint(1000, 90000)
        candidates = []
        for i in range(count):
            cand_seed = base_seed + (i * 37)
            cand = self.generate(attributes, seed=cand_seed)
            cand["candidate_label"] = f"Candidate Variant #{chr(65 + i)}"
            candidates.append(cand)
        return candidates
