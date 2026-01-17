import React from 'react';
import { ScanEye, ShieldAlert, History, Settings, Zap, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isCollapsed, onToggle, user, onLogout }) => {
  const menuItems = [
    { id: 'analysis', label: 'Forensic Lab', icon: ScanEye },
    { id: 'alerts', label: 'Live Signals', icon: ShieldAlert },
    { id: 'history', label: 'Case Logs', icon: History },
    { id: 'settings', label: 'System Config', icon: Settings },
  ];

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} h-screen bg-slate-950/80 backdrop-blur-md border-r border-slate-800/60 flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out`}>
      
      {/* Collapse Toggle Button */}
      <button 
        onClick={onToggle}
        className="absolute -right-3 top-9 bg-slate-900 border border-slate-700 text-slate-400 hover:text-emerald-500 hover:border-emerald-500 rounded-full p-1 shadow-lg z-50 transition-all"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header */}
      <div className={`p-6 border-b border-slate-800/50 flex flex-col ${isCollapsed ? 'items-center' : ''}`}>
        <div className="flex items-center gap-3 mb-1 overflow-hidden">
          <div className="w-6 h-6 bg-emerald-500 rounded flex-shrink-0 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.5)]">
            <div className="w-3 h-3 bg-slate-950 rotate-45"></div>
          </div>
          <h1 className={`text-lg font-bold text-white tracking-widest font-mono transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
            DEEP<span className="text-emerald-500">FRAUD</span>
          </h1>
        </div>
        
        <div className={`flex items-center gap-2 mt-2 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] uppercase tracking-wider text-emerald-500 font-bold whitespace-nowrap">System Operational</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full group flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-3 rounded-md text-sm transition-all duration-200 border-l-2 ${
                isActive
                  ? 'bg-slate-900 border-emerald-500 text-white shadow-lg shadow-black/20'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-500' : 'text-slate-600 group-hover:text-slate-400'}`} />
              
              {!isCollapsed && (
                <>
                  <span className={`font-medium ml-3 whitespace-nowrap ${isActive ? 'tracking-wide' : ''}`}>{item.label}</span>
                  {isActive && <Zap className="w-3 h-3 ml-auto text-emerald-500 fill-emerald-500/20" />}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer User Profile */}
      <div className={`p-4 border-t border-slate-800/50 bg-slate-900/30 flex items-center ${isCollapsed ? 'justify-center flex-col gap-2' : 'gap-3'}`}>
        <div className="w-9 h-9 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-700 font-mono flex-shrink-0 group-hover:border-emerald-500/50 transition-colors">
          {user.username.substring(0,2).toUpperCase()}
        </div>
        
        <div className={`flex-1 min-w-0 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
          <p className="text-xs font-bold text-slate-300 font-mono uppercase whitespace-nowrap">{user.username}</p>
          <p className="text-[10px] text-slate-600 uppercase tracking-wider whitespace-nowrap">Level {user.clearanceLevel} Clearance</p>
        </div>

        <button 
            onClick={onLogout}
            className={`text-slate-500 hover:text-rose-500 transition-colors p-2 rounded hover:bg-slate-800 ${isCollapsed ? '' : ''}`}
            title="Disconnect Session"
        >
            <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;