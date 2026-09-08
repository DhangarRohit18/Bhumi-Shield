import React, { useRef, useEffect, useState } from 'react';
import { Zap, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { InterventionStrategy } from '../../../types';
import { interventionService } from '../../../services/entities.service';
import { auditService } from '../../../services/audit.service';
import { useAuth } from '../../../contexts/AuthContext';

interface InterventionsProps {
  interventions: InterventionStrategy[];
}

/** Returns a relative time string: "just now", "2m ago", etc. */
function relativeTime(ts: number): string {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 10) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export const PriorityInterventionsPanel: React.FC<InterventionsProps> = ({ interventions }) => {
  const { activeRole, userProfile } = useAuth();
  const [applyingId, setApplyingId] = useState<string | null>(null);

  // ── Real-time: track new intervention entries pushed by Firestore ──
  const previousIdsRef = useRef<Set<string>>(new Set());
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const currentIds = new Set(interventions.map((i) => i.id || ''));
    const freshIds = new Set<string>();

    if (previousIdsRef.current.size > 0) {
      currentIds.forEach((id) => {
        if (!previousIdsRef.current.has(id)) freshIds.add(id);
      });
    }
    previousIdsRef.current = currentIds;

    if (freshIds.size > 0) {
      setNewIds(freshIds);
      const t = setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev);
          freshIds.forEach((id) => next.delete(id));
          return next;
        });
      }, 5_000);
      return () => clearTimeout(t);
    }
  }, [interventions.length]);

  const handleExecuteIntervention = async (intervention: InterventionStrategy) => {
    if (!intervention.id) return;
    setApplyingId(intervention.id);
    try {
      await interventionService.update(intervention.id, {
        status: 'APPLIED',
      });

      await auditService.logAction({
        targetCollection: 'interventions',
        targetDocId: intervention.id,
        action: 'UPDATE',
        actorId: userProfile?.uid || 'command-center-authority',
        actorName: userProfile?.displayName || 'Senior Authority',
        actorRole: activeRole,
        diffPayload: {
          recommendedAction: intervention.recommendedAction,
          statusChangeTo: 'APPLIED',
          targetDepartment: intervention.targetDepartment,
        },
      });
    } finally {
      setApplyingId(null);
    }
  };

  const sortedInterventions = [...interventions].sort((a, b) => {
    // RECOMMENDED first, then by recency
    if (a.status === 'RECOMMENDED' && b.status !== 'RECOMMENDED') return -1;
    if (b.status === 'RECOMMENDED' && a.status !== 'RECOMMENDED') return 1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-soft  space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-2xl bg-[#EEF2FF] text-indigo-600 border border-[#E0E7FF]">
            <Zap className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#0B132B]">Priority Directives & Statutory Overrides</h2>
            <p className="text-[11px] text-indigo-600">Real-time synchronized recommendations & escalation matrix</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-slate-200/80 font-extrabold">
          {interventions.length} Strategies
        </span>
      </div>

      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {sortedInterventions.map((intv) => {
          const isApplied = intv.status === 'APPLIED';
          const isExecuting = applyingId === intv.id;
          const isNew = newIds.has(intv.id || '');

          return (
            <div
              key={intv.id}
              className={`p-4 rounded-xl border transition-all shadow-xs ${
                isNew
                  ? 'bg-indigo-50 border-[#38BDF8]'
                  : isApplied
                  ? 'bg-transparent/50 border-slate-200/80/60 opacity-75'
                  : 'bg-transparent/40 border-slate-200/80/70 hover:border-[#4F46E5]'
              }`}
              style={isNew ? { animation: 'slideIn 0.3s ease-out' } : undefined}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-extrabold bg-[#E2E8F0] text-[#0B132B] border border-[#CBD5E1]">
                      Tier: {intv.suggestedEscalationTier}
                    </span>
                    <span className="text-[11px] font-extrabold text-[#0B132B] font-mono">
                      {intv.targetDepartment}
                    </span>
                    {/* NEW badge for freshly pushed interventions */}
                    {isNew && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#DBEAFE] text-[#1E40AF] border border-[#93C5FD] animate-pulse">
                        <Sparkles className="w-2.5 h-2.5" />
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#0B132B] leading-relaxed font-medium">
                    {intv.recommendedAction}
                  </p>
                  {/* Relative timestamp */}
                  {intv.createdAt > 0 && (
                    <p className="text-[10px] text-[#94A3B8] font-mono">
                      Added {relativeTime(intv.createdAt)}
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  {isApplied ? (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold text-[#0B132B] bg-white px-2.5 py-1 rounded-2xl border border-[#CBD5E1]">
                      <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                      <span>Order Issued</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleExecuteIntervention(intv)}
                      disabled={isExecuting}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0B132B] hover:bg-[#1E293B] text-white border border-[#0B132B] text-xs font-extrabold shadow-soft flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{isExecuting ? 'Transmitting…' : 'Issue Order'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {sortedInterventions.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-4 font-medium">
            No pending interventions — all orders have been issued or no recommendations active.
          </p>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
