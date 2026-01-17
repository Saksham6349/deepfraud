import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertOctagon, AlertTriangle, FileVideo, FileAudio, FileImage, FileText, RefreshCw, Loader2, ScanEye, Shield, Fingerprint, ChevronDown, ChevronUp, UserCheck, UserX, Cpu, Terminal, Activity, Eye } from 'lucide-react';
import { analyzeMedia } from '../services/geminiService';
import { AnalysisResult, RiskLevel } from '../types';
import { api } from '../services/api';

const AnalysisLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'audio' | 'video' | 'text'>('image');
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showLiveness, setShowLiveness] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (selectedFile: File) => {
    // Auto-detect media type and switch tab
    if (selectedFile.type.startsWith('image/')) {
      setActiveTab('image');
    } else if (selectedFile.type.startsWith('audio/')) {
      setActiveTab('audio');
    } else if (selectedFile.type.startsWith('video/')) {
      setActiveTab('video');
    } else if (selectedFile.type === 'text/plain') {
        // Optional: Could handle text file uploads here, but for now we rely on pasted text
        // setActiveTab('text');
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setResult(null);
    setShowLiveness(false);
    setTextInput('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    const input = activeTab === 'text' ? textInput : file;
    if (!input) return;

    setIsAnalyzing(true);
    try {
      const data = await analyzeMedia(input, activeTab);
      
      const resultWithMeta: AnalysisResult = {
        ...data,
        fileName: activeTab === 'text' ? 'Text Snippet' : file?.name
      };

      // Simulate a small scanning delay for UX if the API is too fast
      if (Date.now() % 2 === 0) await new Promise(r => setTimeout(r, 800));

      setResult(resultWithMeta);
      setShowLiveness(true); 

      // Save to Backend
      try {
        await api.records.create(resultWithMeta);
      } catch (e) {
        console.error("Failed to save record to backend", e);
      }

    } catch (err) {
      console.error(err);
      alert("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setTextInput('');
    setPreviewUrl(null);
    setResult(null);
    setShowLiveness(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.CRITICAL: return 'text-rose-500 border-rose-500 bg-rose-950';
      case RiskLevel.HIGH: return 'text-orange-500 border-orange-500 bg-orange-950';
      case RiskLevel.MEDIUM: return 'text-amber-400 border-amber-400 bg-amber-950';
      default: return 'text-emerald-500 border-emerald-500 bg-emerald-950';
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in">
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
            <h2 className="text-xl font-bold text-white font-mono tracking-tight flex items-center gap-2">
                <ScanEye className="text-emerald-500 w-6 h-6" />
                FORENSIC LAB <span className="text-slate-600">//</span> ANALYSIS
            </h2>
        </div>
        
        <div className="flex bg-slate-900/50 p-1 rounded border border-slate-700/50">
          {(['image', 'audio', 'video', 'text'] as const).map((type) => (
            <button
              key={type}
              onClick={() => { setActiveTab(type); resetAnalysis(); }}
              className={`px-4 py-1.5 rounded text-xs font-mono font-bold uppercase transition-all ${
                activeTab === type 
                ? 'bg-slate-700 text-white shadow-sm border border-slate-600' 
                : 'text-slate-500 hover:text-slate-300'
              } flex items-center gap-2`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        {/* Source Panel */}
        <div className="glass-panel p-1 rounded-sm tech-border flex flex-col h-full relative group">
          <div className="absolute top-0 right-0 bg-slate-800/80 px-2 py-1 text-[10px] font-mono text-slate-400 rounded-bl border-b border-l border-slate-700 z-20">
              INPUT_STREAM_01
          </div>

          <div className="flex-1 bg-slate-950/50 m-1 rounded overflow-hidden relative flex flex-col">
            {activeTab === 'text' ? (
                <div className="relative w-full h-full flex flex-col">
                     <div className="bg-slate-900 px-4 py-2 flex items-center gap-2 border-b border-slate-800">
                        <Terminal className="w-4 h-4 text-slate-500" />
                        <span className="text-xs text-slate-400 font-mono">text_buffer.txt</span>
                     </div>
                     <textarea 
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="// Paste content for pattern analysis..."
                        className="flex-1 w-full bg-slate-950 p-6 text-slate-300 placeholder:text-slate-700 focus:outline-none font-mono text-sm leading-relaxed resize-none selection:bg-emerald-900/50"
                        spellCheck={false}
                    />
                    {isAnalyzing && (
                        <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none z-10">
                            <div className="w-full h-1 bg-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-scan"></div>
                        </div>
                    )}
                </div>
            ) : (
                <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className="flex-1 relative flex flex-col items-center justify-center min-h-[300px]"
                >
                    {/* Grid Overlay for realism */}
                    <div className="absolute inset-0 pointer-events-none opacity-20" 
                         style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    </div>

                    {!previewUrl ? (
                    <div className="text-center p-8 z-10 transition-all duration-300 opacity-80 hover:opacity-100">
                        <div className={`w-20 h-20 border border-slate-700 bg-slate-900/50 flex items-center justify-center mx-auto mb-6 transition-all duration-300 ${
                        isDragging ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : ''
                        }`}>
                            <div className="w-16 h-16 border border-dashed border-slate-600 flex items-center justify-center">
                                <UploadCloud className={`w-8 h-8 transition-colors ${isDragging ? 'text-emerald-500' : 'text-slate-500'}`} />
                            </div>
                        </div>
                        <p className="font-mono text-xs text-slate-400 uppercase tracking-widest mb-2">
                            Awaiting Media Input
                        </p>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-mono uppercase tracking-wider transition-colors"
                        >
                        [ Select Source ]
                        </button>
                    </div>
                    ) : (
                    <div className="relative w-full h-full flex items-center justify-center bg-black/80">
                         {/* Scanning Overlay */}
                         {isAnalyzing && (
                            <div className="absolute inset-0 z-20 pointer-events-none">
                                <div className="absolute top-4 left-4 text-emerald-500 font-mono text-xs animate-pulse">ANALYZING FRAME...</div>
                                <div className="w-full h-0.5 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-scan absolute top-0"></div>
                                <div className="absolute inset-0 border-2 border-emerald-500/30"></div>
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500"></div>
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500"></div>
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500"></div>
                            </div>
                        )}

                        {activeTab === 'image' && <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />}
                        {activeTab === 'video' && <video src={previewUrl} controls className="max-h-full max-w-full" />}
                        {activeTab === 'audio' && (
                        <div className="w-full h-full flex items-center justify-center bg-slate-900 relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center opacity-20 gap-1">
                                {[...Array(20)].map((_,i) => (
                                    <div key={i} className="w-2 bg-emerald-500 animate-pulse" style={{ height: `${Math.random() * 60 + 20}%`, animationDelay: `${i * 0.05}s` }}></div>
                                ))}
                            </div>
                            <audio src={previewUrl} controls className="relative z-10 w-2/3" />
                        </div>
                        )}
                        
                        {!isAnalyzing && (
                             <button 
                                onClick={resetAnalysis}
                                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/90 text-white rounded border border-slate-600 transition-all z-30"
                             >
                                <RefreshCw className="w-4 h-4" />
                             </button>
                        )}
                    </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,audio/*,video/*" />
                </div>
            )}
          </div>
          
          <div className="p-3 bg-slate-900/50 border-t border-slate-800">
             <button
              onClick={handleAnalyze}
              disabled={(activeTab !== 'text' && !file) || (activeTab === 'text' && !textInput.trim()) || isAnalyzing}
              className={`w-full py-3 font-bold font-mono text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-3 relative overflow-hidden ${
                (activeTab !== 'text' && !file) || (activeTab === 'text' && !textInput.trim()) || isAnalyzing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {activeTab === 'video' ? 'Video processing may take longer...' : 'PROCESSING_ARTIFACT'}
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  INITIATE_SCAN
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="glass-panel p-1 rounded-sm tech-border flex flex-col h-full overflow-hidden">
          <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
             <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Analysis_Output_Log</span>
             {result && <span className="text-[10px] font-mono text-slate-500">{result.timestamp}</span>}
          </div>

          {!result ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 font-mono">
               <div className="w-16 h-16 border border-slate-800 rounded-full flex items-center justify-center mb-4 relative">
                  <div className="absolute inset-0 rounded-full border border-slate-800 animate-ping opacity-20"></div>
                  <Activity className="w-8 h-8 opacity-20" />
               </div>
               <p className="text-xs uppercase tracking-widest">System Ready</p>
               <p className="text-[10px] text-slate-700 mt-2">Waiting for data stream...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto bg-slate-950/20">
              {/* Verdict Header */}
              <div className="p-6 pb-2">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Authenticity Verdict</span>
                    <div className={`px-2 py-0.5 rounded border ${getRiskColor(result.riskLevel)} bg-opacity-20`}>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest">{result.riskLevel} RISK</span>
                    </div>
                 </div>
                 <div className={`text-4xl md:text-5xl font-bold tracking-tighter ${
                        result.verdict === 'FAKE' ? 'text-rose-500' : result.verdict === 'SUSPICIOUS' ? 'text-amber-500' : 'text-emerald-500'
                    } flex items-center gap-3`}>
                     {result.verdict}
                     <span className="text-lg opacity-40 font-mono font-normal tracking-normal">// {result.score}%</span>
                 </div>
              </div>

              {/* Gauges Grid */}
              <div className="grid grid-cols-2 gap-4 px-6 py-4">
                 
                 {/* High-Fi Fraud Probability Gauge */}
                 <div className="bg-slate-900/40 border border-slate-800 p-4 rounded relative overflow-hidden">
                    <div className="text-[10px] font-mono text-slate-500 uppercase mb-3 flex items-center gap-2">
                        <AlertOctagon className="w-3 h-3" /> Fraud Probability
                    </div>
                    <div className="relative flex justify-center py-2">
                        {/* Custom Segmented Gauge */}
                        <svg className="w-36 h-20 overflow-visible">
                            <defs>
                                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#10b981" />
                                    <stop offset="50%" stopColor="#f59e0b" />
                                    <stop offset="100%" stopColor="#f43f5e" />
                                </linearGradient>
                            </defs>
                            {/* Background Track */}
                            <path d="M 10 70 A 58 58 0 0 1 126 70" fill="none" stroke="#1e293b" strokeWidth="12" strokeLinecap="butt" />
                            {/* Ticks */}
                            <path d="M 10 70 A 58 58 0 0 1 126 70" fill="none" stroke="#020617" strokeWidth="2" strokeDasharray="2 4" strokeLinecap="butt" className="opacity-50" />
                            
                            {/* Value Arc */}
                            <path 
                                d="M 10 70 A 58 58 0 0 1 126 70" 
                                fill="none" 
                                stroke="url(#gaugeGradient)" 
                                strokeWidth="12" 
                                strokeLinecap="butt"
                                strokeDasharray="182"
                                strokeDashoffset={182 - (182 * result.score) / 100}
                                className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                            />
                        </svg>
                        <div className="absolute bottom-0 text-center transform translate-y-1">
                            <span className="text-3xl font-bold text-white block -mt-8 font-mono tracking-tight">{result.score}<span className="text-sm text-slate-500">%</span></span>
                        </div>
                    </div>
                 </div>

                 {/* High-Fi Liveness Scanner */}
                 <div className="bg-slate-900/40 border border-slate-800 p-4 rounded relative overflow-hidden flex flex-col items-center">
                    <div className="w-full flex justify-between items-start mb-2 z-10">
                        <div className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-2">
                             <Eye className="w-3 h-3" /> Liveness
                        </div>
                        {result.liveness && (
                             <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${result.liveness.score > 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                 {result.liveness.score > 80 ? 'PASS' : 'FAIL'}
                             </span>
                        )}
                    </div>
                    
                    {result.liveness ? (
                        <div className="relative w-24 h-24 flex items-center justify-center my-1">
                            {/* Outer Static Ring */}
                            <div className="absolute inset-0 border border-slate-800 rounded-full"></div>
                            {/* Rotating Ring */}
                            <div className="absolute inset-1 border border-slate-700 border-t-emerald-500/50 rounded-full animate-spin duration-[3s]"></div>
                            {/* Counter Rotating Ring */}
                            <div className="absolute inset-3 border border-slate-800 border-b-slate-600 rounded-full animate-spin direction-reverse duration-[5s]"></div>
                            
                            {/* Progress Circle */}
                            <svg className="absolute w-full h-full transform -rotate-90 p-3">
                                <circle cx="50%" cy="50%" r="32" stroke="#1e293b" strokeWidth="3" fill="none" />
                                <circle 
                                    cx="50%" cy="50%" r="32" 
                                    stroke={result.liveness.score > 80 ? '#10b981' : '#f43f5e'} 
                                    strokeWidth="3" 
                                    fill="none" 
                                    strokeDasharray={200} 
                                    strokeDashoffset={200 - (200 * result.liveness.score) / 100} 
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            
                            <div className="flex flex-col items-center justify-center z-10">
                                <Fingerprint className={`w-6 h-6 ${result.liveness.score > 80 ? 'text-emerald-500' : 'text-rose-500'}`} />
                                <span className="text-xs font-bold text-white mt-1">{result.liveness.score}%</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs">N/A</div>
                    )}
                 </div>
              </div>

              {/* Technical Analysis */}
              <div className="px-6 pb-6 space-y-4">
                  <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-700 to-transparent"></div>
                      <div className="pl-4">
                          <h4 className="text-[10px] font-mono text-slate-500 uppercase mb-2 tracking-wider">Analysis Vector</h4>
                          <p className="text-sm text-slate-300 font-mono leading-relaxed text-xs">
                             <span className="text-emerald-500 opacity-50 mr-2">{">"}</span>
                             {result.reasoning}
                          </p>
                      </div>
                  </div>

                  <div className="bg-slate-900/30 border border-slate-800 rounded p-4">
                    <h4 className="text-[10px] font-mono text-slate-500 uppercase mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-amber-500" /> Detected Anomalies
                    </h4>
                    <div className="space-y-2">
                        {result.indicators.length > 0 ? result.indicators.map((ind, i) => (
                            <div key={i} className="flex items-start gap-3 group">
                                <div className="mt-1.5 w-1 h-1 bg-rose-500 rounded-full shadow-[0_0_5px_rgba(244,63,94,0.5)] group-hover:scale-150 transition-transform"></div>
                                <span className="text-xs text-slate-400 font-mono group-hover:text-slate-200 transition-colors">{ind}</span>
                            </div>
                        )) : (
                            <div className="text-xs text-slate-600 font-mono italic">No significant anomalies detected in signal data.</div>
                        )}
                    </div>
                  </div>
              </div>
              
              <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 text-[10px] font-mono text-slate-600 flex justify-between items-center">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span>DF-Neural-Net v2.4 Active</span>
                   </div>
                   <span>ID: {Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisLab;