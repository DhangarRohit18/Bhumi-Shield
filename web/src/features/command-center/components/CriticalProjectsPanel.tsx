import React from 'react';
import { Building2, Compass, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Project } from '../../../types';

interface CriticalProjectsProps {
  projects: Project[];
  selectedProjectId?: string;
  onSelectProject: (id: string) => void;
}

export const CriticalProjectsPanel: React.FC<CriticalProjectsProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
}) => {
  return (
    <div className="bg-white border border-[#BAE6FD] rounded-2xl p-5 shadow-sm font-sans space-y-4">
      <div className="flex items-center justify-between border-b border-[#BAE6FD]/60 pb-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#EA580C]" />
          <h3 className="text-sm font-extrabold text-[#0F172A]">Critical Projects & Acquisition Velocity</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
          {projects.length} CORRIDORS
        </span>
      </div>

      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {projects.map((proj) => {
          const isSelected = proj.id === selectedProjectId;

          return (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj.id!)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                isSelected
                  ? 'bg-[#F0F7FF] border-[#0F172A] ring-2 ring-[#0F172A]/20'
                  : 'bg-[#F0F7FF]/50 border-[#BAE6FD]/70 hover:border-[#EA580C]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#0369A1] font-bold bg-[#E0F2FE] px-1.5 py-0.5 rounded border border-[#BAE6FD]">
                      {proj.code}
                    </span>
                    <h3 className="text-xs font-bold text-[#0F172A] line-clamp-1">{proj.name}</h3>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1 line-clamp-1">{proj.description}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold shrink-0 bg-[#0F172A] text-white">
                  {proj.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-[#BAE6FD]/60 text-[10px]">
                <div>
                  <span className="text-[#64748B]">Statutory Stage:</span>
                  <p className="font-bold text-[#0F172A] truncate">{proj.currentStage}</p>
                </div>
                <div>
                  <span className="text-[#64748B]">Total Area:</span>
                  <p className="font-bold text-[#0F172A]">{proj.totalAreaRequiredAcres} Acres</p>
                </div>
                <div>
                  <span className="text-[#64748B]">Total Budget:</span>
                  <p className="font-bold text-[#0F172A]">₹{(proj.totalBudgetINR / 10000000).toLocaleString()} Cr</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
