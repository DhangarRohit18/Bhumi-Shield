// ============================================================
// progressWeights.ts
// Weighted lifecycle progress computation — inspired by
// bhoomisetu's department-weighted progress scoring from
// backend/controllers/projectController.js (SIH 2026 PS 26016).
// Adapted for Bhumi-Shield's RFCTLARR 8-stage lifecycle.
// ============================================================

import { Parcel } from '../types';

export interface StageWeight {
  key: string;
  label: string;
  weight: number; // percentage points (all must sum to 100)
  description: string;
  parcelStatuses: Parcel['status'][];
}

/**
 * Stage weight map mirroring bhoomisetu's department weight logic.
 * Each stage maps to the parcel statuses that represent completion
 * of that statutory milestone.
 *
 * Weights reflect actual RFCTLARR 2013 complexity & criticality:
 *  - Disbursement + Possession = 50% because they are
 *    the true deliverable for PAFs (Project Affected Families).
 *  - SIA & legal stages carry meaningful weight due to
 *    litigation-induced delay risk.
 */
export const STAGE_WEIGHTS: StageWeight[] = [
  {
    key: 'Proposal',
    label: 'Proposal & Requisition',
    weight: 5,
    description: 'Administrative approval & initial alignment',
    parcelStatuses: ['IDENTIFIED'],
  },
  {
    key: 'SIA',
    label: 'Social Impact Assessment',
    weight: 10,
    description: 'SIA expert group study & public hearing',
    parcelStatuses: ['SURVEYED'],
  },
  {
    key: 'Sec_11_Notification',
    label: 'Section 11 Notification',
    weight: 10,
    description: 'Preliminary notification in official gazette',
    parcelStatuses: ['NOTIFIED'],
  },
  {
    key: 'Sec_15_Objections',
    label: 'Section 15 Objections',
    weight: 10,
    description: 'Hearing of claims & boundary inquiries',
    parcelStatuses: ['NOTIFIED'],
  },
  {
    key: 'Sec_19_Declaration',
    label: 'Section 19 Declaration',
    weight: 15,
    description: 'Conclusive declaration of public purpose',
    parcelStatuses: ['VALUED'],
  },
  {
    key: 'Award_Enquiry',
    label: 'Section 23 Award Enquiry',
    weight: 10,
    description: 'Valuation, solatium & claims enquiry',
    parcelStatuses: ['AWARDED'],
  },
  {
    key: 'Disbursement',
    label: 'Compensation & R&R',
    weight: 25,
    description: 'PFMS direct DBT credit & resettlement grants',
    parcelStatuses: ['DISBURSED'],
  },
  {
    key: 'Possession',
    label: 'Section 38 Possession',
    weight: 15,
    description: 'Formal vesting & handover to executing body',
    parcelStatuses: ['POSSESSED'],
  },
];

export interface WeightedProgressResult {
  weightedTotal: number; // 0-100
  stageBreakdown: {
    key: string;
    label: string;
    weight: number;
    actualPct: number;         // raw parcel completion % for this stage
    weightedContribution: number;
    status: 'COMPLETED' | 'ON_TRACK' | 'AT_RISK' | 'BOTTLENECK' | 'PENDING';
    parcelCount: number;
    completedCount: number;
  }[];
}

/**
 * Compute weighted overall progress and per-stage breakdown.
 *
 * At-Risk rule (from bhoomisetu):
 *   A stage is AT_RISK when actualPct trails expectedPct by ≥10 pts.
 *
 * Bottleneck rule (from bhoomisetu):
 *   A stage is BOTTLENECK when parcelCount > 20 AND actualPct < 60.
 *
 * @param parcels    - Live parcel array from Firestore onSnapshot
 * @param currentStageKey - The project's current statutory stage
 */
export function computeWeightedProgress(
  parcels: Parcel[],
  currentStageKey: string
): WeightedProgressResult {
  const total = parcels.length;
  const currentStageIdx = STAGE_WEIGHTS.findIndex((s) => s.key === currentStageKey);

  const stageBreakdown = STAGE_WEIGHTS.map((stage, idx) => {
    const relevant = parcels.filter((p) =>
      stage.parcelStatuses.includes(p.status)
    );
    const completedCount = relevant.length;
    const actualPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    // Expected % based on position relative to current stage
    const expectedPct =
      idx < currentStageIdx ? 100 : idx === currentStageIdx ? 50 : 0;

    let status: WeightedProgressResult['stageBreakdown'][0]['status'];
    if (idx < currentStageIdx) {
      status = 'COMPLETED';
    } else if (idx > currentStageIdx) {
      status = 'PENDING';
    } else if (total > 20 && actualPct < 60) {
      // bhoomisetu bottleneck rule
      status = 'BOTTLENECK';
    } else if (expectedPct - actualPct >= 10) {
      // bhoomisetu at-risk rule
      status = 'AT_RISK';
    } else {
      status = 'ON_TRACK';
    }

    const weightedContribution = Math.round((actualPct / 100) * stage.weight * 10) / 10;

    return {
      key: stage.key,
      label: stage.label,
      weight: stage.weight,
      actualPct,
      weightedContribution,
      status,
      parcelCount: total,
      completedCount,
    };
  });

  const weightedTotal = Math.round(
    stageBreakdown.reduce((acc, s) => acc + s.weightedContribution, 0)
  );

  return { weightedTotal, stageBreakdown };
}

/** Returns a Tailwind-compatible colour token for a stage status badge */
export function getStatusColor(
  status: WeightedProgressResult['stageBreakdown'][0]['status']
): { bg: string; text: string; border: string } {
  switch (status) {
    case 'COMPLETED':
      return { bg: 'bg-[#D1FAE5]', text: 'text-[#065F46]', border: 'border-[#6EE7B7]' };
    case 'ON_TRACK':
      return { bg: 'bg-[#DBEAFE]', text: 'text-[#1E40AF]', border: 'border-[#93C5FD]' };
    case 'AT_RISK':
      return { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', border: 'border-[#FCD34D]' };
    case 'BOTTLENECK':
      return { bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]', border: 'border-[#FCA5A5]' };
    case 'PENDING':
    default:
      return { bg: 'bg-[#F1F5F9]', text: 'text-[#64748B]', border: 'border-[#CBD5E1]' };
  }
}
