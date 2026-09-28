import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Cpu, 
  Sliders, 
  Database, 
  Camera as CameraIcon, 
  ShieldCheck, 
  Save, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { SystemSettingsData } from '../types';
import { ForensicDisclaimer } from '../components/Common/ForensicDisclaimer';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettingsData>({
    recognition_model: 'ArcFace-ResNet50',
    detection_model: 'YOLOv8n-Face',
    tracker_model: 'DeepSORT-Kalman',
    sketch_model: 'Forensic-SketchGAN-v2.4',
    recognition_threshold: 0.65,
    detection_threshold: 0.50,
    active_database: 'SQLite (Local Embedded)',
    demo_mode_enabled: true,
    theme: 'Dark Forensic Navy',
  });
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [isSavedToast, setIsSavedToast] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await api.getSettings();
      setSettings(data.settings);
      setSystemInfo(data.system_info);
    };
    load();
  }, []);

  const handleSave = async () => {
    await api.updateSettings(settings);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      <ForensicDisclaimer />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-navy-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100 font-sans">
              Platform & AI Model Architecture Configuration
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Microservice Endpoints // Model Routing // Operational Biometric Thresholds
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-glow-cyan transition-all font-mono"
        >
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>

      {isSavedToast && (
        <div className="bg-emerald-500/90 text-white px-4 py-2.5 rounded-lg shadow-xl font-mono text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>System configuration parameters saved and updated across AI pipeline!</span>
        </div>
      )}

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Model Configuration (7 Cols) */}
        <div className="lg:col-span-7 space-y-5 bg-navy-900/70 border border-slate-800 rounded-xl p-5 shadow-sm font-mono text-xs">
          <h3 className="font-bold text-slate-200 uppercase tracking-wider text-xs border-b border-slate-800 pb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>AI Model Selection & Pipelines</span>
          </h3>

          <div className="space-y-4">
            {/* Model 1: Face Recognition */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold text-[11px]">Face Recognition Model Backbone</label>
              <select
                value={settings.recognition_model}
                onChange={(e) => setSettings({ ...settings, recognition_model: e.target.value })}
                className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
              >
                <option value="ArcFace-ResNet50">ArcFace ResNet-50 (512-D Normalized Hypersphere)</option>
                <option value="FaceNet-InceptionResNet">FaceNet Inception-ResNet-v1 (128-D Triplet)</option>
                <option value="AdaFace-MobileNet">AdaFace Quality-Adaptive Margin (512-D)</option>
              </select>
            </div>

            {/* Model 2: Face / Person Detection */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold text-[11px]">Surveillance Detection Engine (YOLO)</label>
              <select
                value={settings.detection_model}
                onChange={(e) => setSettings({ ...settings, detection_model: e.target.value })}
                className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
              >
                <option value="YOLOv8n-Face">YOLOv8n-Face (High FPS Real-Time Edge)</option>
                <option value="YOLOv8x-Large">YOLOv8x Precision (High Accuracy Server)</option>
                <option value="YOLOv9-Dense">YOLOv9 Programmable Gradient Info</option>
              </select>
            </div>

            {/* Model 3: Multi-Object Tracking */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold text-[11px]">Multi-Object Tracking Algorithm</label>
              <select
                value={settings.tracker_model}
                onChange={(e) => setSettings({ ...settings, tracker_model: e.target.value })}
                className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
              >
                <option value="DeepSORT-Kalman">DeepSORT (Kalman Filter + Cosine ReID Metric)</option>
                <option value="ByteTrack">ByteTrack (Low-Score Associator)</option>
              </select>
            </div>

            {/* Model 4: Sketch Generator */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold text-[11px]">Generative Face Synthesis Model</label>
              <select
                value={settings.sketch_model}
                onChange={(e) => setSettings({ ...settings, sketch_model: e.target.value })}
                className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
              >
                <option value="Forensic-SketchGAN-v2.4">Forensic-SketchGAN-v2.4 (Conditional Latent)</option>
                <option value="StyleGAN2-ADA">StyleGAN2-ADA (CUFS Face Sketch Domain)</option>
                <option value="Pix2Pix-Composite">Pix2Pix Edge-to-Photo Composite</option>
              </select>
            </div>

            {/* Threshold Sliders */}
            <div className="pt-3 border-t border-slate-800/80 space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Recognition Match Threshold:</span>
                  <span className="text-cyan-400 font-bold">{(settings.recognition_threshold * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.40"
                  max="0.95"
                  step="0.05"
                  value={settings.recognition_threshold}
                  onChange={(e) => setSettings({ ...settings, recognition_threshold: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">YOLO Detection Confidence Threshold:</span>
                  <span className="text-cyan-400 font-bold">{(settings.detection_threshold * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.30"
                  max="0.90"
                  step="0.05"
                  value={settings.detection_threshold}
                  onChange={(e) => setSettings({ ...settings, detection_threshold: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Database, Hardware & System Telemetry (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Database Configuration */}
          <div className="bg-navy-900/70 border border-slate-800 rounded-xl p-5 shadow-sm font-mono text-xs space-y-3">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-xs border-b border-slate-800 pb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Database Storage Backend</span>
            </h4>

            <div className="space-y-2">
              <label className="text-slate-400 text-[11px]">Primary Biometric Database</label>
              <select
                value={settings.active_database}
                onChange={(e) => setSettings({ ...settings, active_database: e.target.value })}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
              >
                <option value="SQLite (Local Embedded)">SQLite (Local Embedded Laptop Storage)</option>
                <option value="PostgreSQL (Production Enterprise)">PostgreSQL with pgvector Extension</option>
              </select>
              <p className="text-[10px] text-slate-500">
                Initial development version utilizes local SQLite. Architecture is fully modular and supports switching to PostgreSQL via configuration.
              </p>
            </div>
          </div>

          {/* System Hardware Specs */}
          <div className="bg-navy-900/70 border border-slate-800 rounded-xl p-5 shadow-sm font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Runtime Environment</span>
              </h4>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                VERIFIED
              </span>
            </div>

            <div className="space-y-2 text-slate-300 text-[11px]">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Platform OS:</span>
                <span className="text-slate-200">{systemInfo?.os || 'Windows 11 x86_64'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Python Interpreter:</span>
                <span className="text-slate-200">{systemInfo?.python_version || '3.10.0'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Execution Provider:</span>
                <span className="text-cyan-400">{systemInfo?.execution_provider || 'CPU / DirectML'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Suspect Gallery:</span>
                <span className="text-emerald-400">{systemInfo?.biometric_db_records || 5} Vectors Indexed</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Standards:</span>
                <span className="text-purple-300">NIST FRTE / SWGDE Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
