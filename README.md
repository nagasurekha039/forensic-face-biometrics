# SMART FORENSIC FACE SKETCH GENERATION AND REAL-TIME BIOMETRIC IDENTIFICATION USING AI AND COMPUTER VISION

**Academic B.Tech AIML Final Year Capstone Project**

A modern full-stack forensic intelligence platform designed for law enforcement, investigative laboratories, and surveillance command centers. It bridges witness depositions (verbal and text) with generative facial synthesis, deep metric face recognition, and real-time CCTV multi-object tracking.

---

## 🏛️ Application Pages & Capabilities

1. **Forensic AI Dashboard**: Real-time biometric metrics, registered suspects count, recognition attempt volume, active surveillance cameras, Recharts confidence area chart, system health telemetry, and quick action shortcuts.
2. **AI Face Sketch Generator**: Interactive forensic face construction console with sliders and dropdowns for gender, age, face shape, skin tone, hair style/color, eyebrows, eyes, nose, lips, beard, moustache, and distinguishing marks. Supports single candidate synthesis, multi-candidate latent space grid exploration, 3D wireframe mesh reconstruction, and craniofacial age morphing (-10 to +30 years).
3. **NLP Witness Description Parser**: Natural Language Processing interface extracting structured facial attribute vectors from free-form witness testimonies before rendering the face.
4. **Voice-Guided Sketch**: Integrated microphone speech-to-text station with real-time waveform visualizer, testimony transcription, and automatic attribute-to-sketch chaining.
5. **ArcFace Biometric Face Recognition**: Multi-source probe station (Upload Image, Load Generated Sketch, or Webcam Snap). Extracts 512-dimensional normalized embeddings and computes cosine similarity against registered suspect gallery with NIST-compliant probabilistic disclaimer.
6. **Real-Time CCTV Surveillance**: Live multi-camera monitoring with WebSocket streaming, YOLOv8 face/person bounding boxes, DeepSORT persistent tracking IDs, suspect alerts, FPS counter, and real-time event logs.
7. **Suspect / Reference Database**: Complete relational database management with search, status/gender filters, new suspect registration with auto-generated 512-D embeddings, and forensic dossiers.
8. **Recognition History Logs**: Searchable and filterable audit trail by date, sensor camera, suspect identifier, and match status with CSV export.
9. **Forensic Examination Reports**: Official print/download-ready forensic case dossiers with side-by-side exhibits (sketch vs. gallery mugshot), similarity metrics, correlated detection timeline, and examiner certification.
10. **System Settings & Telemetry**: AI model selection (ArcFace, YOLOv8, DeepSORT, SketchGAN), detection and recognition threshold sliders, database backend switcher, and hardware execution provider telemetry.
11. **Security & Authentication**: Role-based access control (Lead Forensic Examiner, Surveillance Officer, Biometric Analyst, Admin) with audit logging.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 19 (TypeScript)
  - Vite
  - Tailwind CSS (Dark Forensic Navy `#070b14` Theme)
  - Lucide React Icons
  - Recharts (Biometric Confidence Area and Bar Analytics)
  - HTML5 Canvas 3D Craniofacial Landmark Mesh Viewer
- **Backend**:
  - Python 3.10+
  - FastAPI
  - Uvicorn (ASGI)
  - WebSockets (Real-Time Surveillance Stream)
  - SQLAlchemy ORM
  - Pydantic v2
  - Python-Jose (JWT Authentication)
  - Passlib (Salting & Password Security)
- **AI & Computer Vision Architecture (`ai_models/`)**:
  - Clean modular interfaces with clean TODO comments for deep learning weights:
    - `gan_sketch_generator.py`: Parametric Latent Generator (TODO: StyleGAN2-ADA / Pix2Pix)
    - `face_recognition_model.py`: 512-D ArcFace Cosine Hypersphere Metric (TODO: InsightFace ResNet-100)
    - `yolo_detector.py`: Face & Person Detection (TODO: YOLOv8n-face.pt)
    - `deepsort_tracker.py`: Kalman filter state estimation & ReID metric
    - `nlp_feature_extractor.py`: Lexical-semantic witness statement parser
    - `speech_to_text.py`: Acoustic speech transcription engine
    - `age_progression.py`: Craniofacial morphological aging (+/- 30 years)
    - `attribute_editor.py`: Latent attribute manipulation
    - `reconstruction_3d.py`: 68 dense 3D facial landmarks and wireframe topology
- **Database**:
  - SQLite default embedded for zero-setup execution on student laptops.
  - Fully modular schema ready for PostgreSQL with pgvector.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ and npm
- Python 3.10+

---

### Step 1: Start the Backend (FastAPI)

Open a terminal in the project directory:

```bash
cd backend
# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run the backend server with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend server will start at `http://localhost:8000`.
- Swagger API Docs: `http://localhost:8000/docs`
- ReDoc API Docs: `http://localhost:8000/redoc`

---

### Step 2: Start the Frontend (React + Vite)

Open a second terminal in the project directory:

```bash
cd frontend
# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

The frontend application will start at `http://localhost:5173`.

---

## 🔑 Default Investigator Login Credentials

| Username | Password | Role |
| :--- | :--- | :--- |
| `investigator` | `forensic2026` | Lead Forensic Examiner |
| `surveillance` | `surveillance2026` | Surveillance Officer |
| `analyst` | `analyst2026` | Biometric Data Analyst |

*(Quick one-click demo login buttons are also provided on the login page for seamless demonstration!)*

---

## ⚖️ Ethical & Scientific Notice (NIST FRTE / SWGDE)

This application is an academic research prototype. All facial sketches, biometric embeddings, and detection tracks generated are **probabilistic algorithmic predictions**. Under forensic scientific standards, automated matches do not constitute definitive legal proof of identity and must be peer-reviewed by a certified forensic facial examiner. All demo/mock outputs are clearly labeled as `DEMO / SIMULATED RESULT`.
