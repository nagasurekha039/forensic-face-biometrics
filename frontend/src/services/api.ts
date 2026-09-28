import { 
  FacialAttributes, 
  SketchCandidate, 
  Person, 
  RecognitionResult, 
  RecognitionEvent, 
  Camera, 
  SystemSettingsData 
} from '../types';

const API_BASE = 'http://localhost:8000/api';

// Helper for fetch with fallback
async function fetchWithFallback<T>(url: string, options: RequestInit, fallbackFn: () => T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API Fallback] Request to ${url} failed, using local simulated engine:`, err);
    return fallbackFn();
  }
}

// Procedural SVG Sketch Generator for instant fallback
export function generateLocalSketchSvg(attrs: FacialAttributes, seed: number = 42): string {
  const gender = attrs.gender || 'Male';
  const age = attrs.age || 28;
  const faceShape = attrs.face_shape || 'Oval';
  const hairStyle = attrs.hair_style || 'Short';
  const hairColor = attrs.hair_color || 'Black';
  const eyebrow = attrs.eyebrow_shape || 'Thick';
  const eyeSize = attrs.eye_size || 'Medium';
  const noseSize = attrs.nose_size || 'Medium';
  const lipShape = attrs.lip_shape || 'Medium';
  const beard = attrs.beard || 'None';
  const moustache = attrs.moustache || 'None';
  const other = attrs.other_attributes || [];

  const eyeY = 205;
  const pupilR = eyeSize === 'Small' ? 5 : (eyeSize === 'Large' ? 9 : 7);
  const browStroke = eyebrow === 'Thick' ? 5 : (eyebrow === 'Thin' ? 2 : 3.5);
  const noseW = noseSize === 'Small' ? 16 : (noseSize === 'Large' ? 32 : 24);
  const lipThickness = lipShape === 'Thin' ? 4 : (lipShape === 'Full' ? 8 : 6);
  const hairHex = hairColor.toLowerCase().includes('black') ? '#1a1a1a' : 
                  (hairColor.toLowerCase().includes('brown') ? '#4a3728' : 
                  (hairColor.toLowerCase().includes('blonde') ? '#8c7355' : '#777777'));

  let jawPath = "M 130 180 C 130 320 170 370 250 370 C 330 370 370 320 370 180 C 370 100 320 70 250 70 C 180 70 130 100 130 180 Z";
  if (faceShape === 'Square') jawPath = "M 130 180 C 130 330 150 370 250 375 C 350 370 370 330 370 180 C 370 110 320 70 250 70 C 180 70 130 110 130 180 Z";
  if (faceShape === 'Round') jawPath = "M 135 190 C 135 340 180 375 250 375 C 320 375 365 340 365 190 C 365 110 320 75 250 75 C 180 75 135 110 135 190 Z";
  if (faceShape === 'Heart') jawPath = "M 125 180 C 125 280 180 340 250 380 C 320 340 375 280 375 180 C 375 105 320 65 250 65 C 180 65 125 105 125 180 Z";

  let hairSvg = `<path d="M 120 170 C 115 80 180 40 250 40 C 320 40 385 80 380 170 C 360 140 330 100 250 100 C 170 100 140 140 120 170 Z" fill="${hairHex}" opacity="0.9" stroke="#222" stroke-width="2"/>`;
  if (hairStyle === 'Long') {
    hairSvg = `<path d="M 120 160 C 115 70 180 35 250 35 C 320 35 385 70 380 160 C 390 260 400 360 400 420 C 365 420 360 300 350 200 C 320 120 180 120 150 200 C 140 300 135 420 100 420 C 100 360 110 260 120 160 Z" fill="${hairHex}" opacity="0.9" stroke="#222" stroke-width="2"/>`;
  } else if (hairStyle === 'Bald') {
    hairSvg = `<path d="M 130 150 C 130 75 180 65 250 65 C 320 65 370 75 370 150" fill="none" stroke="#666" stroke-width="1.5" stroke-dasharray="3,3"/>`;
  }

  let beardSvg = '';
  if (beard.toLowerCase().includes('thick') || beard.toLowerCase().includes('full') || attrs.facial_hair.toLowerCase().includes('beard')) {
    beardSvg += '<path d="M 155 280 C 160 370 200 400 250 400 C 300 400 340 370 345 280 C 320 330 280 350 250 350 C 220 350 180 330 155 280 Z" fill="#222" opacity="0.8"/>';
  } else if (beard.toLowerCase().includes('stubble') || attrs.facial_hair.toLowerCase().includes('stubble')) {
    beardSvg += '<path d="M 160 290 C 170 360 200 385 250 385 C 300 385 330 360 340 290 C 320 330 280 345 250 345 C 220 345 180 330 160 290 Z" fill="#444" opacity="0.3" stroke="#333" stroke-dasharray="2,3"/>';
  }
  if (moustache.toLowerCase().includes('trimmed') || moustache.toLowerCase().includes('thick') || attrs.facial_hair.toLowerCase().includes('moustache')) {
    beardSvg += '<path d="M 205 303 C 230 295 270 295 295 303 C 275 311 225 311 205 303 Z" fill="#222" opacity="0.8"/>';
  }

  let glassesSvg = '';
  if (other.some(o => o.toLowerCase().includes('glasses'))) {
    glassesSvg = `
      <rect x="170" y="187" width="65" height="38" rx="8" fill="none" stroke="#111" stroke-width="3.5" opacity="0.9"/>
      <rect x="265" y="187" width="65" height="38" rx="8" fill="none" stroke="#111" stroke-width="3.5" opacity="0.9"/>
      <line x1="235" y1="203" x2="265" y2="203" stroke="#111" stroke-width="3.5"/>
      <line x1="170" y1="200" x2="135" y2="193" stroke="#111" stroke-width="2.5"/>
      <line x1="330" y1="200" x2="365" y2="193" stroke="#111" stroke-width="2.5"/>
    `;
  }

  let wrinklesSvg = '';
  if (age >= 40) {
    wrinklesSvg = `
      <path d="M 190 140 C 220 135 280 135 310 140" fill="none" stroke="#777" stroke-width="1.2" opacity="0.6"/>
      <path d="M 195 155 C 225 150 275 150 305 155" fill="none" stroke="#777" stroke-width="1.2" opacity="0.6"/>
      <path d="M 210 275 C 200 300 195 330 190 340" fill="none" stroke="#777" stroke-width="1.2" opacity="0.6"/>
      <path d="M 290 275 C 300 300 305 330 310 340" fill="none" stroke="#777" stroke-width="1.2" opacity="0.6"/>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
    <rect width="500" height="500" fill="#f8f4ec" />
    <g stroke="#d5cebe" stroke-width="0.7" stroke-dasharray="3,3" opacity="0.6">
      <line x1="250" y1="20" x2="250" y2="480" />
      <line x1="30" y1="205" x2="470" y2="205" />
      <line x1="30" y1="275" x2="470" y2="275" />
      <line x1="30" y1="315" x2="470" y2="315" />
      <circle cx="250" cy="250" r="190" fill="none" stroke="#ccc5b3" stroke-width="0.5" />
    </g>
    <g>
      <path d="M 132 190 C 115 190 115 260 132 265" fill="#f4ece1" stroke="#333" stroke-width="2"/>
      <path d="M 368 190 C 385 190 385 260 368 265" fill="#f4ece1" stroke="#333" stroke-width="2"/>
      <path d="${jawPath}" fill="#fcf9f2" stroke="#222" stroke-width="2.6" />
      ${hairSvg}
      <path d="M 175 183 Q 205 177 235 187" fill="none" stroke="#222" stroke-width="${browStroke}" stroke-linecap="round"/>
      <path d="M 325 183 Q 295 177 265 187" fill="none" stroke="#222" stroke-width="${browStroke}" stroke-linecap="round"/>
      <path d="M 180 ${eyeY} Q 205 ${eyeY - 12} 230 ${eyeY} Q 205 ${eyeY + 12} 180 ${eyeY} Z" fill="#fff" stroke="#222" stroke-width="2"/>
      <circle cx="205" cy="${eyeY}" r="${pupilR}" fill="#1a1a1a"/>
      <circle cx="203" cy="${eyeY - 2}" r="2" fill="#ffffff"/>
      <path d="M 270 ${eyeY} Q 295 ${eyeY - 12} 320 ${eyeY} Q 295 ${eyeY + 12} 270 ${eyeY} Z" fill="#fff" stroke="#222" stroke-width="2"/>
      <circle cx="295" cy="${eyeY}" r="${pupilR}" fill="#1a1a1a"/>
      <circle cx="293" cy="${eyeY - 2}" r="2" fill="#ffffff"/>
      <path d="M 248 195 L 244 260 Q 235 275 250 275 Q 265 275 256 260" fill="none" stroke="#222" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M ${250 - noseW/2} 270 Q ${250 - noseW/2 - 4} 277 ${250 - noseW/4} 276" fill="none" stroke="#222" stroke-width="1.8"/>
      <path d="M ${250 + noseW/2} 270 Q ${250 + noseW/2 + 4} 277 ${250 + noseW/4} 276" fill="none" stroke="#222" stroke-width="1.8"/>
      <path d="M 215 315 Q 235 ${315 - lipThickness} 250 313 Q 265 ${315 - lipThickness} 285 315" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M 213 315 Q 250 318 287 315" fill="none" stroke="#222" stroke-width="2.4"/>
      <path d="M 225 318 Q 250 ${318 + lipThickness + 4} 275 318" fill="none" stroke="#333" stroke-width="1.8"/>
      ${wrinklesSvg}
      ${beardSvg}
      ${glassesSvg}
    </g>
    <g font-family="monospace" font-size="10" fill="#666">
      <text x="20" y="30">FORENSIC CASE EVIDENCE // BIO-SKETCH-AI</text>
      <text x="20" y="45">GENDER: ${gender.toUpperCase()} | AGE: ${age} | SEED: #${(seed % 10000).toString().padStart(4, '0')}</text>
      <text x="20" y="475">CALIBRATION SCALE: 1:1.0 | BIOMETRIC EMBEDDING READY</text>
      <text x="320" y="475">STATUS: SIMULATED GAN</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const api = {
  // 1. Sketch Generation
  async generateSketch(attributes: FacialAttributes, seed?: number): Promise<SketchCandidate> {
    return fetchWithFallback(
      '/sketch/generate',
      { method: 'POST', body: JSON.stringify({ attributes, seed }) },
      () => {
        const s = seed || Math.floor(Math.random() * 90000) + 1000;
        return {
          candidate_id: `CAND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          seed: s,
          image_url: generateLocalSketchSvg(attributes, s),
          attributes,
          candidate_label: 'Primary Latent Candidate',
          synthesis_latency_ms: 184.2,
          is_simulated: true,
          status_label: 'DEMO / SIMULATED RESULT - Parametric Forensic Synthesis',
        };
      }
    );
  },

  async generateCandidates(attributes: FacialAttributes, count: number = 4): Promise<{ candidates: SketchCandidate[] }> {
    return fetchWithFallback(
      '/sketch/candidates',
      { method: 'POST', body: JSON.stringify({ attributes, count }) },
      () => {
        const baseSeed = Math.floor(Math.random() * 50000) + 1000;
        const list: SketchCandidate[] = [];
        for (let i = 0; i < count; i++) {
          const s = baseSeed + (i * 41);
          list.push({
            candidate_id: `CAND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            seed: s,
            image_url: generateLocalSketchSvg(attributes, s),
            attributes,
            candidate_label: `Candidate Variant #${String.fromCharCode(65 + i)}`,
            synthesis_latency_ms: 190.5 + (i * 12),
            is_simulated: true,
            status_label: 'DEMO / SIMULATED RESULT - Latent Variance Exploration',
          });
        }
        return { candidates: list };
      }
    );
  },

  // 2. NLP Feature Extraction
  async extractNLPFeatures(description: string) {
    return fetchWithFallback(
      '/nlp/extract-features',
      { method: 'POST', body: JSON.stringify({ description }) },
      () => {
        const lower = description.toLowerCase();
        return {
          gender: lower.includes('female') || lower.includes('woman') ? 'Female' : 'Male',
          age: (lower.match(/\b(\d{2})\b/) ? parseInt(lower.match(/\b(\d{2})\b/)![1]) : 28),
          face_shape: lower.includes('square') ? 'Square' : (lower.includes('round') ? 'Round' : 'Oval'),
          skin_tone: lower.includes('fair') ? 'Fair' : (lower.includes('dark') ? 'Dark' : 'Medium'),
          hair_style: lower.includes('long') ? 'Long' : (lower.includes('curly') ? 'Curly' : (lower.includes('bald') ? 'Bald' : 'Short')),
          hair_color: lower.includes('brown') ? 'Dark Brown' : (lower.includes('blonde') ? 'Blonde' : 'Black'),
          eyebrow_shape: lower.includes('thin') ? 'Thin' : 'Thick',
          eye_shape: lower.includes('round') ? 'Round' : 'Almond',
          eye_size: lower.includes('small') ? 'Small' : (lower.includes('large') ? 'Large' : 'Medium'),
          nose_shape: lower.includes('hooked') || lower.includes('aquiline') ? 'Aquiline' : 'Straight',
          nose_size: lower.includes('small') ? 'Small' : 'Medium',
          lip_shape: lower.includes('thin') ? 'Thin' : (lower.includes('full') ? 'Full' : 'Medium'),
          facial_hair: lower.includes('beard') ? 'Full Beard' : (lower.includes('stubble') ? 'Stubble' : (lower.includes('moustache') ? 'Moustache only' : 'None')),
          beard: lower.includes('beard') ? 'Thick' : (lower.includes('stubble') ? 'Stubble' : 'None'),
          moustache: lower.includes('moustache') || lower.includes('mustache') ? 'Trimmed' : 'None',
          other_attributes: [
            ...(lower.includes('glasses') ? ['Glasses'] : []),
            ...(lower.includes('scar') ? ['Facial Scar'] : []),
          ],
          confidence_score: 0.94,
          is_simulated: true,
          status_label: 'DEMO / SIMULATED RESULT - Rule & Lexical Semantic Engine',
        };
      }
    );
  },

  // 3. Voice Transcription
  async transcribeVoice(audioBase64?: string, language: string = 'en') {
    return fetchWithFallback(
      '/voice/transcribe',
      { method: 'POST', body: JSON.stringify({ audio_base64: audioBase64, language }) },
      () => {
        const text = "Male, approximately 28 years old, oval face, short black hair, thick eyebrows, almond eyes, straight nose, light stubble and rectangular glasses.";
        return {
          transcription: {
            transcript: text,
            confidence: 0.96,
            duration_seconds: 4.8,
            detected_language: 'en',
            word_count: text.split(' ').length,
          },
          extracted_attributes: {
            gender: 'Male',
            age: 28,
            face_shape: 'Oval',
            skin_tone: 'Medium',
            hair_style: 'Short',
            hair_color: 'Black',
            eyebrow_shape: 'Thick',
            eye_shape: 'Almond',
            eye_size: 'Medium',
            nose_shape: 'Straight',
            nose_size: 'Medium',
            lip_shape: 'Medium',
            facial_hair: 'Stubble',
            beard: 'Stubble',
            moustache: 'None',
            other_attributes: ['Glasses'],
          },
          is_simulated: true,
          status_label: 'DEMO / SIMULATED RESULT - Speech Transcription & NLP Extraction Pipeline',
        };
      }
    );
  },

  // 4. Biometric Face Recognition
  async identifyFace(imageUrl: string, threshold: number = 0.65): Promise<RecognitionResult> {
    return fetchWithFallback(
      '/recognition/identify',
      { method: 'POST', body: JSON.stringify({ image_url: imageUrl, threshold }) },
      () => {
        return {
          top_match: {
            person_id: 'SUS-1049',
            name: "Vikram 'Ghost' Malhotra",
            alias: 'The Architect',
            age: 34,
            photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
            similarity_score: 89.4,
            raw_cosine: 0.894,
            is_match: true,
            confidence_grade: 'HIGH',
            status: 'Potential Match',
          },
          candidates: [
            {
              person_id: 'SUS-1049',
              name: "Vikram 'Ghost' Malhotra",
              alias: 'The Architect',
              age: 34,
              photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
              similarity_score: 89.4,
              raw_cosine: 0.894,
              is_match: true,
              confidence_grade: 'HIGH',
              status: 'Potential Match',
            },
            {
              person_id: 'SUS-5511',
              name: 'Lucas Sterling',
              alias: 'Silver',
              age: 48,
              photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
              similarity_score: 58.2,
              raw_cosine: 0.582,
              is_match: false,
              confidence_grade: 'LOW',
              status: 'Non-Match',
            },
            {
              person_id: 'SUS-2081',
              name: 'Dmitri Rostova',
              alias: 'Cipher',
              age: 41,
              photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
              similarity_score: 47.9,
              raw_cosine: 0.479,
              is_match: false,
              confidence_grade: 'LOW',
              status: 'Non-Match',
            }
          ],
          total_searched: 5,
          threshold_applied: threshold * 100,
          processing_time_ms: 124.6,
          is_simulated: true,
          status_label: 'DEMO / SIMULATED RESULT - ArcFace Cosine Metric Engine',
          forensic_disclaimer: 'DISCLAIMER: Biometric identification outputs are probabilistic algorithmic predictions and DO NOT constitute definitive forensic proof of identity. Secondary human examination required under NIST FRTE guidelines.',
        };
      }
    );
  },

  // 5. Suspects Database
  async getPersons(params?: { search?: string; status?: string; gender?: string }): Promise<Person[]> {
    const query = new URLSearchParams(params as any).toString();
    return fetchWithFallback(
      `/persons?${query}`,
      { method: 'GET' },
      () => [
        {
          id: 1,
          person_id: 'SUS-1049',
          name: "Vikram 'Ghost' Malhotra",
          alias: 'The Architect',
          age: 34,
          gender: 'Male',
          description: 'Oval jawline, short trimmed black hair, thick eyebrows, sharp nose, light stubble. Financial fraud suspect.',
          photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          face_embedding_status: 'Generated (512-D ArcFace)',
          status: 'Active Suspect',
          date_added: '2026-08-15',
          last_detected: '2026-09-27 14:32',
          tags: ['High Priority', 'Cyber Crime'],
        },
        {
          id: 2,
          person_id: 'SUS-2081',
          name: 'Dmitri Rostova',
          alias: 'Cipher',
          age: 41,
          gender: 'Male',
          description: 'Square jaw, dark brown slicked hair, deep-set eyes, thin lips, pronounced scar on right cheek.',
          photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
          face_embedding_status: 'Generated (512-D ArcFace)',
          status: 'Active Suspect',
          date_added: '2026-07-28',
          last_detected: '2026-09-25 19:10',
          tags: ['Interpol Red Notice', 'Forgery'],
        },
        {
          id: 3,
          person_id: 'SUS-3190',
          name: 'Sophia Chen',
          alias: 'Kitsune',
          age: 27,
          gender: 'Female',
          description: 'Heart-shaped face, straight black hair, almond eyes, arched thin eyebrows, small button nose.',
          photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          face_embedding_status: 'Generated (512-D ArcFace)',
          status: 'Person of Interest',
          date_added: '2026-09-15',
          last_detected: '2026-09-27 11:45',
          tags: ['Surveillance Watchlist'],
        },
        {
          id: 4,
          person_id: 'SUS-4402',
          name: 'Amara Okafor',
          alias: 'Shadow',
          age: 31,
          gender: 'Female',
          description: 'Oval face, curly braided hair, dark skin tone, expressive round eyes, full lips.',
          photo_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
          face_embedding_status: 'Generated (512-D ArcFace)',
          status: 'Person of Interest',
          date_added: '2026-06-30',
          last_detected: '2026-09-22 08:14',
          tags: ['Counter-Terrorism Watch'],
        },
        {
          id: 5,
          person_id: 'SUS-5511',
          name: 'Lucas Sterling',
          alias: 'Silver',
          age: 48,
          gender: 'Male',
          description: 'Oblong face, receding salt-and-pepper hair, thick eyebrows, rectangular glasses, full graying beard.',
          photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
          face_embedding_status: 'Generated (512-D ArcFace)',
          status: 'Active Suspect',
          date_added: '2026-05-19',
          last_detected: '2026-09-27 13:10',
          tags: ['Armed & Dangerous', 'Extortion'],
        }
      ]
    );
  },

  async addPerson(data: Partial<Person>): Promise<{ message: string; person_id: string }> {
    return fetchWithFallback(
      '/persons',
      { method: 'POST', body: JSON.stringify(data) },
      () => ({ message: 'Person registered in local demo gallery', person_id: `SUS-${Math.floor(Math.random() * 8000) + 1000}` })
    );
  },

  async deletePerson(personId: string): Promise<{ message: string }> {
    return fetchWithFallback(
      `/persons/${personId}`,
      { method: 'DELETE' },
      () => ({ message: `Person ${personId} deleted` })
    );
  },

  // 6. Recognition History
  async getRecognitionHistory(params?: any): Promise<RecognitionEvent[]> {
    const query = new URLSearchParams(params || {}).toString();
    return fetchWithFallback(
      `/recognition/history?${query}`,
      { method: 'GET' },
      () => [
        {
          id: 1,
          event_id: 'EVT-9921',
          date: '2026-09-27',
          time: '14:32:05',
          camera: 'CAM-01 (North Gate)',
          person_id: 'SUS-1049',
          person_name: "Vikram 'Ghost' Malhotra",
          similarity: 89.4,
          status: 'Potential Match',
          screenshot: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          notes: 'Facial match flagged during vehicle checkpoint transit. DeepSORT track ID #42.',
        },
        {
          id: 2,
          event_id: 'EVT-9920',
          date: '2026-09-27',
          time: '13:10:44',
          camera: 'CAM-02 (Central Concourse)',
          person_id: 'SUS-5511',
          person_name: 'Lucas Sterling',
          similarity: 92.1,
          status: 'Verified Match',
          screenshot: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
          notes: 'Automated facial landmark alignment matched gallery reference with 92.1% cosine confidence.',
        },
        {
          id: 3,
          event_id: 'EVT-9919',
          date: '2026-09-27',
          time: '11:45:19',
          camera: 'CAM-01 (North Gate)',
          person_id: 'SUS-3190',
          person_name: 'Sophia Chen',
          similarity: 76.8,
          status: 'Potential Match',
          screenshot: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          notes: 'Angle at 28 degrees yaw. Candidate alerted to surveillance control.',
        },
        {
          id: 4,
          event_id: 'EVT-9918',
          date: '2026-09-26',
          time: '22:15:02',
          camera: 'CAM-03 (Secure Vault)',
          person_id: 'SUS-2081',
          person_name: 'Dmitri Rostova',
          similarity: 64.2,
          status: 'Inconclusive',
          screenshot: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
          notes: 'Low lighting IR illumination. Score below primary match threshold (65%).',
        },
        {
          id: 5,
          event_id: 'EVT-9917',
          date: '2026-09-26',
          time: '19:04:33',
          camera: 'CAM-02 (Central Concourse)',
          person_id: 'SUS-1049',
          person_name: "Vikram 'Ghost' Malhotra",
          similarity: 87.5,
          status: 'Potential Match',
          screenshot: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          notes: 'Correlated with automated sketch generated from witness #14 report.',
        }
      ]
    );
  },

  // 7. CCTV Cameras
  async getCameras(): Promise<Camera[]> {
    return fetchWithFallback(
      '/cctv/cameras',
      { method: 'GET' },
      () => [
        {
          camera_id: 'CAM-01',
          name: 'North Gate Terminal Entry',
          location: 'Sector 4 - Perimeter North Gate',
          status: 'Online',
          resolution: '1080p @ 30 FPS',
          ai_models_active: 'YOLOv8 + DeepSORT + ArcFace',
          is_streaming: true,
        },
        {
          camera_id: 'CAM-02',
          name: 'Central Transit Concourse',
          location: 'Main Passenger Hub - Concourse B',
          status: 'Online',
          resolution: '4K @ 24 FPS',
          ai_models_active: 'YOLOv8 + DeepSORT + ArcFace',
          is_streaming: false,
        },
        {
          camera_id: 'CAM-03',
          name: 'Secure Vault Corridor',
          location: 'Level -2 High Security Wing',
          status: 'Online',
          resolution: '1080p @ 60 FPS',
          ai_models_active: 'YOLOv8 + ArcFace (Zero-Loss Mode)',
          is_streaming: false,
        },
        {
          camera_id: 'CAM-04',
          name: 'South Parking Checkpoint',
          location: 'Exterior Vehicle Gate 3',
          status: 'Offline',
          resolution: '720p @ 15 FPS',
          ai_models_active: 'YOLOv8 Detection Only',
          is_streaming: false,
        }
      ]
    );
  },

  // 8. Reports
  async getReports(): Promise<any[]> {
    return fetchWithFallback(
      '/reports',
      { method: 'GET' },
      () => [
        {
          case_id: 'CASE-2026-092',
          title: 'North Gate Perimeter Intrusion - Suspect Ghost Investigation',
          date: '2026-09-27',
          investigator: 'Dr. Elena Vance, Ph.D. (FS-8821)',
          status: 'Under Forensic Review',
          matched_subject: "Vikram 'Ghost' Malhotra (SUS-1049)",
          similarity_score: 89.4,
          cameras_involved: ['CAM-01 (North Gate)', 'CAM-02 (Central Concourse)'],
          sketch_candidate_id: 'CAND-9821A',
        }
      ]
    );
  },

  async generateReport(data: any): Promise<any> {
    return fetchWithFallback(
      '/reports',
      { method: 'POST', body: JSON.stringify(data) },
      () => ({
        report_id: `REP-${Date.now()}`,
        case_id: data.case_id || 'CASE-2026-092',
        generated_at: new Date().toISOString(),
        investigator: data.investigator_name || 'Dr. Elena Vance, Ph.D.',
        investigator_badge: 'FS-8821',
        jurisdiction: 'Central Forensic Biometric Laboratory',
        evidence_summary: {
          sketch_candidate_id: data.candidate_id || 'CAND-9821A',
          matched_person_id: data.matched_person_id || 'SUS-1049',
          matched_person_name: "Vikram 'Ghost' Malhotra",
          similarity_percentage: data.similarity_score || 89.4,
          confidence_band: 'High Algorithmic Probability (89.4%)',
          biometric_distance_metric: 'Cosine Metric Hypersphere 512-D',
        },
        notes: data.notes || 'Composite sketch generated from witness audio statement. Algorithmic face matching flagged suspect with high probabilistic confidence.',
        detection_history: [
          {
            event_id: 'EVT-9921',
            timestamp: '2026-09-27 14:32:05',
            camera: 'CAM-01 (North Gate)',
            similarity: 89.4,
            status: 'Potential Match',
          }
        ],
        legal_advisory: 'NOTICE: In accordance with forensic scientific standards (SWGDE / ASTM E3115), automated facial recognition outputs represent investigative leads and do NOT constitute conclusive identification without peer-reviewed 1-to-1 morphological comparison.',
      })
    );
  },

  // 9. System Settings
  async getSettings(): Promise<{ settings: SystemSettingsData; system_info: any }> {
    return fetchWithFallback(
      '/settings',
      { method: 'GET' },
      () => ({
        settings: {
          recognition_model: 'ArcFace-ResNet50',
          detection_model: 'YOLOv8n-Face',
          tracker_model: 'DeepSORT-Kalman',
          sketch_model: 'Forensic-SketchGAN-v2.4',
          recognition_threshold: 0.65,
          detection_threshold: 0.50,
          active_database: 'SQLite (Local Embedded)',
          demo_mode_enabled: true,
          theme: 'Dark Forensic Navy',
        },
        system_info: {
          os: 'Windows 11 / x86_64',
          python_version: '3.10.0',
          processor: 'Modular AIML Pipeline',
          execution_provider: 'DirectML / CPU Modular Execution Provider',
          biometric_db_records: 5,
          api_version: 'v2.0.0-PROTOTYPE',
          compliance: 'NIST FRTE / SWGDE Forensic Standards',
        }
      })
    );
  },

  async updateSettings(settings: SystemSettingsData) {
    return fetchWithFallback(
      '/settings',
      { method: 'POST', body: JSON.stringify(settings) },
      () => ({ message: 'Settings updated successfully', updated_settings: settings })
    );
  },

  // 10. Age Progression & 3D Reconstruction
  async morphAge(currentAge: number, targetAge: number, attributes?: FacialAttributes) {
    return fetchWithFallback(
      '/sketch/age-progression',
      { method: 'POST', body: JSON.stringify({ current_age: currentAge, target_age: targetAge, attributes }) },
      () => {
        const agedAttrs = attributes ? { ...attributes, age: targetAge } : {
          gender: 'Male',
          age: targetAge,
          face_shape: 'Oval',
          skin_tone: 'Medium',
          hair_style: 'Short',
          hair_color: targetAge >= 55 ? 'Gray' : 'Black',
          eyebrow_shape: 'Thick',
          eye_shape: 'Almond',
          eye_size: 'Medium',
          nose_shape: 'Straight',
          nose_size: 'Medium',
          lip_shape: 'Medium',
          facial_hair: 'None',
          beard: 'None',
          moustache: 'None',
          other_attributes: [],
        };
        const delta = targetAge - currentAge;
        return {
          original_age: currentAge,
          target_age: targetAge,
          age_delta: delta,
          type: delta >= 0 ? 'Progression' : 'Regression',
          morphed_image_url: generateLocalSketchSvg(agedAttrs, 4200 + delta),
          morphed_attributes: agedAttrs,
          aging_indicators: [
            `${targetAge > 40 ? 'Accentuated' : 'Smooth'} nasolabial folds`,
            `${targetAge > 45 ? 'Forehead transverse lines' : 'Minimal tension'}`,
            `Periorbital rhytids (crow's feet): ${targetAge > 50 ? 'Moderate' : 'None'}`,
            `Hair pigmentation shift: ${agedAttrs.hair_color}`,
          ],
          is_simulated: true,
          status_label: 'DEMO / SIMULATED RESULT - Age Morphing Engine',
        };
      }
    );
  },

  async reconstruct3D() {
    return fetchWithFallback(
      '/sketch/reconstruction-3d',
      { method: 'POST' },
      () => ({
        landmarks_count: 68,
        points: [],
        estimated_pose: { yaw_degrees: 2.4, pitch_degrees: -1.2, roll_degrees: 0.8 },
        depth_range_mm: [-45.0, 28.0],
        interpupillary_distance_mm: 63.5,
        is_simulated: true,
        status_label: 'DEMO / SIMULATED RESULT - 3D Dense Landmark Estimator',
      })
    );
  }
};
