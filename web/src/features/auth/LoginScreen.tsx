import React, { useState } from 'react';
import { Shield, ArrowRight, Lock, Map, FileCheck, Users, Activity, Eye, FileText, CheckCircle2 } from 'lucide-react';
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
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const roleOptions: { value: UserRole; label: string; desc: string; icon: React.FC<any> }[] = [
    {
      value: 'NATIONAL_EXECUTIVE',
      label: 'National Executive',
      desc: 'Cabinet Secretariat & District Collector',
      icon: Activity,
    },
    {
      value: 'FIELD_ACQUISITION',
      label: 'Field Acquisition',
      desc: 'CALA & Field Surveyor (AR/DGPS)',
      icon: Map,
    },
    {
      value: 'AUDIT_CITIZEN',
      label: 'Audit & Citizen',
      desc: 'CAG Vigilance & Citizen Portal',
      icon: Eye,
    },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    // Simulate secure network delay for professional feel
    setTimeout(() => {
      switchDemoRole(selectedRole);
      onLoginSuccess(selectedRole);
      setIsAuthenticating(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden font-sans text-slate-900">

      {/* LEFT PANEL: Branding & Authority (Hidden on small mobile) */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#0B132B] relative flex-col justify-between overflow-hidden">
        {/* Background Institutional Pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />

        <div className="relative z-10 p-12">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-white rounded-lg p-1 shadow-lg flex items-center justify-center">
              <img src="/logo.png" alt="Emblem" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight leading-none">BHUMI-SHIELD</h1>
              <p className="text-indigo-300 text-xs font-bold tracking-widest uppercase mt-1">Land Operations System</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-extrabold text-white leading-[1.1] tracking-tight">
              Enterprise Scale.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
                Absolute Transparency.
              </span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-medium">
              A unified operating system for National Infrastructure Projects. Centralizing GIS demarcation, statutory lifecycle tracking, and compensation disbursements under a single cryptographic ledger.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            <FeatureRow icon={Map} title="Cadastral Digital Twin" />
            <FeatureRow icon={FileText} title="Sec 11-19 Statutory Lifecycles" />
            <FeatureRow icon={Users} title="Explainable AI Workload Balancing" />
            <FeatureRow icon={Shield} title="SHA-256 Immutable Audit Trail" />
          </div>
        </div>

        <div className="relative z-10 p-12">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            RFCTLARR Act (2013) Compliant Engine
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Authentication Portal */}
      <div className="w-full lg:w-7/12 flex flex-col justify-center items-center p-6 sm:p-12 relative bg-white">
        {/* Mobile Header (Shows only on small screens) */}
        <div className="lg:hidden flex items-center gap-3 mb-10 self-start">
          <div className="w-10 h-10 bg-[#0B132B] rounded-lg p-1 flex items-center justify-center">
            <img src="/logo.png" alt="Emblem" className="w-full h-full object-contain invert" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#0B132B] tracking-tight">BHUMI-SHIELD</h1>
            <p className="text-indigo-600 text-[10px] font-bold tracking-widest uppercase">Land Operations System</p>
          </div>
        </div>

        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Secure Gateway</h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">Authenticate with your departmental credentials or DSC token to access your synchronized workspace.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">

            {/* Role Clearance Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Statutory Role Clearance</label>
              <div className="grid grid-cols-1 gap-3">
                {roleOptions.map((opt) => {
                  const isSelected = selectedRole === opt.value;
                  const Icon = opt.icon;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => setSelectedRole(opt.value)}
                      className={`relative flex items-center p-4 cursor-pointer rounded-xl border-2 transition-all duration-200 ${isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full mr-4 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-sm font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{opt.label}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                      </div>
                      {isSelected && (
                        <div className="absolute right-4">
                          <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {/* Official ID */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Official ID / Aadhaar SSO Token</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={officialId}
                    onChange={(e) => setOfficialId(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-0 focus:border-indigo-600 transition-colors bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* DSC Passcode */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">DSC Digital Signature Passcode</label>
                  <a href="#" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800">Use Smart Card?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 tracking-widest focus:outline-none focus:ring-0 focus:border-indigo-600 transition-colors bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#0B132B] hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {isAuthenticating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Authorize & Initialize Dashboard</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </form>


        </div>
      </div>
    </div>
  );
};

// Helper Component for the Left Panel
const FeatureRow = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div className="flex items-center gap-3 text-slate-300">
    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
      <Icon className="w-4 h-4 text-indigo-400" />
    </div>
    <span className="text-sm font-bold">{title}</span>
  </div>
);
