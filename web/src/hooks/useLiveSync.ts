// ============================================================
// useLiveSync.ts
// Real-time Firestore connection health tracker.
//
// Inspired by JK Land Records' farmerService.ts offline-first
// sync pattern — adapted for Firebase onSnapshot (vs. the JK
// repo's REST-based approach).
//
// Returns:
//   status    — 'LIVE' | 'RECONNECTING' | 'OFFLINE'
//   lastSyncAt — timestamp of the most recent successful snapshot
//   secondsAgo — human-readable "3s ago" / "just now"
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { onSnapshot, collection, limit, query } from 'firebase/firestore';
import { db } from '../core/firebase';

export type SyncStatus = 'LIVE' | 'RECONNECTING' | 'OFFLINE';

export interface LiveSyncState {
  status: SyncStatus;
  lastSyncAt: number | null;
  secondsAgo: string;
}

// Threshold after which we declare "RECONNECTING" (ms)
const STALE_THRESHOLD_MS = 8_000;
// Threshold after which we declare "OFFLINE"
const OFFLINE_THRESHOLD_MS = 20_000;

export function useLiveSync(): LiveSyncState {
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
  const [status, setStatus] = useState<SyncStatus>('LIVE');
  const [secondsAgo, setSecondsAgo] = useState<string>('connecting…');
  const staltimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Subscribe to a lightweight probe on the `projects` collection
  // (limit 1) to detect Firestore reachability in real time.
  useEffect(() => {
    const probeQuery = query(collection(db, 'projects'), limit(1));

    const unsubscribe = onSnapshot(
      probeQuery,
      { includeMetadataChanges: true },
      (snapshot) => {
        if (!snapshot.metadata.fromCache) {
          setLastSyncAt(Date.now());
          setStatus('LIVE');
        }
      },
      (_error) => {
        setStatus('OFFLINE');
      }
    );

    return () => unsubscribe();
  }, []);

  // ── Liveness check: if no snapshot arrives for STALE_THRESHOLD_MS,
  //    downgrade status. Runs every 2 s.
  useEffect(() => {
    staltimerRef.current = setInterval(() => {
      if (lastSyncAt === null) {
        setStatus('RECONNECTING');
        setSecondsAgo('connecting…');
        return;
      }

      const elapsed = Date.now() - lastSyncAt;
      const secs = Math.floor(elapsed / 1000);

      if (elapsed > OFFLINE_THRESHOLD_MS) {
        setStatus('OFFLINE');
      } else if (elapsed > STALE_THRESHOLD_MS) {
        setStatus('RECONNECTING');
      } else {
        setStatus('LIVE');
      }

      if (secs === 0) {
        setSecondsAgo('just now');
      } else if (secs < 60) {
        setSecondsAgo(`${secs}s ago`);
      } else {
        setSecondsAgo(`${Math.floor(secs / 60)}m ago`);
      }
    }, 2_000);

    return () => {
      if (staltimerRef.current) clearInterval(staltimerRef.current);
    };
  }, [lastSyncAt]);

  return { status, lastSyncAt, secondsAgo };
}
