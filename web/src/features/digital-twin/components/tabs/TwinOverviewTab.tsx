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
      {/* Top 4 Metric KPI Cards in Crisp White & Executive Slate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#64748B] font-extrabold uppercase tracking-wider">
            <span>Acquisition Velocity</span>
            <TrendingUp className="w-4 h-4 text-[#0F172A]" />
          </div>
          <p className="text-2xl font-extrabold text-[#0F172A] font-mono">{percentComplete}%</p>
          <p className="text-[10px] text-[#64748B] font-medium">
            {awardedCount} of {parcelsCount} Cadastral Plots Awarded
          </p>
          <div className="w-full bg-[#F1F5F9] border border-[#CBD5E1] h-2 rounded-full overflow-hidden mt-2">
            <div className="bg-[#0F172A] h-full rounded-full" style={{ width: `${percentComplete}%` }} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#64748B] font-extrabold uppercase tracking-wider">
            <span>Direct PFMS Disbursed</span>
            <DollarSign className="w-4 h-4 text-[#0F172A]" />
          </div>
          <p className="text-2xl font-extrabold text-[#0F172A] font-mono">
            ₹{(totalCompensationSum / 10000000).toFixed(2)} Cr
          </p>
          <p className="text-[10px] text-[#64748B] font-medium">Includes 100% Solatium & Valuations</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#64748B] font-extrabold uppercase tracking-wider">
            <span>Forecasted Delay</span>
            <Clock className="w-4 h-4 text-[#0F172A]" />
          </div>
          <p className="text-2xl font-extrabold text-[#0F172A] font-mono">
            +{prediction?.predictedDelayDays || 45} Days
          </p>
          <p className="text-[10px] text-[#64748B] font-medium">Confidence: {((prediction?.confidenceScore || 0.94) * 100).toFixed(0)}% (Calibrated)</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#64748B] font-extrabold uppercase tracking-wider">
            <span>Active Critical Stalls</span>
            <AlertTriangle className="w-4 h-4 text-[#0F172A]" />
          </div>
          <p className="text-2xl font-extrabold text-[#0F172A] font-mono">{bottlenecks.length}</p>
          <p className="text-[10px] text-[#64748B] font-medium">Requires Revenue / High-Court Action</p>
        </div>
      </div>

      {/* Corridor Overview Details & Responsible Officers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <h3 className="text-sm font-extrabold text-[#0F172A]">Statutory Acquisition Overview & Geometry</h3>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1] font-bold">
              Package: {project.code}
            </span>
          </div>

          <p className="text-xs text-[#0F172A] leading-relaxed font-medium">
            {project.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] text-[#64748B] block uppercase font-bold">Total Land</span>
              <strong className="text-[#0F172A] text-sm font-mono font-bold">{project.totalAreaRequiredAcres} Acres</strong>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] text-[#64748B] block uppercase font-bold">Outlay Budget</span>
              <strong className="text-[#0F172A] text-sm font-mono font-bold">₹{(project.totalBudgetINR / 10000000).toLocaleString()} Cr</strong>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] text-[#64748B] block uppercase font-bold">Commenced</span>
              <strong className="text-[#0F172A] text-xs font-mono font-bold">{project.startDate}</strong>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] text-[#64748B] block uppercase font-bold">Target Date</span>
              <strong className="text-[#0F172A] text-xs font-mono font-bold">{project.targetCompletionDate}</strong>
            </div>
          </div>
        </div>

        {/* Responsible Officer Roster */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <h3 className="text-sm font-extrabold text-[#0F172A]">Responsible Statutory Officers</h3>
            <UserCheck className="w-4 h-4 text-[#0F172A]" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] uppercase font-extrabold text-[#0F172A] block">CALA & SDO (Acquisition Officer)</span>
              <p className="font-extrabold text-[#0F172A] text-xs mt-0.5">Shri Vikram Joshi, IAS</p>
              <p className="text-[10px] text-[#64748B]">Palghar Division Collectorate</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] uppercase font-extrabold text-[#0F172A] block">NHSRCL Nodal Project Director</span>
              <p className="font-extrabold text-[#0F172A] text-xs mt-0.5">Er. Rajesh Kulkarni</p>
              <p className="text-[10px] text-[#64748B]">Chief Project Manager (Civil Viaduct)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
