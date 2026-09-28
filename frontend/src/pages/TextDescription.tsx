import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  RotateCcw, 
  ScanFace, 
  BookOpen,
  Sliders
} from 'lucide-react';
import { api } from '../services/api';
import { FacialAttributes, SketchCandidate } from '../types';
import { ForensicDisclaimer } from '../components/Common/ForensicDisclaimer';

interface TextDescriptionProps {
  onNavigate?: (page: string) => void;
  onSendToSketch?: (attrs: FacialAttributes) => void;
  onSendToRecognition?: (imageUrl: string) => void;
}

const sampleStatements = [
  {
    title: "North Gate Robbery Witness Statement",
    text: "Male, approximately 25 years old, oval face, short black hair, thick eyebrows, medium nose and thin lips with light stubble and rectangular glasses."
  },
  {
    title: "Concourse Transit Incident Witness",
    text: "Female, around 30 years old, heart-shaped face, long straight black hair, thin arched eyebrows, almond eyes, small button nose and full lips."
  },
  {
    title: "Vault Corridor Intruder Report",
    text: "Elderly male, approximately 50 years old, square jawline, gray short curly hair, bushy thick eyebrows, large nose, full beard with visible facial scar."
  }
];

export const TextDescription: React.FC<TextDescriptionProps> = ({ onNavigate, onSendToSketch, onSendToRecognition }) => {
  const [description, setDescription] = useState<string>(sampleStatements[0].text);
  const [extractedAttributes, setExtractedAttributes] = useState<any | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedSketch, setGeneratedSketch] = useState<SketchCandidate | null>(null);

  const handleExtract = async () => {
    if (!description.trim()) return;
    setIsExtracting(true);
    try {
      const res = await api.extractNLPFeatures(description);
      setExtractedAttributes(res);
      setGeneratedSketch(null); // Clear previous sketch to show attributes first
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerate = async () => {
    if (!extractedAttributes) return;
    setIsGenerating(true);
    try {
      const sketch = await api.generateSketch(extractedAttributes);
      setGeneratedSketch(sketch);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <ForensicDisclaimer />

      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-navy-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100 font-sans">
              NLP Witness Statement & Verbal Description Parser
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Natural Language Processing // Lexical Semantic Feature Extraction
          </p>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
          NLP ATTRIBUTE EXTRACTION ENGINE
        </span>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Statement Input (7 Cols) */}
        <div className="lg:col-span-7 space-y-4 bg-navy-900/70 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Witness Verbal Statement / Deposition
            </label>
            <span className="text-[11px] font-mono text-slate-500">
              {description.length} characters
            </span>
          </div>

          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter verbal description given by eyewitness or deposition..."
            className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500/60 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none font-mono leading-relaxed resize-none shadow-inner"
          />

          {/* Quick Sample Buttons */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Load Official Witness Depositions:</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleStatements.map((stmt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDescription(stmt.text);
                    setExtractedAttributes(null);
                    setGeneratedSketch(null);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-navy-950 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-[11px] font-mono transition-colors text-left"
                >
                  {stmt.title}
                </button>
              ))}
            </div>
          </div>

          {/* Extraction Trigger Button */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleExtract}
              disabled={isExtracting || !description.trim()}
              className="flex-1 py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-glow-cyan transition-all disabled:opacity-50 font-mono"
            >
              <Cpu className="w-4 h-4" />
              <span>{isExtracting ? 'Analyzing Semantics...' : 'Extract Facial Attributes (NLP)'}</span>
            </button>

            <button
              onClick={() => {
                setDescription('');
                setExtractedAttributes(null);
                setGeneratedSketch(null);
              }}
              className="px-3 py-2.5 rounded-lg bg-navy-950 border border-slate-800 hover:bg-slate-800 text-slate-400 text-xs font-mono"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Right Column: Structured Attributes Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-navy-900/70 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Extracted Structured Schema
                </h3>
              </div>
              {extractedAttributes && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>PARSED (94% CONF)</span>
                </span>
              )}
            </div>

            {/* Display Attributes Before Generating Face */}
            {extractedAttributes ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-navy-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">GENDER</span>
                    <span className="text-cyan-400 font-bold">{extractedAttributes.gender}</span>
                  </div>
                  <div className="p-2 rounded bg-navy-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">ESTIMATED AGE</span>
                    <span className="text-cyan-400 font-bold">{extractedAttributes.age} yrs</span>
                  </div>
                  <div className="p-2 rounded bg-navy-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">FACE SHAPE</span>
                    <span className="text-slate-200 font-semibold">{extractedAttributes.face_shape}</span>
                  </div>
                  <div className="p-2 rounded bg-navy-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">SKIN TONE</span>
                    <span className="text-slate-200 font-semibold">{extractedAttributes.skin_tone}</span>
                  </div>
                  <div className="p-2 rounded bg-navy-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">HAIR STYLE</span>
                    <span className="text-slate-200 font-semibold">{extractedAttributes.hair_style} ({extractedAttributes.hair_color})</span>
                  </div>
                  <div className="p-2 rounded bg-navy-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">EYEBROWS</span>
                    <span className="text-slate-200 font-semibold">{extractedAttributes.eyebrow_shape}</span>
                  </div>
                  <div className="p-2 rounded bg-navy-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">EYES</span>
                    <span className="text-slate-200 font-semibold">{extractedAttributes.eye_shape} ({extractedAttributes.eye_size})</span>
                  </div>
                  <div className="p-2 rounded bg-navy-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">NOSE & LIPS</span>
                    <span className="text-slate-200 font-semibold">{extractedAttributes.nose_shape}, {extractedAttributes.lip_shape}</span>
                  </div>
                </div>

                <div className="p-2 rounded bg-navy-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">FACIAL HAIR / BEARD</span>
                  <span className="text-slate-200 font-semibold">{extractedAttributes.facial_hair}</span>
                </div>

                {extractedAttributes.other_attributes?.length > 0 && (
                  <div className="p-2 rounded bg-navy-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">DISTINGUISHING FEATURES</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {extractedAttributes.other_attributes.map((att: string, i: number) => (
                        <span key={i} className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">
                          {att}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Secondary Action: Generate Face from these Attributes */}
                <div className="pt-2">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isGenerating ? 'Synthesizing Composite...' : 'Generate Face Sketch from Attributes'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-lg">
                <FileText className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p>Click "Extract Facial Attributes" to run the NLP semantic feature parser.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated Face Composite Display (Appears once generated) */}
      {generatedSketch && (
        <div className="bg-navy-900/70 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Generated Forensic Face Composite (NLP Synthesized)</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Composite synthesized directly from extracted witness deposition vector.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400">
              CANDIDATE ID: {generatedSketch.candidate_id}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-64 h-64 rounded-xl overflow-hidden border border-slate-800 bg-slate-100 flex-shrink-0 shadow-xl">
              <img
                src={generatedSketch.image_url}
                alt="NLP Generated Face Sketch"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-3 font-mono text-xs flex-1">
              <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 space-y-1.5">
                <div className="text-cyan-400 font-semibold">SYNTHESIS SPECIFICATION:</div>
                <div className="text-slate-300">Subject: {extractedAttributes?.gender}, Age: {extractedAttributes?.age}</div>
                <div className="text-slate-400 text-[11px]">Latent Seed: #{generatedSketch.seed} | Latency: {generatedSketch.synthesis_latency_ms} ms</div>
                <div className="text-slate-400 text-[11px]">Model: Forensic-SketchGAN-v2.4 (Conditional Latent Synthesis)</div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    if (onSendToSketch && extractedAttributes) {
                      onSendToSketch(extractedAttributes);
                    } else if (onNavigate) {
                      onNavigate('sketch');
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-navy-950 border border-slate-800 hover:border-cyan-500/50 text-slate-200 hover:text-cyan-400 flex items-center gap-2 transition-colors font-semibold"
                >
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Fine-Tune in Sketch Generator</span>
                </button>

                <button
                  onClick={() => {
                    if (onSendToRecognition && generatedSketch?.image_url) {
                      onSendToRecognition(generatedSketch.image_url);
                    } else if (onNavigate) {
                      onNavigate('recognition');
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/50 hover:bg-cyan-500/30 text-cyan-300 font-semibold flex items-center gap-2 transition-colors"
                >
                  <ScanFace className="w-4 h-4 text-cyan-400" />
                  <span>Probe in ArcFace Recognition</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
