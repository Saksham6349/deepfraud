import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AnalysisLab from './components/AnalysisLab';
import History from './components/History';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Login from './components/Login';
import { AlertCircle } from 'lucide-react';
import { User } from './types';
import { api } from './services/api';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('analysis');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
        // 1. Check local storage (fast)
        let session = api.auth.getSession();
        
        // 2. Check with backend (Firebase auto-restore)
        // Even if we have a local session, verifying with Firebase ensures token validity
        try {
            const recovered = await api.auth.recoverSession();
            if (recovered) {
                session = recovered;
            }
        } catch (e) {
            console.warn("Session recovery check failed", e);
        }

        if (session) {
          setUser(session);
        }
        setLoading(false);
    };
    
    initAuth();
  }, []);

  const handleLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'analysis':
        return <AnalysisLab />;
      case 'history':
        return <History />;
      case 'alerts':
        return <Dashboard />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 font-mono">
            <AlertCircle className="w-12 h-12 mb-4 opacity-20 text-emerald-500" />
            <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest">Module Offline</h3>
            <p className="max-w-md text-center mt-2 text-xs">The {activeTab} subsystem is currently disabled for maintenance.</p>
          </div>
        );
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950"></div>;

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen text-slate-100 font-sans selection:bg-emerald-500/30 bg-slate-950">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        user={user}
        onLogout={handleLogout}
      />
      
      <main className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} p-6 relative overflow-hidden h-screen flex flex-col`}>
        {/* Subtle grid line for top alignment */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-20"></div>

        <div className="relative z-10 h-full">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;