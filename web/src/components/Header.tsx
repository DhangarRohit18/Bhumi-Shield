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
    <header className="flex flex-col sticky top-0 z-50 shadow-sm font-sans">
      {/* Bhoomi Rashi Official Top Utility Bar in Light Blue */}
      <div className="bg-[#E0F2FE] text-[#0369A1] text-[10px] px-4 py-1 flex items-center justify-between border-b border-[#BAE6FD] font-semibold">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[#0369A1]">
            <span className="text-[#BF7834] font-extrabold">📞 Helpline:</span> 011-23711824
          </span>
          <span className="hidden sm:flex items-center gap-1 text-[#0369A1]">
            <span className="text-[#BF7834] font-extrabold">✉️ Email:</span> supportla-morth@gov.in
          </span>
        </div>
        <div className="flex items-center gap-3 text-[#0284C7]">
          <span className="font-extrabold text-[#0369A1]">Highway Land Register [Rule 4(1)]</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline font-bold">RFCTLARR Act (2013)</span>
          <span className="hidden md:inline">•</span>
          <span className="font-extrabold text-[#BF7834]">Govt. of India (MoRTH)</span>
        </div>
      </div>

      {/* Main Government Navbar */}
      <div className="border-b border-[#E2E8F0] bg-white text-[#0F172A] px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#BF7834] text-white shadow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base tracking-wide text-[#BF7834]">
                BHUMI-SHIELD <span className="text-[#1E293B] font-extrabold text-sm">| Land Acquisition Portal</span>
              </h1>
              <span className="text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#BF7834] border border-[#FDE68A]">
                MoRTH Govt. of India
              </span>
            </div>
            <p className="text-[10px] text-[#64748B] font-semibold">
              Ministry of Road Transport & Highways • National Infrastructure & Statutory Sentinel Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Role Selector */}
          <div className="flex items-center gap-2 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl px-3 py-1.5 shadow-sm">
            <Lock className="w-3.5 h-3.5 text-[#BF7834]" />
            <span className="text-xs text-[#BF7834] font-extrabold">Clearance:</span>
            <select
              value={activeRole}
              onChange={(e) => switchDemoRole(e.target.value as UserRole)}
              aria-label="Switch Active Government Role"
              className="bg-white border border-[#CBD5E1] rounded-lg px-2.5 py-0.5 text-xs font-extrabold text-[#0F172A] focus:outline-none focus:border-[#BF7834] cursor-pointer"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Profile Card */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-[#E2E8F0]">
            <div className="w-8 h-8 rounded-full bg-[#1E293B] border border-[#334155] flex items-center justify-center text-xs font-bold text-white shadow-sm">
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-xs font-extrabold text-[#0F172A] transition-all cursor-pointer shadow-sm"
              title="Log Out & Return to Login Screen"
            >
              <LogOut className="w-3.5 h-3.5 text-[#BF7834]" />
              <span className="hidden md:inline">Log Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
