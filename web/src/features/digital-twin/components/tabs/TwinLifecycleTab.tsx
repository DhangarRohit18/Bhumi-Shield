import React, { useState } from 'react';
import { WorkflowEvent, Parcel } from '../../../../types';
import { CheckCircle2, Circle, Clock, ShieldCheck, ScrollText, AlertTriangle, Zap } from 'lucide-react';
import { computeWeightedProgress, getStatusColor } from '../../../../utils/progressWeights';

interface LifecycleProps {
  currentStage: string;
  workflowEvents: WorkflowEvent[];
  onAdvanceStage: (nextStage: string) => void;
  parcels?: Parcel[];
}

export const TwinLifecycleTab: React.FC<LifecycleProps> = ({
  currentStage,
  workflowEvents,
  onAdvanceStage,
  parcels = [],
}) => {
  const [advancing, setAdvancing] = useState(false);

  const stages: { key: string; label: string; desc: string; actSec: string }[] = [
    { key: 'Proposal', label: '1. Proposal & Requisition', desc: 'Administrative Approval & Alignment Sanction', actSec: 'Sec 4' },
    { key: 'SIA', label: '2. Social Impact Assessment', desc: 'SIA Expert Group Study & Public Hearing', actSec: 'Sec 7/8' },
    { key: 'Sec_11_Notification', label: '3. Section 11 Notification', desc: 'Preliminary Notification in Official Gazette', actSec: 'Sec 11' },
    { key: 'Sec_15_Objections', label: '4. Section 15 Objections', desc: 'Hearing of Claims & Boundary Inquiries (60d)', actSec: 'Sec 15' },
    { key: 'Sec_19_Declaration', label: '5. Section 19 Declaration', desc: 'Conclusive Declaration of Public Purpose', actSec: 'Sec 19' },
    { key: 'Award_Enquiry', label: '6. Section 23 Award Enquiry', desc: 'Enquiry into Valuations, Solatium & Claims', actSec: 'Sec 23' },
    { key: 'Disbursement', label: '7. Compensation & R&R', desc: 'PFMS Direct DBT Credit & Resettlement Grants', actSec: 'Sec 30/31' },
    { key: 'Possession', label: '8. Section 38 Possession', desc: 'Formal Vesting & Handover to Executing Body', actSec: 'Sec 38' },
  ];

  const currentIdx = stages.findIndex((s) => s.key === currentStage);
  const nextStageObj = currentIdx < stages.length - 1 ? stages[currentIdx + 1] : null;

  // ── Feature 1+2: Compute live stage status for badges ────────────
  const { stageBreakdown } = computeWeightedProgress(parcels, currentStage);
  const stageStatusMap = Object.fromEntries(
    stageBreakdown.map((s) => [s.key, s])
  );

  const handleAdvance = async () => {
    if (!nextStageObj) return;
    setAdvancing(true);
    try {
      await onAdvanceStage(nextStageObj.key);
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Statutory Stage Advancement Action Banner */}
      {nextStageObj && (
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#0F172A] text-white border border-[#0F172A]">
              <ScrollText className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold text-[#0F172A] tracking-wider">
                Statutory Milestone Progression
              </span>
              <h3 className="text-sm font-extrabold text-[#0F172A]">
                Ready to advance to {nextStageObj.label}?
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                Will publish official administrative decree and trigger next statutory SLA window.
              </p>
            </div>
          </div>

          <button
            onClick={handleAdvance}
            disabled={advancing}
            className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white border border-[#0F172A] text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>{advancing ? 'Publishing Order…' : `Advance to ${nextStageObj.label}`}</span>
          </button>
        </div>
      )}

      {/* 8-Stage Visual Pipeline Grid */}
      <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <h3 className="text-sm font-extrabold text-[#0F172A]">
            RFCTLARR Act (2013) Statutory Lifecycle Sequence
          </h3>
          {parcels.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-[#64748B] font-mono">
              <Zap className="w-3 h-3 text-[#10B981]" />
              <span>Live risk badges computed from {parcels.length} parcels</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {stages.map((stg, idx) => {
            const isCompleted = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const stageInfo = stageStatusMap[stg.key];
            const hasRisk =
              stageInfo &&
              (stageInfo.status === 'AT_RISK' || stageInfo.status === 'BOTTLENECK');
            const riskColors = stageInfo ? getStatusColor(stageInfo.status) : null;

            return (
              <div
                key={stg.key}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-[#F8FAFC] border-[#0F172A] shadow-sm ring-1 ring-[#0F172A]/40'
                    : isCompleted
                    ? 'bg-white border-[#E2E8F0]'
                    : 'bg-[#F8FAFC]/50 border-[#E2E8F0] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-[#E2E8F0] text-[#0F172A] px-1.5 py-0.5 rounded border border-[#CBD5E1]">
                    {stg.actSec}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 text-[#0F172A] animate-pulse" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#94A3B8]" />
                  )}
                </div>

                <h4 className="text-xs font-bold text-[#0F172A] mt-2">{stg.label}</h4>
                <p className="text-[11px] text-[#64748B] mt-1 line-clamp-2 leading-relaxed font-medium">
                  {stg.desc}
                </p>

                {/* ── Live At-Risk / Bottleneck badge (from bhoomisetu rules) ── */}
                {hasRisk && riskColors && (
                  <div
                    className={`mt-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border ${riskColors.bg} ${riskColors.text} ${riskColors.border}`}
                  >
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>{stageInfo.status.replace('_', ' ')}</span>
                    {stageInfo.actualPct > 0 && (
                      <span className="ml-auto font-mono">{stageInfo.actualPct}%</span>
                    )}
                  </div>
                )}

                <div className="mt-3 pt-2 border-t border-[#E2E8F0] text-[10px]">
                  {isCompleted ? (
                    <span className="text-[#0F172A] font-bold">Statutory Milestone Concluded</span>
                  ) : isCurrent ? (
                    <span className="text-[#0F172A] font-extrabold">Active Statutory Phase</span>
                  ) : (
                    <span className="text-[#64748B]">Pending Sequence</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workflow Event Feed for this project */}
      {workflowEvents.length > 0 && (
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-3">
          <h3 className="text-sm font-extrabold text-[#0F172A] border-b border-[#E2E8F0] pb-3">
            Statutory Action Log — Latest Events
          </h3>
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {[...workflowEvents]
              .sort((a, b) => b.createdAt - a.createdAt)
              .slice(0, 10)
              .map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs"
                >
                  <span className="shrink-0 font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#E2E8F0] text-[#0F172A] border border-[#CBD5E1] font-bold mt-0.5">
                    {evt.stage}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0F172A] truncate">{evt.actionTaken}</p>
                    <p className="text-[#64748B] text-[11px]">{evt.actorName} · {evt.actorRole}</p>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B] shrink-0">
                    {new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
