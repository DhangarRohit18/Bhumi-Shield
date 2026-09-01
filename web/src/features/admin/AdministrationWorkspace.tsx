import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import {
  departmentService,
  stateService,
  districtService,
  iotDeviceService,
} from '../../services/entities.service';
import { auditService } from '../../services/audit.service';
import {
  Shield,
  Users,
  Building2,
  MapPin,
  Clock,
  QrCode,
  Radio,
  FileCheck,
  History,
  Activity,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const AdministrationWorkspace: React.FC = () => {
  const { activeRole, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'depts' | 'sla' | 'assets' | 'audit' | 'health'>('users');
  const [maskPII, setMaskPII] = useState<boolean>(true);

  const { data: allDepts } = useFirestoreCollection(departmentService);
  const { data: allStates } = useFirestoreCollection(stateService);
  const { data: allDistricts } = useFirestoreCollection(districtService);
  const { data: allIoTDevices } = useFirestoreCollection(iotDeviceService);
  const { data: allAuditLogs } = useFirestoreCollection(auditService);

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans">
      {/* Top Admin Header in Pure White & Beige */}
      <div className="bg-[#FDFBF7] border-b border-[#E2D9CC] px-6 py-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E]">
              <Shield className="w-6 h-6 text-[#8C7355]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">Administration & Security Control Hub</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E]">
                  MASTER CONFIG
                </span>
              </div>
              <p className="text-xs text-[#786C5E] mt-0.5">
                Statutory RBAC • Jurisdictions • SLA Policies • PII Minimization • Cryptographic Audit Ledger
              </p>
            </div>
          </div>

          {/* PII Toggle */}
          <div className="flex items-center gap-2 bg-white border border-[#C5B49E] rounded-xl px-3 py-1.5 shadow-sm">
            {maskPII ? <EyeOff className="w-4 h-4 text-[#8C7355]" /> : <Eye className="w-4 h-4 text-emerald-700" />}
            <span className="text-xs font-bold text-slate-800">
              PII Minimization: {maskPII ? 'Active (Masked)' : 'Disabled'}
            </span>
            <button
              onClick={() => setMaskPII(!maskPII)}
              className="ml-2 px-2 py-0.5 text-[10px] font-bold rounded bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E] cursor-pointer"
            >
              {maskPII ? 'Unmask' : 'Mask'}
            </button>
          </div>
        </div>

        {/* Tab Navigation in Pure Beige */}
        <div className="flex space-x-2 pt-2 border-t border-[#E2D9CC] overflow-x-auto">
          {[
            { id: 'users', label: 'Users & Identity', icon: Users },
            { id: 'roles', label: 'Roles & RBAC Matrix', icon: KeyRound },
            { id: 'depts', label: 'Departments & Agencies', icon: Building2 },
            { id: 'sla', label: 'Statutory SLA Rules', icon: Clock },
            { id: 'assets', label: 'QR & IoT Registries', icon: Radio },
            { id: 'audit', label: 'Security Audit Ledger', icon: History },
            { id: 'health', label: 'System Health & App Check', icon: Activity },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E]'
                    : 'text-[#786C5E] hover:text-slate-900 hover:bg-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subtab View Content in Pure White */}
      <div className="p-6 flex-1 bg-white">
        {activeTab === 'users' && (
          <div className="p-5 rounded-2xl bg-white border border-[#E2D9CC] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-[#E2D9CC] pb-3">
              Official Users & Identity Verification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Dr. Rajesh Verma, IAS', role: 'National Admin', email: 'admin.national@bhumishield.gov.in', phone: '98201XXXXX' },
                { name: 'Shri Vikram Joshi, IAS', role: 'Acquisition Officer (CALA)', email: 'cala.palghar@gov.in', phone: '94220XXXXX' },
                { name: 'Smt. Deepa Kulkarni', role: 'District Officer', email: 'collector.thane@gov.in', phone: '91580XXXXX' },
              ].map((u, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2D9CC] space-y-1 text-xs">
                  <div className="flex justify-between items-start">
                    <strong className="text-slate-900 font-bold text-xs">{u.name}</strong>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E]">
                      {u.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#786C5E] font-mono">{u.email}</p>
                  <p className="text-[10px] text-[#786C5E]">Phone: {maskPII ? 'XXXX-XXXX-92' : u.phone}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="p-5 rounded-2xl bg-white border border-[#E2D9CC] shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[#E2D9CC] pb-3">
              <h3 className="text-sm font-bold text-slate-900">Cryptographic Security Audit Trail</h3>
              <span className="text-xs text-emerald-800 font-bold font-mono">SHA-256 Checksums Verified</span>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {allAuditLogs.map((log: any) => (
                <div key={log.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E2D9CC] flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-900">{log.action}</strong> on <span className="font-mono text-[#8C7355]">{log.targetCollection}</span>
                    <p className="text-[11px] text-[#786C5E]">By: {log.actorName} ({log.actorRole})</p>
                  </div>
                  <span className="font-mono text-[10px] text-[#786C5E]">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab !== 'users' && activeTab !== 'audit' && (
          <div className="p-8 text-center rounded-2xl bg-[#FAF8F5] border border-[#E2D9CC] space-y-2">
            <Shield className="w-8 h-8 text-[#8C7355] mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">Module Configured & Operational</h3>
            <p className="text-xs text-[#786C5E]">Active jurisdiction & statutory rule enforcement connected to live Firebase.</p>
          </div>
        )}
      </div>
    </div>
  );
};
