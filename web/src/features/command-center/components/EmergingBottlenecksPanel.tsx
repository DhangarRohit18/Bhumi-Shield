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
        return <Scale className="w-3.5 h-3.5 text-rose-700" />;
      case 'INTER_DEPARTMENTAL_NOC':
        return <FileX className="w-3.5 h-3.5 text-amber-700" />;
      default:
        return <ShieldAlert className="w-3.5 h-3.5 text-[#8C7355]" />;
    }
  };

  return (
    <div className="bg-white border border-[#E2D9CC] rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E]">
            <AlertOctagon className="w-4 h-4 text-[#8C7355]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Emerging Bottlenecks & Litigation Stalls</h2>
            <p className="text-[11px] text-[#786C5E]">Root-cause breakdown of acquisition halts and court writ petitions</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-bold">
          {bottlenecks.length} Active Stalls
        </span>
      </div>

      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {bottlenecks.map((btn) => (
          <div
            key={btn.id}
            className="p-3.5 rounded-xl bg-white border border-[#E2D9CC] hover:border-[#C5B49E] transition-all space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-[#FDFBF7] border border-[#E2D9CC]">
                  {getRootCauseIcon(btn.rootCause)}
                </div>
                <span className="text-xs font-bold text-slate-900">{btn.title}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                  btn.severity === 'CRITICAL'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {btn.severity}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#786C5E] pt-1">
              <span>Root Cause: <strong className="text-slate-900">{btn.rootCause}</strong></span>
              <span className="text-rose-700 font-bold font-mono">+{btn.delayDaysEstimated} Days Estimated Delay</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#E2D9CC] text-[10px]">
              <span className="text-[#786C5E]">Status: <strong className="text-slate-900">{btn.status}</strong></span>
              {onFocusBottleneck && (
                <button
                  onClick={() => onFocusBottleneck(btn)}
                  className="text-[#8C7355] hover:text-[#4A3B2C] flex items-center gap-0.5 font-bold cursor-pointer"
                >
                  <span>Triage Solution</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
