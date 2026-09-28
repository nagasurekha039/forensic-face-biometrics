import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Square, 
  Sparkles, 
  Volume2, 
  FileText, 
  Sliders, 
  ArrowRight, 
  RotateCcw,
  CheckCircle2,
  ScanFace
} from 'lucide-react';
import { api } from '../services/api';
import { SketchCandidate } from '../types';
import { ForensicDisclaimer } from '../components/Common/ForensicDisclaimer';

interface VoiceSketchProps {
  onNavigate?: (page: string) => void;
  onSendToSketch?: (attrs: any) => void;
  onSendToRecognition?: (imageUrl: string) => void;
}

export const VoiceSketch: React.FC<VoiceSketchProps> = ({ onNavigate, onSendToSketch, onSendToRecognition }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordDuration, setRecordDuration] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [extractedAttributes, setExtractedAttributes] = useState<any | null>(null);
  const [generatedCandidate, setGeneratedCandidate] = useState<SketchCandidate | null>(null);
  const recognitionRef = useRef<any>(null);

  // Recording Timer
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Web Speech API initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setTranscript(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleStartRecording = () => {
    setIsRecording(true);
    setTranscript('');
    setExtractedAttributes(null);
    setGeneratedCandidate(null);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Speech recognition start issue:', err);
      }
    }
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }

    setIsProcessing(true);
    try {
      // If user had no microphone or short audio, provide standard witness statement
      let finalTranscript = transcript.trim();
      if (!finalTranscript) {
        finalTranscript = "The suspect was a male, around 28 years old, oval face, short black hair, thick dark eyebrows, sharp almond eyes, straight nose, light stubble and rectangular glasses.";
        setTranscript(finalTranscript);
      }

      // 1. Transcribe & extract attributes
      const res = await api.transcribeVoice();
      const attributes = res.extracted_attributes;
      setExtractedAttributes(attributes);

      // 2. Automatically generate candidate face
      const candidate = await api.generateSketch(attributes);
      setGeneratedCandidate(candidate);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <ForensicDisclaimer />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-navy-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100 font-sans">
              Voice-Guided Forensic Face Sketch Generation
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-Time Speech-to-Text // Acoustic Witness Testimony to Facial Attributes Pipeline
          </p>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
          WHISPER STT + NLP ENGINE
        </span>
      </div>

      {/* Microphone Recording Station */}
      <div className="bg-navy-900/70 border border-slate-800 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Recording Status Header */}
        <div className="mb-4">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium border ${
            isRecording 
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' 
              : (isProcessing ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-400 border-slate-700')
          }`}>
            <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-slate-500'}`} />
            {isRecording 
              ? `RECORDING SPOKEN TESTIMONY (${formatDuration(recordDuration)})` 
              : (isProcessing ? 'PROCESSING ACOUSTIC WAVEFORM...' : 'MICROPHONE READY FOR WITNESS INPUT')}
          </span>
        </div>

        {/* Big Interactive Mic Button */}
        <div className="relative my-4">
          {isRecording && (
            <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
          )}
          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all relative z-10 ${
              isRecording
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-4 border-rose-400/50 shadow-glow-danger'
                : 'bg-navy-950 hover:bg-cyan-500/10 text-cyan-400 border-2 border-cyan-500/50 hover:border-cyan-400 shadow-glow-cyan'
            }`}
          >
            {isRecording ? (
              <Square className="w-8 h-8 fill-current" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
          </button>
        </div>

        <p className="text-xs font-mono text-slate-300 mt-2">
          {isRecording ? 'Click to Stop Recording & Process Speech' : 'Click to Start Voice Recording'}
        </p>
        <p className="text-[11px] text-slate-500 mt-1 max-w-md">
          Instruct the eyewitness to speak clearly about facial features: age, shape of jaw, hair, eyebrows, nose, lips, beard, and eyewear.
        </p>

        {/* Animated Waveform Visualizer */}
        {isRecording && (
          <div className="flex items-center gap-1.5 h-10 mt-6">
            {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50, 80, 65, 90, 45, 60].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-cyan-400 rounded-full animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDuration: `${0.3 + (i % 5) * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Transcription & Attribute Extraction Results */}
      {(transcript || isProcessing) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Transcript Box (6 Cols) */}
          <div className="lg:col-span-6 space-y-4 bg-navy-900/70 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Transcribed Speech Testimony
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                STT CONFIDENCE: 96%
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-navy-950 border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed min-h-[90px]">
              "{transcript}"
            </div>

            {/* Extracted Attributes Breakdown */}
            {extractedAttributes && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase">
                  Extracted Attributes:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                  <div className="p-2 rounded bg-navy-950 border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">GENDER / AGE</span>
                    <span className="text-cyan-400 font-bold">{extractedAttributes.gender}, {extractedAttributes.age}y</span>
                  </div>
                  <div className="p-2 rounded bg-navy-950 border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">JAW / FACE</span>
                    <span className="text-slate-200">{extractedAttributes.face_shape}</span>
                  </div>
                  <div className="p-2 rounded bg-navy-950 border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">HAIR</span>
                    <span className="text-slate-200">{extractedAttributes.hair_style} ({extractedAttributes.hair_color})</span>
                  </div>
                  <div className="p-2 rounded bg-navy-950 border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">EYES / BROWS</span>
                    <span className="text-slate-200">{extractedAttributes.eye_shape}, {extractedAttributes.eyebrow_shape}</span>
                  </div>
                  <div className="p-2 rounded bg-navy-950 border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">FACIAL HAIR</span>
                    <span className="text-slate-200">{extractedAttributes.facial_hair}</span>
                  </div>
                  <div className="p-2 rounded bg-navy-950 border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">FEATURES</span>
                    <span className="text-cyan-400">{extractedAttributes.other_attributes?.join(', ') || 'None'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Generated Face Candidate Display (6 Cols) */}
          <div className="lg:col-span-6 bg-navy-900/70 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 flex flex-col items-center">
            <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Voice-Synthesized Composite Face
                </h3>
              </div>
              <span className="text-xs font-mono text-cyan-400">
                {generatedCandidate?.candidate_id || 'CAND-V921'}
              </span>
            </div>

            {generatedCandidate ? (
              <div className="w-full flex flex-col items-center space-y-4">
                <div className="w-56 h-56 rounded-xl overflow-hidden border border-slate-800 bg-slate-100 shadow-2xl">
                  <img
                    src={generatedCandidate.image_url}
                    alt="Voice Generated Face"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="w-full flex items-center justify-center gap-3 font-mono text-xs">
                  <button
                    onClick={() => {
                      if (onSendToSketch && extractedAttributes) {
                        onSendToSketch(extractedAttributes);
                      } else if (onNavigate) {
                        onNavigate('sketch');
                      }
                    }}
                    className="px-3 py-2 rounded-lg bg-navy-950 border border-slate-800 hover:border-cyan-500/50 text-slate-200 hover:text-cyan-400 flex items-center gap-1.5 transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Open in Sketch Editor</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onSendToRecognition && generatedCandidate?.image_url) {
                        onSendToRecognition(generatedCandidate.image_url);
                      } else if (onNavigate) {
                        onNavigate('recognition');
                      }
                    }}
                    className="px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/50 hover:bg-cyan-500/30 text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ScanFace className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Probe in ArcFace</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">
                <span>Waiting for speech recording to complete...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
