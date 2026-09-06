import React, { useState } from 'react';
import { SAMPLE_DEPENDENCY_NODES, SAMPLE_DEPENDENCY_EDGES, DependencyNode } from '../utils/graphData';
import { GitCommit, AlertOctagon, CheckCircle2, Clock, ShieldAlert, ArrowRight, CornerDownRight } from 'lucide-react';

export const DependencyGraphView: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<DependencyNode | null>(SAMPLE_DEPENDENCY_NODES[6]);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-[#0F172A]" />
            <span>Statutory Dependency Graph & Critical Path Engine</span>
          </h2>
          <p className="text-xs text-[#64748B] font-medium">
            Multi-node DAG tracking statutory sequence, slack days, and critical path bottlenecks
          </p>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 bg-[#0F172A] text-white px-3 py-1 rounded-full font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>Critical Path (Slack: 0d)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#F1F5F9] text-[#0F172A] px-3 py-1 rounded-full border border-[#CBD5E1] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#64748B]" />
            <span>Non-Critical (Float Available)</span>
          </div>
        </div>
      </div>

      {/* Interactive Graph Node Strip / Flow */}
      <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm overflow-x-auto">
        <div className="flex items-center gap-3 min-w-max pb-2">
          {SAMPLE_DEPENDENCY_NODES.map((node, index) => {
            const isSelected = selectedNode?.id === node.id;
            const isCritical = node.isCriticalPath;

            return (
              <React.Fragment key={node.id}>
                <div
                  onClick={() => setSelectedNode(node)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer w-64 shrink-0 space-y-2 shadow-sm ${
                    isSelected
                      ? 'bg-[#F8FAFC] border-[#0F172A] ring-2 ring-[#0F172A]/40'
                      : isCritical
                      ? 'bg-white border-[#0F172A] hover:border-[#0F172A]'
                      : 'bg-[#F8FAFC]/60 border-[#E2E8F0] hover:border-[#0F172A]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-[#0F172A] font-extrabold">{node.stage}</span>
                    <span className="px-2 py-0.5 rounded font-bold bg-[#0F172A] text-white">
                      {node.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#0F172A] line-clamp-2 h-8 leading-snug">
                    {node.label}
                  </h4>

                  <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[10px] text-[#64748B] font-medium">
                    <span>Est: <strong className="text-[#0F172A]">{node.durationDaysEstimated}d</strong></span>
                    <span className="font-bold text-[#0F172A]">
                      Slack: {node.slackDays}d
                    </span>
                  </div>
                </div>

                {index < SAMPLE_DEPENDENCY_NODES.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-[#64748B] shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Node Deep Inspector */}
      {selectedNode && (
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4 font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
            <div>
              <span className="text-[10px] font-mono text-[#64748B] font-bold">DEPENDENCY NODE INSPECTION</span>
              <h3 className="text-sm font-extrabold text-[#0F172A] mt-0.5">{selectedNode.label}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1]">
                {selectedNode.stage} Stage
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#0F172A] text-white">
                {selectedNode.isCriticalPath ? 'CRITICAL PATH NODE' : 'FLOAT AVAILABLE'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <p className="text-[10px] text-[#64748B] uppercase font-bold">Responsible Statutory Owner</p>
              <p className="font-extrabold text-[#0F172A]">{selectedNode.responsibleOfficer}</p>
              <p className="text-[10px] text-[#64748B] font-mono">{selectedNode.responsibleRole}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <p className="text-[10px] text-[#64748B] uppercase font-bold">Estimated Lead Time</p>
              <p className="text-lg font-extrabold text-[#0F172A]">{selectedNode.durationDaysEstimated} Days</p>
              <p className="text-[10px] text-[#64748B] font-medium">Total Slack Available: {selectedNode.slackDays} Days</p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <p className="text-[10px] text-[#64748B] uppercase font-bold">Downstream Impact on Delay</p>
              <p className="text-xs font-semibold text-[#0F172A]">
                {selectedNode.isCriticalPath
                  ? 'Every 1 day delay pushes project possession by 1 day.'
                  : `Can absorb up to ${selectedNode.slackDays} days without delaying project possession.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
