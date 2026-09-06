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
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm font-sans space-y-4">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1]">
            <History className="w-4 h-4 text-[#0F172A]" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#0F172A]">Live Statutory Chronology & Recent Shifts</h2>
            <p className="text-[11px] text-[#64748B]">Answering "What changed recently?" with real-time audit ledger feeds</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#0F172A] font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
          <span>Real-time Sync Active</span>
        </div>
      </div>

      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {workflowEvents.map((evt) => (
          <div
            key={evt.id}
            className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0F172A] transition-all space-y-1.5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#E2E8F0] text-[#0F172A] border border-[#CBD5E1]">
                {evt.stage}
              </span>
              <span className="text-[10px] text-[#64748B] font-mono font-medium">
                {new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <p className="text-xs font-extrabold text-[#0F172A] leading-snug">
              {evt.actionTaken}
            </p>

            <p className="text-[11px] text-[#64748B] leading-normal font-medium">
              {evt.comments}
            </p>

            <div className="flex items-center justify-between pt-1.5 border-t border-[#E2E8F0] text-[10px] text-[#64748B]">
              <span>Actor: <strong className="text-[#0F172A]">{evt.actorName}</strong> ({evt.actorRole})</span>
              {evt.gazetteOrderNo && (
                <span className="font-mono text-[#0F172A] font-bold">{evt.gazetteOrderNo}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
