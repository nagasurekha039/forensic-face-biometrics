import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ScanFace, 
  Video, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Cpu,
  Fingerprint
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';
import { api } from '../services/api';
import { ForensicDisclaimer } from '../components/Common/ForensicDisclaimer';
import { StatusBadge } from '../components/Common/StatusBadge';
import { RecognitionEvent } from '../types';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const confidenceData = [
  { time: '08:00', confidence: 78, attempts: 12 },
  { time: '10:00', confidence: 84, attempts: 24 },
  { time: '12:00', confidence: 91, attempts: 38 },
  { time: '14:00', confidence: 89, attempts: 45 },
  { time: '16:00', confidence: 94, attempts: 29 },
  { time: '18:00', confidence: 86, attempts: 18 },
  { time: '20:00', confidence: 88, attempts: 14 },
];

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [events, setEvents] = useState<RecognitionEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getRecognitionHistory();
        setEvents(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Forensic Legal Advisory Notice */}
      <ForensicDisclaimer />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-navy-900/70 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Registered Faces</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">5</span>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-0.5">
              +2 this week
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">512-D ArcFace Embeddings in gallery</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-navy-900/70 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Recognition Probes</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ScanFace className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">142</span>
            <span className="text-[11px] font-mono text-cyan-400">89.4% Avg. Peak Match</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Surveillance + Manual Probes</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-navy-900/70 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Active Cameras</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">3 / 4</span>
            <span className="text-[11px] font-mono text-slate-400">Online 1080p/4K</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">YOLOv8 + DeepSORT Real-Time</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-navy-900/70 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Generated Composites</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">28</span>
            <span className="text-[11px] font-mono text-purple-400">GAN Syntheses</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Witness & Audio Generated Sketches</p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="bg-navy-900/60 border border-slate-800 rounded-xl p-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
          Forensic Operational Shortcuts
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('sketch')}
            className="flex items-center justify-between p-3 rounded-lg bg-navy-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-left group"
          >
            <div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400">Face Sketch Generator</div>
              <div className="text-[10px] text-slate-500">Parametric GAN synthesis</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            onClick={() => onNavigate('text-desc')}
            className="flex items-center justify-between p-3 rounded-lg bg-navy-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-left group"
          >
            <div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400">NLP Witness Extraction</div>
              <div className="text-[10px] text-slate-500">Parse witness statements</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            onClick={() => onNavigate('recognition')}
            className="flex items-center justify-between p-3 rounded-lg bg-navy-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-left group"
          >
            <div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400">Face Recognition Probe</div>
              <div className="text-[10px] text-slate-500">ArcFace 512-D verification</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            onClick={() => onNavigate('cctv')}
            className="flex items-center justify-between p-3 rounded-lg bg-navy-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-left group"
          >
            <div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400">Real-Time CCTV</div>
              <div className="text-[10px] text-slate-500">YOLO + DeepSORT feed</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </div>

      {/* Analytics & System Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column (2 Cols) */}
        <div className="lg:col-span-2 bg-navy-900/70 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Biometric Match Confidence & Recognition Volume</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                ArcFace Cosine Similarity Trendline (0% - 100%) vs Daily Probes
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              CONFIDENCE THRESHOLD: 65%
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={confidenceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[50, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0c1222', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px', color: '#f1f5f9' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="confidence" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorConfidence)" 
                  name="Confidence %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI System Telemetry Status (1 Col) */}
        <div className="bg-navy-900/70 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>AI Engine Health</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              ALL SERVICES NOMINAL
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-semibold">YOLOv8 Face Detection</div>
                <div className="text-[10px] text-slate-500">Bounding Box & Landmark Loc</div>
              </div>
              <span className="text-emerald-400 text-[11px]">ACTIVE (30 FPS)</span>
            </div>

            <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-semibold">DeepSORT Object Tracker</div>
                <div className="text-[10px] text-slate-500">Kalman State + ReID Metric</div>
              </div>
              <span className="text-emerald-400 text-[11px]">ACTIVE (ID #42, #88)</span>
            </div>

            <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-semibold">ArcFace / FaceNet Embedder</div>
                <div className="text-[10px] text-slate-500">512-D Normalized Hypersphere</div>
              </div>
              <span className="text-cyan-400 text-[11px]">ONLINE (124ms)</span>
            </div>

            <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-semibold">Forensic GAN Sketch Model</div>
                <div className="text-[10px] text-slate-500">Parametric Latent Synthesis</div>
              </div>
              <span className="text-purple-400 text-[11px]">ONLINE (184ms)</span>
            </div>

            <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-semibold">SQLite Forensic DB</div>
                <div className="text-[10px] text-slate-500">Modular SQLite/Postgres</div>
              </div>
              <span className="text-emerald-400 text-[11px]">SYNCHRONIZED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Recognition Activity Feed */}
      <div className="bg-navy-900/70 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Recent Forensic Recognition Activity Feed</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Live automated surveillance matches and manual biometric probe events
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View Full Audit Logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Event ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Camera / Node</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Similarity</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Evidence Snapshot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {events.slice(0, 5).map((e) => (
                <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 text-cyan-400 font-semibold">{e.event_id}</td>
                  <td className="py-2.5 px-3 text-slate-400">{e.date} {e.time}</td>
                  <td className="py-2.5 px-3 text-slate-300">{e.camera}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-200 font-sans">{e.person_name}</span>
                    <span className="text-[10px] text-slate-500 block">ID: {e.person_id}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`font-bold ${e.similarity >= 85 ? 'text-emerald-400' : (e.similarity >= 65 ? 'text-cyan-400' : 'text-slate-400')}`}>
                      {e.similarity}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={e.status} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <img 
                      src={e.screenshot} 
                      alt="Thumbnail" 
                      className="w-8 h-8 rounded object-cover border border-slate-700 ml-auto"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
