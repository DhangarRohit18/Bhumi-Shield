import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface HeaderProps {
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { activeRole, switchDemoRole, userProfile } = useAuth();

  const roles: { id: UserRole; label: string }[] = [
    { id: 'NATIONAL_EXECUTIVE', label: '🏛️ National Executive' },
    { id: 'FIELD_ACQUISITION', label: '📐 Field Acquisition' },
    { id: 'AUDIT_CITIZEN', label: '🛡️ Audit & Citizen' },
  ];

  return (
    <header className="flex flex-col sticky top-0 z-50 shadow-sm font-sans bg-white/95 backdrop-blur-md border-b border-[#BAE6FD]/60">
      {/* Main Clean Government Navbar */}
      <div className="px-6 py-2.5 flex items-center justify-end gap-3">
        <div className="flex items-center gap-3">
          {/* Clean Role Selector */}
          <div className="flex items-center gap-1.5 bg-[#F0F7FF] border border-[#BAE6FD] rounded-xl px-2.5 py-1.5 shadow-sm">
            <select
              value={activeRole}
              onChange={(e) => switchDemoRole(e.target.value as UserRole)}
              aria-label="Switch Active Government Role"
              className="bg-white border border-[#BAE6FD] rounded-lg px-2.5 py-1 text-xs font-extrabold text-[#0F172A] focus:outline-none focus:border-[#EA580C] cursor-pointer shadow-xs"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Profile Card */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#BAE6FD]/60">
            <div className="w-8 h-8 rounded-full bg-[#0F172A] border border-[#1E293B] flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {userProfile?.displayName ? userProfile.displayName.charAt(0) : 'G'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-extrabold text-[#0F172A] leading-tight">
                {userProfile?.displayName || 'National Authority'}
              </p>
              <p className="text-[10px] text-[#64748B] font-mono leading-tight">
                {userProfile?.email || 'admin@gov.in'}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#BAE6FD] bg-[#F0F7FF] hover:bg-[#E0F2FE] text-xs font-extrabold text-[#0F172A] transition-all cursor-pointer shadow-xs"
              title="Log Out & Return to Login Screen"
            >
              <LogOut className="w-3.5 h-3.5 text-[#EA580C]" />
              <span className="hidden md:inline">Log Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
