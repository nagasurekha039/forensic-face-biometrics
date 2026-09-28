import React from 'react';
import { 
  LayoutDashboard, 
  Palette, 
  FileText, 
  Mic, 
  ScanFace, 
  Video, 
  Database, 
  History, 
  FileSpreadsheet, 
  Settings, 
  ShieldCheck, 
  Radio,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'sketch', label: 'Face Sketch Generator', icon: Palette, badge: 'GAN AI' },
    { id: 'text-desc', label: 'Text Description', icon: FileText, badge: 'NLP' },
    { id: 'voice-sketch', label: 'Voice-Guided Sketch', icon: Mic, badge: 'STT' },
    { id: 'recognition', label: 'Face Recognition', icon: ScanFace, badge: 'ArcFace' },
    { id: 'cctv', label: 'Real-Time CCTV', icon: Video, badge: 'YOLO+SORT' },
    { id: 'database', label: 'Suspect Database', icon: Database, badge: 'Gallery' },
    { id: 'history', label: 'Recognition History', icon: History, badge: null },
    { id: 'reports', label: 'Forensic Reports', icon: FileSpreadsheet, badge: 'Print' },
    { id: 'settings', label: 'System Settings', icon: Settings, badge: null },
  ];

  return (
    <aside className="w-64 bg-navy-950 border-r border-slate-800/80 flex flex-col h-screen select-none z-30 sticky top-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
          <ScanFace className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-mono text-sm font-bold text-slate-100 tracking-wider">BIO-SKETCH</h1>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <p className="text-[10px] font-mono text-cyan-400/80 uppercase tracking-widest">FORENSIC AI // AIML</p>
        </div>
      </div>

      {/* Live System Telemetry Badge */}
      <div className="px-4 py-2 bg-navy-900/50 border-b border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>SURVEILLANCE AI</span>
        </div>
        <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30 text-[10px]">
          ONLINE
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-cyan-400/20 text-cyan-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Examiner Profile Card & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-navy-900/40">
        <div className="flex items-center justify-between p-2 rounded-lg bg-navy-950/70 border border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-cyan-300 flex-shrink-0">
              {user?.full_name?.charAt(0) || 'F'}
            </div>
            <div className="truncate">
              <div className="text-xs font-medium text-slate-200 truncate">{user?.full_name || 'Investigator'}</div>
              <div className="text-[10px] font-mono text-cyan-400/80 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                <span>{user?.badge_number || 'FS-8821'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
