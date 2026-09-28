import React, { useState } from 'react';
import { 
  ScanFace, 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  AlertTriangle,
  Fingerprint,
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('investigator');
  const [password, setPassword] = useState('forensic2026');
  const [role, setRole] = useState('Lead Forensic Examiner');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide valid forensic security credentials.');
      return;
    }
    login(username, role);
  };

  const handleQuickLogin = (u: string, r: string) => {
    setUsername(u);
    setPassword('forensic2026');
    setRole(r);
    login(u, r);
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background Reticle / Scanline Effect */}
      <div className="absolute inset-0 forensic-scanlines pointer-events-none opacity-50" />
      <div className="absolute w-[600px] h-[600px] rounded-full border border-cyan-500/10 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] rounded-full border border-cyan-500/15 pointer-events-none" />

      {/* Login Card */}
      <div className="max-w-md w-full bg-navy-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto shadow-glow-cyan">
            <ScanFace className="w-8 h-8" />
          </div>
          <h1 className="text-lg font-bold text-slate-100 tracking-wider font-mono">
            SMART FORENSIC BIOMETRIC AI
          </h1>
          <p className="text-[11px] font-mono text-cyan-400/90 uppercase tracking-widest">
            B.TECH AIML RESEARCH PROTOTYPE // NIST FRTE BENCHMARK
          </p>
        </div>

        {/* Ethics & Legal Precaution Notice */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-[11px] text-amber-300 font-mono flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
          <span>
            RESTRICTED FORENSIC TERMINAL: Authorized personnel only. All queries are audited under chain of custody regulations.
          </span>
        </div>

        {error && (
          <div className="p-2.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold text-[11px] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Investigator Identifier / Username</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3.5 py-2.5 text-slate-200 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold text-[11px] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Biometric Security Key / Password</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3.5 py-2.5 text-slate-200 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Role-Based Access Profile</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3.5 py-2.5 text-slate-200 focus:outline-none"
            >
              <option value="Lead Forensic Examiner">Lead Forensic Examiner (Full Control)</option>
              <option value="Surveillance Officer">Surveillance Officer (CCTV Operator)</option>
              <option value="Biometric Data Analyst">Biometric Data Analyst (ArcFace/Model Research)</option>
              <option value="Admin">System Administrator</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-glow-cyan transition-all font-mono"
          >
            <Fingerprint className="w-4 h-4" />
            <span>Authenticate Forensic Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Sign-Ins */}
        <div className="pt-2 border-t border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-500 block mb-2 text-center uppercase tracking-wider">
            Quick Academic Demo Logins:
          </span>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <button
              onClick={() => handleQuickLogin('investigator', 'Lead Forensic Examiner')}
              className="p-2 rounded bg-navy-950 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors"
            >
              Dr. Vance (Examiner)
            </button>
            <button
              onClick={() => handleQuickLogin('surveillance', 'Surveillance Officer')}
              className="p-2 rounded bg-navy-950 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors"
            >
              Ofc. Kane (CCTV)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
