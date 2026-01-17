import React, { useState } from 'react';
import { ScanEye, ShieldCheck, Lock, ChevronRight, Loader2, Fingerprint } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await api.auth.login(username, password);
      onLogin(user);
    } catch (err) {
      setError('Access Denied: Invalid Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"></div>
         <div className="absolute w-full h-full opacity-20" style={{ 
             backgroundImage: 'linear-gradient(rgba(16,185,129,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.1) 1px, transparent 1px)', 
             backgroundSize: '50px 50px' 
         }}></div>
      </div>

      <div className="w-full max-w-md p-1 relative z-10 animate-fade-in">
        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-lg"></div>
        
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-8 rounded-lg shadow-2xl relative overflow-hidden">
           {/* Scanline */}
           <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
           <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-scan"></div>

           <div className="text-center mb-8">
              <div className="w-16 h-16 bg-slate-950 border border-emerald-500/30 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative group">
                  <div className="absolute inset-0 bg-emerald-500/10 animate-pulse rounded-2xl"></div>
                  <ScanEye className="w-8 h-8 text-emerald-500 relative z-10" />
              </div>
              <h1 className="text-2xl font-bold font-mono text-white tracking-widest">DEEP<span className="text-emerald-500">FRAUD</span></h1>
              <p className="text-xs text-slate-500 uppercase tracking-[0.2em] mt-2">Secure Access Terminal</p>
           </div>

           <form onSubmit={handleLogin} className="space-y-5 relative z-10">
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Operator ID</label>
                 <div className="relative group">
                    <ShieldCheck className="absolute left-3 top-3 w-4 h-4 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 pl-10 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700"
                        placeholder="OP-ID"
                    />
                 </div>
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Access Key</label>
                 <div className="relative group">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 pl-10 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700"
                        placeholder="••••••••"
                    />
                 </div>
              </div>

              {error && (
                  <div className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 p-2 rounded flex items-center gap-2">
                      <Lock className="w-3 h-3" />
                      {error}
                  </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded border border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
                {loading ? 'Authenticating...' : 'Verify Identity'}
              </button>
           </form>

           <div className="mt-6 pt-6 border-t border-slate-800 text-center">
              <p className="text-[10px] text-slate-600 font-mono">
                 UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE.<br/>
                 SESSION MONITORED BY SEC-OPS.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;