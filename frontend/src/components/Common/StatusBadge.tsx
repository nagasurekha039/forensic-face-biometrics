import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const s = status.toLowerCase();
  
  let styles = 'bg-slate-700/40 text-slate-300 border-slate-600/40';

  if (s.includes('verified') || s.includes('online') || s.includes('active')) {
    styles = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  } else if (s.includes('potential') || s.includes('calibrat') || s.includes('interest')) {
    styles = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  } else if (s.includes('false') || s.includes('offline') || s.includes('danger') || s.includes('red notice')) {
    styles = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  } else if (s.includes('inconclusive') || s.includes('cleared')) {
    styles = 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-full border ${styles} ${padding}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {status}
    </span>
  );
};
