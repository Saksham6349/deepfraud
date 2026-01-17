import React, { useEffect, useState } from 'react';
import { Clock, Trash2, FileImage, FileAudio, FileVideo, FileText, Search, Filter, X } from 'lucide-react';
import { AnalysisResult, RiskLevel } from '../types';
import { api } from '../services/api';

const History: React.FC = () => {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | RiskLevel>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'image' | 'audio' | 'video' | 'text'>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.records.list();
      setHistory(data);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const clearHistory = async () => {
    if (confirm('CONFIRM DELETE: Clear all forensic audit logs?')) {
      await api.records.clear();
      setHistory([]);
    }
  };

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.CRITICAL:
        return <span className="font-mono text-[10px] text-rose-500 font-bold border border-rose-900/50 bg-rose-950/30 px-2 py-0.5 rounded">CRIT</span>;
      case RiskLevel.HIGH:
        return <span className="font-mono text-[10px] text-orange-500 font-bold border border-orange-900/50 bg-orange-950/30 px-2 py-0.5 rounded">HIGH</span>;
      case RiskLevel.MEDIUM:
        return <span className="font-mono text-[10px] text-amber-500 font-bold border border-amber-900/50 bg-amber-950/30 px-2 py-0.5 rounded">MED</span>;
      default:
        return <span className="font-mono text-[10px] text-emerald-500 font-bold border border-emerald-900/50 bg-emerald-950/30 px-2 py-0.5 rounded">LOW</span>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audio': return <FileAudio className="w-3.5 h-3.5 text-sky-400" />;
      case 'video': return <FileVideo className="w-3.5 h-3.5 text-purple-400" />;
      case 'text': return <FileText className="w-3.5 h-3.5 text-slate-400" />;
      default: return <FileImage className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = (item.fileName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.verdict.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reasoning.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRisk = riskFilter === 'ALL' || item.riskLevel === riskFilter;
    const matchesType = typeFilter === 'ALL' || item.mediaType === typeFilter;

    return matchesSearch && matchesRisk && matchesType;
  });

  const FilterPill = ({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-all border ${
        active 
          ? 'bg-slate-700 text-white border-slate-500' 
          : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-900'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in">
      <div className="flex justify-between items-end pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-mono tracking-tight">
            <Clock className="w-5 h-5 text-emerald-500" />
            CASE_LOGS <span className="text-slate-600">//</span> ARCHIVE
          </h2>
        </div>
        <button 
          onClick={clearHistory}
          className="text-xs text-rose-500 hover:text-rose-400 transition-colors flex items-center gap-2 font-mono uppercase tracking-wider"
        >
          <Trash2 className="w-3 h-3" />
          Purge Data
        </button>
      </div>

      <div className="glass-panel rounded-sm tech-border flex flex-col flex-1 overflow-hidden">
        {/* Toolbar */}
        <div className="p-3 border-b border-slate-800/50 bg-slate-900/30 flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="relative w-full max-w-xs group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search logs (ID, Verdict, Reason)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700 rounded-sm pl-9 pr-8 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono placeholder:text-slate-700 transition-all"
            />
            {searchTerm && (
                <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-rose-500 transition-colors p-1"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Risk</span>
                <div className="flex bg-slate-950/30 p-0.5 rounded border border-slate-800">
                   <FilterPill active={riskFilter === 'ALL'} label="All" onClick={() => setRiskFilter('ALL')} />
                   <FilterPill active={riskFilter === RiskLevel.MEDIUM} label="Med" onClick={() => setRiskFilter(RiskLevel.MEDIUM)} />
                   <FilterPill active={riskFilter === RiskLevel.HIGH} label="High" onClick={() => setRiskFilter(RiskLevel.HIGH)} />
                </div>
             </div>
             
             <div className="w-px h-4 bg-slate-800 hidden sm:block"></div>

             <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Type</span>
                <div className="flex bg-slate-950/30 p-0.5 rounded border border-slate-800">
                   <FilterPill active={typeFilter === 'ALL'} label="All" onClick={() => setTypeFilter('ALL')} />
                   <FilterPill active={typeFilter === 'image'} label="Img" onClick={() => setTypeFilter('image')} />
                   <FilterPill active={typeFilter === 'text'} label="Txt" onClick={() => setTypeFilter('text')} />
                </div>
             </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="flex-1 overflow-auto bg-slate-950/20">
          {loading ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-600 font-mono">
               <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></div>
               <p className="text-xs tracking-widest uppercase">Fetching Records...</p>
             </div>
          ) : history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 font-mono">
              <Clock className="w-8 h-8 mb-4 opacity-20" />
              <p className="text-xs tracking-widest uppercase">Database Empty</p>
            </div>
          ) : filteredHistory.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-600 font-mono">
               <Search className="w-8 h-8 mb-4 opacity-20" />
               <p className="text-xs tracking-widest uppercase">No Records Found</p>
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900 text-slate-500 text-[10px] uppercase font-mono tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-medium border-b border-slate-800">Time</th>
                  <th className="px-4 py-3 font-medium border-b border-slate-800">Source ID</th>
                  <th className="px-4 py-3 font-medium border-b border-slate-800">Format</th>
                  <th className="px-4 py-3 font-medium border-b border-slate-800">Risk</th>
                  <th className="px-4 py-3 font-medium border-b border-slate-800">Conf.</th>
                  <th className="px-4 py-3 font-medium border-b border-slate-800">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredHistory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-emerald-500/5 transition-colors group cursor-default">
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300 font-medium truncate max-w-[150px]">
                      {item.fileName || 'RAW_INPUT'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono uppercase">
                        {getTypeIcon(item.mediaType)}
                        {item.mediaType}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getRiskBadge(item.riskLevel)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-mono font-bold ${item.score > 80 ? 'text-white' : 'text-slate-400'}`}>
                          {item.score}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono">
                      <span className={
                          item.verdict === 'REAL' ? 'text-emerald-500' : 
                          item.verdict === 'FAKE' ? 'text-rose-500' : 'text-amber-500'
                      }>
                          {item.verdict}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;