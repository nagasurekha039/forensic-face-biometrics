import React, { useState, useRef } from 'react';
import { 
  ScanFace, 
  Upload, 
  Camera as CameraIcon, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  ArrowRight, 
  RefreshCw,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { api, generateLocalSketchSvg } from '../services/api';
import { RecognitionResult } from '../types';
import { ForensicDisclaimer } from '../components/Common/ForensicDisclaimer';
import { StatusBadge } from '../components/Common/StatusBadge';

interface FaceRecognitionProps {
  onNavigate?: (page: string) => void;
  initialQueryImage?: string;
}

export const FaceRecognition: React.FC<FaceRecognitionProps> = ({ onNavigate, initialQueryImage }) => {
  const [queryImage, setQueryImage] = useState<string>(
    initialQueryImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  );
  const [imageSource, setImageSource] = useState<'upload' | 'sketch' | 'webcam'>('upload');
  const [threshold, setThreshold] = useState<number>(0.65);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger Biometric Identification
  const handleIdentify = async (imgToScan = queryImage) => {
    setIsScanning(true);
    try {
      const res = await api.identifyFace(imgToScan, threshold);
      setResult(res);
    } finally {
      setIsScanning(false);
    }
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        setQueryImage(dataUrl);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Webcam Capture Handler
  const handleStartWebcam = async () => {
    setImageSource('webcam');
    setIsWebcamActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Webcam stream not accessible:', err);
    }
  };

  const handleCaptureWebcam = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setQueryImage(dataUrl);
        // Stop stream
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        setIsWebcamActive(false);
        setResult(null);
      }
    }
  };

  // Select Sample Forensic Sketch
  const handleSelectSketch = () => {
    setImageSource('sketch');
    const sketchSvg = generateLocalSketchSvg({
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
    }, 42);
    setQueryImage(sketchSvg);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <ForensicDisclaimer />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-navy-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ScanFace className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100 font-sans">
              ArcFace Biometric Face Recognition & Suspect Identification
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            512-Dimensional Deep Metric Cosine Hypersphere Similarity Engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono bg-navy-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Match Threshold:</span>
            <span className="text-cyan-400 font-bold">{(threshold * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Input Selection & Probe Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Input Box (5 Cols) */}
        <div className="lg:col-span-5 bg-navy-900/70 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Query Biometric Evidence Input
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
              SOURCE: {imageSource.toUpperCase()}
            </span>
          </div>

          {/* Source Selectors */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setImageSource('upload');
                fileInputRef.current?.click();
              }}
              className={`py-2 px-2 rounded-lg text-xs font-mono flex flex-col items-center gap-1 border transition-colors ${
                imageSource === 'upload' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-navy-950 text-slate-400 border-slate-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Image</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <button
              onClick={handleSelectSketch}
              className={`py-2 px-2 rounded-lg text-xs font-mono flex flex-col items-center gap-1 border transition-colors ${
                imageSource === 'sketch' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-navy-950 text-slate-400 border-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Load Sketch</span>
            </button>

            <button
              onClick={handleStartWebcam}
              className={`py-2 px-2 rounded-lg text-xs font-mono flex flex-col items-center gap-1 border transition-colors ${
                imageSource === 'webcam' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-navy-950 text-slate-400 border-slate-800'
              }`}
            >
              <CameraIcon className="w-4 h-4" />
              <span>Webcam Snap</span>
            </button>
          </div>

          {/* Query Image Frame / Webcam */}
          <div className="relative w-full aspect-square max-w-[340px] mx-auto rounded-xl overflow-hidden border border-slate-800 bg-navy-950 flex items-center justify-center shadow-inner">
            {isWebcamActive ? (
              <div className="w-full h-full flex flex-col items-center justify-center relative">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <button
                  onClick={handleCaptureWebcam}
                  className="absolute bottom-4 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg"
                >
                  <CameraIcon className="w-4 h-4" />
                  <span>Snap Photo</span>
                </button>
              </div>
            ) : (
              <img
                src={queryImage}
                alt="Query Evidence"
                className="w-full h-full object-contain"
              />
            )}

            {/* Scanning HUD Overlay when scanning */}
            {isScanning && (
              <div className="absolute inset-0 bg-cyan-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-cyan-400 font-mono text-xs space-y-2">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <div className="tracking-widest uppercase text-[11px] font-bold">
                  Extracting 512-D ArcFace Vector...
                </div>
                <div className="w-3/4 h-1 bg-cyan-950 rounded-full overflow-hidden border border-cyan-500/30">
                  <div className="w-full h-full bg-cyan-400 animate-pulse" />
                </div>
              </div>
            )}

            {/* Corner Markers */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />
          </div>

          {/* Threshold Slider */}
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Similarity Threshold:</span>
              <span className="text-cyan-400 font-bold">{(threshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.40"
              max="0.95"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Trigger Scan Button */}
          <button
            onClick={() => handleIdentify()}
            disabled={isScanning}
            className="w-full py-3 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-glow-cyan transition-all disabled:opacity-50 font-mono"
          >
            <ScanFace className="w-4 h-4" />
            <span>{isScanning ? 'Computing Cosine Distance...' : 'Execute Biometric Identification Probe'}</span>
          </button>
        </div>

        {/* Right Column: Recognition Results & Matching Candidates (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4">
              {/* Primary Match Card */}
              <div className={`p-5 rounded-xl border shadow-lg ${
                result.top_match?.is_match 
                  ? 'bg-navy-900/90 border-cyan-500/50 shadow-glow-cyan' 
                  : 'bg-navy-900/70 border-slate-800'
              }`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-5 h-5 ${result.top_match?.is_match ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <h3 className="text-sm font-bold text-slate-100 font-mono uppercase">
                      Primary Biometric Candidate Result
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">
                      Processing: <strong className="text-cyan-400">{result.processing_time_ms} ms</strong>
                    </span>
                  </div>
                </div>

                {result.top_match ? (
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* Suspect Photo */}
                    <div className="w-28 h-28 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 flex-shrink-0 relative">
                      <img
                        src={result.top_match.photo_url}
                        alt="Matched Suspect"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-navy-950/90 text-cyan-300 px-1 rounded">
                        REF
                      </span>
                    </div>

                    {/* Suspect Info & Similarity Gauge */}
                    <div className="space-y-2 font-mono text-xs flex-1 text-center sm:text-left">
                      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                        <span className="text-base font-bold text-slate-100 font-sans">{result.top_match.name}</span>
                        <StatusBadge status={result.top_match.status} size="sm" />
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        ID: <strong className="text-cyan-400">{result.top_match.person_id}</strong> | Alias: {result.top_match.alias} | Age: {result.top_match.age}
                      </div>

                      {/* Similarity Bar */}
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">ArcFace Cosine Similarity:</span>
                          <span className="text-cyan-400 font-bold">{result.top_match.similarity_score}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-navy-950 overflow-hidden border border-slate-800">
                          <div
                            className={`h-full transition-all duration-1000 ${
                              result.top_match.similarity_score >= 80 ? 'bg-cyan-400' : 'bg-amber-400'
                            }`}
                            style={{ width: `${result.top_match.similarity_score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center font-mono text-xs text-slate-400">
                    No registered suspect in gallery matched the similarity threshold ({(threshold * 100)}%).
                  </div>
                )}
              </div>

              {/* Top Ranked Candidates Gallery */}
              <div className="bg-navy-900/70 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Top Ranked Gallery Matches (N-Best List)
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">
                    SEARCHED {result.total_searched} EMBEDDINGS
                  </span>
                </div>

                <div className="space-y-2">
                  {result.candidates.map((cand, idx) => (
                    <div
                      key={cand.person_id}
                      className="p-3 rounded-lg bg-navy-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-center font-bold text-slate-500">#{idx + 1}</span>
                        <img
                          src={cand.photo_url}
                          alt={cand.name}
                          className="w-10 h-10 rounded object-cover border border-slate-700"
                        />
                        <div>
                          <div className="font-semibold text-slate-200 font-sans">{cand.name}</div>
                          <div className="text-[10px] text-slate-500">ID: {cand.person_id}</div>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="text-cyan-400 font-bold text-sm">
                          {cand.similarity_score}%
                        </div>
                        <StatusBadge status={cand.status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ethical Warning Banner */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs font-mono flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
                <span>{result.forensic_disclaimer}</span>
              </div>
            </div>
          ) : (
            <div className="bg-navy-900/70 border border-slate-800 rounded-xl p-12 text-center text-slate-500 font-mono text-xs flex flex-col items-center justify-center space-y-3">
              <ScanFace className="w-12 h-12 text-slate-700" />
              <div>
                <p className="font-semibold text-slate-300">Biometric Recognition Probe Pending</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                  Select an image source on the left and click "Execute Biometric Identification Probe" to match against the suspect gallery.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
