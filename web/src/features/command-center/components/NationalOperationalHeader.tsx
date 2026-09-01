import React from 'react';
import { Shield, Radio, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { UserRole } from '../../../types';

interface HeaderProps {
  activeRole: UserRole;
  scopeLabel: string;
  totalProjects: number;
  criticalProjectsCount: number;
  openBottlenecksCount: number;
  totalDisbursedCr: number;
  recentChangesCount: number;
}

export const NationalOperationalHeader: React.FC<HeaderProps> = ({
  activeRole,
  scopeLabel,
  totalProjects,
  criticalProjectsCount,
  openBottlenecksCount,
  totalDisbursedCr,
  recentChangesCount,
}) => {
  return (
    <div className="bg-white border-b border-[#E2D9CC] px-6 py-4 space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Active Scope */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E]">
            <Shield className="w-6 h-6 text-[#8C7355]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">National Command Center</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E]">
                LIVE SENTINEL
              </span>
            </div>
            <p className="text-xs text-[#786C5E] mt-0.5">
              Operational Scope: <strong className="text-slate-900">{scopeLabel}</strong> • Role Clearance: <strong className="text-slate-900">{activeRole}</strong>
            </p>
          </div>
        </div>

        {/* Pure White & Beige Restrained Operational Stat Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#FDFBF7] border border-[#E2D9CC] text-left">
            <span className="text-[10px] uppercase font-bold text-[#786C5E] tracking-wider">Active Corridors</span>
            <p className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">{totalProjects}</p>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-[#FDFBF7] border border-[#E2D9CC] text-left">
            <span className="text-[10px] uppercase font-bold text-[#786C5E] tracking-wider">Bottlenecks Triaged</span>
            <p className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">{openBottlenecksCount}</p>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-[#FDFBF7] border border-[#E2D9CC] text-left">
            <span className="text-[10px] uppercase font-bold text-[#786C5E] tracking-wider">Delayed / Critical</span>
            <p className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">{criticalProjectsCount}</p>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-[#FDFBF7] border border-[#E2D9CC] text-left">
            <span className="text-[10px] uppercase font-bold text-[#786C5E] tracking-wider">Direct PFMS Credit</span>
            <p className="text-sm font-extrabold text-[#4A3B2C] font-mono mt-0.5">₹{totalDisbursedCr.toFixed(2)} Cr</p>
          </div>
        </div>
      </div>
    </div>
  );
};
