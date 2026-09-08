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
    <div className="space-y-6 ">
      <div>
        <h2 className="text-base font-extrabold text-[#0B132B] flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#0B132B]" />
          <span>Comparative What-If Decision & Scenario Simulator</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Simulate strategic policy levers and compare <strong>Current State Baseline</strong> vs <strong>Proposed Interventions</strong> vs <strong>Estimated Outcome</strong>
        </p>
      </div>

      {/* 3-Column Comparative Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: Current State Baseline */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft space-y-4 ">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">1. Current Baseline</h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F1F5F9] text-[#0B132B] border border-[#CBD5E1]">
              UNMITIGATED
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-transparent rounded-xl border border-[#E2E8F0] space-y-1">
              <p className="text-[10px] text-slate-500 uppercase font-extrabold">Projected Delay</p>
              <p className="text-xl font-extrabold text-[#0B132B]">+{baselineDelayDays} Days</p>
              <p className="text-[10px] text-slate-500 font-medium">Critical path stalled on JMS & Forest NOC</p>
            </div>

            <div className="p-3.5 bg-transparent rounded-xl border border-[#E2E8F0] space-y-1">
              <p className="text-[10px] text-slate-500 uppercase font-extrabold">Projected Cost Overrun</p>
              <p className="text-xl font-extrabold text-[#0B132B]">+₹{baselineCostOverrunCr.toFixed(2)} Cr</p>
              <p className="text-[10px] text-slate-500 font-medium">Standby machinery & price index escalation</p>
            </div>

            <div className="p-3.5 bg-transparent rounded-xl border border-[#E2E8F0] space-y-1">
              <p className="text-[10px] text-slate-500 uppercase font-extrabold">Statutory Litigation Risk</p>
              <p className="text-base font-extrabold text-[#0B132B]">High (3 Writ Petitions Pending)</p>
            </div>
          </div>
        </div>

        {/* Col 2: Proposed Intervention Levers (Controls) */}
        <div className="p-5 rounded-2xl bg-white border border-[#0B132B] shadow-soft space-y-4 ">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0B132B]">2. Proposed Levers</h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#0B132B] text-white">
              ADJUSTABLE
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Lever 1: Survey Squad Boost */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#0B132B] font-extrabold">DGPS Survey Squad Deployment:</span>
                <span className="text-[#0B132B] font-mono font-extrabold">+{surveySquadBoost}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={10}
                value={surveySquadBoost}
                onChange={(e) => setSurveySquadBoost(parseInt(e.target.value))}
                className="w-full accent-[#0B132B] cursor-pointer"
              />
            </div>

            {/* Lever 2: Provisional Solatium Release */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#0B132B] font-extrabold">Provisional Solatium Release:</span>
                <span className="text-[#0B132B] font-mono font-extrabold">{provisionalSolatiumPct}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={25}
                value={provisionalSolatiumPct}
                onChange={(e) => setProvisionalSolatiumPct(parseInt(e.target.value))}
                className="w-full accent-[#0B132B] cursor-pointer"
              />
            </div>

            {/* Lever 3: Dedicated High Court Counsel */}
            <div className="flex items-center justify-between p-3 bg-transparent rounded-xl border border-[#E2E8F0]">
              <span className="text-[#0B132B] font-extrabold">Dedicated High Court Counsel:</span>
              <button
                onClick={() => setDedicatedLegalCounsel(!dedicatedLegalCounsel)}
                className={`px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
                  dedicatedLegalCounsel
                    ? 'bg-[#0B132B] text-white shadow-soft'
                    : 'bg-white text-slate-500 border border-[#CBD5E1]'
                }`}
              >
                {dedicatedLegalCounsel ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* Lever 4: Minor Route Realignment Exclusion */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#0B132B] font-extrabold">Homestead Exclusion Realignment:</span>
                <span className="text-[#0B132B] font-mono font-extrabold">{realignmentExclusionAcres} Acres</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={realignmentExclusionAcres}
                onChange={(e) => setRealignmentExclusionAcres(parseInt(e.target.value))}
                className="w-full accent-[#0B132B] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Col 3: Estimated Simulated Outcome */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft space-y-4 ">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0B132B]">3. Estimated Outcome</h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#0B132B] text-white">
              SIMULATED
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-transparent rounded-xl border border-[#E2E8F0] space-y-1">
              <p className="text-[10px] text-slate-500 uppercase font-extrabold">Optimized Delay</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-extrabold text-[#0B132B]">+{simulatedOutcomeDelayDays} Days</p>
                <span className="text-xs text-[#0B132B] font-extrabold bg-white px-2.5 py-0.5 rounded-full border border-[#CBD5E1]">
                  -{totalSimulatedDelayReduction}d Saved
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Recovers {((totalSimulatedDelayReduction / baselineDelayDays) * 100).toFixed(0)}% of critical path delay</p>
            </div>

            <div className="p-3.5 bg-transparent rounded-xl border border-[#E2E8F0] space-y-1">
              <p className="text-[10px] text-slate-500 uppercase font-extrabold">Net Cost Impact</p>
              <p className="text-xl font-extrabold text-[#0B132B]">+₹{simulatedNetCostImpactCr.toFixed(2)} Cr</p>
              <p className="text-[10px] text-[#0B132B] font-extrabold">Net Savings: ₹{(baselineCostOverrunCr - simulatedNetCostImpactCr).toFixed(2)} Cr</p>
            </div>

            <div className="p-3.5 bg-transparent rounded-xl border border-[#E2E8F0] space-y-1">
              <p className="text-[10px] text-slate-500 uppercase font-extrabold">Litigation Mitigation Status</p>
              <p className="text-xs font-extrabold text-[#0B132B]">
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
