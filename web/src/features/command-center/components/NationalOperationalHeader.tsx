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
    <div className="bg-white border-b border-[#E2E8F0] px-6 py-4 shadow-sm font-sans space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-tight text-[#0F172A]">
            National Command Center
          </h1>
          <p className="text-xs text-[#64748B]">
            Pan-India Corridor Monitoring • RFCTLARR Act (2013)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-xs font-bold text-[#BF7834] flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span>Scope: <strong className="text-[#0F172A] font-extrabold">{scopeLabel}</strong></span>
          </div>
        </div>
      </div>

      {/* Clean KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <p className="text-[11px] font-semibold text-[#64748B]">Active Corridors</p>
          <p className="text-2xl font-black text-[#0F172A] mt-0.5">{totalCorridors}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <p className="text-[11px] font-semibold text-[#64748B]">Active Bottlenecks</p>
          <p className="text-2xl font-black text-[#D97706] mt-0.5">{triagedBottlenecks}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <p className="text-[11px] font-semibold text-[#64748B]">Critical Projects</p>
          <p className="text-2xl font-black text-[#EF4444] mt-0.5">{delayedProjects}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <p className="text-[11px] font-semibold text-[#64748B]">PFMS Disbursed</p>
          <p className="text-2xl font-black text-[#10B981] mt-0.5">₹{(totalDisbursedINR / 10000000).toFixed(2)} Cr</p>
        </div>
      </div>
    </div>
  );
};
