import React from 'react';
import { Project, Bottleneck, PredictionRecord, TaskItem } from '../../../../types';
import { TrendingUp, Clock, AlertTriangle, UserCheck, DollarSign } from 'lucide-react';

interface OverviewProps {
  project: Project;
  parcelsCount: number;
  awardedCount: number;
  totalCompensationSum: number;
  bottlenecks: Bottleneck[];
  tasks: TaskItem[];
  prediction?: PredictionRecord;
}

export const TwinOverviewTab: React.FC<OverviewProps> = ({
  project,
  parcelsCount,
  awardedCount,
  totalCompensationSum,
  bottlenecks,
  tasks,
  prediction,
}) => {
  const percentComplete = parcelsCount > 0 ? Math.round((awardedCount / parcelsCount) * 100) : 0;

  return (
    <div className="space-y-6 font-sans">
      {/* Top 4 Metric KPI Cards in Pure White & Beige */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E2D9CC] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#786C5E] font-bold uppercase tracking-wider">
            <span>Acquisition Velocity</span>
            <TrendingUp className="w-4 h-4 text-[#8C7355]" />
          </div>
          <p className="text-xl font-bold text-slate-900 font-mono">{percentComplete}%</p>
          <p className="text-[10px] text-[#786C5E]">
            {awardedCount} of {parcelsCount} Cadastral Plots Awarded
          </p>
          <div className="w-full bg-[#FAF8F5] border border-[#E2D9CC] h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-[#8C7355] h-full rounded-full" style={{ width: `${percentComplete}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2D9CC] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#786C5E] font-bold uppercase tracking-wider">
            <span>Direct PFMS Disbursed</span>
            <DollarSign className="w-4 h-4 text-[#8C7355]" />
          </div>
          <p className="text-xl font-bold text-[#4A3B2C] font-mono">
            ₹{(totalCompensationSum / 10000000).toFixed(2)} Cr
          </p>
          <p className="text-[10px] text-[#786C5E]">Includes 100% Solatium & Valuations</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2D9CC] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#786C5E] font-bold uppercase tracking-wider">
            <span>Forecasted Delay</span>
            <Clock className="w-4 h-4 text-rose-700" />
          </div>
          <p className="text-xl font-bold text-rose-800 font-mono">
            +{prediction?.predictedDelayDays || 45} Days
          </p>
          <p className="text-[10px] text-[#786C5E]">Confidence: {((prediction?.confidenceScore || 0.94) * 100).toFixed(0)}% (Calibrated)</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2D9CC] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#786C5E] font-bold uppercase tracking-wider">
            <span>Active Critical Stalls</span>
            <AlertTriangle className="w-4 h-4 text-amber-700" />
          </div>
          <p className="text-xl font-bold text-amber-800 font-mono">{bottlenecks.length}</p>
          <p className="text-[10px] text-[#786C5E]">Requires Revenue / High-Court Action</p>
        </div>
      </div>

      {/* Corridor Overview Details & Responsible Officers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-[#E2D9CC] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2D9CC] pb-3">
            <h3 className="text-sm font-bold text-slate-900">Statutory Acquisition Overview & Geometry</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E2D9CC] text-[#4A3B2C] border border-[#C5B49E] font-bold">
              Package: {project.code}
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {project.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E2D9CC]">
              <span className="text-[10px] text-[#786C5E] block uppercase font-bold">Total Land</span>
              <strong className="text-slate-900 text-sm font-mono">{project.totalAreaRequiredAcres} Acres</strong>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E2D9CC]">
              <span className="text-[10px] text-[#786C5E] block uppercase font-bold">Outlay Budget</span>
              <strong className="text-[#4A3B2C] text-sm font-mono">₹{(project.totalBudgetINR / 10000000).toLocaleString()} Cr</strong>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E2D9CC]">
              <span className="text-[10px] text-[#786C5E] block uppercase font-bold">Commenced</span>
              <strong className="text-slate-900 text-xs font-mono">{project.startDate}</strong>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E2D9CC]">
              <span className="text-[10px] text-[#786C5E] block uppercase font-bold">Target Date</span>
              <strong className="text-slate-900 text-xs font-mono">{project.targetCompletionDate}</strong>
            </div>
          </div>
        </div>

        {/* Responsible Officer Roster */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2D9CC] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2D9CC] pb-3">
            <h3 className="text-sm font-bold text-slate-900">Responsible Statutory Officers</h3>
            <UserCheck className="w-4 h-4 text-[#8C7355]" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E2D9CC]">
              <span className="text-[10px] uppercase font-bold text-[#8C7355] block">CALA & SDO (Acquisition Officer)</span>
              <p className="font-bold text-slate-900 text-xs mt-0.5">Shri Vikram Joshi, IAS</p>
              <p className="text-[10px] text-[#786C5E]">Palghar Division Collectorate</p>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E2D9CC]">
              <span className="text-[10px] uppercase font-bold text-[#8C7355] block">NHSRCL Nodal Project Director</span>
              <p className="font-bold text-slate-900 text-xs mt-0.5">Er. Rajesh Kulkarni</p>
              <p className="text-[10px] text-[#786C5E]">Chief Project Manager (Civil Viaduct)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
