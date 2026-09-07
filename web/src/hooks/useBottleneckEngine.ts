// ============================================================
// useBottleneckEngine.ts
// Client-side bottleneck auto-detection hook.
//
// Rules ported from bhoomisetu's projectController.js
// (SIH 2026 PS 26016 — Aaditya Singh):
//   • At-Risk:    actual % trails planned % by ≥ 10 pts
//   • Bottleneck: >20 pending parcels AND <60% actual progress
//   • Dependency ripple: upstream AT_RISK → downstream flagged
//
// All computation runs client-side on live Firestore onSnapshot
// data — no extra backend calls needed.
// ============================================================

import { useMemo, useRef } from 'react';
import { Parcel, WorkflowEvent, Bottleneck } from '../types';
import { STAGE_WEIGHTS } from '../utils/progressWeights';

export interface ComputedBottleneck {
  id: string;
  stageKey: string;
  stageLabel: string;
  title: string;
  rootCause: Bottleneck['rootCause'] | 'PROGRESS_LAG' | 'PARCEL_VOLUME' | 'DEPENDENCY_RIPPLE';
  severity: Bottleneck['severity'];
  delayDaysEstimated: number;
  status: 'IDENTIFIED' | 'UNDER_MITIGATION';
  actualPct: number;
  plannedPct: number;
  pendingParcels: number;
  isComputed: true; // distinguishes from Firestore bottlenecks
  lastEventAt?: number;
}

interface UseBottleneckEngineOptions {
  parcels: Parcel[];
  workflowEvents: WorkflowEvent[];
  currentStageKey: string;
}

export function useBottleneckEngine({
  parcels,
  workflowEvents,
  currentStageKey,
}: UseBottleneckEngineOptions): ComputedBottleneck[] {
  // Track previous computation to avoid unnecessary re-renders
  const prevResultRef = useRef<ComputedBottleneck[]>([]);

  const computed = useMemo(() => {
    const total = parcels.length;
    if (total === 0) return [];

    const currentStageIdx = STAGE_WEIGHTS.findIndex(
      (s) => s.key === currentStageKey
    );

    const bottlenecks: ComputedBottleneck[] = [];
    const atRiskStageKeys = new Set<string>();

    // ─── Pass 1: At-Risk + Bottleneck detection ───────────────────
    STAGE_WEIGHTS.forEach((stage, idx) => {
      // Only evaluate active or recent stages (not future ones)
      if (idx > currentStageIdx + 1) return;

      const completedParcels = parcels.filter((p) =>
        stage.parcelStatuses.includes(p.status)
      ).length;
      const actualPct = Math.round((completedParcels / total) * 100);

      // Expected % — current stage should be ~50%, past stages ~100%
      const plannedPct = idx < currentStageIdx ? 100 : idx === currentStageIdx ? 60 : 0;

      const pendingParcels = total - completedParcels;
      const latestEvent = workflowEvents
        .filter((e) => e.stage === stage.key)
        .sort((a, b) => b.createdAt - a.createdAt)[0];

      // bhoomisetu BOTTLENECK rule: >20 pending cases AND <60% progress
      if (pendingParcels > 20 && actualPct < 60 && idx <= currentStageIdx) {
        atRiskStageKeys.add(stage.key);
        bottlenecks.push({
          id: `computed-bottleneck-${stage.key}`,
          stageKey: stage.key,
          stageLabel: stage.label,
          title: `Volume Overload: ${pendingParcels} Pending Parcels in ${stage.label}`,
          rootCause: 'PARCEL_VOLUME',
          severity: pendingParcels > 50 ? 'CRITICAL' : pendingParcels > 30 ? 'HIGH' : 'MEDIUM',
          delayDaysEstimated: Math.round(pendingParcels * 1.8),
          status: 'IDENTIFIED',
          actualPct,
          plannedPct,
          pendingParcels,
          isComputed: true,
          lastEventAt: latestEvent?.createdAt,
        });
      }
      // bhoomisetu AT-RISK rule: actual trails planned by ≥10 pts
      else if (
        plannedPct - actualPct >= 10 &&
        idx <= currentStageIdx &&
        !atRiskStageKeys.has(stage.key)
      ) {
        atRiskStageKeys.add(stage.key);
        bottlenecks.push({
          id: `computed-atrisk-${stage.key}`,
          stageKey: stage.key,
          stageLabel: stage.label,
          title: `Progress Lag: ${stage.label} at ${actualPct}% (Expected ≥${plannedPct}%)`,
          rootCause: 'PROGRESS_LAG',
          severity: plannedPct - actualPct >= 30 ? 'HIGH' : 'MEDIUM',
          delayDaysEstimated: Math.round((plannedPct - actualPct) * 1.2),
          status: 'IDENTIFIED',
          actualPct,
          plannedPct,
          pendingParcels,
          isComputed: true,
          lastEventAt: latestEvent?.createdAt,
        });
      }
    });

    // ─── Pass 2: Dependency ripple (bhoomisetu rule) ──────────────
    // "compensation delay may affect rehabilitation" pattern —
    // if upstream stage is AT_RISK, flag the NEXT downstream stage.
    STAGE_WEIGHTS.forEach((stage, idx) => {
      const prevStage = STAGE_WEIGHTS[idx - 1];
      if (!prevStage) return;

      // If upstream is at-risk and downstream is NOT yet completed
      if (
        atRiskStageKeys.has(prevStage.key) &&
        idx <= currentStageIdx + 1 &&
        !bottlenecks.find((b) => b.stageKey === stage.key)
      ) {
        bottlenecks.push({
          id: `computed-ripple-${stage.key}`,
          stageKey: stage.key,
          stageLabel: stage.label,
          title: `Dependency Risk: ${prevStage.label} stall may block ${stage.label}`,
          rootCause: 'DEPENDENCY_RIPPLE',
          severity: 'MEDIUM',
          delayDaysEstimated: 15,
          status: 'IDENTIFIED',
          actualPct: 0,
          plannedPct: 0,
          pendingParcels: 0,
          isComputed: true,
        });
      }
    });

    return bottlenecks;
  }, [parcels, workflowEvents, currentStageKey]);

  prevResultRef.current = computed;
  return computed;
}
