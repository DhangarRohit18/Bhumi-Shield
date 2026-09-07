import React, { useState } from 'react';
import { Shield, ArrowRight } from 'lucide-react';
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

  const roleOptions: { value: UserRole; label: string; desc: string }[] = [
    {
      value: 'NATIONAL_EXECUTIVE',
      label: '🏛️ National & District Executive Cockpit',
      desc: 'Cabinet Secretariat • State Revenue • District Collector',
    },
    {
      value: 'FIELD_ACQUISITION',
      label: '📐 Ground Field & Statutory Acquisition Suite',
      desc: 'CALA • Circle Officer • Field Surveyor (AR/DGPS)',
    },
    {
      value: 'AUDIT_CITIZEN',
      label: '🛡️ Audit, Compliance & Citizen Portal',
      desc: 'CAG Vigilance • PFMS Ledger • Citizen / PAF Claims',
    },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    switchDemoRole(selectedRole);
    onLoginSuccess(selectedRole);
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex flex-col justify-between font-sans text-[#0F172A]">
      {/* Main Government Navbar Header */}
      <header className="border-b border-[#BAE6FD]/60 bg-white/95 backdrop-blur-md px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#EA580C] text-white shadow-md">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-wide text-[#0F172A]">BHUMI-SHIELD</span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                MoRTH Govt. of India
              </span>
            </div>
          </div>
        </div>
        <span className="text-xs font-mono text-[#EA580C] font-black bg-[#FFF7ED] px-3 py-1 rounded-lg border border-[#FFEDD5]">
          RFCTLARR ACT (2013) COMPLIANT
        </span>
      </header>

      {/* Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-6 bg-[#F0F7FF]">
        <div className="max-w-xl w-full bg-white border border-[#BAE6FD] rounded-2xl p-8 shadow-xl shadow-blue-500/5 space-y-6">
          <div className="text-center space-y-1.5 border-b border-[#E2E8F0] pb-5">
            <h1 className="text-xl font-black text-[#0F172A]">Official Portal Authentication</h1>
            <p className="text-xs text-[#64748B] font-semibold">
              Select your consolidated statutory role to access your synchronized workspace
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {/* Role Selection */}
            <div>
              <label className="block text-[#0F172A] font-extrabold mb-1.5 uppercase text-[10px] tracking-wider">
                Select Unified Role Dashboard
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                aria-label="Statutory Role Clearance"
                className="w-full bg-[#F0F7FF] border border-[#BAE6FD] rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-[#0F172A] focus:outline-none focus:border-[#EA580C] cursor-pointer shadow-xs"
              >
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} — {opt.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* Official ID */}
            <div>
              <label className="block text-[#0F172A] font-extrabold mb-1 uppercase text-[10px] tracking-wider">
                Govt. Official ID / Aadhaar SSO Token
              </label>
              <input
                type="text"
                required
                value={officialId}
                onChange={(e) => setOfficialId(e.target.value)}
                className="w-full bg-[#F0F7FF] border border-[#BAE6FD] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#0F172A] font-bold focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            {/* Access Passcode */}
            <div>
              <label className="block text-[#0F172A] font-extrabold mb-1 uppercase text-[10px] tracking-wider">
                Digital Signature Certificate (DSC) Passcode
              </label>
              <input
                type="password"
                required
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                className="w-full bg-[#F0F7FF] border border-[#BAE6FD] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#0F172A] font-bold focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            {/* Login Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
              >
                <span>Authenticate & Open Workspace</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#BAE6FD]/60 bg-white px-8 py-3.5 text-center text-[11px] text-[#0369A1] font-semibold shadow-sm">
        Designed & Developed for Ministry of Road Transport & Highways (MoRTH) • Secured with Firebase App Check & Digital Signatures
      </footer>
    </div>
  );
};
