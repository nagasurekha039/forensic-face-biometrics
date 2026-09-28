# REST & WebSocket API Documentation

FastAPI Interactive Swagger UI is hosted at `http://localhost:8000/docs`.  
FastAPI ReDoc Interactive Documentation is hosted at `http://localhost:8000/redoc`.

---

## 1. Authentication Endpoints

### `POST /api/auth/login`
- **Description**: Authenticate investigator credentials and issue JWT access token.
- **Request Body**:
  ```json
  {
    "username": "investigator",
    "password": "forensic2026"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "username": "investigator",
      "full_name": "Dr. Elena Vance, Ph.D.",
      "role": "Lead Forensic Examiner",
      "badge_number": "FSL-9082"
    }
  }
  ```

---

## 2. Face Sketch & Generative Synthesis Endpoints

### `POST /api/sketch/generate`
- **Description**: Synthesizes a single high-resolution forensic composite face sketch from structured attributes.
- **Request Body**:
  ```json
  {
    "attributes": {
      "gender": "Male",
      "age": 28,
      "face_shape": "Oval",
      "skin_tone": "Medium",
      "hair_style": "Short",
      "hair_color": "Black",
      "eyebrow_shape": "Thick",
      "eye_shape": "Almond",
      "eye_size": "Medium",
      "nose_shape": "Straight",
      "nose_size": "Medium",
      "lip_shape": "Medium",
      "facial_hair": "Stubble",
      "beard": "Stubble",
      "moustache": "None",
      "other_attributes": ["Glasses"]
    },
    "seed": 42
  }
  ```

### `POST /api/sketch/candidates`
- **Description**: Generates 4 to 8 diverse candidate variants across latent space.

### `POST /api/sketch/age-progression`
- **Description**: Morphs facial landmarks across +/- 30 years age trajectory.

### `POST /api/sketch/reconstruction-3d`
- **Description**: Reconstructs 68 dense 3D landmarks and wireframe mesh topology.

---

## 3. NLP & Voice Processing Endpoints

### `POST /api/nlp/extract-features`
- **Description**: Parses witness free-text statement into structured schema.
- **Request Body**:
  ```json
  {
    "description": "Male, approximately 25 years old, oval face, short black hair, thick eyebrows, medium nose and thin lips."
  }
  ```

### `POST /api/voice/transcribe`
- **Description**: Transcribes recorded witness speech audio to text and automatically extracts facial attributes.

---

## 4. Biometric Face Recognition Endpoints

### `POST /api/recognition/identify`
- **Description**: Queries a face image or synthesized sketch against suspect embeddings.
- **Request Body**:
  ```json
  {
    "image_url": "data:image/svg+xml;base64,...",
    "threshold": 0.65
  }
  ```
- **Response**:
  ```json
  {
    "top_match": {
      "person_id": "SUS-1049",
      "name": "Vikram 'Ghost' Malhotra",
      "similarity_score": 89.4,
      "is_match": true,
      "confidence_grade": "HIGH",
      "status": "Potential Match"
    },
    "candidates": [...],
    "processing_time_ms": 124.6,
    "forensic_disclaimer": "DISCLAIMER: Biometric identification outputs are probabilistic algorithmic indicators..."
  }
  ```

---

## 5. Suspect Database Endpoints

- `GET /api/persons`: Lists registered suspects with search (`search`), status (`status`), and gender (`gender`) filters.
- `POST /api/persons`: Registers a new suspect and computes their 512-D ArcFace vector.
- `GET /api/persons/{id}`: Retrieves comprehensive suspect biometric dossier.
- `DELETE /api/persons/{id}`: Removes suspect record.

---

## 6. Surveillance & WebSocket Protocol

### `GET /api/cctv/cameras`
- Lists registered surveillance camera feeds and health telemetry.

### `WebSocket /api/cctv/ws`
- **Description**: Real-time bidirectional streaming of YOLO bounding boxes, DeepSORT tracking IDs, and face match predictions.
- **Payload Schema**:
  ```json
  {
    "frame": 124,
    "timestamp": "2026-09-27 14:32:05",
    "camera_id": "CAM-01",
    "fps": 29.8,
    "tracked_objects": [
      {
        "track_id": 42,
        "class_name": "face",
        "bbox_percent": [32.4, 24.1, 20.0, 30.0],
        "detection_conf": 0.94,
        "identity": "SUS-1049",
        "name": "Vikram 'Ghost' Malhotra",
        "similarity": 89.4,
        "status": "Potential Match",
        "alert": true
      }
    ],
    "is_demo_mode": true
  }
  ```

---

## 7. Reports & History Endpoints

- `GET /api/recognition/history`: Searchable history table with multi-parameter filtering.
- `POST /api/reports`: Compiles formal forensic examination report ready for PDF printing.
