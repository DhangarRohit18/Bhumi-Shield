import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import {
  bottleneckService,
  interventionService,
  projectService,
} from '../../services/entities.service';
import { DETECTED_DIAGNOSTIC_ISSUES } from './utils/diagnosticData';
import { IssueDiagnosticCard } from './components/IssueDiagnosticCard';
import { DependencyGraphView } from './components/DependencyGraphView';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { Brain, Network, Sliders, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export const OperationsIntelligenceCenter: React.FC = () => {
  const { activeRole } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'diagnostics' | 'dependencies' | 'simulator'>('diagnostics');
  const [modelMode, setModelMode] = useState<'production' | 'prototype'>('production');

  const { data: allBottlenecks } = useFirestoreCollection(bottleneckService);
  const { data: allProjects } = useFirestoreCollection(projectService);

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans">
      {/* Top Intelligence Header in Pure White & Beige */}
      <div className="bg-[#FDFBF7] border-b border-[#E2D9CC] px-6 py-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E]">
              <Brain className="w-6 h-6 text-[#8C7355]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">Operations & Intelligence Center</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E]">
                  EXPLAINABLE AI ENGINE
                </span>
              </div>
              <p className="text-xs text-[#786C5E] mt-0.5">
                7-Layer Root Cause Diagnostics • Statutory Critical Path DAG • What-If Intervention Simulator
              </p>
            </div>
          </div>

          {/* Governance Model Toggle */}
          <div className="flex items-center gap-2 bg-white border border-[#C5B49E] rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setModelMode('production')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                modelMode === 'production'
                  ? 'bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E]'
                  : 'text-[#786C5E] hover:text-slate-900'
              }`}
            >
              Production Model (94.2% Conf)
            </button>
            <button
              onClick={() => setModelMode('prototype')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                modelMode === 'prototype'
                  ? 'bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E]'
                  : 'text-[#786C5E] hover:text-slate-900'
              }`}
            >
              Prototype / Simulated Heuristic
            </button>
          </div>
        </div>

        {/* Subtab Navigation */}
        <div className="flex space-x-2 pt-2 border-t border-[#E2D9CC]">
          <button
            onClick={() => setActiveSubTab('diagnostics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'diagnostics'
                ? 'bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E]'
                : 'text-[#786C5E] hover:text-slate-900 hover:bg-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>7-Layer Issue Diagnostics ({DETECTED_DIAGNOSTIC_ISSUES.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('dependencies')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'dependencies'
                ? 'bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E]'
                : 'text-[#786C5E] hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Statutory Critical Path DAG</span>
          </button>

          <button
            onClick={() => setActiveSubTab('simulator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'simulator'
                ? 'bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E]'
                : 'text-[#786C5E] hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>What-If Intervention Simulator</span>
          </button>
        </div>
      </div>

      {/* Subtab Content */}
      <div className="p-6 flex-1 space-y-6 bg-white">
        {activeSubTab === 'diagnostics' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-900">
                Active Operational Diagnostics (Problem ➔ Evidence ➔ Root Cause ➔ Action ➔ Impact)
              </h2>
              <span className="text-xs text-[#786C5E] font-medium">Human-in-the-Loop Enforced</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {DETECTED_DIAGNOSTIC_ISSUES.map((issue) => (
                <IssueDiagnosticCard
                  key={issue.id}
                  issue={issue}
                  onOrderIssued={() => {}}
                />
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'dependencies' && (
          <DependencyGraphView />
        )}

        {activeSubTab === 'simulator' && (
          <WhatIfSimulator />
        )}
      </div>
    </div>
  );
};
