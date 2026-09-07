import React, { useRef, useEffect, useState } from 'react';
import { History, Sparkles } from 'lucide-react';
import { WorkflowEvent, AuditLogEntry } from '../../../types';

interface RecentChangesProps {
  workflowEvents: WorkflowEvent[];
  auditLogs: AuditLogEntry[];
}

/** Returns a human-readable relative timestamp: "just now", "2 min ago", etc. */
function relativeTime(ts: number): string {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 10) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

export const RecentChangesFeed: React.FC<RecentChangesProps> = ({
  workflowEvents,
  auditLogs: _auditLogs,
}) => {
  // ── Feature 4: Track new entries for slide-in animation ──────────
  // previousIds holds the IDs from the last render to diff against.
  const previousIdsRef = useRef<Set<string>>(new Set());
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  // Sort events newest-first
  const sortedEvents = [...workflowEvents].sort((a, b) => b.createdAt - a.createdAt);

  useEffect(() => {
    const currentIds = new Set(sortedEvents.map((e) => e.id || ''));
    const freshIds = new Set<string>();

    // Only flag as new on subsequent renders (not the first load)
    if (previousIdsRef.current.size > 0) {
      currentIds.forEach((id) => {
        if (!previousIdsRef.current.has(id)) {
          freshIds.add(id);
        }
      });
    }

    previousIdsRef.current = currentIds;

    if (freshIds.size > 0) {
      setNewIds(freshIds);
      // Remove the "NEW" badge after 5 seconds
      const timer = setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev);
          freshIds.forEach((id) => next.delete(id));
          return next;
        });
      }, 5_000);
      return () => clearTimeout(timer);
    }
  }, [workflowEvents.length]); // re-run whenever the count changes

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
        {/* ── Real-time sync active indicator (matches JK farmerService pattern) ── */}
        <div className="flex items-center gap-1.5 text-[10px] text-[#065F46] font-mono font-bold">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
          </span>
          <span>Real-time Sync Active</span>
        </div>
      </div>

      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {sortedEvents.map((evt) => {
          const isNew = newIds.has(evt.id || '');
          return (
            <div
              key={evt.id}
              className={`p-3.5 rounded-xl border transition-all space-y-1.5 shadow-sm
                ${isNew
                  ? 'bg-[#F0FDF4] border-[#BBF7D0] animate-[slideIn_0.3s_ease-out]'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#0F172A]'
                }`}
              style={isNew ? { animation: 'slideIn 0.3s ease-out' } : undefined}
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#E2E8F0] text-[#0F172A] border border-[#CBD5E1]">
                  {evt.stage}
                </span>

                <div className="flex items-center gap-1.5">
                  {/* ── NEW badge for freshly-pushed events ── */}
                  {isNew && (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#D1FAE5] text-[#065F46] border border-[#6EE7B7] animate-pulse">
                      <Sparkles className="w-2.5 h-2.5" />
                      NEW
                    </span>
                  )}
                  <span className="text-[10px] text-[#64748B] font-mono font-medium">
                    {relativeTime(evt.createdAt)}
                  </span>
                </div>
              </div>

              <p className="text-xs font-extrabold text-[#0F172A] leading-snug">
                {evt.actionTaken}
              </p>

              <p className="text-[11px] text-[#64748B] leading-normal font-medium">
                {evt.comments}
              </p>

              <div className="flex items-center justify-between pt-1.5 border-t border-[#E2E8F0] text-[10px] text-[#64748B]">
                <span>
                  Actor: <strong className="text-[#0F172A]">{evt.actorName}</strong> ({evt.actorRole})
                </span>
                {evt.gazetteOrderNo && (
                  <span className="font-mono text-[#0F172A] font-bold">{evt.gazetteOrderNo}</span>
                )}
              </div>
            </div>
          );
        })}

        {sortedEvents.length === 0 && (
          <p className="text-xs text-[#64748B] text-center py-4 font-medium">
            No workflow events yet — advance a lifecycle stage to see activity here.
          </p>
        )}
      </div>

      {/* Inline keyframe for slide-in animation */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
