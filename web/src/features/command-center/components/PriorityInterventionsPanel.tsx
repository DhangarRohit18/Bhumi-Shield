import React, { useState } from 'react';
import { Zap, CheckCircle2, ShieldCheck } from 'lucide-react';
import { InterventionStrategy } from '../../../types';
import { interventionService } from '../../../services/entities.service';
import { auditService } from '../../../services/audit.service';
import { useAuth } from '../../../contexts/AuthContext';

interface InterventionsProps {
  interventions: InterventionStrategy[];
}

export const PriorityInterventionsPanel: React.FC<InterventionsProps> = ({ interventions }) => {
  const { activeRole, userProfile } = useAuth();
  const [applyingId, setApplyingId] = useState<string | null>(null);

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

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm font-sans space-y-4">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1]">
            <Zap className="w-4 h-4 text-[#0F172A]" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#0F172A]">Priority Operational Interventions</h2>
            <p className="text-[11px] text-[#64748B]">Direct statutory escalations and one-click authority orders</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1] font-bold">
          {interventions.filter((i) => i.status === 'RECOMMENDED').length} Pending Orders
        </span>
      </div>

      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {interventions.map((intv) => {
          const isApplied = intv.status === 'APPLIED';
          const isExecuting = applyingId === intv.id;

          return (
            <div
              key={intv.id}
              className={`p-4 rounded-xl border transition-all shadow-sm ${
                isApplied
                  ? 'bg-[#F8FAFC] border-[#E2E8F0] opacity-75'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#0F172A]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#E2E8F0] text-[#0F172A] border border-[#CBD5E1]">
                      Tier: {intv.suggestedEscalationTier}
                    </span>
                    <span className="text-[11px] font-extrabold text-[#0F172A] font-mono">
                      {intv.targetDepartment}
                    </span>
                  </div>
                  <p className="text-xs text-[#0F172A] leading-relaxed font-medium">
                    {intv.recommendedAction}
                  </p>
                </div>

                <div className="shrink-0">
                  {isApplied ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-[#0F172A] bg-white px-2.5 py-1 rounded-lg border border-[#CBD5E1]">
                      <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                      <span>Order Issued</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleExecuteIntervention(intv)}
                      disabled={isExecuting}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white border border-[#0F172A] text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{isExecuting ? 'Transmitting...' : 'Issue Order'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
