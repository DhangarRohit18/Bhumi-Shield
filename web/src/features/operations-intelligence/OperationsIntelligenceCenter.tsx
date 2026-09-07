import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import {
  bottleneckService,
  interventionService,
  projectService,
  officerWorkloadService,
} from '../../services/entities.service';
import { DETECTED_DIAGNOSTIC_ISSUES } from './utils/diagnosticData';
import { IssueDiagnosticCard } from './components/IssueDiagnosticCard';
import { DependencyGraphView } from './components/DependencyGraphView';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { WorkloadBalancer } from './components/WorkloadBalancer';
import { Brain, Network, Sliders, AlertTriangle, ShieldCheck, Zap, Scale } from 'lucide-react';

export const OperationsIntelligenceCenter: React.FC = () => {
  const { activeRole } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'workload' | 'diagnostics' | 'dependencies' | 'simulator'>('workload');
  const [modelMode, setModelMode] = useState<'production' | 'prototype'>('production');

  const { data: allBottlenecks } = useFirestoreCollection(bottleneckService);
  const { data: allProjects } = useFirestoreCollection(projectService);
  const { data: allOfficerWorkloads } = useFirestoreCollection(officerWorkloadService);

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F7FF] text-[#0F172A] font-sans">
      {/* Top Intelligence Header in Pure White & Executive Slate */}
      <div className="bg-white/95 backdrop-blur-md border-b border-[#BAE6FD]/60 px-6 py-4 space-y-3 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#EA580C] text-white shadow-sm">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-[#0F172A]">Operations & Intelligence Center</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                  EXPLAINABLE AI ENGINE
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                Officer Workload Balancer • 7-Layer Diagnostics • Statutory Critical Path DAG • What-If Simulator
              </p>
            </div>
          </div>

          {/* Governance Model Toggle */}
          <div className="flex items-center gap-2 bg-[#F0F7FF] border border-[#BAE6FD] rounded-xl p-1 shadow-xs">
            <button
              onClick={() => setModelMode('production')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                modelMode === 'production'
                  ? 'bg-[#0F172A] text-white shadow-sm font-extrabold'
                  : 'text-[#0369A1] hover:text-[#0F172A]'
              }`}
            >
              Production Model (94.2% Conf)
            </button>
            <button
              onClick={() => setModelMode('prototype')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                modelMode === 'prototype'
                  ? 'bg-[#0F172A] text-white shadow-sm font-extrabold'
                  : 'text-[#0369A1] hover:text-[#0F172A]'
              }`}
            >
              Prototype / Simulated Heuristic
            </button>
          </div>
        </div>

        {/* Subtab Navigation */}
        <div className="flex space-x-2 pt-2 border-t border-[#BAE6FD]/60">
          <button
            onClick={() => setActiveSubTab('workload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition-all cursor-pointer ${
              activeSubTab === 'workload'
                ? 'bg-[#0F172A] text-white font-extrabold shadow-sm'
                : 'text-[#0369A1] hover:text-[#0F172A] hover:bg-[#E0F2FE] font-bold'
            }`}
          >
            <Scale className={`w-4 h-4 ${activeSubTab === 'workload' ? 'text-[#EA580C]' : 'text-[#0284C7]'}`} />
            <span>Officer Workload Balancer</span>
          </button>

          <button
            onClick={() => setActiveSubTab('diagnostics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition-all cursor-pointer ${
              activeSubTab === 'diagnostics'
                ? 'bg-[#0F172A] text-white font-extrabold shadow-sm'
                : 'text-[#0369A1] hover:text-[#0F172A] hover:bg-[#E0F2FE] font-bold'
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${activeSubTab === 'diagnostics' ? 'text-[#EA580C]' : 'text-[#0284C7]'}`} />
            <span>Root-Cause Diagnostics (7 Layers)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('dependencies')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition-all cursor-pointer ${
              activeSubTab === 'dependencies'
                ? 'bg-[#0F172A] text-white font-extrabold shadow-sm'
                : 'text-[#0369A1] hover:text-[#0F172A] hover:bg-[#E0F2FE] font-bold'
            }`}
          >
            <Network className={`w-4 h-4 ${activeSubTab === 'dependencies' ? 'text-[#EA580C]' : 'text-[#0284C7]'}`} />
            <span>Statutory Critical Path DAG</span>
          </button>

          <button
            onClick={() => setActiveSubTab('simulator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition-all cursor-pointer ${
              activeSubTab === 'simulator'
                ? 'bg-[#0F172A] text-white font-extrabold shadow-sm'
                : 'text-[#0369A1] hover:text-[#0F172A] hover:bg-[#E0F2FE] font-bold'
            }`}
          >
            <Sliders className={`w-4 h-4 ${activeSubTab === 'simulator' ? 'text-[#EA580C]' : 'text-[#0284C7]'}`} />
            <span>What-If Policy Simulator</span>
          </button>
        </div>
      </div>

      {/* Subtab Content */}
      <div className="p-6 flex-1 space-y-6 bg-[#F8FAFC]">
        {activeSubTab === 'workload' && (
          <WorkloadBalancer officers={allOfficerWorkloads} />
        )}

        {activeSubTab === 'diagnostics' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-extrabold text-[#0F172A]">
                Active Operational Diagnostics (Problem ➔ Evidence ➔ Root Cause ➔ Action ➔ Impact)
              </h2>
              <span className="text-xs text-[#64748B] font-bold">Human-in-the-Loop Enforced</span>
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
