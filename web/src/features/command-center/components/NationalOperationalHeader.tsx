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
    <div className="bg-white/95 backdrop-blur-md border-b border-[#BAE6FD]/60 px-6 py-4 shadow-sm font-sans space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-tight text-[#0F172A]">
            National Command Center
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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
