import React from 'react';
import { AlertOctagon, Scale, ShieldAlert, FileX, ArrowUpRight, Cpu, Zap } from 'lucide-react';
import { Bottleneck } from '../../../types';
import { ComputedBottleneck } from '../../../hooks/useBottleneckEngine';
import { getStatusColor } from '../../../utils/progressWeights';

interface BottlenecksProps {
  bottlenecks: Bottleneck[];
  computedBottlenecks?: ComputedBottleneck[];
  onFocusBottleneck?: (b: Bottleneck) => void;
}

export const EmergingBottlenecksPanel: React.FC<BottlenecksProps> = ({
  bottlenecks,
  computedBottlenecks = [],
  onFocusBottleneck,
}) => {
  const getRootCauseIcon = (cause: string) => {
    switch (cause) {
      case 'COURT_STAY':
        return <Scale className="w-3.5 h-3.5 text-[#0B132B]" />;
      case 'INTER_DEPARTMENTAL_NOC':
        return <FileX className="w-3.5 h-3.5 text-indigo-600" />;
      case 'PROGRESS_LAG':
        return <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600" />;
      case 'PARCEL_VOLUME':
        return <Cpu className="w-3.5 h-3.5 text-[#DC2626]" />;
      case 'DEPENDENCY_RIPPLE':
        return <Zap className="w-3.5 h-3.5 text-[#4F46E5]" />;
      default:
        return <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  const totalCount = bottlenecks.length + computedBottlenecks.length;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-soft  space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-2xl bg-[#EEF2FF] text-indigo-600 border border-[#E0E7FF]">
            <AlertOctagon className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#0B132B]">Emerging Bottlenecks & Litigation Stalls</h2>
            <p className="text-[11px] text-indigo-600">Root-cause breakdown + live engine-computed risks (bhoomisetu rules)</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-slate-200/80 font-extrabold">
          {totalCount} Active Stalls
        </span>
      </div>

      <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">

        {/* ── Computed bottlenecks from bhoomisetu engine (shown first) ── */}
        {computedBottlenecks.map((btn) => {
          const statusColors = getStatusColor(
            btn.rootCause === 'DEPENDENCY_RIPPLE' ? 'AT_RISK' :
            btn.rootCause === 'PARCEL_VOLUME' ? 'BOTTLENECK' : 'AT_RISK'
          );
          return (
            <div
              key={btn.id}
              className={`p-3.5 rounded-xl border transition-all space-y-2 shadow-soft ${statusColors.bg} ${statusColors.border}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-2xl bg-white border border-white/80">
                    {getRootCauseIcon(btn.rootCause)}
                  </div>
                  <span className={`text-xs font-extrabold ${statusColors.text}`}>{btn.title}</span>
                </div>
                {/* "COMPUTED · LIVE" badge distinguishes engine vs Firestore */}
                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider shrink-0 border flex items-center gap-0.5 ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse inline-block" />
                  <span>Computed</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] pt-1">
                <span className={`${statusColors.text} opacity-80`}>
                  Stage: <strong className={`font-extrabold ${statusColors.text}`}>{btn.stageLabel}</strong>
                </span>
                <span className={`font-extrabold font-mono ${statusColors.text}`}>
                  +{btn.delayDaysEstimated} Days Est.
                </span>
              </div>

              <div className={`flex items-center justify-between pt-1.5 border-t border-current/10 text-[10px] ${statusColors.text}`}>
                <span>Root Cause: <strong>{btn.rootCause.replace('_', ' ')}</strong></span>
                {btn.actualPct > 0 && (
                  <span className="font-mono font-extrabold">{btn.actualPct}% actual vs {btn.plannedPct}% planned</span>
                )}
              </div>
            </div>
          );
        })}

        {/* ── Firestore-persisted bottlenecks ── */}
        {bottlenecks.map((btn) => (
          <div
            key={btn.id}
            className="p-3.5 rounded-xl bg-transparent border border-[#E2E8F0] hover:border-[#0B132B] transition-all space-y-2 shadow-soft"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-2xl bg-white border border-[#CBD5E1]">
                  {getRootCauseIcon(btn.rootCause)}
                </div>
                <span className="text-xs font-extrabold text-[#0B132B]">{btn.title}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider shrink-0 bg-[#0B132B] text-white">
                {btn.severity}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>Root Cause: <strong className="text-[#0B132B] font-extrabold">{btn.rootCause}</strong></span>
              <span className="text-[#0B132B] font-extrabold font-mono">+{btn.delayDaysEstimated} Days Estimated Delay</span>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-[#E2E8F0] text-[10px]">
              <span className="text-slate-500">Status: <strong className="text-[#0B132B]">{btn.status}</strong></span>
              {onFocusBottleneck && (
                <button
                  onClick={() => onFocusBottleneck(btn)}
                  className="text-[#0B132B] hover:underline flex items-center gap-0.5 font-extrabold cursor-pointer"
                >
                  <span>Triage Solution</span>
                  <ArrowUpRight className="w-3 h-3 text-[#0B132B]" />
                </button>
              )}
            </div>
          </div>
        ))}

        {totalCount === 0 && (
          <p className="text-xs text-slate-500 text-center py-4 font-medium">
            No active bottlenecks detected — all stages within threshold.
          </p>
        )}
      </div>
    </div>
  );
};
