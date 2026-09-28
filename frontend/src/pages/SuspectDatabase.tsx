import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Eye, 
  ScanFace, 
  Calendar, 
  Clock, 
  Fingerprint, 
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { Person } from '../types';
import { ForensicDisclaimer } from '../components/Common/ForensicDisclaimer';
import { StatusBadge } from '../components/Common/StatusBadge';

interface SuspectDatabaseProps {
  onNavigate?: (page: string) => void;
}

export const SuspectDatabase: React.FC<SuspectDatabaseProps> = ({ onNavigate }) => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [genderFilter, setGenderFilter] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);
  
  // Modals
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newPerson, setNewPerson] = useState({
    name: '',
    alias: '',
    age: 30,
    gender: 'Male',
    description: '',
    photo_url: '',
    tags: 'High Priority, Suspect',
  });

  const loadPersons = async () => {
    setLoading(true);
    try {
      const data = await api.getPersons({
        search: search || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        gender: genderFilter !== 'All' ? genderFilter : undefined,
      });
      setPersons(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPersons();
  }, [search, statusFilter, genderFilter]);

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.addPerson({
      ...newPerson,
      tags: newPerson.tags.split(',').map(t => t.trim()),
    });
    setIsAddModalOpen(false);
    setNewPerson({
      name: '',
      alias: '',
      age: 30,
      gender: 'Male',
      description: '',
      photo_url: '',
      tags: 'High Priority, Suspect',
    });
    loadPersons();
  };

  const handleDeletePerson = async (personId: string) => {
    if (confirm(`Are you sure you want to remove suspect record ${personId} from the biometric registry?`)) {
      await api.deletePerson(personId);
      loadPersons();
      if (selectedPerson?.person_id === personId) {
        setSelectedPerson(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <ForensicDisclaimer />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-navy-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100 font-sans">
              Suspect & Reference Gallery Database
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            512-Dimensional ArcFace Vector Gallery // SQLite Relational Storage
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-glow-cyan transition-all font-mono"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Suspect</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-navy-900/70 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, suspect ID (SUS-...), alias, or facial description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500/60 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-navy-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active Suspect">Active Suspect</option>
            <option value="Person of Interest">Person of Interest</option>
            <option value="Cleared">Cleared</option>
          </select>

          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="bg-navy-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      {/* Persons Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {persons.map((p) => (
          <div
            key={p.person_id}
            className="bg-navy-900/70 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 flex-shrink-0">
                    <img
                      src={p.photo_url}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm font-sans">{p.name}</h3>
                    <div className="text-[11px] font-mono text-cyan-400 font-semibold">{p.person_id}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Alias: "{p.alias}"</div>
                  </div>
                </div>
                <StatusBadge status={p.status} size="sm" />
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {p.description}
              </p>

              {/* Biometric Status Metadata */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 font-mono text-[11px] space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Age / Gender:</span>
                  <span className="text-slate-200">{p.age} yrs / {p.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span>Embedding:</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Fingerprint className="w-3 h-3" />
                    <span>512-D Ready</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Last Detected:</span>
                  <span className="text-cyan-400">{p.last_detected}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs font-mono">
              <button
                onClick={() => setSelectedPerson(p)}
                className="flex-1 py-1.5 px-2 rounded-lg bg-navy-950 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Dossier</span>
              </button>

              <button
                onClick={() => handleDeletePerson(p.person_id)}
                className="p-1.5 rounded-lg bg-navy-950 border border-slate-800 hover:border-rose-500/40 text-slate-500 hover:text-rose-400 transition-colors"
                title="Delete Suspect"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: Add Suspect Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-slate-100 font-sans text-sm">
                  Register New Suspect / Reference Subject
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPerson} className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 text-[11px]">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={newPerson.name}
                    onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                    placeholder="e.g. Tariq Vance"
                    className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 text-[11px]">Known Alias</label>
                  <input
                    type="text"
                    value={newPerson.alias}
                    onChange={(e) => setNewPerson({ ...newPerson, alias: e.target.value })}
                    placeholder="e.g. Phantom"
                    className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 text-[11px]">Age</label>
                  <input
                    type="number"
                    min="14"
                    max="90"
                    value={newPerson.age}
                    onChange={(e) => setNewPerson({ ...newPerson, age: parseInt(e.target.value) || 30 })}
                    className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 text-[11px]">Gender</label>
                  <select
                    value={newPerson.gender}
                    onChange={(e) => setNewPerson({ ...newPerson, gender: e.target.value })}
                    className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 text-[11px]">Reference Photo URL</label>
                <input
                  type="url"
                  value={newPerson.photo_url}
                  onChange={(e) => setNewPerson({ ...newPerson, photo_url: e.target.value })}
                  placeholder="https://... (leave blank for default suspect photo)"
                  className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 text-[11px]">Facial & Investigative Description</label>
                <textarea
                  rows={3}
                  value={newPerson.description}
                  onChange={(e) => setNewPerson({ ...newPerson, description: e.target.value })}
                  placeholder="Describe jawline, hair, eye shape, scars, criminal involvement..."
                  className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-navy-950 border border-slate-800 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Save & Generate 512-D ArcFace Vector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: View Suspect Dossier Details */}
      {selectedPerson && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-slate-100 font-sans text-sm">
                  Forensic Biometric Dossier: {selectedPerson.person_id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPerson(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-start gap-4">
              <img
                src={selectedPerson.photo_url}
                alt={selectedPerson.name}
                className="w-24 h-24 rounded-lg object-cover border border-slate-700 flex-shrink-0"
              />
              <div className="space-y-1">
                <div className="text-base font-bold text-slate-100 font-sans">{selectedPerson.name}</div>
                <div className="text-cyan-400">Alias: {selectedPerson.alias}</div>
                <div className="text-slate-400">Age: {selectedPerson.age} | Gender: {selectedPerson.gender}</div>
                <StatusBadge status={selectedPerson.status} size="sm" />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Forensic Description</span>
              <p className="text-slate-300 leading-relaxed">{selectedPerson.description}</p>
            </div>

            <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Biometric Embedding:</span>
                <span className="text-emerald-400">ArcFace Normalized 512-D</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date Registered:</span>
                <span className="text-slate-300">{selectedPerson.date_added}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Surveillance Hit:</span>
                <span className="text-cyan-400">{selectedPerson.last_detected}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => setSelectedPerson(null)}
                className="px-4 py-2 rounded-lg bg-navy-950 border border-slate-800 text-slate-300 hover:text-white"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
