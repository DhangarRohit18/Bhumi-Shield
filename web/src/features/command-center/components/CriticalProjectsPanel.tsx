import React from 'react';
import { Compass, AlertCircle, CheckCircle, Clock } from 'lucide-react';
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
    <div className="bg-white border border-[#E2D9CC] rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E]">
            <Compass className="w-4 h-4 text-[#8C7355]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Critical Projects Operational Triage</h2>
            <p className="text-[11px] text-[#786C5E]">Statutory land acquisition velocity & corridor risk rank</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FDFBF7] text-[#4A3B2C] border border-[#C5B49E] font-bold">
          {projects.length} Corridors
        </span>
      </div>

      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {projects.map((proj) => {
          const isDelayed = proj.status === 'DELAYED' || proj.status === 'LITIGATION';
          const isSelected = proj.id === selectedProjectId;

          return (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj.id!)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#FDFBF7] border-[#8C7355] shadow-sm ring-1 ring-[#8C7355]/40'
                  : 'bg-white border-[#E2D9CC] hover:border-[#C5B49E]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#4A3B2C] font-bold bg-[#E2D9CC] px-1.5 py-0.5 rounded border border-[#C5B49E]">
                      {proj.code}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{proj.name}</h3>
                  </div>
                  <p className="text-[11px] text-[#786C5E] mt-1 line-clamp-1">{proj.description}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    isDelayed
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {proj.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-[#E2D9CC] text-[10px]">
                <div>
                  <span className="text-[#786C5E]">Statutory Stage:</span>
                  <p className="font-bold text-emerald-800 truncate">{proj.currentStage}</p>
                </div>
                <div>
                  <span className="text-[#786C5E]">Total Area:</span>
                  <p className="font-bold text-slate-900">{proj.totalAreaRequiredAcres} Acres</p>
                </div>
                <div>
                  <span className="text-[#786C5E]">Total Budget:</span>
                  <p className="font-bold text-slate-900">₹{(proj.totalBudgetINR / 10000000).toLocaleString()} Cr</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
