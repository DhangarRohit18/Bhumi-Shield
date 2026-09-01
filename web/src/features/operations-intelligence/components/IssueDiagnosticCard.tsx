import React, { useState } from 'react';
import { DiagnosticIssue } from '../utils/diagnosticData';
import {
  AlertTriangle,
  FileSearch,
  Scale,
  GitBranch,
  UserCheck,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { auditService } from '../../../services/audit.service';

interface CardProps {
  issue: DiagnosticIssue;
  onOrderIssued?: (issueId: string) => void;
}

export const IssueDiagnosticCard: React.FC<CardProps> = ({ issue, onOrderIssued }) => {
  const { activeRole, userProfile } = useAuth();
  const [issuingOrder, setIssuingOrder] = useState(false);
  const [orderDone, setOrderDone] = useState(issue.status === 'ORDER_ISSUED');

  const handleIssueDirective = async () => {
    setIssuingOrder(true);
    try {
      await auditService.logAction({
        targetCollection: 'interventions',
        targetDocId: issue.id,
        action: 'UPDATE',
        actorId: userProfile?.uid || 'authority-01',
        actorName: userProfile?.displayName || 'Senior Authority',
        actorRole: activeRole,
        diffPayload: {
          issueProblem: issue.problem,
          recommendedAction: issue.recommendedAction,
          assignedOwner: issue.responsibleOwnerName,
          statusChangeTo: 'ORDER_ISSUED',
        },
      });
      setOrderDone(true);
      if (onOrderIssued) onOrderIssued(issue.id);
    } finally {
      setIssuingOrder(false);
    }
  };

  return (
    <div className="rounded-2xl bg-[#0e1628] border border-slate-800 shadow-xl overflow-hidden space-y-0">
      {/* Card Header: Problem & Severity */}
      <div className="p-4 bg-[#090f1e] border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-cyan-300 font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
              {issue.projectName}
            </span>
            {issue.isStagnant && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 animate-pulse">
                Silent Stagnation ({issue.daysStagnant}d Inactive)
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Problem: {issue.problem}</span>
          </h3>
        </div>

        <span
          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 self-start sm:self-auto ${
            issue.severity === 'CRITICAL'
              ? 'bg-rose-950 text-rose-300 border border-rose-800'
              : issue.severity === 'HIGH'
              ? 'bg-amber-950 text-amber-300 border border-amber-800'
              : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
          }`}
        >
          {issue.severity} SEVERITY
        </span>
      </div>

      {/* Structured 7-Layer Diagnostic Chain */}
      <div className="p-5 space-y-4 text-xs">
        {/* Layer 1: Concrete Evidence */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <FileSearch className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Layer 1: Empirical Evidence</p>
            <p className="text-slate-200 mt-0.5 font-medium">{issue.evidence}</p>
          </div>
        </div>

        {/* Layer 2: Root Cause */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <Scale className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Layer 2: Statutory Root Cause</p>
            <p className="text-slate-200 mt-0.5 font-medium">{issue.rootCause}</p>
          </div>
        </div>

        {/* Layer 3: Affected Dependencies & Downstream Blast Radius */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <GitBranch className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="w-full">
            <p className="text-[10px] uppercase font-bold text-slate-400">Layer 3: Affected Downstream Activities ({issue.affectedDependencies.length})</p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-slate-300">
              {issue.affectedDependencies.map((dep, idx) => (
                <li key={idx} className="leading-snug">{dep}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Layer 4 & 5: Responsible Owner & Expected Delay Impact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Layer 4: Responsible Owner</p>
              <p className="font-bold text-slate-100 mt-0.5">{issue.responsibleOwnerName}</p>
              <p className="text-[10px] text-emerald-400 font-mono">{issue.responsibleOwnerRole}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
            <TrendingUp className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Layer 5: Expected Operational Impact</p>
              <p className="font-semibold text-rose-300 mt-0.5">{issue.expectedImpact}</p>
            </div>
          </div>
        </div>

        {/* Layer 6 & 7: Recommended Action & Human-in-the-Loop Decision Dispatch */}
        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/40 space-y-3">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] uppercase font-bold text-cyan-400">Layer 6: Recommended Operational Action</p>
              <p className="text-slate-200 mt-1 font-medium leading-relaxed">{issue.recommendedAction}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-cyan-900/40 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">
              Governance Safeguard: <strong>Human-in-the-Loop Verification Required</strong>
            </span>

            {orderDone ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Statutory Directive Transmitted</span>
              </span>
            ) : (
              <button
                onClick={handleIssueDirective}
                disabled={issuingOrder}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-cyan-600/20 flex items-center gap-1.5 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{issuingOrder ? 'Transmitting Directive...' : 'Approve & Issue Directive'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
