import React from 'react';
import { CorridorDelayFactor, CorridorReadinessProject } from '../../../types';
import { HelpCircle, AlertTriangle, Coins, Trees, Scale, Wrench, CheckCircle2 } from 'lucide-react';

interface DelayFactorBreakdownProps {
  project: CorridorReadinessProject;
  activeFactorFilter: CorridorDelayFactor | 'ALL';
  onSelectFactor: (factor: CorridorDelayFactor | 'ALL') => void;
}

export const DelayFactorBreakdown: React.FC<DelayFactorBreakdownProps> = ({
  project,
  activeFactorFilter,
  onSelectFactor,
}) => {
  const breakdown = project.delayFactorsBreakdown;

  const factors: Array<{
    id: CorridorDelayFactor;
    label: string;
    percentage: number;
    icon: any;
    colorClass: string;
    barColor: string;
    description: string;
  }> = [
    {
      id: 'LAND_ACQUISITION',
      label: 'Land Acquisition & Gram Sabha Resistance',
      percentage: breakdown.landAcquisitionPct,
      icon: AlertTriangle,
      colorClass: 'text-rose-600 bg-rose-50 border-rose-200',
      barColor: 'bg-rose-500',
      description: 'Sec 15(1) public objections, PESA tribal resistance & community pasture rights',
    },
    {
      id: 'COMPENSATION_DISPUTES',
      label: 'Compensation & Solatium Disagreements',
      percentage: breakdown.compensationDisputesPct,
      icon: Coins,
      colorClass: 'text-amber-600 bg-amber-50 border-amber-200',
      barColor: 'bg-amber-500',
      description: 'Commercial circle rate re-indexing, fruit orchard valuation & 4x multiplier demands',
    },
    {
      id: 'ENVIRONMENTAL_FOREST',
      label: 'Forest, Wildlife & Eco-Sensitive Buffer',
      percentage: breakdown.environmentalForestPct,
      icon: Trees,
      colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      barColor: 'bg-emerald-500',
      description: 'MoEFCC Stage-II forest diversion, tiger corridor animal underpass compliance',
    },
    {
      id: 'LEGAL_PROCEEDINGS',
      label: 'Court Injunctions & Title Litigation',
      percentage: breakdown.legalProceedingsPct,
      icon: Scale,
      colorClass: 'text-purple-600 bg-purple-50 border-purple-200',
      barColor: 'bg-purple-500',
      description: 'High Court status quo orders, ancestral coparcenary title suits & Sec 30 references',
    },
    {
      id: 'UTILITY_RELOCATION',
      label: 'Utility Relocation & Inter-Ministerial NOC',
      percentage: breakdown.utilityRelocationPct,
      icon: Wrench,
      colorClass: 'text-cyan-600 bg-cyan-50 border-cyan-200',
      barColor: 'bg-cyan-500',
      description: 'Defence depot blast buffer zone clearances, 765 kV transmission towers & canals',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80/80 shadow-soft space-y-4 ">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-gradient text-white shadow-soft">
            <HelpCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#0B132B] tracking-tight">
              Why is this Corridor Delayed?
            </h3>
            <p className="text-xs text-slate-500">
              Root-cause social consent, legal & administrative bottleneck breakdown
            </p>
          </div>
        </div>

        {/* Filter Clear or Active Filter Pill */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {activeFactorFilter !== 'ALL' && (
            <button
              onClick={() => onSelectFactor('ALL')}
              className="text-[11px] font-extrabold text-indigo-600 hover:underline bg-[#EEF2FF] px-2.5 py-1 rounded-2xl border border-[#E0E7FF] cursor-pointer"
            >
              Clear Factor Filter ✕
            </button>
          )}
          <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-2xl bg-transparent text-[#4F46E5] border border-slate-200/80">
            {project.totalLengthKm - project.clearedKm} km Total Constraints
          </span>
        </div>
      </div>

      {/* Multi-segment Combined Progress Ribbon */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-extrabold text-slate-500">
          <span>Corridor Delay Attribution Matrix</span>
          <span className="text-[#0B132B] font-extrabold">100% Impact Share</span>
        </div>
        <div className="w-full h-3.5 rounded-full bg-slate-100 flex overflow-hidden p-0.5 border border-slate-200">
          {factors.map((f) => (
            <div
              key={f.id}
              style={{ width: `${f.percentage}%` }}
              className={`${f.barColor} h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 hover:opacity-85 cursor-pointer relative group`}
              onClick={() => onSelectFactor(activeFactorFilter === f.id ? 'ALL' : f.id)}
              title={`${f.label}: ${f.percentage}%`}
            />
          ))}
        </div>
      </div>

      {/* Interactive Clickable Factor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
        {factors.map((f) => {
          const Icon = f.icon;
          const isSelected = activeFactorFilter === f.id;

          return (
            <button
              key={f.id}
              onClick={() => onSelectFactor(isSelected ? 'ALL' : f.id)}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'ring-2 ring-[#4F46E5] border-[#4F46E5] bg-[#EEF2FF] shadow-soft scale-[1.02]'
                  : 'bg-transparent border-slate-200 hover:border-slate-200/80 hover:bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`p-1.5 rounded-2xl border ${f.colorClass}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-extrabold text-[#0B132B] font-mono">
                    {f.percentage}%
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-[#0B132B] leading-tight line-clamp-2">
                  {f.label}
                </h4>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                {f.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
