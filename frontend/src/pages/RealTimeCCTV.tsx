import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Play, 
  Square, 
  Camera as CameraIcon, 
  Upload, 
  Radio, 
  AlertTriangle, 
  ShieldAlert, 
  Maximize2, 
  Layers, 
  Activity, 
  RefreshCw,
  Clock,
  ScanFace
} from 'lucide-react';
import { api } from '../services/api';
import { Camera } from '../types';
import { ForensicDisclaimer } from '../components/Common/ForensicDisclaimer';
import { StatusBadge } from '../components/Common/StatusBadge';

interface RealTimeCCTVProps {
  onNavigate?: (page: string) => void;
}

interface TrackedObject {
  track_id: number;
  class_name: string;
  bbox_percent: [number, number, number, number]; // [x%, y%, w%, h%]
  detection_conf: number;
  identity: string;
  name: string;
  similarity: number;
  status: string;
  color: string;
  alert: boolean;
}

export const RealTimeCCTV: React.FC<RealTimeCCTVProps> = ({ onNavigate }) => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('CAM-01');
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(29.8);
  const [trackedObjects, setTrackedObjects] = useState<TrackedObject[]>([]);
  const [eventLogs, setEventLogs] = useState<any[]>([]);
  const [isWebcamInput, setIsWebcamInput] = useState<boolean>(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Load cameras
  useEffect(() => {
    const load = async () => {
      const list = await api.getCameras();
      setCameras(list);
    };
    load();
  }, []);

  // WebSocket Connection or Dynamic Simulation Fallback
  useEffect(() => {
    if (!isProcessing) return;

    let socket: WebSocket | null = null;
    let fallbackInterval: any = null;

    try {
      socket = new WebSocket('ws://localhost:8000/api/cctv/ws');
      wsRef.current = socket;

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setTrackedObjects(data.tracked_objects || []);
          setFps(data.fps || 29.8);

          // Add to live surveillance logs if alert
          if (data.tracked_objects?.some((t: TrackedObject) => t.alert)) {
            const alertObj = data.tracked_objects.find((t: TrackedObject) => t.alert);
            setEventLogs((prev) => [
              {
                id: Date.now(),
                time: new Date().toTimeString().split(' ')[0],
                camera: data.camera_id,
                track_id: alertObj.track_id,
                name: alertObj.name,
                similarity: alertObj.similarity,
                status: alertObj.status,
              },
              ...prev.slice(0, 15),
            ]);
          }
        } catch (e) {}
      };

      socket.onerror = () => {
        // Switch to smooth simulated tracking loop
        initSimulation();
      };
    } catch (e) {
      initSimulation();
    }

    function initSimulation() {
      let tick = 0;
      fallbackInterval = setInterval(() => {
        tick++;
        const t = (tick % 150) / 150.0;
        const xOffset = Math.sin(t * Math.PI * 2) * 5;
        const yOffset = Math.cos(t * Math.PI * 2) * 3;

        const simulatedTargets: TrackedObject[] = [
          {
            track_id: 42,
            class_name: 'face',
            bbox_percent: [32 + xOffset, 24 + yOffset, 20, 30],
            detection_conf: 0.94,
            identity: 'SUS-1049',
            name: "Vikram 'Ghost' Malhotra",
            similarity: 89.4,
            status: 'Potential Match',
            color: '#ef4444',
            alert: true,
          },
          {
            track_id: 88,
            class_name: 'face',
            bbox_percent: [68 - xOffset * 0.7, 36 - yOffset * 0.5, 17, 26],
            detection_conf: 0.88,
            identity: 'UNIDENTIFIED',
            name: 'Unidentified Subject #88',
            similarity: 42.1,
            status: 'No Match',
            color: '#06b6d4',
            alert: false,
          },
        ];

        setTrackedObjects(simulatedTargets);
        setFps(+(29.5 + Math.random() * 0.8).toFixed(1));

        if (tick % 25 === 0) {
          setEventLogs((prev) => [
            {
              id: Date.now(),
              time: new Date().toTimeString().split(' ')[0],
              camera: selectedCamera,
              track_id: 42,
              name: "Vikram 'Ghost' Malhotra",
              similarity: 89.4,
              status: 'Potential Match',
            },
            ...prev.slice(0, 15),
          ]);
        }
      }, 100);
    }

    return () => {
      if (socket) socket.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [isProcessing, selectedCamera]);

  const handleToggleProcessing = () => {
    setIsProcessing(!isProcessing);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
      setIsWebcamInput(false);
    }
  };

  const handleStartWebcam = async () => {
    setIsWebcamInput(true);
    setUploadedVideoUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Webcam stream unavailable:', err);
    }
  };

  return (
    <div className="space-y-6">
      <ForensicDisclaimer />

      {/* Title & Live Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-navy-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100 font-sans">
              Real-Time CCTV Video Surveillance & Biometric Telemetry
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            YOLOv8 Face Detection // DeepSORT Multi-Object Tracking // ArcFace Re-Identification
          </p>
        </div>

        {/* Prominent Demo Mode Notice */}
        <div className="flex items-center gap-2 font-mono">
          <span className="text-[11px] px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            DEMO MODE / SIMULATED PIPELINE
          </span>
        </div>
      </div>

      {/* Main Surveillance Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Video Stream Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-navy-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
            {/* Camera Header Bar */}
            <div className="p-3 bg-navy-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-slate-200 font-bold">{selectedCamera}</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">FPS: <strong className="text-cyan-400">{fps}</strong></span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">TRACKED TARGETS: <strong className="text-cyan-400">{trackedObjects.length}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleProcessing}
                  className={`px-3 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
                    isProcessing
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  }`}
                >
                  {isProcessing ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  <span>{isProcessing ? 'Halt Pipeline' : 'Resume Pipeline'}</span>
                </button>
              </div>
            </div>

            {/* Video Viewport Container */}
            <div className="relative aspect-video w-full bg-navy-950 overflow-hidden flex items-center justify-center">
              {/* Background Video / CCTV Stills / Webcam */}
              {isWebcamInput ? (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              ) : uploadedVideoUrl ? (
                <video src={uploadedVideoUrl} autoPlay loop muted className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full relative">
                  {/* High Quality Surveillance Backing Image */}
                  <img
                    src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80"
                    alt="Surveillance Scene"
                    className="w-full h-full object-cover opacity-85 filter contrast-110 brightness-90"
                  />
                  {/* Dark Forensic Scanlines Overlay */}
                  <div className="absolute inset-0 forensic-scanlines pointer-events-none opacity-40" />
                </div>
              )}

              {/* Dynamic YOLO + DeepSORT Bounding Boxes Overlay */}
              {isProcessing && trackedObjects.map((obj) => {
                const [x, y, w, h] = obj.bbox_percent;
                return (
                  <div
                    key={obj.track_id}
                    className={`absolute transition-all duration-100 pointer-events-none border-2 ${
                      obj.alert 
                        ? 'border-rose-500 shadow-glow-danger bg-rose-500/10' 
                        : 'border-cyan-400 shadow-glow-cyan bg-cyan-500/10'
                    }`}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${w}%`,
                      height: `${h}%`,
                    }}
                  >
                    {/* Bounding Box Corner Accents */}
                    <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white" />

                    {/* HUD Label Above Box */}
                    <div className={`absolute -top-7 left-0 whitespace-nowrap px-1.5 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 shadow ${
                      obj.alert ? 'bg-rose-600 text-white' : 'bg-navy-950/90 text-cyan-300 border border-cyan-500/40'
                    }`}>
                      <span>ID: #{obj.track_id}</span>
                      <span>|</span>
                      <span>{obj.identity}</span>
                      <span>({obj.similarity}%)</span>
                    </div>
                  </div>
                );
              })}

              {/* Forensic Radar / HUD Stamp */}
              <div className="absolute bottom-3 left-3 pointer-events-none font-mono text-[10px] text-cyan-400/90 bg-navy-950/80 p-2 rounded border border-slate-800 backdrop-blur-xs space-y-0.5">
                <div>AI NODE: CCTV-SURV-EDGE-01</div>
                <div>YOLOv8 CONF: 0.94 // KALMAN REID: CONFIRMED</div>
                <div>PREDICTIVE ALERT: SUSPECT GHOST (SUS-1049)</div>
              </div>

              {/* Timestamp HUD */}
              <div className="absolute top-3 right-3 pointer-events-none font-mono text-[10px] text-slate-300 bg-navy-950/80 px-2.5 py-1 rounded border border-slate-800 backdrop-blur-xs flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>{new Date().toISOString().replace('T', ' ').substring(0, 19)}</span>
              </div>
            </div>

            {/* Bottom Stream Controls */}
            <div className="p-3 bg-navy-950 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Stream Source:</span>
                {['CAM-01', 'CAM-02', 'CAM-03'].map((camId) => (
                  <button
                    key={camId}
                    onClick={() => {
                      setSelectedCamera(camId);
                      setIsWebcamInput(false);
                      setUploadedVideoUrl(null);
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                      selectedCamera === camId && !isWebcamInput && !uploadedVideoUrl
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-navy-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {camId}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartWebcam}
                  className={`px-2.5 py-1 rounded text-[11px] flex items-center gap-1 border transition-colors ${
                    isWebcamInput ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-navy-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <CameraIcon className="w-3.5 h-3.5" />
                  <span>Webcam</span>
                </button>

                <label className="px-2.5 py-1 rounded text-[11px] bg-navy-900 text-slate-400 border border-slate-800 hover:text-slate-200 flex items-center gap-1 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Video</span>
                  <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Event Logs & Target Telemetry (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Target Card */}
          <div className="bg-navy-900/70 border border-rose-500/40 rounded-xl p-4 shadow-glow-danger space-y-3">
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                <h3 className="text-xs font-mono font-bold uppercase text-rose-300">
                  Target Match Flagged (Track #42)
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30">
                89.4% COSINE
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                alt="Suspect Vikram"
                className="w-14 h-14 rounded-lg object-cover border border-rose-500/40"
              />
              <div className="font-mono text-xs space-y-0.5">
                <div className="font-bold text-slate-100 font-sans">Vikram 'Ghost' Malhotra</div>
                <div className="text-[11px] text-cyan-400">ID: SUS-1049</div>
                <div className="text-[10px] text-slate-400">Tag: High Priority Cyber Crime</div>
              </div>
            </div>

            <button
              onClick={() => {
                if (onNavigate) onNavigate('recognition');
              }}
              className="w-full py-2 rounded-lg bg-rose-600/30 hover:bg-rose-600/40 text-rose-200 border border-rose-500/40 font-mono text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <ScanFace className="w-3.5 h-3.5" />
              <span>Investigate Full Biometric Dossier</span>
            </button>
          </div>

          {/* Real-Time Surveillance Events Feed */}
          <div className="bg-navy-900/70 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-mono font-bold uppercase text-slate-200">
                  Live Event Stream
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-500">REAL-TIME</span>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {eventLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-navy-950 border border-slate-800 font-mono text-xs space-y-1 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-cyan-400">{log.time}</span>
                    <span className="text-slate-500">{log.camera}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200 font-semibold font-sans">{log.name}</span>
                    <span className="text-rose-400 font-bold">{log.similarity}%</span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Track ID: #{log.track_id}</span>
                    <StatusBadge status={log.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
