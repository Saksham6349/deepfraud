import React, { useState } from 'react';
import { ScanEye, ShieldCheck, Lock, ChevronRight, Loader2, Fingerprint, UserPlus, ArrowRight, HelpCircle, AlertTriangle, Terminal } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isLoginMode) {
        const user = await api.auth.login(username, password);
        onLogin(user);
      } else {
        const user = await api.auth.register(username, password);
        onLogin(user);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      const msg = err.message || '';
      
      if (msg.includes("unauthorized-domain") || (err.code === 'auth/unauthorized-domain')) {
          setError(`Domain not authorized. Add '${window.location.hostname}' to Firebase Console > Auth > Settings.`);
      } else if (msg.includes("check your email") || msg.includes("already registered")) {
          setSuccessMsg(msg);
          if (msg.includes("already registered")) {
             setIsLoginMode(true);
          }
      } else {
          setError(msg || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
      setLoading(true);
      setError('');
      try {
          // Uses the mock credentials defined in api.ts
          const user = await api.auth.login('admin', 'password');
          onLogin(user);
      } catch (err) {
          setError("Demo login failed");
      } finally {
          setLoading(false);
      }
  };

  const toggleMode = () => {
      setIsLoginMode(!isLoginMode);
      setError('');
      setSuccessMsg('');
      setUsername('');
      setPassword('');
  }

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
              <p className="text-xs text-slate-500 uppercase tracking-[0.2em] mt-2">
                  {isLoginMode ? 'Secure Access Terminal' : 'New Identity Creation'}
              </p>
           </div>

           <form onSubmit={handleAuth} className="space-y-5 relative z-10">
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                     Email Address
                 </label>
                 <div className="relative group">
                    <ShieldCheck className="absolute left-3 top-3 w-4 h-4 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 pl-10 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700"
                        placeholder="user@example.com"
                        required
                    />
                 </div>
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                     Password
                 </label>
                 <div className="relative group">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 pl-10 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-700"
                        placeholder="••••••••"
                        required
                        minLength={5}
                    />
                 </div>
              </div>

              {error && (
                  <div className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 p-2 rounded flex items-center gap-2 animate-pulse break-words">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      <span>{error}</span>
                  </div>
              )}
              
              {successMsg && (
                  <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded flex items-center gap-2">
                      <ShieldCheck className="w-3 h-3 flex-shrink-0" />
                      {successMsg}
                  </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full font-bold py-3 rounded border shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs group disabled:opacity-50 disabled:cursor-not-allowed ${
                    isLoginMode 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400' 
                    : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-emerald-500/50'
                }`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isLoginMode ? <Fingerprint className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />)}
                {loading ? 'Processing...' : (isLoginMode ? 'Verify Identity' : 'Create Account')}
              </button>
           </form>

           {/* Quick Action Buttons */}
           <div className="mt-4">
               <button 
                    type="button"
                    onClick={handleDemoLogin}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded flex items-center justify-center gap-2 transition-colors text-xs border border-slate-700 hover:border-emerald-500/50 uppercase tracking-wider"
                >
                    <Terminal className="w-3 h-3" />
                    Demo Access (Skip Auth)
               </button>
           </div>
            
           <div className="mt-4 text-center">
               <button 
                type="button"
                onClick={toggleMode}
                className="text-xs text-slate-500 hover:text-emerald-400 transition-colors uppercase tracking-wider font-mono flex items-center justify-center gap-1 mx-auto"
               >
                   {isLoginMode ? (
                       <>Initialize New Operator <ArrowRight className="w-3 h-3" /></>
                   ) : (
                       <>Return to Login Interface</>
                   )}
               </button>
           </div>
           
            <div className="mt-4 text-center">
                <button 
                 onClick={() => setShowHelp(!showHelp)}
                 className="text-[10px] text-slate-600 hover:text-slate-400 underline decoration-slate-700 flex items-center justify-center gap-1 mx-auto"
                >
                    <HelpCircle className="w-3 h-3" /> Connection Status
                </button>
                
                {showHelp && (
                    <div className="mt-2 p-3 bg-slate-950 rounded text-left border border-slate-800 animate-fade-in">
                         <div className="flex items-start gap-2 mb-2">
                             <div className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                             <p className="text-[10px] text-slate-400 leading-tight">
                                 <strong>Domain Not Authorized:</strong><br/>
                                 Add <code>{window.location.hostname}</code> to <br/>
                                 Firebase Console &gt; Auth &gt; Settings
                             </p>
                         </div>
                         <div className="flex items-start gap-2">
                             <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                             <p className="text-[10px] text-slate-400 leading-tight">
                                 <strong>Bypass:</strong> Use the "Demo Access" button to enter without Firebase.
                             </p>
                         </div>
                    </div>
                )}
            </div>

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