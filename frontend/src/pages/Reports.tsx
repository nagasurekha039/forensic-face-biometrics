import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  FileText,
  UserCheck
} from 'lucide-react';
import { api, generateLocalSketchSvg } from '../services/api';
import { ForensicDisclaimer } from '../components/Common/ForensicDisclaimer';
import { useAuth } from '../context/AuthContext';

export const Reports: React.FC = () => {
  const { user } = useAuth();
  const [caseId, setCaseId] = useState<string>('CASE-2026-092');
  const [investigatorName, setInvestigatorName] = useState<string>(user?.full_name || 'Dr. Elena Vance, Ph.D.');
  const [notes, setNotes] = useState<string>(
    'Composite sketch synthesized from primary witness audio statement. Algorithmic face matching against gallery flagged suspect Vikram Malhotra with 89.4% cosine similarity across Sector 4 North Gate perimeter.'
  );
  const [report, setReport] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Generate Report
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const data = await api.generateReport({
        case_id: caseId,
        investigator_name: investigatorName,
        candidate_id: 'CAND-9821A',
        matched_person_id: 'SUS-1049',
        similarity_score: 89.4,
        notes: notes,
      });
      setReport(data);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="no-print">
        <ForensicDisclaimer />

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-navy-900/60 p-4 rounded-xl border border-slate-800 mt-4">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-slate-100 font-sans">
                Official Forensic Examination Report Generator
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Standardized Forensic Facial Comparison (FFC) Evidence Dossier
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={!report}
              className="px-3.5 py-2 rounded-lg bg-navy-950 border border-slate-800 hover:border-cyan-500/50 text-slate-200 hover:text-cyan-400 font-mono text-xs flex items-center gap-2 transition-colors disabled:opacity-40"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official PDF</span>
            </button>
          </div>
        </div>

        {/* Report Input Form Controls */}
        <div className="bg-navy-900/70 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 font-mono text-xs mt-4">
          <h3 className="font-bold text-slate-200 uppercase tracking-wider text-xs">
            Case Parameters & Investigator Sign-Off
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 text-[11px]">Investigation Case Number *</label>
              <input
                type="text"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 text-[11px]">Lead Examiner / Forensic Analyst *</label>
              <input
                type="text"
                value={investigatorName}
                onChange={(e) => setInvestigatorName(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 text-[11px]">Forensic Morphological Comparison Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 resize-none font-mono"
            />
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-glow-cyan transition-all font-mono"
          >
            <FileText className="w-4 h-4" />
            <span>{isGenerating ? 'Compiling Dossier...' : 'Compile & Render Formal Report'}</span>
          </button>
        </div>
      </div>

      {/* PRINT/DOWNLOAD-READY REPORT DOCUMENT */}
      {report && (
        <div className="bg-slate-950 text-slate-100 p-8 sm:p-12 rounded-xl border border-slate-700 shadow-2xl space-y-6 font-mono text-xs print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
          {/* Formal Header */}
          <div className="border-b-2 border-slate-700 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="text-base font-bold tracking-widest text-cyan-400 print:text-black">
                CENTRAL FORENSIC BIOMETRIC LABORATORY
              </div>
              <div className="text-[11px] text-slate-400 print:text-slate-700">
                DIVISION OF ADVANCED ARTIFICIAL INTELLIGENCE & COMPUTER VISION
              </div>
              <div className="text-[10px] text-slate-500 print:text-slate-600">
                CERTIFIED NIST FRTE / SWGDE FORENSIC COMPLIANT DOSSIER
              </div>
            </div>
            <div className="text-right sm:text-right">
              <div className="font-bold text-slate-200 print:text-black">REPORT ID: {report.report_id}</div>
              <div className="text-[11px] text-slate-400 print:text-slate-700">DATE: {report.generated_at}</div>
              <div className="text-[10px] text-cyan-400 font-bold print:text-black">CASE: {report.case_id}</div>
            </div>
          </div>

          {/* Evidence Comparison Exhibits (Side-by-Side) */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-xs border-b border-slate-800 pb-1 print:text-black">
              Section 1: Comparative Facial Biometric Exhibits
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Exhibit A: Synthesized Sketch */}
              <div className="p-4 rounded-lg bg-navy-900 border border-slate-800 flex flex-col items-center text-center space-y-2 print:bg-white print:border-black">
                <span className="font-bold text-cyan-400 print:text-black">EXHIBIT A: WITNESS COMPOSITE SKETCH</span>
                <span className="text-[10px] text-slate-400">Synthesized via GAN Latent Model</span>
                <div className="w-48 h-48 rounded border border-slate-700 bg-slate-100 overflow-hidden">
                  <img
                    src={generateLocalSketchSvg({
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
                    }, 42)}
                    alt="Exhibit A"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-[10px] text-slate-500">REF: {report.evidence_summary.sketch_candidate_id}</div>
              </div>

              {/* Exhibit B: Registered Reference Photo */}
              <div className="p-4 rounded-lg bg-navy-900 border border-slate-800 flex flex-col items-center text-center space-y-2 print:bg-white print:border-black">
                <span className="font-bold text-emerald-400 print:text-black">EXHIBIT B: SUSPECT GALLERY REFERENCE</span>
                <span className="text-[10px] text-slate-400">Registered Mugshot Photo</span>
                <div className="w-48 h-48 rounded border border-slate-700 bg-slate-900 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                    alt="Exhibit B"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-[10px] text-slate-500">ID: {report.evidence_summary.matched_person_id}</div>
              </div>
            </div>
          </div>

          {/* Section 2: Biometric Similarity Metrics */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-xs border-b border-slate-800 pb-1 print:text-black">
              Section 2: Deep Metric Identification Analysis
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-2.5 rounded bg-navy-900 border border-slate-800 print:border-black">
                <span className="text-slate-500 block text-[10px]">MATCHED SUBJECT</span>
                <span className="font-bold text-slate-100 print:text-black">{report.evidence_summary.matched_person_name}</span>
              </div>
              <div className="p-2.5 rounded bg-navy-900 border border-slate-800 print:border-black">
                <span className="text-slate-500 block text-[10px]">COSINE SIMILARITY</span>
                <span className="font-bold text-cyan-400 print:text-black">{report.evidence_summary.similarity_percentage}%</span>
              </div>
              <div className="p-2.5 rounded bg-navy-900 border border-slate-800 print:border-black">
                <span className="text-slate-500 block text-[10px]">METRIC ALGORITHM</span>
                <span className="text-slate-200 print:text-black">ArcFace Normalized 512-D</span>
              </div>
            </div>
          </div>

          {/* Section 3: Detection History Logs */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-xs border-b border-slate-800 pb-1 print:text-black">
              Section 3: Correlated Surveillance Node Detections
            </h4>

            <table className="w-full text-left text-xs border border-slate-800 print:border-black">
              <thead className="bg-navy-950 font-bold border-b border-slate-800 print:bg-slate-200 print:text-black">
                <tr>
                  <th className="p-2">Event ID</th>
                  <th className="p-2">Timestamp</th>
                  <th className="p-2">Camera / Node</th>
                  <th className="p-2">Similarity</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-black">
                {report.detection_history.map((d: any, i: number) => (
                  <tr key={i}>
                    <td className="p-2 text-cyan-400 print:text-black">{d.event_id}</td>
                    <td className="p-2">{d.timestamp}</td>
                    <td className="p-2">{d.camera}</td>
                    <td className="p-2 font-bold">{d.similarity}%</td>
                    <td className="p-2">{d.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: Examiner Notes & Sign-Off */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-xs border-b border-slate-800 pb-1 print:text-black">
              Section 4: Expert Witness Examiner Certification
            </h4>
            <p className="text-slate-300 leading-relaxed print:text-black">
              {report.notes}
            </p>

            <div className="pt-6 grid grid-cols-2 gap-8">
              <div>
                <div className="border-b border-slate-600 w-3/4 mb-1" />
                <span className="text-slate-400 block text-[10px]">EXAMINER SIGNATURE</span>
                <span className="text-slate-200 font-bold print:text-black">{report.investigator}</span>
                <span className="text-slate-500 block text-[10px]">BADGE: {report.investigator_badge}</span>
              </div>
              <div className="text-right">
                <div className="border-b border-slate-600 w-3/4 ml-auto mb-1" />
                <span className="text-slate-400 block text-[10px]">LABORATORY SEAL & DATE</span>
                <span className="text-slate-200 font-bold print:text-black">OFFICIALLY RECORDED</span>
                <span className="text-slate-500 block text-[10px]">{report.generated_at}</span>
              </div>
            </div>
          </div>

          {/* Mandatory Legal & Ethical Forensic Advisory */}
          <div className="p-3 bg-navy-900 border border-slate-700 text-slate-400 text-[10px] leading-relaxed rounded print:bg-white print:border-black print:text-black">
            {report.legal_advisory}
          </div>
        </div>
      )}
    </div>
  );
};
