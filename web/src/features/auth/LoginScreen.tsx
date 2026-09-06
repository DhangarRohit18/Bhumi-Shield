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
      defaultTarget: 'Bhumi-Chakra: Corridor Sentinel',
    },
    'Field Supervisor': {
      title: 'District Field Supervisor & Survey In-charge',
      desc: 'Joint Measurement Surveys (JMS), squad allocation, and DGPS verification.',
      defaultTarget: 'Operations & Intelligence',
    },
    'Field Officer': {
      title: 'Field Revenue Officer / Talathi',
      desc: 'Cadastral Khasra ground inspection, boundary pillar QR scanning & evidence ingest.',
      defaultTarget: 'Bhumi-Chakra (Parcels & Evidence)',
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans text-[#0F172A]">
      {/* Bhoomi Rashi Official Top Utility Bar in Light Blue */}
      <div className="bg-[#E0F2FE] text-[#0369A1] text-[11px] px-8 py-2 flex items-center justify-between border-b border-[#BAE6FD] font-semibold">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[#0369A1]">
            <span className="text-[#BF7834] font-extrabold">📞 Phone:</span> 011-23711824
          </span>
          <span className="hidden sm:flex items-center gap-1.5 text-[#0369A1]">
            <span className="text-[#BF7834] font-extrabold">✉️ Support:</span> supportla-morth@gov.in
          </span>
        </div>
        <div className="flex items-center gap-4 text-[#0284C7]">
          <span className="font-extrabold text-[#0369A1]">Highway Land Register [Rule 4(1)]</span>
          <span>•</span>
          <span className="font-extrabold text-[#BF7834]">Ministry of Road Transport & Highways</span>
        </div>
      </div>

      {/* Main Government Navbar Header */}
      <header className="border-b border-[#E2E8F0] bg-white px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#BF7834] text-white shadow-sm">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-wide text-[#BF7834]">BHUMI-SHIELD</span>
              <span className="text-sm font-extrabold text-[#1E293B]">| Land Acquisition Portal</span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#BF7834] border border-[#FDE68A]">
                Govt. of India
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] font-semibold mt-0.5">
              Ministry of Road Transport & Highways • National Land Acquisition Mission & Statutory Sentinel
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-[#BF7834] font-black bg-[#FFFBEB] px-3 py-1 rounded-lg border border-[#FDE68A]">
          RFCTLARR ACT (2013) COMPLIANT
        </span>
      </header>

      {/* Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-6 bg-[#F8FAFC]">
        <div className="max-w-xl w-full bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-md space-y-6">
          <div className="text-center space-y-1.5 border-b border-[#E2E8F0] pb-5">
            <h1 className="text-xl font-black text-[#BF7834]">Official Portal Authentication</h1>
            <p className="text-xs text-[#64748B] font-semibold">
              Select your designated statutory government role to access your authorized workspace
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {/* Role Selection */}
            <div>
              <label className="block text-[#1E293B] font-extrabold mb-1.5 uppercase text-[10px] tracking-wider">
                Select Statutory Role & Clearance
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                aria-label="Statutory Role Clearance"
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-[#0F172A] focus:outline-none focus:border-[#BF7834] cursor-pointer shadow-sm"
              >
                {Object.keys(roleDescriptions).map((role) => (
                  <option key={role} value={role}>
                    {role} — {roleDescriptions[role as UserRole].title}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Description Callout */}
            <div className="p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl space-y-1">
              <p className="font-extrabold text-[#BF7834] text-xs">
                {roleDescriptions[selectedRole].title}
              </p>
              <p className="text-[11px] text-[#78350F] leading-relaxed font-medium">
                {roleDescriptions[selectedRole].desc}
              </p>
              <div className="pt-2 border-t border-[#FDE68A] text-[10px] text-[#BF7834] font-extrabold">
                Designated Landing: <strong>{roleDescriptions[selectedRole].defaultTarget}</strong>
              </div>
            </div>

            {/* Official ID */}
            <div>
              <label className="block text-[#1E293B] font-extrabold mb-1 uppercase text-[10px] tracking-wider">
                Govt. Official ID / Aadhaar SSO Token
              </label>
              <input
                type="text"
                required
                value={officialId}
                onChange={(e) => setOfficialId(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#0F172A] font-bold focus:outline-none focus:border-[#BF7834]"
              />
            </div>

            {/* Access Passcode */}
            <div>
              <label className="block text-[#1E293B] font-extrabold mb-1 uppercase text-[10px] tracking-wider">
                Digital Signature Certificate (DSC) Passcode
              </label>
              <input
                type="password"
                required
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#0F172A] font-bold focus:outline-none focus:border-[#BF7834]"
              />
            </div>

            {/* Login Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3.5 bg-[#BF7834] hover:bg-[#A36224] text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Authenticate & Open Workspace</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white px-8 py-3.5 text-center text-[11px] text-[#64748B] font-semibold shadow-sm">
        Designed & Developed for Ministry of Road Transport & Highways (MoRTH) • Secured with Firebase App Check & Digital Signatures
      </footer>
    </div>
  );
};
