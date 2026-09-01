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
    <div className="bg-white border border-[#E2D9CC] rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E]">
            <Zap className="w-4 h-4 text-[#8C7355]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Priority Operational Interventions</h2>
            <p className="text-[11px] text-[#786C5E]">Direct statutory escalations and one-click authority orders</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FDFBF7] text-[#4A3B2C] border border-[#C5B49E] font-bold">
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
              className={`p-4 rounded-xl border transition-all ${
                isApplied
                  ? 'bg-[#FDFBF7] border-[#E2D9CC] opacity-75'
                  : 'bg-white border-[#E2D9CC] shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E]">
                      Tier: {intv.suggestedEscalationTier}
                    </span>
                    <span className="text-[11px] font-bold text-slate-900 font-mono">
                      {intv.targetDepartment}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {intv.recommendedAction}
                  </p>
                </div>

                <div className="shrink-0">
                  {isApplied ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Order Issued</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleExecuteIntervention(intv)}
                      disabled={isExecuting}
                      className="px-3 py-1.5 rounded-lg bg-[#E2D9CC] hover:bg-[#D5C7B7] text-[#4A3B2C] border border-[#C5B49E] text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
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
