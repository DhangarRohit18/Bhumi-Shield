import React, { useEffect, useRef, useState } from 'react';
import { UserRole } from '../../../types';
import { LiveSyncStatusBar } from '../../../components/LiveSyncStatusBar';

interface HeaderProps {
  activeRole: UserRole;
  scopeLabel: string;
  totalCorridors: number;
  triagedBottlenecks: number;
  delayedProjects: number;
  totalDisbursedINR: number;
}

/** Flashes a KPI card briefly whenever its value changes — real-time feedback. */
function useFlashOnChange(value: number): boolean {
  const [flashing, setFlashing] = useState(false);
  const prevRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevRef.current !== null && prevRef.current !== value) {
      setFlashing(true);
      const t = setTimeout(() => setFlashing(false), 900);
      return () => clearTimeout(t);
    }
    prevRef.current = value;
  }, [value]);

  return flashing;
}

import { FileText, Download, CheckCircle2, AlertTriangle, X, Printer, Shield } from 'lucide-react';

export const NationalOperationalHeader: React.FC<HeaderProps> = ({
  activeRole,
  scopeLabel,
  totalCorridors,
  triagedBottlenecks,
  delayedProjects,
  totalDisbursedINR,
}) => {
  const [isPragatiOpen, setIsPragatiOpen] = useState(false);
  const flashCorridors = useFlashOnChange(totalCorridors);
  const flashBottlenecks = useFlashOnChange(triagedBottlenecks);
  const flashDelayed = useFlashOnChange(delayedProjects);
  const flashDisbursed = useFlashOnChange(totalDisbursedINR);

  // Live relative clock shown next to scope label
  const [nowStr, setNowStr] = useState(() =>
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  useEffect(() => {
    const t = setInterval(() => {
      setNowStr(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-[#BAE6FD]/60 px-6 py-4 shadow-sm font-sans space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-tight text-[#0F172A]">
            National Command Center
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* PRAGATI PM-Level Briefing Button */}
          <button
            onClick={() => setIsPragatiOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#0F172A] to-[#1E293B] hover:from-[#1E293B] hover:to-[#334155] text-white text-xs font-black shadow-sm transition-all cursor-pointer border border-[#334155]"
            title="Generate PM-Level PRAGATI Review Brief"
          >
            <FileText className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>PRAGATI PMO View</span>
            <span className="text-[9px] font-mono px-1 rounded bg-[#EA580C] text-white font-bold">
              1-CLICK
            </span>
          </button>

          {/* Live clock */}
          <div className="px-3 py-1 rounded-lg bg-[#F0F7FF] border border-[#BAE6FD] text-[10px] font-mono font-bold text-[#0F172A]">
            🕐 {nowStr}
          </div>

          <div className="px-3.5 py-1.5 rounded-lg bg-[#FFF7ED] border border-[#FFEDD5] text-xs font-bold text-[#EA580C] flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span>Scope: <strong className="text-[#0F172A] font-extrabold">{scopeLabel}</strong></span>
          </div>

          {/* Real-time Firestore sync indicator */}
          <LiveSyncStatusBar />
        </div>
      </div>

      {/* PRAGATI PMO Review Dossier Modal */}
      {isPragatiOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-[#BAE6FD] shadow-2xl max-w-2xl w-full p-6 space-y-4 font-sans max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#0F172A] text-white">
                  <Shield className="w-5 h-5 text-[#EA580C]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-[#0F172A]">PRAGATI PMO Executive Briefing</h2>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
                      CONFIDENTIAL / PM REVIEW
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Pro-Active Governance & Timely Implementation Dossier • MoRTH / DoLR
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPragatiOpen(false)}
                className="text-xs text-[#64748B] hover:text-[#0F172A] font-bold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* National Macro Health KPI Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#F0F7FF] border border-[#BAE6FD]">
                <p className="text-[10px] text-[#0369A1] font-bold uppercase">National Corridors</p>
                <p className="text-lg font-black text-[#0F172A] font-mono">{totalCorridors}</p>
                <p className="text-[9px] text-[#059669] font-bold">100% Tracked in GIS</p>
              </div>
              <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]">
                <p className="text-[10px] text-[#065F46] font-bold uppercase">Disbursement Done</p>
                <p className="text-lg font-black text-[#065F46] font-mono">₹{(totalDisbursedINR / 10000000).toFixed(1)} Cr</p>
                <p className="text-[9px] text-[#059669] font-bold">PFMS Direct Credit</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
                <p className="text-[10px] text-[#78350F] font-bold uppercase">Critical Bottlenecks</p>
                <p className="text-lg font-black text-[#B45309] font-mono">{triagedBottlenecks}</p>
                <p className="text-[9px] text-[#B45309] font-bold">Triaged via AI Engine</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
                <p className="text-[10px] text-[#991B1B] font-bold uppercase">Delayed Corridors</p>
                <p className="text-lg font-black text-[#DC2626] font-mono">{delayedProjects}</p>
                <p className="text-[9px] text-[#DC2626] font-bold">Requires Inter-State SLA</p>
              </div>
            </div>

            {/* Traffic-Light Status Corridor Roster */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">
                Corridor Escalation Matrix (Traffic-Light Health)
              </h4>
              <div className="space-y-1.5 text-xs">
                {[
                  { name: 'Mumbai-Ahmedabad High Speed Rail (Sec 3)', status: 'YELLOW', lead: 'Sec 19 Declaration Done, Valuation in Progress', lag: 'Forest Clearance in Palghar (14 Days left)' },
                  { name: 'Delhi-Mumbai Expressway Package 4', status: 'GREEN', lead: '91% Possession Verified via SAR Radar', lag: 'On-schedule, zero pending writs' },
                  { name: 'Eastern Dedicated Freight Corridor (Varanasi)', status: 'RED', lead: 'Sec 11(1) Objection Window Open', lag: 'Officer Workload Overload (84% score in Varanasi)' },
                ].map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-extrabold text-[#0F172A]">{c.name}</strong>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                        c.status === 'GREEN' ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]' :
                        c.status === 'YELLOW' ? 'bg-[#FFFBEB] text-[#B45309] border border-[#FCD34D]' :
                        'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                      }`}>
                        {c.status === 'GREEN' ? '🟢 ON TRACK' : c.status === 'YELLOW' ? '🟡 ATTENTION NEEDED' : '🔴 CRITICAL STALL'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#475569]">{c.lead}</p>
                    <p className="text-[10px] text-[#EA580C] font-semibold">Priority Action: {c.lag}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
              <span className="text-[10px] text-[#64748B] font-mono">
                Generated via BHUMI-SHIELD National Engine • Ref: PRAGATI-2026-Q3
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print PMO Brief</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards — flash on value change to signal real-time push */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          className={`p-3.5 rounded-xl border transition-all duration-500 ${
            flashCorridors
              ? 'bg-[#E0F2FE] border-[#38BDF8] shadow-md scale-[1.02]'
              : 'bg-[#F0F7FF] border-[#BAE6FD]/70'
          }`}
        >
          <p className="text-[11px] font-semibold text-[#0369A1]">Active Corridors</p>
          <p className={`text-2xl font-black mt-0.5 transition-colors duration-300 ${flashCorridors ? 'text-[#0284C7]' : 'text-[#0F172A]'}`}>
            {totalCorridors}
          </p>
          {flashCorridors && (
            <span className="text-[9px] font-bold text-[#0284C7] animate-pulse">↑ Updated</span>
          )}
        </div>

        <div
          className={`p-3.5 rounded-xl border transition-all duration-500 ${
            flashBottlenecks
              ? 'bg-[#FFF7ED] border-[#FDBA74] shadow-md scale-[1.02]'
              : 'bg-[#FFF7ED]/70 border-[#FFEDD5]'
          }`}
        >
          <p className="text-[11px] font-semibold text-[#EA580C]">Triaged Bottlenecks</p>
          <p className={`text-2xl font-black mt-0.5 transition-colors duration-300 ${flashBottlenecks ? 'text-[#C2410C]' : 'text-[#0F172A]'}`}>
            {triagedBottlenecks}
          </p>
          {flashBottlenecks && (
            <span className="text-[9px] font-bold text-[#EA580C] animate-pulse">↑ Recalculated</span>
          )}
        </div>

        <div
          className={`p-3.5 rounded-xl border transition-all duration-500 ${
            flashDelayed
              ? 'bg-[#FEF2F2] border-[#FCA5A5] shadow-md scale-[1.02]'
              : 'bg-[#F0F7FF] border-[#BAE6FD]/70'
          }`}
        >
          <p className="text-[11px] font-semibold text-[#0369A1]">Delayed Projects</p>
          <p className={`text-2xl font-black mt-0.5 transition-colors duration-300 ${flashDelayed ? 'text-[#DC2626]' : 'text-[#0F172A]'}`}>
            {delayedProjects}
          </p>
          {flashDelayed && (
            <span className="text-[9px] font-bold text-[#DC2626] animate-pulse">↑ Changed</span>
          )}
        </div>

        <div
          className={`p-3.5 rounded-xl border transition-all duration-500 ${
            flashDisbursed
              ? 'bg-[#ECFDF5] border-[#6EE7B7] shadow-md scale-[1.02]'
              : 'bg-[#F0F7FF] border-[#BAE6FD]/70'
          }`}
        >
          <p className="text-[11px] font-semibold text-[#0369A1]">Total Disbursed (INR)</p>
          <p className={`text-2xl font-black mt-0.5 transition-colors duration-300 ${flashDisbursed ? 'text-[#059669]' : 'text-[#0F172A]'}`}>
            ₹{(totalDisbursedINR / 10000000).toFixed(2)} Cr
          </p>
          {flashDisbursed && (
            <span className="text-[9px] font-bold text-[#059669] animate-pulse">↑ PFMS Push</span>
          )}
        </div>
      </div>
    </div>
  );
};
