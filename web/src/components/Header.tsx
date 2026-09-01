import React from 'react';
import { Shield, Lock, Bell, User, CheckCircle2, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface HeaderProps {
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { activeRole, switchDemoRole, userProfile } = useAuth();

  const roles: UserRole[] = [
    'National Admin',
    'State Admin',
    'District Officer',
    'Acquisition Officer',
    'Field Supervisor',
    'Field Officer',
    'Auditor',
    'Public User',
  ];

  return (
    <header className="border-b border-[#E2D9CC] bg-white text-slate-900 px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E]">
          <Shield className="w-5 h-5 text-[#8C7355]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-wider text-slate-900">BHUMI-SHIELD</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E]">
              Govt. of India
            </span>
          </div>
          <p className="text-[11px] text-[#786C5E] font-medium">
            National Land Acquisition Mission & Statutory Sentinel Platform
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Role Selector */}
        <div className="flex items-center gap-2 bg-[#FDFBF7] border border-[#C5B49E] rounded-lg px-3 py-1.5 shadow-sm">
          <Lock className="w-3.5 h-3.5 text-[#8C7355]" />
          <span className="text-xs text-[#786C5E] font-medium">Clearance:</span>
          <select
            value={activeRole}
            onChange={(e) => switchDemoRole(e.target.value as UserRole)}
            aria-label="Switch Active Government Role"
            className="bg-white border border-[#C5B49E] rounded px-2 py-0.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#8C7355] cursor-pointer"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#E2D9CC]">
          <div className="w-8 h-8 rounded-full bg-[#E2D9CC] border border-[#C5B49E] flex items-center justify-center text-xs font-bold text-[#4A3B2C]">
            {userProfile?.displayName ? userProfile.displayName.charAt(0) : 'G'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {userProfile?.displayName || 'National Authority'}
            </p>
            <p className="text-[10px] text-[#786C5E] font-mono leading-tight">
              {userProfile?.email || 'admin@gov.in'}
            </p>
          </div>
        </div>

        {/* Logout / Switch Role Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#C5B49E] bg-[#FDFBF7] hover:bg-[#E2D9CC] text-xs font-bold text-[#4A3B2C] transition-all cursor-pointer"
            title="Log Out & Return to Login Screen"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Log Out</span>
          </button>
        )}
      </div>
    </header>
  );
};
