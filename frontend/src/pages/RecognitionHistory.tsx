import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Video, 
  User, 
  Eye, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';
import { RecognitionEvent } from '../types';
import { ForensicDisclaimer } from '../components/Common/ForensicDisclaimer';
import { StatusBadge } from '../components/Common/StatusBadge';

interface RecognitionHistoryProps {
  onNavigate?: (page: string) => void;
}

export const RecognitionHistory: React.FC<RecognitionHistoryProps> = ({ onNavigate }) => {
  const [events, setEvents] = useState<RecognitionEvent[]>([]);
  const [search, setSearch] = useState<string>('');
  const [cameraFilter, setCameraFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedEvent, setSelectedEvent] = useState<RecognitionEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getRecognitionHistory({
        search: search || undefined,
        camera: cameraFilter !== 'All' ? cameraFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
      });
      setEvents(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [search, cameraFilter, statusFilter]);

  const exportCSV = () => {
    const headers = ['Event ID', 'Date', 'Time', 'Camera', 'Person ID', 'Person Name', 'Similarity (%)', 'Status'];
    const rows = events.map(e => [
      e.event_id,
      e.date,
      e.time,
      e.camera,
      e.person_id,
      e.person_name,
      e.similarity,
      e.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `forensic_recognition_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <ForensicDisclaimer />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-navy-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100 font-sans">
              Biometric Recognition Audit Logs & Surveillance History
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Immutable Chain of Custody Audit Trail // Forensic Temporal Tracking
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-3.5 py-2 rounded-lg bg-navy-950 border border-slate-800 hover:border-cyan-500/50 text-slate-200 hover:text-cyan-400 font-mono text-xs flex items-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Audit Log</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-navy-900/70 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by event ID, subject name, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500/60 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={cameraFilter}
            onChange={(e) => setCameraFilter(e.target.value)}
            className="bg-navy-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
          >
            <option value="All">All Cameras</option>
            <option value="CAM-01">CAM-01 (North Gate)</option>
            <option value="CAM-02">CAM-02 (Central Concourse)</option>
            <option value="CAM-03">CAM-03 (Secure Vault)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-navy-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
          >
            <option value="All">All Match Statuses</option>
            <option value="Verified Match">Verified Match</option>
            <option value="Potential Match">Potential Match</option>
            <option value="Inconclusive">Inconclusive</option>
          </select>
        </div>
      </div>

      {/* Searchable History Table */}
      <div className="bg-navy-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Camera</th>
                <th className="py-3 px-4">Person ID</th>
                <th className="py-3 px-4">Similarity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Screenshot</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 text-slate-300">{e.date}</td>
                  <td className="py-3 px-4 text-slate-400">{e.time}</td>
                  <td className="py-3 px-4 text-slate-200">{e.camera}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-cyan-400 block">{e.person_id}</span>
                    <span className="text-[10px] text-slate-400 font-sans">{e.person_name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${e.similarity >= 85 ? 'text-emerald-400' : (e.similarity >= 65 ? 'text-cyan-400' : 'text-slate-400')}`}>
                      {e.similarity}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={e.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <img
                      src={e.screenshot}
                      alt="Thumbnail"
                      className="w-9 h-9 rounded object-cover border border-slate-700 mx-auto"
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedEvent(e)}
                      className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                      title="Inspect Event"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Event Detail Inspection */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-100 font-sans text-sm">
                  Forensic Biometric Incident: {selectedEvent.event_id}
                </h3>
                <span className="text-[10px] text-slate-500">
                  {selectedEvent.date} at {selectedEvent.time}
                </span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-start gap-4">
              <img
                src={selectedEvent.screenshot}
                alt="Event Still"
                className="w-32 h-32 rounded-lg object-cover border border-slate-700 flex-shrink-0"
              />
              <div className="space-y-1.5">
                <div className="text-base font-bold text-slate-100 font-sans">{selectedEvent.person_name}</div>
                <div className="text-cyan-400">Suspect ID: {selectedEvent.person_id}</div>
                <div className="text-slate-400">Sensor: {selectedEvent.camera}</div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Cosine Similarity:</span>
                  <span className="text-emerald-400 font-bold">{selectedEvent.similarity}%</span>
                </div>
                <StatusBadge status={selectedEvent.status} size="sm" />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Surveillance Event Notes</span>
              <p className="text-slate-300 leading-relaxed">{selectedEvent.notes}</p>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-lg bg-navy-950 border border-slate-800 text-slate-300 hover:text-white"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
