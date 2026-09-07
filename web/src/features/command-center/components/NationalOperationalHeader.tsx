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

export const NationalOperationalHeader: React.FC<HeaderProps> = ({
  activeRole,
  scopeLabel,
  totalCorridors,
  triagedBottlenecks,
  delayedProjects,
  totalDisbursedINR,
}) => {
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
    <div className="bg-white border-b border-[#E2E8F0] px-6 py-4 shadow-sm font-sans space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-tight text-[#0F172A]">
            National Command Center
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Live clock */}
          <div className="px-3 py-1 rounded-lg bg-[#F1F5F9] border border-[#CBD5E1] text-[10px] font-mono font-bold text-[#0F172A]">
            🕐 {nowStr}
          </div>

          <div className="px-3.5 py-1.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-xs font-bold text-[#BF7834] flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span>Scope: <strong className="text-[#0F172A] font-extrabold">{scopeLabel}</strong></span>
          </div>

          {/* Real-time Firestore sync indicator */}
          <LiveSyncStatusBar />
        </div>
      </div>

      {/* KPI Cards — flash on value change to signal real-time push */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          className={`p-3.5 rounded-xl border transition-all duration-500 ${
            flashCorridors
              ? 'bg-[#EFF6FF] border-[#93C5FD] shadow-md scale-[1.02]'
              : 'bg-[#F8FAFC] border-[#E2E8F0]'
          }`}
        >
          <p className="text-[11px] font-semibold text-[#64748B]">Active Corridors</p>
          <p className={`text-2xl font-black mt-0.5 transition-colors duration-300 ${flashCorridors ? 'text-[#1E40AF]' : 'text-[#0F172A]'}`}>
            {totalCorridors}
          </p>
          {flashCorridors && (
            <span className="text-[9px] font-bold text-[#1E40AF] animate-pulse">↑ Updated</span>
          )}
        </div>

        <div
          className={`p-3.5 rounded-xl border transition-all duration-500 ${
            flashBottlenecks
              ? 'bg-[#FFFBEB] border-[#FCD34D] shadow-md scale-[1.02]'
              : 'bg-[#F8FAFC] border-[#E2E8F0]'
          }`}
        >
          <p className="text-[11px] font-semibold text-[#64748B]">Active Bottlenecks</p>
          <p className={`text-2xl font-black mt-0.5 transition-colors duration-300 ${flashBottlenecks ? 'text-[#D97706]' : 'text-[#D97706]'}`}>
            {triagedBottlenecks}
          </p>
          {flashBottlenecks && (
            <span className="text-[9px] font-bold text-[#D97706] animate-pulse">↑ Updated</span>
          )}
        </div>

        <div
          className={`p-3.5 rounded-xl border transition-all duration-500 ${
            flashDelayed
              ? 'bg-[#FEF2F2] border-[#FCA5A5] shadow-md scale-[1.02]'
              : 'bg-[#F8FAFC] border-[#E2E8F0]'
          }`}
        >
          <p className="text-[11px] font-semibold text-[#64748B]">Critical Projects</p>
          <p className={`text-2xl font-black mt-0.5 transition-colors duration-300 ${flashDelayed ? 'text-[#DC2626]' : 'text-[#EF4444]'}`}>
            {delayedProjects}
          </p>
          {flashDelayed && (
            <span className="text-[9px] font-bold text-[#DC2626] animate-pulse">↑ Updated</span>
          )}
        </div>

        <div
          className={`p-3.5 rounded-xl border transition-all duration-500 ${
            flashDisbursed
              ? 'bg-[#F0FDF4] border-[#6EE7B7] shadow-md scale-[1.02]'
              : 'bg-[#F8FAFC] border-[#E2E8F0]'
          }`}
        >
          <p className="text-[11px] font-semibold text-[#64748B]">PFMS Disbursed</p>
          <p className={`text-2xl font-black mt-0.5 transition-colors duration-300 ${flashDisbursed ? 'text-[#059669]' : 'text-[#10B981]'}`}>
            ₹{(totalDisbursedINR / 10000000).toFixed(2)} Cr
          </p>
          {flashDisbursed && (
            <span className="text-[9px] font-bold text-[#059669] animate-pulse">↑ Updated</span>
          )}
        </div>
      </div>
    </div>
  );
};
