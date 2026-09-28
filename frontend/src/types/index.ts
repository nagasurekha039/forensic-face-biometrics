export interface FacialAttributes {
  gender: string;
  age: number;
  face_shape: string;
  skin_tone: string;
  hair_style: string;
  hair_color: string;
  eyebrow_shape: string;
  eye_shape: string;
  eye_size: string;
  nose_shape: string;
  nose_size: string;
  lip_shape: string;
  facial_hair: string;
  beard: string;
  moustache: string;
  other_attributes: string[];
}

export interface SketchCandidate {
  candidate_id: string;
  seed: number;
  image_url: string;
  svg_data?: string;
  attributes: FacialAttributes;
  landmarks?: Record<string, [number, number]>;
  candidate_label?: string;
  synthesis_latency_ms?: number;
  is_simulated?: boolean;
  status_label?: string;
}

export interface Person {
  id: number;
  person_id: string;
  name: string;
  alias: string;
  age: number;
  gender: string;
  description: string;
  photo_url: string;
  face_embedding_status: string;
  status: 'Active Suspect' | 'Person of Interest' | 'Cleared' | 'Witness';
  date_added: string;
  last_detected: string;
  tags: string[];
}

export interface RecognitionCandidate {
  person_id: string;
  name: string;
  alias: string;
  age: number;
  photo_url: string;
  similarity_score: number;
  raw_cosine: number;
  is_match: boolean;
  confidence_grade: 'HIGH' | 'MODERATE' | 'LOW';
  status: string;
}

export interface RecognitionResult {
  top_match: RecognitionCandidate | null;
  candidates: RecognitionCandidate[];
  total_searched: number;
  threshold_applied: number;
  processing_time_ms: number;
  is_simulated: boolean;
  status_label: string;
  forensic_disclaimer: string;
}

export interface RecognitionEvent {
  id: number;
  event_id: string;
  date: string;
  time: string;
  camera: string;
  person_id: string;
  person_name: string;
  similarity: number;
  status: 'Verified Match' | 'Potential Match' | 'Inconclusive' | 'False Positive';
  screenshot: string;
  notes: string;
}

export interface Camera {
  camera_id: string;
  name: string;
  location: string;
  status: 'Online' | 'Offline' | 'Calibrating';
  resolution: string;
  ai_models_active: string;
  is_streaming: boolean;
}

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: string;
  badge_number: string;
}

export interface SystemSettingsData {
  recognition_model: string;
  detection_model: string;
  tracker_model: string;
  sketch_model: string;
  recognition_threshold: number;
  detection_threshold: number;
  active_database: string;
  demo_mode_enabled: boolean;
  theme: string;
}
