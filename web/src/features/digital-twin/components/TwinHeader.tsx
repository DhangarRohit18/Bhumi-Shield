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
    <div className="bg-[#FDFBF7] border-b border-[#E2D9CC] px-6 py-4 space-y-3 font-sans">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Project Selector & Badge */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E]">
            <Cpu className="w-6 h-6 text-[#8C7355]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E] font-bold">
                {project.code}
              </span>
              <select
                value={project.id}
                onChange={(e) => onSelectProject(e.target.value)}
                aria-label="Select Infrastructure Corridor"
                className="bg-white border border-[#C5B49E] rounded-lg px-2.5 py-1 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#8C7355] cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-[#786C5E] mt-0.5">
              Target Completion: <strong className="text-slate-900 font-mono">{project.targetCompletionDate}</strong> • Stage: <strong className="text-emerald-800 font-mono">{project.currentStage}</strong>
            </p>
          </div>
        </div>

        {/* Operational Indicators in Beige */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-white border border-[#E2D9CC] text-left">
            <span className="text-[10px] uppercase font-bold text-[#786C5E] tracking-wider">Total Area Required</span>
            <p className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">{project.totalAreaRequiredAcres} Acres</p>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-white border border-[#E2D9CC] text-left">
            <span className="text-[10px] uppercase font-bold text-[#786C5E] tracking-wider">Sanctioned Outlay</span>
            <p className="text-sm font-extrabold text-[#4A3B2C] font-mono mt-0.5">₹{(project.totalBudgetINR / 10000000).toLocaleString()} Cr</p>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-white border border-[#E2D9CC] text-left">
            <span className="text-[10px] uppercase font-bold text-[#786C5E] tracking-wider">Active Stalls</span>
            <p className="text-sm font-extrabold text-rose-800 font-mono mt-0.5">{bottlenecks.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
