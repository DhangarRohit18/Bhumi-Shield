import React from 'react';
import { Shield, Radio, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { UserRole } from '../../../types';

interface HeaderProps {
  activeRole: UserRole;
  scopeLabel: string;
  totalCorridors: number;
  triagedBottlenecks: number;
  delayedProjects: number;
  totalDisbursedINR: number;
}

export const NationalOperationalHeader: React.FC<HeaderProps> = ({
  activeRole,
  scopeLabel,
  totalCorridors,
  triagedBottlenecks,
  delayedProjects,
  totalDisbursedINR,
}) => {
  return (
    <div className="bg-white border-b border-[#E2E8F0] px-4 py-3 shadow-sm font-sans space-y-2">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black tracking-tight text-[#BF7834]">
              National Operational Command Center <span className="text-[#1E293B] font-extrabold text-sm">| Bhoomi Rashi Sentinel</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#BF7834] text-white tracking-wider shadow-sm">
              REAL-TIME MISSION CONTROL
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] font-semibold">
            Pan-India Statutory Land Acquisition & Decision Support Platform • RFCTLARR Act (2013)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-xs font-bold text-[#BF7834] flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span>Scope: <strong className="text-[#1E293B] font-black">{scopeLabel}</strong></span>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
        <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-0.5 shadow-sm">
          <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Active Infrastructure Corridors</p>
          <p className="text-xl font-extrabold text-[#0F172A]">{totalCorridors}</p>
          <p className="text-[9px] text-[#64748B]">Pan-India Mega Projects</p>
        </div>

        <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-0.5 shadow-sm">
          <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Triaged Statutory Bottlenecks</p>
          <p className="text-xl font-extrabold text-[#0F172A]">{triagedBottlenecks}</p>
          <p className="text-[9px] text-[#64748B]">Court Stays, JMS & NOCs</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1 shadow-sm">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Delayed / Critical Projects</p>
          <p className="text-2xl font-extrabold text-[#0F172A]">{delayedProjects}</p>
          <p className="text-[10px] text-[#64748B]">Requires High-Level Directive</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1 shadow-sm">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">PFMS Direct Credit Disbursed</p>
          <p className="text-2xl font-extrabold text-[#0F172A]">₹{(totalDisbursedINR / 10000000).toFixed(2)} Cr</p>
          <p className="text-[10px] text-[#64748B]">100% Solatium & Awards</p>
        </div>
      </div>
    </div>
  );
};
