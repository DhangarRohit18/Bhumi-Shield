import React from 'react';
import { History } from 'lucide-react';
import { WorkflowEvent, AuditLogEntry } from '../../../types';

interface RecentChangesProps {
  workflowEvents: WorkflowEvent[];
  auditLogs: AuditLogEntry[];
}

export const RecentChangesFeed: React.FC<RecentChangesProps> = ({
  workflowEvents,
  auditLogs,
}) => {
  return (
    <div className="bg-white border border-[#E2D9CC] rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E]">
            <History className="w-4 h-4 text-[#8C7355]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Live Statutory Chronology & Recent Shifts</h2>
            <p className="text-[11px] text-[#786C5E]">Answering "What changed recently?" with real-time audit ledger feeds</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
          <span>Real-time Sync Active</span>
        </div>
      </div>

      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {workflowEvents.map((evt) => (
          <div
            key={evt.id}
            className="p-3.5 rounded-xl bg-white border border-[#E2D9CC] hover:border-[#C5B49E] transition-all space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E]">
                {evt.stage}
              </span>
              <span className="text-[10px] text-[#786C5E] font-mono">
                {new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <p className="text-xs font-bold text-slate-900 leading-snug">
              {evt.actionTaken}
            </p>

            <p className="text-[11px] text-[#786C5E] leading-normal">
              {evt.comments}
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-[#E2D9CC] text-[10px] text-[#786C5E]">
              <span>Actor: <strong className="text-slate-900">{evt.actorName}</strong> ({evt.actorRole})</span>
              {evt.gazetteOrderNo && (
                <span className="font-mono text-emerald-800 font-bold">{evt.gazetteOrderNo}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
