import React from 'react';
import { Project, Bottleneck } from '../../../types';
import { ChevronRight, Cpu, AlertOctagon, Layers } from 'lucide-react';

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
    <div className="bg-white border-b border-[#E2E8F0] px-4 py-2.5 space-y-2 font-sans shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
        {/* Project Selector & Badge */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#0F172A] text-white border border-[#0F172A]">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#E2E8F0] text-[#0F172A] border border-[#CBD5E1] font-bold">
                {project.code}
              </span>
              <select
                value={project.id}
                onChange={(e) => onSelectProject(e.target.value)}
                aria-label="Select Infrastructure Corridor"
                className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-2 py-0.5 text-xs font-extrabold text-[#0F172A] focus:outline-none focus:border-[#0F172A] cursor-pointer shadow-sm"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-[#64748B] font-medium">
              Target: <strong className="text-[#0F172A] font-mono">{project.targetCompletionDate}</strong> • Stage: <strong className="text-[#0F172A] font-mono">{project.currentStage}</strong>
            </p>
          </div>
        </div>

        {/* Operational Indicators in Slate */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-left shadow-sm">
            <span className="text-[9px] uppercase font-bold text-[#64748B] tracking-wider">Area Required</span>
            <p className="text-xs font-extrabold text-[#0F172A] font-mono">{project.totalAreaRequiredAcres} Ac</p>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-left shadow-sm">
            <span className="text-[9px] uppercase font-bold text-[#64748B] tracking-wider">Outlay</span>
            <p className="text-xs font-extrabold text-[#0F172A] font-mono">₹{(project.totalBudgetINR / 10000000).toLocaleString()} Cr</p>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-left shadow-sm">
            <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Active Stalls</span>
            <p className="text-sm font-extrabold text-[#0F172A] font-mono mt-0.5">{bottlenecks.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
