import React, { useState, useMemo } from 'react';
import {
  Users,
  Scale,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Building2,
  TrendingDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { OfficerWorkloadRecord, WorkloadReassignmentPlan } from '../../../types';
import { officerWorkloadService } from '../../../services/entities.service';
import { auditService } from '../../../services/audit.service';
import {
  generateWorkloadRedistributionPlan,
  calculateOfficerWorkloadScore,
} from '../../../utils/intelligenceCalculations';

interface WorkloadBalancerProps {
  officers: OfficerWorkloadRecord[];
}

export const WorkloadBalancer: React.FC<WorkloadBalancerProps> = ({ officers }) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [activePlan, setActivePlan] = useState<WorkloadReassignmentPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Group officers by district
  const districtsSummary = useMemo(() => {
    const map = new Map<
      string,
      { districtName: string; officerCount: number; pendingCount: number; overdueCount: number; avgLoad: number }
    >();

    officers.forEach((o) => {
      const distName = o.districtId === 'dist-palghar' ? 'Palghar District' : o.districtId === 'dist-thane' ? 'Thane District' : 'Varanasi District';
      const current = map.get(o.districtId) || { districtName: distName, officerCount: 0, pendingCount: 0, overdueCount: 0, avgLoad: 0 };
      current.officerCount += 1;
      current.pendingCount += o.pendingCases;
      current.overdueCount += o.overdueCases;
      current.avgLoad += o.calculatedWorkloadScore;
      map.set(o.districtId, current);
    });

    return Array.from(map.entries()).map(([id, data]) => ({
      districtId: id,
      districtName: data.districtName,
      officerCount: data.officerCount,
      pendingCount: data.pendingCount,
      overdueCount: data.overdueCount,
      avgLoad: Math.round(data.avgLoad / (data.officerCount || 1)),
      isOverloaded: Math.round(data.avgLoad / (data.officerCount || 1)) >= 80,
    }));
  }, [officers]);

  // Filter officers based on selected district
  const filteredOfficers = useMemo(() => {
    if (selectedDistrict === 'ALL') return officers;
    return officers.filter((o) => o.districtId === selectedDistrict);
  }, [officers, selectedDistrict]);

  // Compute recommended redistribution plan
  const recommendedPlan = useMemo(() => {
    return generateWorkloadRedistributionPlan(officers);
  }, [officers]);

  const handleOpenSimulation = () => {
    if (recommendedPlan) {
      setActivePlan(recommendedPlan);
      setIsModalOpen(true);
    }
  };

  const handleApproveRedistribution = async () => {
    if (!activePlan) return;
    setIsApplying(true);

    try {
      // 1. Update source officer in Firestore
      const sourceOfficer = officers.find((o) => o.officerUid === activePlan.sourceOfficerUid);
      if (sourceOfficer) {
        const newPending = sourceOfficer.pendingCases - activePlan.reassignedCasesCount;
        const newOverdue = Math.max(0, sourceOfficer.overdueCases - Math.round(activePlan.reassignedCasesCount * 0.3));
        const newScore = calculateOfficerWorkloadScore(newPending, newOverdue, sourceOfficer.complexityScore, sourceOfficer.maxCapacity);

        await officerWorkloadService.update(sourceOfficer.id || sourceOfficer.officerUid, {
          pendingCases: newPending,
          overdueCases: newOverdue,
          calculatedWorkloadScore: newScore,
          isAvailable: newScore < 80,
        });
      }

      // 2. Update target officer in Firestore
      const targetOfficer = officers.find((o) => o.officerUid === activePlan.targetOfficerUid);
      if (targetOfficer) {
        const newPending = targetOfficer.pendingCases + activePlan.reassignedCasesCount;
        const newScore = calculateOfficerWorkloadScore(newPending, targetOfficer.overdueCases, targetOfficer.complexityScore, targetOfficer.maxCapacity);

        await officerWorkloadService.update(targetOfficer.id || targetOfficer.officerUid, {
          pendingCases: newPending,
          calculatedWorkloadScore: newScore,
          isAvailable: newScore < 75,
        });
      }

      // 3. Log Immutable Audit Record
      await auditService.logAction({
        targetCollection: 'officer_workloads',
        targetDocId: activePlan.id,
        action: 'UPDATE',
        actorId: 'auth-user-current',
        actorName: 'District / National Collector',
        actorRole: 'Acquisition Officer',
        diffPayload: {
          action: 'WORKLOAD_REASSIGNMENT_EXECUTED',
          sourceOfficer: activePlan.sourceOfficerName,
          targetOfficer: activePlan.targetOfficerName,
          casesMoved: activePlan.reassignedCasesCount,
          preSourceLoad: activePlan.preSourceLoadPct,
          postSourceLoad: activePlan.postSourceLoadPct,
          projectedDelayReductionDays: activePlan.projectedDelayReductionDays,
        },
      });

      setSuccessMessage(`Successfully reallocated ${activePlan.reassignedCasesCount} statutory files. Workload rebalanced.`);
      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Failed to rebalance workload:', err);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-4 font-sans text-[#0F172A]">
      {successMessage && (
        <div className="p-3.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl flex items-center justify-between text-xs font-bold text-[#065F46] shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Critical Imbalance Alert & Smart Recommendation */}
      {recommendedPlan && (
        <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#F59E0B] text-white shrink-0 mt-0.5">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-[#92400E]">
                  Critical Workload Imbalance Detected
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D]">
                  ELIGIBLE REASSIGNMENT
                </span>
              </div>
              <p className="text-xs text-[#78350F] mt-1">
                {recommendedPlan.rationale}
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenSimulation}
            className="px-4 py-2 bg-[#BF7834] hover:bg-[#A36224] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <span>Review Redistribution</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* District Concentration Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {districtsSummary.map((dist) => (
          <div
            key={dist.districtId}
            onClick={() => setSelectedDistrict(selectedDistrict === dist.districtId ? 'ALL' : dist.districtId)}
            className={`p-4 rounded-xl border transition-all cursor-pointer shadow-sm ${
              selectedDistrict === dist.districtId
                ? 'bg-white border-[#BF7834] ring-2 ring-[#BF7834]/20'
                : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-[#0F172A]">{dist.districtName}</span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  dist.isOverloaded
                    ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                    : 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                }`}
              >
                {dist.isOverloaded ? 'HIGH LOAD' : 'BALANCED'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#F1F5F9] text-center">
              <div>
                <p className="text-[10px] text-[#64748B]">Officers</p>
                <p className="text-sm font-black text-[#0F172A]">{dist.officerCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#64748B]">Pending</p>
                <p className="text-sm font-black text-[#0F172A]">{dist.pendingCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#64748B]">Avg Load</p>
                <p className={`text-sm font-black ${dist.isOverloaded ? 'text-[#DC2626]' : 'text-[#059669]'}`}>
                  {dist.avgLoad}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Officers List Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#BF7834]" />
            <h3 className="font-extrabold text-xs text-[#0F172A]">
              Officer Capacity & Workload Index ({filteredOfficers.length})
            </h3>
          </div>
          <span className="text-[10px] text-[#64748B] font-mono">
            Explainable Formula: ((Pending * Complexity) + (Overdue * 1.8)) / Capacity
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#64748B] font-extrabold uppercase text-[10px] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-4 py-2.5">Officer</th>
                <th className="px-4 py-2.5">District</th>
                <th className="px-4 py-2.5 text-center">Assigned</th>
                <th className="px-4 py-2.5 text-center">Pending</th>
                <th className="px-4 py-2.5 text-center">Overdue</th>
                <th className="px-4 py-2.5 text-center">Capacity</th>
                <th className="px-4 py-2.5 text-right">Workload Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredOfficers.map((o) => {
                const isHeavy = o.calculatedWorkloadScore >= 80;
                return (
                  <tr key={o.officerUid} className="hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3">
                      <p className="font-extrabold text-[#0F172A]">{o.officerName}</p>
                      <p className="text-[10px] text-[#64748B]">{o.role}</p>
                    </td>
                    <td className="px-4 py-3 text-[#475569] font-medium">
                      {o.districtId === 'dist-palghar' ? 'Palghar' : o.districtId === 'dist-thane' ? 'Thane' : 'Varanasi'}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-[#0F172A]">{o.assignedCases}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-[#0F172A]">{o.pendingCases}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-[#DC2626]">{o.overdueCases}</td>
                    <td className="px-4 py-3 text-center font-mono text-[#64748B]">{o.maxCapacity}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-mono font-black text-xs px-2.5 py-1 rounded-lg ${
                          isHeavy
                            ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                            : 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                        }`}
                      >
                        {o.calculatedWorkloadScore}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* What-If Redistribution Simulation Modal */}
      {isModalOpen && activePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#BF7834]" />
                <h3 className="text-sm font-black text-[#0F172A]">
                  What-If Workload Redistribution Simulation
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-xs text-[#64748B] hover:text-[#0F172A] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#475569] leading-relaxed">
              {activePlan.rationale}
            </div>

            {/* Before vs After Impact Table */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#991B1B]">
                  Source: {activePlan.sourceOfficerName}
                </p>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-[#64748B]">Current Load:</span>
                  <strong className="text-[#DC2626] font-mono">{activePlan.preSourceLoadPct}%</strong>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-[#64748B]">Post Redistribution:</span>
                  <strong className="text-[#059669] font-mono">{activePlan.postSourceLoadPct}%</strong>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#065F46]">
                  Target: {activePlan.targetOfficerName}
                </p>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-[#64748B]">Current Load:</span>
                  <strong className="text-[#059669] font-mono">{activePlan.preTargetLoadPct}%</strong>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-[#64748B]">Post Redistribution:</span>
                  <strong className="text-[#0F172A] font-mono">{activePlan.postTargetLoadPct}%</strong>
                </div>
              </div>
            </div>

            {/* Projected Delay Reduction */}
            <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#92400E] font-extrabold">
                <TrendingDown className="w-4 h-4 text-[#D97706]" />
                <span>Projected Statutory Delay Reduction</span>
              </div>
              <span className="font-mono font-black text-sm text-[#B45309]">
                -{activePlan.projectedDelayReductionDays} Days
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveRedistribution}
                disabled={isApplying}
                className="px-5 py-2.5 rounded-xl bg-[#BF7834] hover:bg-[#A36224] text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                {isApplying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Reassigning Cases in Firestore...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Reassign Cases</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
