import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, Lock, Cpu, Save, ToggleLeft, ToggleRight, Server } from 'lucide-react';

const Settings: React.FC = () => {
  const [autoBan, setAutoBan] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [threshold, setThreshold] = useState(85);
  const [apiStatus, setApiStatus] = useState<'connected' | 'error'>('connected');

  const Toggle = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`transition-colors duration-200 ${active ? 'text-emerald-500' : 'text-slate-600'}`}>
      {active ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
    </button>
  );

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in">
      <div className="flex justify-between items-end pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-mono tracking-tight">
            <SettingsIcon className="w-5 h-5 text-emerald-500" />
            SYSTEM_CONFIG <span className="text-slate-600">//</span> PREFERENCES
          </h2>
        </div>
        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono rounded border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2 transition-all">
          <Save className="w-3 h-3" />
          SAVE CHANGES
        </button>
      </div>

      <div className="flex-1 overflow-auto space-y-6 pr-2">
        
        {/* Detection Engine Config */}
        <div className="glass-panel p-6 rounded-sm tech-border">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" /> 
            Detection Engine
          </h3>
          
          <div className="space-y-6">
             <div className="flex justify-between items-center pb-4 border-b border-slate-800/50">
                <div>
                   <p className="text-sm font-medium text-white mb-1">Auto-Ban High Risk</p>
                   <p className="text-xs text-slate-500 max-w-sm">Automatically block transactions with a fraud score above 95%.</p>
                </div>
                <Toggle active={autoBan} onClick={() => setAutoBan(!autoBan)} />
             </div>

             <div className="pb-4 border-b border-slate-800/50">
                <div className="flex justify-between mb-2">
                   <p className="text-sm font-medium text-white">Risk Sensitivity Threshold</p>
                   <span className="text-xs font-mono font-bold text-emerald-500">{threshold}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="99" 
                  value={threshold} 
                  onChange={(e) => setThreshold(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between mt-2 text-[10px] text-slate-600 font-mono uppercase">
                   <span>Lenient (50%)</span>
                   <span>Strict (99%)</span>
                </div>
             </div>

             <div className="flex justify-between items-center">
                <div>
                   <p className="text-sm font-medium text-white mb-1">Deepfake Heuristic Analysis</p>
                   <p className="text-xs text-slate-500">Enable experimental spectral audio analysis.</p>
                </div>
                <div className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold rounded">BETA</div>
             </div>
          </div>
        </div>

        {/* API & Connectivity */}
        <div className="glass-panel p-6 rounded-sm tech-border">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-500" /> 
            API & Connectivity
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-slate-900/50 p-4 rounded border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-mono mb-2">Active Model</p>
                <div className="flex items-center gap-3">
                   <Cpu className="w-5 h-5 text-slate-300" />
                   <span className="text-sm font-bold text-white">DF-Neural-Net v2.4</span>
                </div>
             </div>

             <div className="bg-slate-900/50 p-4 rounded border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-mono mb-2">Connection Status</p>
                <div className="flex items-center gap-3">
                   <div className={`w-2.5 h-2.5 rounded-full ${apiStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`}></div>
                   <span className="text-sm font-bold text-white uppercase">{apiStatus === 'connected' ? 'Operational' : 'Offline'}</span>
                </div>
             </div>

             <div className="bg-slate-900/50 p-4 rounded border border-slate-800 md:col-span-2">
                <p className="text-[10px] text-slate-500 uppercase font-mono mb-2">Endpoint URL</p>
                <div className="flex items-center gap-2">
                   <code className="text-xs text-slate-400 font-mono bg-slate-950 px-2 py-1 rounded w-full">https://api.deepfraud.ai/v2/inference/secure</code>
                   <Lock className="w-3 h-3 text-slate-600" />
                </div>
             </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-panel p-6 rounded-sm tech-border">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Bell className="w-4 h-4 text-sky-500" /> 
            Alerts
          </h3>
          
          <div className="flex justify-between items-center">
             <div>
                <p className="text-sm font-medium text-white mb-1">Real-time Push Notifications</p>
                <p className="text-xs text-slate-500">Notify dashboard operators immediately upon critical risk detection.</p>
             </div>
             <Toggle active={notifications} onClick={() => setNotifications(!notifications)} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;