import React from 'react';
import { Shield, Lock, Bell, User, CheckCircle2, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { ROLE_CAPABILITIES } from '../utils/rbac';

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
      <div className="px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#EA580C] text-white shadow-md flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-lg tracking-tight text-[#0F172A]">
                BHUMI-SHIELD
              </h1>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                MoRTH Govt. of India
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Native AR Sentinel APK Feature Button */}
          <a
            href="/bhumi-shield-ar-sentinel-v1.0.apk"
            download="bhumi-shield-ar-sentinel-v1.0.apk"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:from-[#C2410C] hover:to-[#9A3412] text-white text-xs font-black shadow-md transition-all cursor-pointer border border-[#EA580C]"
            title="Download Native AR Sentinel Field APK (v1.0 - 35.6 MB Universal Android)"
          >
            <span className="text-sm">📱</span>
            <span className="hidden sm:inline">Native AR Sentinel APK</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20 text-white font-bold">
              35.6MB
            </span>
          </a>

          {/* Role Selector */}
          <div className="flex items-center gap-2 bg-[#F0F7FF] border border-[#BAE6FD] rounded-xl px-3 py-1.5 shadow-sm">
            <Lock className="w-3.5 h-3.5 text-[#EA580C]" />
            <span className="text-xs text-[#0369A1] font-extrabold">Clearance:</span>
            <select
              value={activeRole}
              onChange={(e) => switchDemoRole(e.target.value as UserRole)}
              aria-label="Switch Active Government Role"
              className="bg-white border border-[#BAE6FD] rounded-lg px-2.5 py-0.5 text-xs font-extrabold text-[#0F172A] focus:outline-none focus:border-[#EA580C] cursor-pointer shadow-xs"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
            <span className="hidden lg:inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
              {ROLE_CAPABILITIES[activeRole]?.scope || 'Jurisdiction'}
            </span>
          </div>

          {/* Profile Card */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-[#BAE6FD]/60">
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#BAE6FD] bg-[#F0F7FF] hover:bg-[#E0F2FE] text-xs font-extrabold text-[#0F172A] transition-all cursor-pointer shadow-xs"
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
