import React, { useState } from 'react';
import { SAMPLE_DEPENDENCY_NODES, SAMPLE_DEPENDENCY_EDGES, DependencyNode } from '../utils/graphData';
import { GitCommit, AlertOctagon, CheckCircle2, Clock, ShieldAlert, ArrowRight, CornerDownRight } from 'lucide-react';

export const DependencyGraphView: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<DependencyNode | null>(SAMPLE_DEPENDENCY_NODES[6]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-cyan-400" />
            <span>Statutory Dependency Graph & Critical Path Engine</span>
          </h2>
          <p className="text-xs text-slate-400">
            Multi-node DAG tracking statutory sequence, slack days, and critical path bottlenecks
          </p>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 bg-rose-950/60 text-rose-300 px-2.5 py-1 rounded-lg border border-rose-800">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Critical Path (Slack: 0d)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900 text-slate-400 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Non-Critical (Float Available)</span>
          </div>
        </div>
      </div>

      {/* Interactive Graph Node Strip / Flow */}
      <div className="p-5 rounded-2xl bg-[#0e1628] border border-slate-800 shadow-xl overflow-x-auto">
        <div className="flex items-center gap-3 min-w-max pb-2">
          {SAMPLE_DEPENDENCY_NODES.map((node, index) => {
            const isSelected = selectedNode?.id === node.id;
            const isCritical = node.isCriticalPath;

            return (
              <React.Fragment key={node.id}>
                <div
                  onClick={() => setSelectedNode(node)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer w-64 shrink-0 space-y-2 ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg'
                      : isCritical
                      ? 'bg-slate-900 border-rose-900/80 hover:border-rose-700'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-cyan-300 font-bold">{node.stage}</span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        node.status === 'COMPLETED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : node.status === 'BLOCKED'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                          : node.status === 'IN_PROGRESS'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {node.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 line-clamp-2 h-8 leading-snug">
                    {node.label}
                  </h4>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Est: <strong>{node.durationDaysEstimated}d</strong></span>
                    <span className={node.slackDays === 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                      Slack: {node.slackDays}d
                    </span>
                  </div>
                </div>

                {index < SAMPLE_DEPENDENCY_NODES.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Node Deep Inspector */}
      {selectedNode && (
        <div className="p-5 rounded-2xl bg-[#0e1628] border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">DEPENDENCY NODE INSPECTION</span>
              <h3 className="text-sm font-bold text-slate-100 mt-0.5">{selectedNode.label}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-700">
                {selectedNode.stage} Stage
              </span>
              <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                {selectedNode.isCriticalPath ? 'CRITICAL PATH NODE' : 'FLOAT AVAILABLE'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Responsible Statutory Owner</p>
              <p className="font-bold text-slate-200">{selectedNode.responsibleOfficer}</p>
              <p className="text-[10px] text-emerald-400 font-mono">{selectedNode.responsibleRole}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Lead Time</p>
              <p className="text-lg font-bold text-slate-100">{selectedNode.durationDaysEstimated} Days</p>
              <p className="text-[10px] text-slate-400">Total Slack Available: {selectedNode.slackDays} Days</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Downstream Impact on Delay</p>
              <p className="text-xs font-semibold text-rose-300">
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
