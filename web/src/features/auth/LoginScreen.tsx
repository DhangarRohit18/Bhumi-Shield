import React, { useState } from 'react';
import { Shield, ArrowRight, CheckCircle2, Lock, Sparkles, Building, Layers, FileCheck } from 'lucide-react';
import { UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface LoginScreenProps {
  onLoginSuccess: (role: UserRole) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { switchDemoRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('NATIONAL_EXECUTIVE');
  const [officialId, setOfficialId] = useState('GOV-MH-8921');
  const [accessKey, setAccessKey] = useState('••••••••••••');

  const roleOptions: { value: UserRole; label: string; desc: string; badge: string }[] = [
    {
      value: 'NATIONAL_EXECUTIVE',
      label: 'National & District Executive Cockpit',
      desc: 'Cabinet Secretariat • State Revenue • District Collector',
      badge: 'Admin Suite',
    },
    {
      value: 'FIELD_ACQUISITION',
      label: 'Ground Field & Statutory Acquisition Suite',
      desc: 'CALA • Circle Officer • Field Surveyor (AR/DGPS)',
      badge: 'Operations',
    },
    {
      value: 'AUDIT_CITIZEN',
      label: 'Audit, Compliance & Citizen Transparency',
      desc: 'CAG Vigilance • PFMS Ledger • Citizen / PAF Claims',
      badge: 'Public & Auditor',
    },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    switchDemoRole(selectedRole);
    onLoginSuccess(selectedRole);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF0FF] via-[#F4F1FF] to-white flex flex-col justify-between  text-[#0B132B] relative overflow-hidden">
      {/* Background Decorative Ambient Glow Orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-200/40 to-purple-200/40 blur-3xl opacity-70" />
        <div className="absolute right-[-10%] top-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-blue-200/40 to-indigo-200/40 blur-3xl opacity-70" />
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-purple-100/50 to-pink-100/40 blur-3xl opacity-60" />
      </div>

      {/* Modern Floating Header */}
      <header className="px-6 py-5 max-w-7xl mx-auto w-full flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-soft bg-white border border-slate-100 flex items-center justify-center">
            <img src="/logo.png" alt="Bhumi-Shield Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-[#0B132B]">
              BHUMI-SHIELD
            </span>
            <span className="text-[10px] font-extrabold text-indigo-600 block leading-none">
              The Land Operating System
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/15 bg-white/70 backdrop-blur-md text-xs font-extrabold text-indigo-900 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
          <span>RFCTLARR Act (2013) Compliant</span>
        </div>
      </header>

      {/* Main Hero & Auth Split View */}
      <main className="flex-1 flex items-center justify-center p-6 z-10 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center w-full">
          {/* Left Hero Narrative */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-white/80 px-4 py-1.5 text-xs font-extrabold text-indigo-600 shadow-xs backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
              Built for Modern Land Operations
            </div>

            <h1 className="font-extrabold text-3xl sm:text-5xl lg:text-[46px] leading-[1.1] tracking-tight text-[#0B132B]">
              The Operating System for{' '}
              <span className="text-gradient">Modern Land Acquisition</span> Teams.
            </h1>

            <p className="text-sm sm:text-base leading-relaxed text-slate-600 max-w-xl mx-auto lg:mx-0">
              Centralize parcel intelligence, acquisitions, litigation tracking, document workflows, GIS data, approvals, and reporting in a single unified platform.
            </p>

            {/* Micro Feature Bullet Points */}
            <div className="pt-2 grid grid-cols-2 gap-3 text-xs font-extrabold text-slate-700 max-w-md mx-auto lg:mx-0 text-left">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Multi-Corridor GIS Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cadastral Digital Twin</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Immutable SHA-256 Ledger</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Mobile AR Field HUD</span>
              </div>
            </div>
          </div>

          {/* Right Floating Authentication Card */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="max-w-md w-full bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl p-7 shadow-float space-y-5">
              <div className="space-y-1">
                <div className="inline-flex p-2 rounded-2xl bg-indigo-50 text-indigo-600 mb-1">
                  <Lock className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-extrabold text-[#0B132B] tracking-tight">
                  Sign in to your Workspace
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Select your role clearance to access your synchronized dashboard
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                {/* Role Clearance Selector */}
                <div className="space-y-1.5">
                  <label className="block text-slate-700 font-extrabold uppercase text-[10px] tracking-wider">
                    Statutory Role Clearance
                  </label>
                  <div className="space-y-2">
                    {roleOptions.map((opt) => {
                      const isSelected = selectedRole === opt.value;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => setSelectedRole(opt.value)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                              : 'bg-transparent/70 border-slate-200/80 hover:bg-slate-100/60'
                          }`}
                        >
                          <div>
                            <span className="font-extrabold text-xs text-[#0B132B] block">
                              {opt.label}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {opt.desc}
                            </span>
                          </div>
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {opt.badge}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Official ID */}
                <div className="space-y-1">
                  <label className="block text-slate-700 font-extrabold uppercase text-[10px] tracking-wider">
                    Official ID / Aadhaar SSO Token
                  </label>
                  <input
                    type="text"
                    required
                    value={officialId}
                    onChange={(e) => setOfficialId(e.target.value)}
                    className="w-full bg-transparent border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#0B132B] font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* DSC Passcode */}
                <div className="space-y-1">
                  <label className="block text-slate-700 font-extrabold uppercase text-[10px] tracking-wider">
                    DSC Digital Signature Passcode
                  </label>
                  <input
                    type="password"
                    required
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    className="w-full bg-transparent border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#0B132B] font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full font-extrabold text-xs bg-brand-gradient text-white shadow-soft hover:shadow-float hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <span>Authenticate & Open Workspace</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="px-6 py-4 border-t border-slate-200/60 bg-white/60 backdrop-blur-md text-center text-xs text-slate-500 font-medium z-20">
        BHUMI-SHIELD • The Operating System for Land Acquisition, GIS & Statutory R&R Teams
      </footer>
    </div>
  );
};
