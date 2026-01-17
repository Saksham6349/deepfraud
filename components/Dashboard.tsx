import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { DashboardStat, AnalysisResult, RiskLevel } from '../types';
import { Activity, ShieldAlert, Globe, Database, Ban, CheckCircle, AlertTriangle, Search, Clock } from 'lucide-react';
import { api } from '../services/api';

const Dashboard: React.FC = () => {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load and Process Data
  const refreshData = async () => {
      try {
          const data = await api.records.list();
          // Sort descending for list (newest first)
          setHistory(data);
          
          const statsData = await api.stats.getSummary();
          setStats(statsData);
          
          processChart(data);
      } catch(e) { 
          console.error("Data fetch error", e); 
      }
      setLoading(false);
  };

  useEffect(() => {
    refreshData();
    // Poll for updates from the backend
    const interval = setInterval(refreshData, 2000); 
    return () => clearInterval(interval);
  }, []);

  const processChart = (data: AnalysisResult[]) => {
      // Sort by time ascending for the chart (oldest first)
      const sorted = [...data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      // Map to chart format
      const mapped = sorted.map(item => ({
          time: new Date(item.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
          value: item.score,
          verdict: item.verdict,
          type: item.mediaType
      }));
      
      // Show last 20 events to keep chart readable
      setChartData(mapped.slice(-20));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-white">Security Operations Center</h2>
           <p className="text-slate-400 text-sm">Real-time threat monitoring and verification stream</p>
        </div>
        <div className="flex gap-3">
          <div className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700 flex items-center gap-2">
            <Database className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                LIVE DATA CONNECTED
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-mono">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </span>
             ONLINE
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-panel p-5 rounded-xl border-t-2 border-t-transparent hover:border-t-emerald-500 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</span>
              <Activity className={`w-4 h-4 ${stat.value !== 0 ? 'text-emerald-500' : 'text-slate-600'}`} />
            </div>
            <div className="text-2xl font-mono font-bold text-white">
                {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                Risk Score History
            </h3>
            <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="font-mono text-[10px] uppercase">Real-time Analysis Feed</span>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-[300px]">
             {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                        dataKey="time" 
                        stroke="#475569" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false}
                    />
                    <YAxis 
                        stroke="#475569" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false}
                        domain={[0, 100]}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                        itemStyle={{ color: '#10b981' }}
                        formatter={(value: any) => [`${value}%`, 'Risk Score']}
                        labelStyle={{ color: '#94a3b8' }}
                    />
                    <ReferenceLine y={80} stroke="#f43f5e" strokeDasharray="3 3" />
                    <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#10b981" 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        isAnimationActive={true}
                    />
                </AreaChart>
                </ResponsiveContainer>
             ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 border border-dashed border-slate-800 rounded">
                     <Activity className="w-10 h-10 mb-2 opacity-20" />
                     <p className="text-xs font-mono uppercase">Waiting for analysis data...</p>
                 </div>
             )}
          </div>
        </div>

        {/* Live Alerts Feed */}
        <div className="glass-panel p-0 rounded-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                Live Log
            </h3>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-bold uppercase">
                {history.length} Events
            </div>
          </div>
          
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[400px]">
            {history.length === 0 ? (
                <div className="text-center py-10 text-slate-600">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-xs font-mono">No incidents recorded.</p>
                </div>
            ) : (
                history.map((alert, idx) => (
                <div key={`${alert.timestamp}-${idx}`} className="p-3 rounded-lg border bg-slate-800/80 border-slate-600 shadow-md transition-all duration-300 relative overflow-hidden group">
                    {/* Risk Bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        alert.verdict === 'FAKE' ? 'bg-rose-500' : 
                        alert.verdict === 'SUSPICIOUS' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}></div>
                    
                    <div className="flex justify-between items-start pl-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white uppercase">{alert.mediaType} SCAN</h4>
                            {alert.verdict === 'FAKE' && (
                                <span className="text-[9px] bg-rose-500 text-white px-1 rounded font-bold uppercase animate-pulse">THREAT</span>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 truncate max-w-[150px]">
                            {alert.fileName || 'Raw Input'}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className={`text-sm font-bold font-mono ${
                            alert.score > 80 ? 'text-rose-500' : 
                            alert.score > 40 ? 'text-amber-500' : 'text-emerald-500'
                        }`}>
                        {alert.score}%
                        </div>
                        <span className="text-[10px] text-slate-500">
                            {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center pl-3">
                        <div className="flex items-center gap-2">
                            {alert.verdict === 'FAKE' ? <Ban className="w-3 h-3 text-rose-500"/> : 
                             alert.verdict === 'SUSPICIOUS' ? <AlertTriangle className="w-3 h-3 text-amber-500"/> :
                             <CheckCircle className="w-3 h-3 text-emerald-500"/>}
                            <span className={`text-[10px] font-bold uppercase ${
                                alert.verdict === 'FAKE' ? 'text-rose-400' : 
                                alert.verdict === 'SUSPICIOUS' ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                                {alert.verdict}
                            </span>
                        </div>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;