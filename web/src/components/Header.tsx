import React from 'react';
import { LogOut, Shield, Sparkles, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface HeaderProps {
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { activeRole, switchDemoRole } = useAuth();

  const roles: { id: UserRole; label: string; badge: string }[] = [
    { id: 'NATIONAL_EXECUTIVE', label: 'National Executive', badge: 'Admin' },
    { id: 'FIELD_ACQUISITION', label: 'Field Acquisition', badge: 'Operations' },
    { id: 'AUDIT_CITIZEN', label: 'Audit & Citizen', badge: 'Public' },
  ];

  return (
    <header className="sticky top-0 z-50 font-sans px-4 sm:px-6 py-2.5 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3">
      {/* Left Active Context / Status Pill */}
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/80 text-[11px] font-extrabold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">Operating System for Land Operations</span>
          <span className="sm:hidden font-mono font-extrabold text-[#0B132B]">RFCTLARR 2013</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Role Selector Pill */}
        <div className="relative flex items-center">
          <select
            value={activeRole}
            onChange={(e) => switchDemoRole(e.target.value as UserRole)}
            aria-label="Switch Active Government Role"
            className="appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-extrabold bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer shadow-xs"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label} ({r.badge})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 pointer-events-none" />
        </div>

        {/* Temporary Seed Button */}
        <button
          onClick={async () => {
            const { seedBhumiShieldDemoData } = await import('../utils/seedData');
            alert('Seeding data... Check console for progress.');
            await seedBhumiShieldDemoData(console.log);
            alert('Seeding complete! Please refresh the page.');
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 shadow-xs transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Seed Sandbox</span>
        </button>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-slate-600 hover:text-[#0B132B] bg-white hover:bg-slate-100 border border-slate-200 shadow-xs transition-all cursor-pointer active:scale-95"
            title="Log Out & Return to Login Screen"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden md:inline">Sign out</span>
          </button>
        )}
      </div>
    </header>
  );
};
