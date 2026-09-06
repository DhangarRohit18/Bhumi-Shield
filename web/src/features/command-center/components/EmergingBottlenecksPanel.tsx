import React from 'react';
import { AlertOctagon, Scale, ShieldAlert, FileX, ArrowUpRight } from 'lucide-react';
import { Bottleneck } from '../../../types';

interface BottlenecksProps {
  bottlenecks: Bottleneck[];
  onFocusBottleneck?: (b: Bottleneck) => void;
}

export const EmergingBottlenecksPanel: React.FC<BottlenecksProps> = ({
  bottlenecks,
  onFocusBottleneck,
}) => {
  const getRootCauseIcon = (cause: string) => {
    switch (cause) {
      case 'COURT_STAY':
        return <Scale className="w-3.5 h-3.5 text-[#0F172A]" />;
      case 'INTER_DEPARTMENTAL_NOC':
        return <FileX className="w-3.5 h-3.5 text-[#475569]" />;
      default:
        return <ShieldAlert className="w-3.5 h-3.5 text-[#475569]" />;
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm font-sans space-y-4">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1]">
            <AlertOctagon className="w-4 h-4 text-[#0F172A]" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#0F172A]">Emerging Bottlenecks & Litigation Stalls</h2>
            <p className="text-[11px] text-[#64748B]">Root-cause breakdown of acquisition halts and court writ petitions</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1] font-bold">
          {bottlenecks.length} Active Stalls
        </span>
      </div>

      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {bottlenecks.map((btn) => (
          <div
            key={btn.id}
            className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0F172A] transition-all space-y-2 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-white border border-[#CBD5E1]">
                  {getRootCauseIcon(btn.rootCause)}
                </div>
                <span className="text-xs font-bold text-[#0F172A]">{btn.title}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 bg-[#0F172A] text-white">
                {btn.severity}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1">
              <span>Root Cause: <strong className="text-[#0F172A] font-bold">{btn.rootCause}</strong></span>
              <span className="text-[#0F172A] font-bold font-mono">+{btn.delayDaysEstimated} Days Estimated Delay</span>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-[#E2E8F0] text-[10px]">
              <span className="text-[#64748B]">Status: <strong className="text-[#0F172A]">{btn.status}</strong></span>
              {onFocusBottleneck && (
                <button
                  onClick={() => onFocusBottleneck(btn)}
                  className="text-[#0F172A] hover:underline flex items-center gap-0.5 font-extrabold cursor-pointer"
                >
                  <span>Triage Solution</span>
                  <ArrowUpRight className="w-3 h-3 text-[#0F172A]" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
