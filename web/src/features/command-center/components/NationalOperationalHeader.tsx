import React, { useEffect, useRef, useState } from 'react';
import { UserRole } from '../../../types';

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
    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-5 shadow-soft font-sans space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-tight text-[#0B132B]">
              National Command Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
              {scopeLabel}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time portfolio overview, corridor milestones & statutory compensation ledger
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Live clock pill */}
          <div className="px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200 text-[11px] font-mono font-bold text-slate-700 shadow-2xs">
            🕐 {nowStr}
          </div>
        </div>
      </div>

      {/* KPI Cards — modern rounded-2xl with clean typography */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          className={`p-4 rounded-2xl border transition-all duration-300 ${
            flashCorridors
              ? 'bg-indigo-50 border-indigo-300 shadow-soft scale-[1.02]'
              : 'bg-[#FAF8F5] border-slate-200/70 hover:bg-white hover:border-indigo-200 shadow-2xs'
          }`}
        >
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Corridors</p>
          <p className={`text-2xl font-black mt-1 font-mono transition-colors duration-300 ${flashCorridors ? 'text-indigo-600' : 'text-[#0B132B]'}`}>
            {totalCorridors}
          </p>
          {flashCorridors && (
            <span className="text-[9px] font-bold text-indigo-600 animate-pulse">↑ Updated</span>
          )}
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all duration-300 ${
            flashBottlenecks
              ? 'bg-amber-50 border-amber-300 shadow-soft scale-[1.02]'
              : 'bg-[#FAF8F5] border-slate-200/70 hover:bg-white hover:border-amber-200 shadow-2xs'
          }`}
        >
          <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Triaged Bottlenecks</p>
          <p className={`text-2xl font-black mt-1 font-mono transition-colors duration-300 ${flashBottlenecks ? 'text-amber-600' : 'text-amber-900'}`}>
            {triagedBottlenecks}
          </p>
          {flashBottlenecks && (
            <span className="text-[9px] font-bold text-amber-600 animate-pulse">↑ Recalculated</span>
          )}
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all duration-300 ${
            flashDelayed
              ? 'bg-rose-50 border-rose-300 shadow-soft scale-[1.02]'
              : 'bg-[#FAF8F5] border-slate-200/70 hover:bg-white hover:border-rose-200 shadow-2xs'
          }`}
        >
          <p className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Delayed Projects</p>
          <p className={`text-2xl font-black mt-1 font-mono transition-colors duration-300 ${flashDelayed ? 'text-rose-600' : 'text-rose-900'}`}>
            {delayedProjects}
          </p>
          {flashDelayed && (
            <span className="text-[9px] font-bold text-rose-600 animate-pulse">↑ Changed</span>
          )}
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all duration-300 ${
            flashDisbursed
              ? 'bg-emerald-50 border-emerald-300 shadow-soft scale-[1.02]'
              : 'bg-[#FAF8F5] border-slate-200/70 hover:bg-white hover:border-emerald-200 shadow-2xs'
          }`}
        >
          <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Total Disbursed (PFMS)</p>
          <p className={`text-2xl font-black mt-1 font-mono transition-colors duration-300 ${flashDisbursed ? 'text-emerald-600' : 'text-emerald-900'}`}>
            ₹{(totalDisbursedINR / 10000000).toFixed(2)} Cr
          </p>
          {flashDisbursed && (
            <span className="text-[9px] font-bold text-emerald-600 animate-pulse">↑ PFMS Push</span>
          )}
        </div>
      </div>
    </div>
  );
};
