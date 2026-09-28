import React, { useState } from 'react';
import { 
  Palette, 
  Sparkles, 
  RotateCcw, 
  Save, 
  Sliders, 
  Layers, 
  Grid, 
  Download, 
  ScanFace, 
  FileSpreadsheet, 
  Box, 
  Clock, 
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { FacialAttributes, SketchCandidate } from '../types';
import { api } from '../services/api';
import { FaceMeshViewer } from '../components/3D/FaceMeshViewer';
import { ForensicDisclaimer } from '../components/Common/ForensicDisclaimer';

interface SketchGeneratorProps {
  onNavigate?: (page: string) => void;
  onSendToRecognition?: (imageUrl: string) => void;
  initialAttributes?: FacialAttributes;
}

const defaultAttributes: FacialAttributes = {
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
  facial_hair: 'None',
  beard: 'None',
  moustache: 'None',
  other_attributes: [],
};

export const SketchGenerator: React.FC<SketchGeneratorProps> = ({ onNavigate, onSendToRecognition, initialAttributes }) => {
  const [attributes, setAttributes] = useState<FacialAttributes>(() => initialAttributes || defaultAttributes);
  const [currentCandidate, setCurrentCandidate] = useState<SketchCandidate | null>(() => {
    // Generate initial sketch candidate
    const seed = 42;
    return {
      candidate_id: 'CAND-9821A',
      seed,
      image_url: '',
      attributes: initialAttributes || defaultAttributes,
      candidate_label: 'Candidate Primary Reference',
      is_simulated: true,
      status_label: 'DEMO / SIMULATED RESULT - Parametric Forensic Synthesis',
    };
  });
  const [candidatesGrid, setCandidatesGrid] = useState<SketchCandidate[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'2d' | '3d' | 'aging'>('2d');
  const [targetAge, setTargetAge] = useState<number>(initialAttributes?.age || 28);
  const [agingResult, setAgingResult] = useState<any>(null);
  const [savedCandidates, setSavedCandidates] = useState<SketchCandidate[]>([]);
  const [saveToast, setSaveToast] = useState(false);

  // Initialize or update sketch if initialAttributes change
  React.useEffect(() => {
    if (initialAttributes) {
      setAttributes(initialAttributes);
      setTargetAge(initialAttributes.age);
      api.generateSketch(initialAttributes).then((cand) => {
        setCurrentCandidate(cand);
        setAgingResult(null);
      });
    } else if (!currentCandidate?.image_url) {
      handleGenerateSingle();
    }
  }, [initialAttributes]);

  const handleChange = (field: keyof FacialAttributes, value: any) => {
    setAttributes((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleAttribute = (attr: string) => {
    setAttributes((prev) => {
      const exists = prev.other_attributes.includes(attr);
      return {
        ...prev,
        other_attributes: exists 
          ? prev.other_attributes.filter(a => a !== attr)
          : [...prev.other_attributes, attr]
      };
    });
  };

  const handleGenerateSingle = async () => {
    setIsGenerating(true);
    try {
      const candidate = await api.generateSketch(attributes);
      setCurrentCandidate(candidate);
      setTargetAge(attributes.age);
      setAgingResult(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateMultiple = async () => {
    setIsGenerating(true);
    try {
      const result = await api.generateCandidates(attributes, 4);
      setCandidatesGrid(result.candidates);
      if (result.candidates.length > 0) {
        setCurrentCandidate(result.candidates[0]);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setAttributes(defaultAttributes);
    setTargetAge(28);
    setAgingResult(null);
  };

  const handleSave = () => {
    if (currentCandidate) {
      setSavedCandidates((prev) => [currentCandidate, ...prev]);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    }
  };

  const handleAgeMorph = async (newAge: number) => {
    setTargetAge(newAge);
    const result = await api.morphAge(attributes.age, newAge, attributes);
    setAgingResult(result);
  };

  return (
    <div className="space-y-6">
      <ForensicDisclaimer />

      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-navy-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100 tracking-wide font-sans">
              AI Forensic Face Sketch Generator & Latent Synthesis
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Parametric Facial Synthesis // StyleGAN2 Latent Neighborhood Exploration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300">
            DEMO / SIMULATED GAN ENGINE
          </span>
        </div>
      </div>

      {saveToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500/90 text-white px-4 py-2.5 rounded-lg shadow-xl font-mono text-xs flex items-center gap-2 animate-bounce">
          <UserCheck className="w-4 h-4" />
          <span>Candidate saved to forensic case evidence repository!</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Attribute Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-5 bg-navy-900/70 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Witness Parametric Controls
              </h3>
            </div>
            <button
              onClick={handleReset}
              className="px-2.5 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All
            </button>
          </div>

          {/* Form Control Groups */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* 1. Appearance / Gender */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold font-mono text-[11px]">Gender Category</label>
              <select
                value={attributes.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500/60 rounded-lg px-3 py-2 text-slate-200 focus:outline-none font-mono"
              >
                <option value="Male">Male Subject</option>
                <option value="Female">Female Subject</option>
              </select>
            </div>

            {/* 2. Approximate Age Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-slate-300 font-semibold font-mono text-[11px]">Approximate Age</label>
                <span className="font-mono text-cyan-400 font-bold">{attributes.age} yrs</span>
              </div>
              <input
                type="range"
                min="14"
                max="85"
                value={attributes.age}
                onChange={(e) => handleChange('age', parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* 3. Face Shape */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold font-mono text-[11px]">Face / Jawline Shape</label>
              <select
                value={attributes.face_shape}
                onChange={(e) => handleChange('face_shape', e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500/60 rounded-lg px-3 py-2 text-slate-200 focus:outline-none font-mono"
              >
                <option value="Oval">Oval (Standard Balanced)</option>
                <option value="Square">Square (Angular Mandible)</option>
                <option value="Round">Round (Curved Contours)</option>
                <option value="Heart">Heart (Pointed Chin)</option>
                <option value="Oblong">Oblong (Elongated Vertical)</option>
              </select>
            </div>

            {/* 4. Skin Tone */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold font-mono text-[11px]">Skin Tone Category</label>
              <select
                value={attributes.skin_tone}
                onChange={(e) => handleChange('skin_tone', e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500/60 rounded-lg px-3 py-2 text-slate-200 focus:outline-none font-mono"
              >
                <option value="Fair">Fair / Pale (Type I-II)</option>
                <option value="Medium">Medium / Olive (Type III)</option>
                <option value="Tan">Tan / Wheatish (Type IV)</option>
                <option value="Dark">Dark / Deep (Type V-VI)</option>
              </select>
            </div>

            {/* 5. Hair Style */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold font-mono text-[11px]">Hair Style</label>
              <select
                value={attributes.hair_style}
                onChange={(e) => handleChange('hair_style', e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500/60 rounded-lg px-3 py-2 text-slate-200 focus:outline-none font-mono"
              >
                <option value="Short">Short Crop / Textured</option>
                <option value="Buzzcut">Buzzcut / Military</option>
                <option value="Curly">Curly / Coiled</option>
                <option value="Straight">Straight / Classic</option>
                <option value="Long">Long Flowing</option>
                <option value="Bald">Bald / Shaved Head</option>
              </select>
            </div>

            {/* 6. Hair Color */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold font-mono text-[11px]">Hair Color</label>
              <select
                value={attributes.hair_color}
                onChange={(e) => handleChange('hair_color', e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500/60 rounded-lg px-3 py-2 text-slate-200 focus:outline-none font-mono"
              >
                <option value="Black">Natural Black</option>
                <option value="Dark Brown">Dark Brown</option>
                <option value="Blonde">Blonde / Fair</option>
                <option value="Gray">Gray / Silver</option>
                <option value="Salt & Pepper">Salt & Pepper</option>
              </select>
            </div>

            {/* 7. Eyebrow Shape */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold font-mono text-[11px]">Eyebrow Density & Shape</label>
              <select
                value={attributes.eyebrow_shape}
                onChange={(e) => handleChange('eyebrow_shape', e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500/60 rounded-lg px-3 py-2 text-slate-200 focus:outline-none font-mono"
              >
                <option value="Thick">Thick / Heavy Density</option>
                <option value="Thin">Thin / Sparse</option>
                <option value="Arched">High Arched</option>
                <option value="Straight">Straight Horizontal</option>
              </select>
            </div>

            {/* 8. Eye Shape & Size */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold font-mono text-[11px]">Eye Shape</label>
              <select
                value={attributes.eye_shape}
                onChange={(e) => handleChange('eye_shape', e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500/60 rounded-lg px-3 py-2 text-slate-200 focus:outline-none font-mono"
              >
                <option value="Almond">Almond (Standard)</option>
                <option value="Round">Round / Prominent</option>
                <option value="Hooded">Hooded / Deep Sockets</option>
              </select>
            </div>

            {/* 9. Eye Size */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold font-mono text-[11px]">Eye Aperture Size</label>
              <select
                value={attributes.eye_size}
                onChange={(e) => handleChange('eye_size', e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500/60 rounded-lg px-3 py-2 text-slate-200 focus:outline-none font-mono"
              >
                <option value="Small">Small / Narrow</option>
                <option value="Medium">Medium Proportion</option>
                <option value="Large">Large / Wide Open</option>
              </select>
            </div>

            {/* 10. Nose Shape & Size */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold font-mono text-[11px]">Nose Ridge & Tip</label>
              <select
                value={attributes.nose_shape}
                onChange={(e) => handleChange('nose_shape', e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500/60 rounded-lg px-3 py-2 text-slate-200 focus:outline-none font-mono"
              >
                <option value="Straight">Straight Dorsum</option>
                <option value="Aquiline">Aquiline / Hooked</option>
                <option value="Button">Button / Upturned</option>
                <option value="Wide">Broad / Wide Alar</option>
              </select>
            </div>

            {/* 11. Lip Shape */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold font-mono text-[11px]">Lip Contour</label>
              <select
                value={attributes.lip_shape}
                onChange={(e) => handleChange('lip_shape', e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500/60 rounded-lg px-3 py-2 text-slate-200 focus:outline-none font-mono"
              >
                <option value="Medium">Medium Proportion</option>
                <option value="Thin">Thin Lips</option>
                <option value="Full">Full / Plump</option>
              </select>
            </div>

            {/* 12. Facial Hair / Beard */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold font-mono text-[11px]">Beard / Stubble</label>
              <select
                value={attributes.beard}
                onChange={(e) => {
                  handleChange('beard', e.target.value);
                  handleChange('facial_hair', e.target.value);
                }}
                className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500/60 rounded-lg px-3 py-2 text-slate-200 focus:outline-none font-mono"
              >
                <option value="None">None (Clean Shaven)</option>
                <option value="Stubble">5 o'clock Stubble Shadow</option>
                <option value="Thick">Full Thick Beard</option>
                <option value="Goatee">Goatee / Chin Beard</option>
              </select>
            </div>

            {/* 13. Moustache */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold font-mono text-[11px]">Moustache</label>
              <select
                value={attributes.moustache}
                onChange={(e) => handleChange('moustache', e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500/60 rounded-lg px-3 py-2 text-slate-200 focus:outline-none font-mono"
              >
                <option value="None">None</option>
                <option value="Trimmed">Trimmed Moustache</option>
                <option value="Thick">Thick Walrus / Handlebar</option>
              </select>
            </div>
          </div>

          {/* Distinguishing Marks / Accessories */}
          <div className="pt-2 border-t border-slate-800/80">
            <label className="text-slate-300 font-semibold font-mono text-[11px] block mb-2">
              Distinguishing Forensic Features & Eyewear
            </label>
            <div className="flex flex-wrap gap-2">
              {['Glasses', 'Facial Scar', 'Mole on Cheek', 'Facial Tattoo', 'Pronounced Wrinkles'].map((attr) => {
                const active = attributes.other_attributes.includes(attr);
                return (
                  <button
                    key={attr}
                    type="button"
                    onClick={() => handleToggleAttribute(attr)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                      active
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-glow-cyan'
                        : 'bg-navy-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {active ? '✓ ' : '+ '} {attr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-3">
            <button
              onClick={handleGenerateSingle}
              disabled={isGenerating}
              className="flex-1 min-w-[170px] px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-glow-cyan transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Synthesizing GAN...' : 'Generate Candidate'}</span>
            </button>

            <button
              onClick={handleGenerateMultiple}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-lg bg-navy-950 border border-cyan-500/40 hover:bg-cyan-500/10 text-cyan-300 font-semibold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Grid className="w-4 h-4" />
              <span>Generate Multiple Candidates (4x)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Forensic Canvas & Tools (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* View Mode Tabs */}
          <div className="flex items-center gap-1 bg-navy-900/80 p-1 rounded-lg border border-slate-800 font-mono text-xs">
            <button
              onClick={() => setActiveTab('2d')}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                activeTab === '2d' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>2D Forensic Sketch</span>
            </button>
            <button
              onClick={() => setActiveTab('3d')}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                activeTab === '3d' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Mesh</span>
            </button>
            <button
              onClick={() => setActiveTab('aging')}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'aging' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Age Progression</span>
            </button>
          </div>

          {/* TAB 1: 2D Composite Display */}
          {activeTab === '2d' && (
            <div className="bg-navy-900/70 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-3 text-xs font-mono">
                <span className="text-slate-400">
                  REF: <strong className="text-cyan-400">{currentCandidate?.candidate_id || 'CAND-9821A'}</strong>
                </span>
                <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                  LATENT SEED #{currentCandidate?.seed || 42}
                </span>
              </div>

              {/* High-Resolution Forensic Canvas */}
              <div className="relative w-full aspect-square max-w-[360px] rounded-lg overflow-hidden border border-slate-800 shadow-2xl bg-slate-100 flex items-center justify-center">
                {currentCandidate?.image_url ? (
                  <img
                    src={currentCandidate.image_url}
                    alt="Forensic Face Sketch"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 text-xs">
                    <Sparkles className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
                    <span>Rendering forensic latent vector...</span>
                  </div>
                )}

                {/* Corner Forensic Reticle Markers */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-slate-600 pointer-events-none" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-slate-600 pointer-events-none" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-slate-600 pointer-events-none" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-slate-600 pointer-events-none" />
              </div>

              {/* Action Buttons for Selected Candidate */}
              <div className="w-full mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  onClick={handleSave}
                  className="px-3 py-2 rounded-lg bg-navy-950 border border-slate-800 hover:border-cyan-500/50 text-slate-200 hover:text-cyan-400 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Candidate</span>
                </button>

                <button
                  onClick={() => {
                    if (onSendToRecognition && currentCandidate) {
                      onSendToRecognition(currentCandidate.image_url);
                    } else if (onNavigate) {
                      onNavigate('recognition');
                    }
                  }}
                  className="px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/50 hover:bg-cyan-500/30 text-cyan-300 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ScanFace className="w-3.5 h-3.5" />
                  <span>Probe in ArcFace</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: 3D Face Wireframe Reconstruction */}
          {activeTab === '3d' && (
            <FaceMeshViewer />
          )}

          {/* TAB 3: Age Progression / Regression */}
          {activeTab === 'aging' && (
            <div className="bg-navy-900/70 border border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-200">
                    Craniofacial Morphological Aging
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                  MORPHO-GAN
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Baseline: {attributes.age} yrs</span>
                  <span className="text-cyan-400 font-bold">Morphed Age: {targetAge} yrs</span>
                  <span className="text-amber-400">
                    Delta: {targetAge >= attributes.age ? `+${targetAge - attributes.age}` : targetAge - attributes.age} yrs
                  </span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="80"
                  value={targetAge}
                  onChange={(e) => handleAgeMorph(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="w-full aspect-square max-w-[280px] mx-auto rounded-lg overflow-hidden border border-slate-800 bg-slate-100">
                <img
                  src={agingResult?.morphed_image_url || currentCandidate?.image_url}
                  alt="Age Morphed Face"
                  className="w-full h-full object-contain"
                />
              </div>

              {agingResult?.aging_indicators && (
                <div className="bg-navy-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1 text-slate-400">
                  <span className="text-slate-300 font-semibold block text-[10px] uppercase tracking-wider text-cyan-400">
                    Morphological Indicators:
                  </span>
                  {agingResult.aging_indicators.map((ind: string, i: number) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-cyan-400" />
                      <span>{ind}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Multiple Candidates Grid Section */}
      {candidatesGrid.length > 0 && (
        <div className="bg-navy-900/70 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Grid className="w-4 h-4 text-cyan-400" />
                <span>Multi-Candidate Latent Space Exploration (Witness Cross-Selection)</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Click any variant candidate to set as active primary investigation reference.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400">
              {candidatesGrid.length} Candidates Generated
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {candidatesGrid.map((cand, idx) => {
              const isSelected = currentCandidate?.candidate_id === cand.candidate_id;
              return (
                <div
                  key={cand.candidate_id}
                  onClick={() => setCurrentCandidate(cand)}
                  className={`cursor-pointer rounded-xl p-2.5 bg-navy-950 border transition-all ${
                    isSelected
                      ? 'border-cyan-400 shadow-glow-cyan bg-cyan-500/5'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="w-full aspect-square rounded-lg overflow-hidden border border-slate-800/80 bg-slate-100 mb-2">
                    <img
                      src={cand.image_url}
                      alt={cand.candidate_label}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="font-semibold text-slate-200">{cand.candidate_label}</span>
                    <span className="text-[10px] text-cyan-400">#{cand.seed % 1000}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
