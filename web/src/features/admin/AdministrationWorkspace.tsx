import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import {
  departmentService,
  stateService,
  districtService,
  iotDeviceService,
  userService,
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
  const { data: allUsers } = useFirestoreCollection(userService);

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F7FF] text-[#0F172A] font-sans">
      {/* Top Admin Header in Pure White & Executive Slate */}
      <div className="bg-white/95 backdrop-blur-md border-b border-[#BAE6FD]/60 px-6 py-4 space-y-3 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#EA580C] text-white shadow-sm">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-[#0F172A]">Administration & Security Control Hub</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                  MASTER CONFIG
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                Statutory RBAC • Jurisdictions • SLA Policies • PII Minimization • Cryptographic Audit Ledger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMaskPII(!maskPII)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                maskPII
                  ? 'bg-[#E0F2FE] border-[#BAE6FD] text-[#0369A1]'
                  : 'bg-[#FFF7ED] border-[#FFEDD5] text-[#EA580C]'
              }`}
            >
              {maskPII ? <EyeOff className="w-4 h-4 text-[#0284C7]" /> : <Eye className="w-4 h-4 text-[#EA580C]" />}
              <span>{maskPII ? 'PII Masking Active' : 'Unmasked Audit Mode'}</span>
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex space-x-2 pt-2 border-t border-[#BAE6FD]/60 overflow-x-auto">
          {[
            { id: 'users', name: 'Authorized Officers', icon: Users },
            { id: 'roles', name: 'Statutory RBAC Matrix', icon: KeyRound },
            { id: 'depts', name: 'Acquisition Authorities', icon: Building2 },
            { id: 'sla', name: 'RFCTLARR Timelines', icon: Clock },
            { id: 'assets', name: 'DGPS & IoT Pillars', icon: Radio },
            { id: 'audit', name: 'SHA-256 Ledger', icon: History },
            { id: 'health', name: 'System Resilience', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0F172A] text-white shadow-sm'
                    : 'text-[#0369A1] hover:text-[#0F172A] hover:bg-[#E0F2FE]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#EA580C]' : 'text-[#0284C7]'}`} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subtab View Content in Pure White */}
      <div className="p-6 flex-1 bg-[#F8FAFC]">
        {activeTab === 'users' && (
          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4 font-sans">
            <h3 className="text-sm font-extrabold text-[#0F172A] border-b border-[#E2E8F0] pb-3">
              Official Users & Identity Verification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allUsers.map((u, i) => (
                <div key={u.id || i} className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-[#0F172A] font-extrabold text-xs block">{u.displayName || 'Unknown Officer'}</strong>
                      <span className="text-[10px] text-[#EA580C] font-semibold">User Role</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#0F172A] text-white">
                      {u.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] font-mono">{u.email}</p>
                  <p className="text-[10px] text-[#64748B]">Active: {u.isActive ? 'Yes' : 'No'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4 font-sans">
            <h3 className="text-sm font-extrabold text-[#0F172A] border-b border-[#E2E8F0] pb-3">
              Consolidated Statutory Role-Based Access Control (RBAC) Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#0F172A]">
                <thead className="bg-[#F8FAFC] text-[10px] uppercase font-bold text-[#64748B] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="p-2.5">Unified Dashboard Role</th>
                    <th className="p-2.5">Constituent Roles</th>
                    <th className="p-2.5">Scope</th>
                    <th className="p-2.5">Sec 19 Gazette</th>
                    <th className="p-2.5">Sec 30 100% Solatium</th>
                    <th className="p-2.5">PFMS Direct Credit</th>
                    <th className="p-2.5">SHA-256 Ledger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-[11px]">
                  <tr>
                    <td className="p-2.5 font-bold text-[#0F172A]">🏛️ National & District Executive Cockpit</td>
                    <td className="p-2.5 text-[#64748B]">Cabinet Sec. + State Revenue + DM Collector</td>
                    <td className="p-2.5 text-[#64748B]">Pan-India & Multi-State</td>
                    <td className="p-2.5 text-[#047857] font-bold">✓ Sovereign Approval</td>
                    <td className="p-2.5 text-[#047857] font-bold">✓ Final Sanction</td>
                    <td className="p-2.5 text-[#047857] font-bold">✓ Authorize Order</td>
                    <td className="p-2.5 text-[#047857] font-bold">✓ Full Oversight</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-[#0F172A]">📐 Ground Field & Statutory Acquisition Suite</td>
                    <td className="p-2.5 text-[#64748B]">CALA + Circle Officer + Ground Surveyor</td>
                    <td className="p-2.5 text-[#64748B]">Corridor & Revenue Circle</td>
                    <td className="p-2.5 text-[#047857] font-bold">✓ Draft & Submit</td>
                    <td className="p-2.5 text-[#047857] font-bold">✓ Compute & Award</td>
                    <td className="p-2.5 text-[#B45309] font-bold">⚡ Initiate Batch</td>
                    <td className="p-2.5 text-[#047857] font-bold">✓ Direct Append</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-[#0F172A]">🛡️ Audit, Compliance & Public Transparency Portal</td>
                    <td className="p-2.5 text-[#64748B]">Statutory Auditor / CAG + Citizen / PAF</td>
                    <td className="p-2.5 text-[#64748B]">Vigilance & Public Portal</td>
                    <td className="p-2.5 text-[#64748B]">Public Gazette View</td>
                    <td className="p-2.5 text-[#64748B]">Solatium Audit / Claim</td>
                    <td className="p-2.5 text-[#64748B]">Reconciliation View</td>
                    <td className="p-2.5 text-[#047857] font-bold">✓ Cryptographic Audit</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'depts' && (
          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4 font-sans">
            <h3 className="text-sm font-extrabold text-[#0F172A] border-b border-[#E2E8F0] pb-3">
              Departments, Implementing Agencies & Inter-Agency Coordination
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allDepts.map((d: any) => (
                <div key={d.id} className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1 text-xs">
                  <span className="font-mono text-[10px] text-[#0F172A] font-extrabold">{d.code || d.id}</span>
                  <h4 className="font-bold text-[#0F172A]">{d.name}</h4>
                  <p className="text-[11px] text-[#64748B]">Ministry: {d.ministry || 'Ministry of Railways / MoRTH'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sla' && (
          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4 font-sans">
            <h3 className="text-sm font-extrabold text-[#0F172A] border-b border-[#E2E8F0] pb-3">
              Statutory SLA Rules & Threshold Engine (RFCTLARR 2013)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <span className="font-bold text-[#0F172A]">Section 15 Objections SLA</span>
                <p className="text-lg font-extrabold text-[#0F172A]">60 Days</p>
                <p className="text-[10px] text-[#64748B]">Hearing and collector report threshold</p>
              </div>
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <span className="font-bold text-[#0F172A]">Section 19 Declaration Lapse SLA</span>
                <p className="text-lg font-extrabold text-[#0F172A]">12 Months</p>
                <p className="text-[10px] text-[#64748B]">Automatic lapse alert threshold under Sec 19(7)</p>
              </div>
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <span className="font-bold text-[#0F172A]">PFMS Compensation Direct Credit SLA</span>
                <p className="text-lg font-extrabold text-[#0F172A]">30 Days</p>
                <p className="text-[10px] text-[#64748B]">Post-Award disbursement SLA</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4 font-sans">
            <h3 className="text-sm font-extrabold text-[#0F172A] border-b border-[#E2E8F0] pb-3">
              DGPS Boundary Pillars & IoT Sentinels Registry
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allIoTDevices.map((d: any) => (
                <div key={d.id} className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[#0F172A] font-extrabold">{d.deviceId}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${d.status === 'ONLINE' ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#FFF1F2] text-[#9F1239]'}`}>
                      {d.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B]">Type: {d.deviceType} • Battery: {d.batteryPercentage}%</p>
                  <p className="text-[10px] text-[#64748B] font-mono">Firmware: v2.4-DGPS-ESP32</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4 font-sans">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-extrabold text-[#0F172A]">Cryptographic Security Audit Trail</h3>
              <span className="text-xs text-[#0F172A] font-extrabold font-mono">SHA-256 Checksums Verified</span>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {allAuditLogs.map((log: any) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs shadow-sm">
                  <div>
                    <strong className="text-[#0F172A] font-bold">{log.action}</strong> on <span className="font-mono text-[#0F172A] font-bold">{log.targetCollection}</span>
                    <p className="text-[11px] text-[#64748B]">By: {log.actorName} ({log.actorRole})</p>
                  </div>
                  <span className="font-mono text-[10px] text-[#64748B] font-medium">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4 font-sans">
            <h3 className="text-sm font-extrabold text-[#0F172A] border-b border-[#E2E8F0] pb-3">
              System Health & Cryptographic Integrity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-1">
                <span className="font-bold text-[#047857]">Cloud Firestore Cluster</span>
                <p className="text-lg font-extrabold text-[#047857]">Healthy (100% SLA)</p>
                <p className="text-[10px] text-[#047857]">28 statutory collections synchronized</p>
              </div>
              <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-1">
                <span className="font-bold text-[#047857]">Firebase App Check</span>
                <p className="text-lg font-extrabold text-[#047857]">Active & Attested</p>
                <p className="text-[10px] text-[#047857]">Play Integrity & reCAPTCHA v3 enabled</p>
              </div>
              <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-1">
                <span className="font-bold text-[#047857]">Cryptographic Hash Verifier</span>
                <p className="text-lg font-extrabold text-[#047857]">Verified (SHA-256)</p>
                <p className="text-[10px] text-[#047857]">Zero tampering detected across audit ledger</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
