import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Shield, 
  Clock, 
  Search, 
  Cpu, 
  AlertCircle,
  FileCheck2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ currentPage }) => {
  const { user } = useAuth();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toTimeString().split(' ')[0] + ' UTC');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Forensic Biometric Command Center';
      case 'sketch': return 'AI Forensic Face Sketch Generator';
      case 'text-desc': return 'NLP Witness Statement Extraction';
      case 'voice-sketch': return 'Voice-Guided Sketch Synthesis';
      case 'recognition': return 'ArcFace Biometric Face Recognition';
      case 'cctv': return 'Real-Time CCTV Video Surveillance';
      case 'database': return 'Suspect & Reference Gallery Database';
      case 'history': return 'Biometric Recognition History Logs';
      case 'reports': return 'Forensic Examination Reports';
      case 'settings': return 'AI Model & System Configuration';
      default: return 'Forensic Biometric Terminal';
    }
  };

  return (
    <header className="h-16 bg-navy-950/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title & Case Context */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>{getPageTitle()}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              CASE: #2026-092
            </span>
          </h2>
          <p className="text-[11px] text-slate-400 font-mono">
            AIML PROTOTYPE // NIST FRTE 1:N VERIFICATION BENCHMARK
          </p>
        </div>
      </div>

      {/* Right Telemetry & Actions */}
      <div className="flex items-center gap-4">
        {/* Live System Clock */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-900 border border-slate-800 text-xs font-mono text-cyan-400">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{time || '12:00:00 UTC'}</span>
        </div>

        {/* AI Hardware Load */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-900 border border-slate-800 text-xs font-mono text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] text-slate-400">AI ENGINE:</span>
          <span className="text-cyan-400 font-semibold">DIRECTML/MODULAR</span>
        </div>

        {/* Alert Bell */}
        <div className="relative">
          <button className="p-2 rounded-lg bg-navy-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors">
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full" />
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="text-right hidden lg:block">
            <div className="text-xs font-medium text-slate-200">{user?.full_name}</div>
            <div className="text-[10px] text-cyan-400 font-mono">{user?.role}</div>
          </div>
          <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold">
            {user?.badge_number?.substring(3) || '9082'}
          </div>
        </div>
      </div>
    </header>
  );
};
