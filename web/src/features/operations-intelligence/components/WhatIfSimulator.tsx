import React, { useState } from 'react';
import { Sliders, TrendingDown, ArrowRight, ShieldCheck, RefreshCw, BarChart3, AlertCircle } from 'lucide-react';

export const WhatIfSimulator: React.FC = () => {
  // Simulator Controls
  const [surveySquadBoost, setSurveySquadBoost] = useState<number>(30); // +% squads
  const [provisionalSolatiumPct, setProvisionalSolatiumPct] = useState<number>(50); // 50% provisional release
  const [dedicatedLegalCounsel, setDedicatedLegalCounsel] = useState<boolean>(true);
  const [realignmentExclusionAcres, setRealignmentExclusionAcres] = useState<number>(0);

  // Baseline Current State
  const baselineDelayDays = 45;
  const baselineCostOverrunCr = 18.5;

  // Real-time Calculated Simulated Outcome
  const delayReductionFromSquads = Math.round(surveySquadBoost * 0.35);
  const delayReductionFromSolatium = Math.round(provisionalSolatiumPct * 0.25);
  const delayReductionFromLegal = dedicatedLegalCounsel ? 12 : 0;
  const delayReductionFromRealignment = Math.round(realignmentExclusionAcres * 1.5);

  const totalSimulatedDelayReduction = Math.min(
    baselineDelayDays - 5,
    delayReductionFromSquads + delayReductionFromSolatium + delayReductionFromLegal + delayReductionFromRealignment
  );
  const simulatedOutcomeDelayDays = Math.max(5, baselineDelayDays - totalSimulatedDelayReduction);

  const estimatedInterventionCostCr =
    surveySquadBoost * 0.04 + (dedicatedLegalCounsel ? 0.35 : 0) + realignmentExclusionAcres * 0.2;
  const simulatedNetCostImpactCr = Math.max(
    0.5,
    baselineCostOverrunCr - totalSimulatedDelayReduction * 0.32 + estimatedInterventionCostCr
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <span>Comparative What-If Decision & Scenario Simulator</span>
        </h2>
        <p className="text-xs text-slate-400">
          Simulate strategic policy levers and compare <strong>Current State Baseline</strong> vs <strong>Proposed Interventions</strong> vs <strong>Estimated Outcome</strong>
        </p>
      </div>

      {/* 3-Column Comparative Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: Current State Baseline */}
        <div className="p-5 rounded-2xl bg-[#0e1628] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Current Baseline</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
              UNMITIGATED
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-900 rounded-xl space-y-1">
              <p className="text-[10px] text-slate-400 uppercase">Projected Delay</p>
              <p className="text-xl font-bold text-rose-400">+{baselineDelayDays} Days</p>
              <p className="text-[10px] text-slate-500">Critical path stalled on JMS & Forest NOC</p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl space-y-1">
              <p className="text-[10px] text-slate-400 uppercase">Projected Cost Overrun</p>
              <p className="text-xl font-bold text-amber-400">+₹{baselineCostOverrunCr.toFixed(2)} Cr</p>
              <p className="text-[10px] text-slate-500">Standby machinery & price index escalation</p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl space-y-1">
              <p className="text-[10px] text-slate-400 uppercase">Statutory Litigation Risk</p>
              <p className="text-base font-bold text-slate-200">High (3 Writ Petitions Pending)</p>
            </div>
          </div>
        </div>

        {/* Col 2: Proposed Intervention Levers (Controls) */}
        <div className="p-5 rounded-2xl bg-[#0b1324] border border-cyan-500/50 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">2. Proposed Levers</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              ADJUSTABLE
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Lever 1: Survey Squad Boost */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-300 font-semibold">DGPS Survey Squad Deployment:</span>
                <span className="text-cyan-400 font-mono font-bold">+{surveySquadBoost}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={10}
                value={surveySquadBoost}
                onChange={(e) => setSurveySquadBoost(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Lever 2: Provisional Solatium Release */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-300 font-semibold">Provisional Solatium Release:</span>
                <span className="text-emerald-400 font-mono font-bold">{provisionalSolatiumPct}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={25}
                value={provisionalSolatiumPct}
                onChange={(e) => setProvisionalSolatiumPct(parseInt(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* Lever 3: Dedicated High Court Counsel */}
            <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-300 font-semibold">Dedicated High Court Counsel:</span>
              <button
                onClick={() => setDedicatedLegalCounsel(!dedicatedLegalCounsel)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  dedicatedLegalCounsel
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {dedicatedLegalCounsel ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* Lever 4: Minor Route Realignment Exclusion */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-300 font-semibold">Homestead Exclusion Realignment:</span>
                <span className="text-indigo-300 font-mono font-bold">{realignmentExclusionAcres} Acres</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={realignmentExclusionAcres}
                onChange={(e) => setRealignmentExclusionAcres(parseInt(e.target.value))}
                className="w-full accent-indigo-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Col 3: Estimated Simulated Outcome */}
        <div className="p-5 rounded-2xl bg-[#0e1628] border border-emerald-500/50 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">3. Estimated Outcome</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              SIMULATED
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-900 rounded-xl space-y-1 border border-emerald-900/60">
              <p className="text-[10px] text-slate-400 uppercase">Optimized Delay</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-emerald-400">+{simulatedOutcomeDelayDays} Days</p>
                <span className="text-xs text-emerald-300 font-bold bg-emerald-950 px-2 py-0.5 rounded">
                  -{totalSimulatedDelayReduction}d Saved
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Recovers {((totalSimulatedDelayReduction / baselineDelayDays) * 100).toFixed(0)}% of critical path delay</p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl space-y-1">
              <p className="text-[10px] text-slate-400 uppercase">Net Cost Impact</p>
              <p className="text-xl font-bold text-indigo-300">+₹{simulatedNetCostImpactCr.toFixed(2)} Cr</p>
              <p className="text-[10px] text-emerald-400 font-semibold">Net Savings: ₹{(baselineCostOverrunCr - simulatedNetCostImpactCr).toFixed(2)} Cr</p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl space-y-1">
              <p className="text-[10px] text-slate-400 uppercase">Litigation Mitigation Status</p>
              <p className="text-xs font-semibold text-emerald-300">
                {provisionalSolatiumPct >= 50
                  ? 'High Court SLP standard affidavit acceptable; stay risk suppressed.'
                  : 'Requires higher solatium release to prevent injunctions.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
