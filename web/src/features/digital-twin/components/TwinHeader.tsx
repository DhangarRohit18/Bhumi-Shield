import React from 'react';
import { Project, Bottleneck } from '../../../types';
import { Cpu } from 'lucide-react';

interface TwinHeaderProps {
  project: Project;
  projects: Project[];
  onSelectProject: (id: string) => void;
  bottlenecks: Bottleneck[];
}

export const TwinHeader: React.FC<TwinHeaderProps> = ({
  project,
  projects,
  onSelectProject,
  bottlenecks,
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-[#BAE6FD]/60 px-4 py-2.5 space-y-2 font-sans shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
        {/* Project Selector & Badge */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#EA580C] text-white shadow-sm">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] font-bold">
                {project.code}
              </span>
              <select
                value={project.id}
                onChange={(e) => onSelectProject(e.target.value)}
                aria-label="Select Infrastructure Corridor"
                className="bg-[#F0F7FF] border border-[#BAE6FD] rounded-lg px-2 py-0.5 text-xs font-extrabold text-[#0F172A] focus:outline-none focus:border-[#EA580C] cursor-pointer shadow-xs"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-[#64748B] font-medium">
              Target: <strong className="text-[#0F172A] font-mono">{project.targetCompletionDate}</strong> • Stage: <strong className="text-[#EA580C] font-mono font-bold">{project.currentStage}</strong>
            </p>
          </div>
        </div>

        {/* Operational Indicators in Light Blue */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-2.5 py-1 rounded-lg bg-[#F0F7FF] border border-[#BAE6FD] text-left shadow-xs">
            <span className="text-[9px] uppercase font-bold text-[#0369A1] tracking-wider">Area Required</span>
            <p className="text-xs font-extrabold text-[#0F172A] font-mono">{project.totalAreaRequiredAcres} Ac</p>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-[#F0F7FF] border border-[#BAE6FD] text-left shadow-xs">
            <span className="text-[9px] uppercase font-bold text-[#0369A1] tracking-wider">Outlay</span>
            <p className="text-xs font-extrabold text-[#0F172A] font-mono">₹{(project.totalBudgetINR / 10000000).toLocaleString()} Cr</p>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] text-left shadow-xs">
            <span className="text-[10px] uppercase font-bold text-[#EA580C] tracking-wider">Active Stalls</span>
            <p className="text-sm font-extrabold text-[#C2410C] font-mono mt-0.5">{bottlenecks.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
