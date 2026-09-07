// ============================================================
// LiveSyncStatusBar.tsx
// Shared UI pill showing Firestore real-time connection health.
//
// Design: matches Bhumi-Shield's crisp white + Executive Slate
// (#0F172A) design system. Three states:
//   🟢 LIVE      — green pulse + "Live · synced Xs ago"
//   🟡 RECONNECTING — amber pulse + "Reconnecting…"
//   🔴 OFFLINE   — red static + "Offline — cached data"
// ============================================================

import React from 'react';
import { useLiveSync, SyncStatus } from '../hooks/useLiveSync';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface LiveSyncStatusBarProps {
  className?: string;
}

const STATUS_CONFIG: Record<
  SyncStatus,
  {
    pulseClass: string;
    dotBg: string;
    pillBg: string;
    pillBorder: string;
    textColor: string;
    label: (secondsAgo: string) => string;
    Icon: React.FC<{ className?: string }>;
  }
> = {
  LIVE: {
    pulseClass: 'animate-ping',
    dotBg: 'bg-[#10B981]',
    pillBg: 'bg-[#F0FDF4]',
    pillBorder: 'border-[#BBF7D0]',
    textColor: 'text-[#065F46]',
    label: (s) => `Live · synced ${s}`,
    Icon: Wifi,
  },
  RECONNECTING: {
    pulseClass: 'animate-pulse',
    dotBg: 'bg-[#F59E0B]',
    pillBg: 'bg-[#FFFBEB]',
    pillBorder: 'border-[#FDE68A]',
    textColor: 'text-[#92400E]',
    label: () => 'Reconnecting…',
    Icon: RefreshCw,
  },
  OFFLINE: {
    pulseClass: '',
    dotBg: 'bg-[#EF4444]',
    pillBg: 'bg-[#FEF2F2]',
    pillBorder: 'border-[#FECACA]',
    textColor: 'text-[#991B1B]',
    label: () => 'Offline — cached data',
    Icon: WifiOff,
  },
};

export const LiveSyncStatusBar: React.FC<LiveSyncStatusBarProps> = ({
  className = '',
}) => {
  const { status, secondsAgo } = useLiveSync();
  const cfg = STATUS_CONFIG[status];
  const { Icon } = cfg;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-sans ${cfg.pillBg} ${cfg.pillBorder} ${className}`}
      title={`Firestore real-time sync: ${status}`}
    >
      {/* Animated status dot */}
      <span className="relative flex h-2 w-2 shrink-0">
        {status === 'LIVE' && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full ${cfg.dotBg} opacity-75 ${cfg.pulseClass}`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dotBg} ${
            status === 'RECONNECTING' ? cfg.pulseClass : ''
          }`}
        />
      </span>

      <Icon className={`w-3 h-3 ${cfg.textColor} shrink-0`} />

      <span className={`text-[10px] font-bold font-mono ${cfg.textColor} whitespace-nowrap`}>
        {cfg.label(secondsAgo)}
      </span>
    </div>
  );
};
