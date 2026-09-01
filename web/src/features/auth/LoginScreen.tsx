import React, { useState } from 'react';
import { Shield, ArrowRight } from 'lucide-react';
import { UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface LoginScreenProps {
  onLoginSuccess: (role: UserRole) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { switchDemoRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('National Admin');
  const [officialId, setOfficialId] = useState('GOV-MH-8921');
  const [accessKey, setAccessKey] = useState('••••••••••••');

  const roleDescriptions: Record<UserRole, { title: string; desc: string; defaultTarget: string }> = {
    'National Admin': {
      title: 'National Administrator / Cabinet Secretariat',
      desc: 'Pan-India corridor oversight, policy interventions, and inter-state approvals.',
      defaultTarget: 'National Command Center',
    },
    'State Admin': {
      title: 'State Revenue Secretary / Divisional Commissioner',
      desc: 'Statewide land acquisition velocity, district coordination & forest NOC clearance.',
      defaultTarget: 'National Command Center (State Scope)',
    },
    'District Officer': {
      title: 'District Magistrate & Collector',
      desc: 'District revenue circles, Section 15 objection hearings, and SLA enforcement.',
      defaultTarget: 'National Command Center (District Scope)',
    },
    'Acquisition Officer': {
      title: 'Competent Authority for Land Acquisition (CALA / SDO)',
      desc: 'Section 19 declarations, Section 23/30 awards, solatium, and PFMS approvals.',
      defaultTarget: 'Project Digital Twin',
    },
    'Field Supervisor': {
      title: 'District Field Supervisor & Survey In-charge',
      desc: 'Joint Measurement Surveys (JMS), squad allocation, and DGPS verification.',
      defaultTarget: 'Operations & Intelligence',
    },
    'Field Officer': {
      title: 'Field Revenue Officer / Talathi',
      desc: 'Cadastral Khasra ground inspection, boundary pillar QR scanning & evidence ingest.',
      defaultTarget: 'Project Digital Twin (Parcels)',
    },
    'Auditor': {
      title: 'Principal Auditor / Vigilance Officer',
      desc: 'Forensic audit trails, SHA-256 tamper-proof checks, and fund ledger verification.',
      defaultTarget: 'Administration & Security',
    },
    'Public User': {
      title: 'Citizen / Project Affected Landowner (PAF)',
      desc: 'Public gazette notifications, transparent award inquiry & grievance redressal.',
      defaultTarget: 'National Command Center (Public View)',
    },
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    switchDemoRole(selectedRole);
    onLoginSuccess(selectedRole);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between font-sans text-slate-900">
      {/* Top Government Bar */}
      <header className="border-b border-[#E2D9CC] bg-[#FDFBF7] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E]">
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
        <span className="text-xs font-mono text-[#786C5E] font-semibold">
          RFCTLARR ACT (2013) COMPLIANT
        </span>
      </header>

      {/* Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-6 bg-[#FAF8F5]">
        <div className="max-w-xl w-full bg-white border border-[#E2D9CC] rounded-2xl p-8 shadow-sm space-y-6">
          <div className="text-center space-y-1.5 border-b border-[#E2D9CC] pb-5">
            <h1 className="text-xl font-bold text-slate-900">Official Portal Authentication</h1>
            <p className="text-xs text-[#786C5E]">
              Select your designated statutory government role to access your authorized workspace
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {/* Role Selection */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5 uppercase text-[10px] tracking-wider">
                Select Statutory Role & Clearance
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                aria-label="Statutory Role Clearance"
                className="w-full bg-[#FDFBF7] border border-[#C5B49E] rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#8C7355] cursor-pointer"
              >
                {Object.keys(roleDescriptions).map((role) => (
                  <option key={role} value={role}>
                    {role} — {roleDescriptions[role as UserRole].title}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Description Callout */}
            <div className="p-3.5 bg-[#FDFBF7] border border-[#E2D9CC] rounded-xl space-y-1">
              <p className="font-bold text-slate-900 text-xs">
                {roleDescriptions[selectedRole].title}
              </p>
              <p className="text-[11px] text-[#786C5E] leading-relaxed">
                {roleDescriptions[selectedRole].desc}
              </p>
              <div className="pt-1.5 border-t border-[#E2D9CC] text-[10px] text-[#8C7355] font-semibold">
                Designated Landing: <strong>{roleDescriptions[selectedRole].defaultTarget}</strong>
              </div>
            </div>

            {/* Official ID */}
            <div>
              <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px] tracking-wider">
                Govt. Official ID / Aadhaar SSO Token
              </label>
              <input
                type="text"
                required
                value={officialId}
                onChange={(e) => setOfficialId(e.target.value)}
                className="w-full bg-[#FDFBF7] border border-[#C5B49E] rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#8C7355]"
              />
            </div>

            {/* Access Passcode */}
            <div>
              <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px] tracking-wider">
                Digital Signature Certificate (DSC) Passcode
              </label>
              <input
                type="password"
                required
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                className="w-full bg-[#FDFBF7] border border-[#C5B49E] rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#8C7355]"
              />
            </div>

            {/* Login Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3 bg-[#E2D9CC] hover:bg-[#D5C7B7] text-[#4A3B2C] border border-[#C5B49E] font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>Authenticate & Open Workspace</span>
                <ArrowRight className="w-4 h-4 text-[#4A3B2C]" />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white px-8 py-3 text-center text-[11px] text-[#786C5E]">
        National Informatics Mission • Government of India • Secured with Firebase App Check & Digital Signatures
      </footer>
    </div>
  );
};
