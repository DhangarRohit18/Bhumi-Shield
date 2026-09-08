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
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-soft  space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-extrabold text-[#0B132B]">Critical Projects & Acquisition Velocity</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-indigo-50 text-indigo-600 border border-slate-200/80">
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
                  ? 'bg-transparent border-[#0B132B] ring-2 ring-[#0B132B]/20'
                  : 'bg-transparent/50 border-slate-200/80/70 hover:border-[#4F46E5]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-indigo-600 font-extrabold bg-indigo-50 px-1.5 py-0.5 rounded border border-slate-200/80">
                      {proj.code}
                    </span>
                    <h3 className="text-xs font-extrabold text-[#0B132B] line-clamp-1">{proj.name}</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{proj.description}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold shrink-0 bg-[#0B132B] text-white">
                  {proj.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-200/80/60 text-[10px]">
                <div>
                  <span className="text-slate-500">Statutory Stage:</span>
                  <p className="font-extrabold text-[#0B132B] truncate">{proj.currentStage}</p>
                </div>
                <div>
                  <span className="text-slate-500">Total Area:</span>
                  <p className="font-extrabold text-[#0B132B]">{proj.totalAreaRequiredAcres} Acres</p>
                </div>
                <div>
                  <span className="text-slate-500">Total Budget:</span>
                  <p className="font-extrabold text-[#0B132B]">₹{(proj.totalBudgetINR / 10000000).toLocaleString()} Cr</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
