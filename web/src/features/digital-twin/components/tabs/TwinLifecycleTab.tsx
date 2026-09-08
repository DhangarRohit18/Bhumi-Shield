import React, { useState } from 'react';
import { WorkflowEvent, Parcel } from '../../../../types';
import { CheckCircle2, Circle, Clock, ShieldCheck, ScrollText, AlertTriangle, Zap, Lock } from 'lucide-react';
import { computeWeightedProgress, getStatusColor } from '../../../../utils/progressWeights';
import { useAuth } from '../../../../contexts/AuthContext';
import { hasPermission, getPermissionReason } from '../../../../utils/rbac';

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
  const { activeRole } = useAuth();
  const [advancing, setAdvancing] = useState(false);
  const canAdvance = hasPermission(activeRole, 'ADVANCE_LIFECYCLE_STAGE');

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
    if (!canAdvance) {
      alert(getPermissionReason(activeRole, 'ADVANCE_LIFECYCLE_STAGE'));
      return;
    }
    if (!nextStageObj) return;
    setAdvancing(true);
    try {
      await onAdvanceStage(nextStageObj.key);
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="space-y-6 ">
      {/* Statutory Stage Advancement Action Banner */}
      {nextStageObj && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-gradient text-white shadow-soft">
              <ScrollText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-extrabold text-indigo-600 tracking-wider">
                  Statutory Milestone Progression
                </span>
                <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-[#EEF2FF] text-indigo-600 border border-[#E0E7FF]">
                  {canAdvance ? '✓ Stage Advancement Authorized' : '🔒 Authorization Required'}
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-[#0B132B]">
                Ready to advance to {nextStageObj.label}?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Will publish official administrative decree and trigger next statutory SLA window.
              </p>
            </div>
          </div>

          {canAdvance ? (
            <button
              onClick={handleAdvance}
              disabled={advancing}
              className="px-4 py-2.5 rounded-xl bg-brand-gradient hover:bg-[#3730A3] text-white text-xs font-extrabold shadow-soft flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>{advancing ? 'Publishing Order…' : `Advance to ${nextStageObj.label}`}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#CBD5E1] text-xs font-extrabold text-slate-500">
              <Lock className="w-4 h-4 text-[#94A3B8]" />
              <span>Requires National/State Admin Authority</span>
            </div>
          )}
        </div>
      )}

      {/* 8-Stage Visual Pipeline Grid */}
      <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <h3 className="text-sm font-extrabold text-[#0B132B]">
            RFCTLARR Act (2013) Statutory Lifecycle Sequence
          </h3>
          {parcels.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
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
                    ? 'bg-transparent border-[#0B132B] shadow-soft ring-1 ring-[#0B132B]/40'
                    : isCompleted
                    ? 'bg-white border-[#E2E8F0]'
                    : 'bg-transparent/50 border-[#E2E8F0] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-extrabold bg-[#E2E8F0] text-[#0B132B] px-1.5 py-0.5 rounded border border-[#CBD5E1]">
                    {stg.actSec}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 text-[#0B132B] animate-pulse" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#94A3B8]" />
                  )}
                </div>

                <h4 className="text-xs font-extrabold text-[#0B132B] mt-2">{stg.label}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed font-medium">
                  {stg.desc}
                </p>

                {/* ── Live At-Risk / Bottleneck badge (from bhoomisetu rules) ── */}
                {hasRisk && riskColors && (
                  <div
                    className={`mt-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border ${riskColors.bg} ${riskColors.text} ${riskColors.border}`}
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
                    <span className="text-[#0B132B] font-extrabold">Statutory Milestone Concluded</span>
                  ) : isCurrent ? (
                    <span className="text-[#0B132B] font-extrabold">Active Statutory Phase</span>
                  ) : (
                    <span className="text-slate-500">Pending Sequence</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workflow Event Feed for this project */}
      {workflowEvents.length > 0 && (
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft space-y-3">
          <h3 className="text-sm font-extrabold text-[#0B132B] border-b border-[#E2E8F0] pb-3">
            Statutory Action Log — Latest Events
          </h3>
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {[...workflowEvents]
              .sort((a, b) => b.createdAt - a.createdAt)
              .slice(0, 10)
              .map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-transparent border border-[#E2E8F0] text-xs"
                >
                  <span className="shrink-0 font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#E2E8F0] text-[#0B132B] border border-[#CBD5E1] font-extrabold mt-0.5">
                    {evt.stage}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-[#0B132B] truncate">{evt.actionTaken}</p>
                    <p className="text-slate-500 text-[11px]">{evt.actorName} · {evt.actorRole}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
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
