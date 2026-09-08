import React, { useState } from 'react';
import { CorridorSegment } from '../../../types';
import { CORRIDOR_STATUS_CONFIG } from '../../../data/corridorReadinessData';
import {
  X,
  MapPin,
  Users,
  Building,
  AlertCircle,
  Clock,
  FileText,
  Scale,
  ShieldCheck,
  Coins,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Download,
  Eye,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface SegmentDetailDrawerProps {
  segment: CorridorSegment | null;
  onClose: () => void;
  onOpenARVerification?: (waypointCode: string) => void;
}

export const SegmentDetailDrawer: React.FC<SegmentDetailDrawerProps> = ({
  segment,
  onClose,
  onOpenARVerification,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DELAY_CHAIN' | 'TIMELINE' | 'EVIDENCE'>('OVERVIEW');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  if (!segment) return null;

  const statusConfig = CORRIDOR_STATUS_CONFIG[segment.status] || CORRIDOR_STATUS_CONFIG.GREY_NO_DATA;

  const handleAction = (actionTitle: string) => {
    setActionSuccessMessage(`Order Dispatched: "${actionTitle}" logged to Blockchain Audit Ledger with SHA-256 validation.`);
    setTimeout(() => setActionSuccessMessage(null), 4500);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-[1200] w-full max-w-xl bg-white shadow-2xl border-l border-slate-200/80 flex flex-col  animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/80/80 bg-gradient-to-r from-[#F0F7FF] to-white flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${statusConfig.badgeClass}`}>
              {segment.statusLabel}
            </span>
            <span className="text-[11px] font-mono font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Km {segment.startChainageKm}+000 – Km {segment.endChainageKm}+000 ({segment.lengthKm} km)
            </span>
          </div>
          <h2 className="text-base font-extrabold text-[#0B132B] tracking-tight">
            {segment.segmentName}
          </h2>
          <div className="flex items-center gap-2 text-xs text-[#4F46E5] font-extrabold">
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            <span>{segment.villageName} • {segment.talukaTehsil}, {segment.district}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-[#0B132B] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Action Success Alert Notification */}
      {actionSuccessMessage && (
        <div className="mx-4 mt-3 p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-extrabold text-emerald-800 flex items-center gap-2 shadow-soft animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200/80 px-4 bg-transparent">
        {[
          { id: 'OVERVIEW', label: 'Overview & Metrics' },
          { id: 'DELAY_CHAIN', label: `Delay Chain (${segment.delayChain?.length || 0})` },
          { id: 'TIMELINE', label: `Timeline (${segment.timeline?.length || 0})` },
          { id: 'EVIDENCE', label: `Evidence (${segment.evidenceDocuments?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2.5 px-3 text-xs font-extrabold transition-all cursor-pointer border-b-2 ${
              activeTab === tab.id
                ? 'border-[#4F46E5] text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-[#0B132B]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-4">
            {/* Readiness Score & Progress */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F0F7FF] to-white border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#4F46E5] block">
                  Project Readiness Score
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-extrabold text-[#0B132B] font-mono">
                    {segment.readinessScore}
                  </span>
                  <span className="text-sm font-extrabold text-slate-500">/ 100</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {segment.readinessScore >= 80 ? '🟢 Viable for Immediate Construction' : segment.readinessScore >= 50 ? '🟡 Administrative Resolution Required' : '🔴 Critical Barrier to Progress'}
                </p>
              </div>

              {/* AR Waypoint Quick Trigger */}
              {segment.arWaypointCode && (
                <button
                  onClick={() => onOpenARVerification?.(segment.arWaypointCode!)}
                  className="px-3.5 py-2 rounded-xl bg-[#0B132B] text-white hover:bg-[#1E293B] transition-all flex items-center gap-2 cursor-pointer shadow-float text-xs font-extrabold group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#38BDF8] group-hover:rotate-12 transition-transform" />
                  <span>AR Spatial HUD</span>
                </button>
              )}
            </div>

            {/* Micro Demographics & Risk Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-transparent border border-slate-200">
                <span className="text-[10px] font-extrabold text-slate-500 block">Parcels</span>
                <span className="text-base font-extrabold text-[#0B132B] font-mono">{segment.affectedParcelsCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-transparent border border-slate-200">
                <span className="text-[10px] font-extrabold text-slate-500 block">Landholders</span>
                <span className="text-base font-extrabold text-[#0B132B] font-mono">{segment.affectedLandholdersCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200">
                <span className="text-[10px] font-extrabold text-rose-700 block">Objections</span>
                <span className="text-base font-extrabold text-rose-700 font-mono">{segment.recordedObjectionsCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200">
                <span className="text-[10px] font-extrabold text-purple-700 block">Court Stays</span>
                <span className="text-base font-extrabold text-purple-700 font-mono">{segment.pendingLitigationCount}</span>
              </div>
            </div>

            {/* Key Impediment Box */}
            <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Primary Impediment & Root Cause</span>
              </div>
              <p className="text-xs text-rose-900 leading-relaxed font-medium">
                {segment.keyImpediment}
              </p>
              {segment.courtCaseNo && (
                <div className="pt-1.5 flex items-center justify-between text-[11px] font-mono font-extrabold text-purple-800 border-t border-rose-200/60 mt-1">
                  <span>Case: {segment.courtCaseNo}</span>
                  <span className="text-rose-700">{segment.stayOrderActive ? '⚠️ Stay Active' : 'No Stay'}</span>
                </div>
              )}
            </div>

            {/* Compensation Summary */}
            <div className="p-4 rounded-xl bg-transparent border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-extrabold text-[#0B132B]">
                <span className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-indigo-600" /> Compensation & Solatium Disbursed
                </span>
                <span className="font-mono text-[#4F46E5]">
                  {((segment.disbursedCompensationINR / segment.totalCompensationINR) * 100).toFixed(0)}% Disbursed
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(segment.disbursedCompensationINR / (segment.totalCompensationINR || 1)) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span>Disbursed: ₹{(segment.disbursedCompensationINR / 10000000).toFixed(1)} Cr</span>
                <span>Total Entitled: ₹{(segment.totalCompensationINR / 10000000).toFixed(1)} Cr</span>
              </div>
            </div>

            {/* Actionable Administrative Fast-Track Interventions */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
              <h4 className="text-xs font-extrabold text-[#0B132B] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" /> Statutory Fast-Track Interventions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => handleAction(`Fast-Track CALA Sec 15(1) Special Hearing for ${segment.villageName}`)}
                  className="px-3 py-2 rounded-2xl bg-transparent hover:bg-indigo-50 border border-slate-200/80 text-left text-xs font-extrabold text-[#4F46E5] transition-all cursor-pointer flex items-center justify-between"
                >
                  <span>Fast-Track CALA Hearing</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleAction(`File Sec 30 Court Deposit Requisition for ${segment.villageName}`)}
                  className="px-3 py-2 rounded-2xl bg-[#FAF5FF] hover:bg-[#F3E8FF] border border-[#E9D5FF] text-left text-xs font-extrabold text-[#7E22CE] transition-all cursor-pointer flex items-center justify-between"
                >
                  <span>File Sec 30 Court Deposit</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleAction(`Authorize 25% Ex-Gratia Direct Consent Bonus for ${segment.villageName}`)}
                  className="px-3 py-2 rounded-2xl bg-[#EEF2FF] hover:bg-[#E0E7FF] border border-[#FFD8B5] text-left text-xs font-extrabold text-[#3730A3] transition-all cursor-pointer flex items-center justify-between"
                >
                  <span>Authorize Ex-Gratia Bonus</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleAction(`Dispatch DGPS / LiDAR Team for Re-Demarcation at ${segment.villageName}`)}
                  className="px-3 py-2 rounded-2xl bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] text-left text-xs font-extrabold text-[#047857] transition-all cursor-pointer flex items-center justify-between"
                >
                  <span>Dispatch DGPS Survey</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Delay Chain Visualization Flow */}
        {activeTab === 'DELAY_CHAIN' && (
          <div className="space-y-4">
            <div className="p-3 bg-transparent rounded-xl border border-slate-200/80 text-xs text-indigo-600 font-medium leading-relaxed">
              Step-by-step statutory causality chain linking preliminary alignment to final possession handover.
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {segment.delayChain?.map((step, idx) => {
                let dotColor = 'bg-emerald-500 ring-emerald-200';
                if (step.status === 'BLOCKED') dotColor = 'bg-rose-500 ring-rose-200 animate-pulse';
                if (step.status === 'IN_PROGRESS') dotColor = 'bg-amber-500 ring-amber-200';
                if (step.status === 'PENDING') dotColor = 'bg-slate-300 ring-slate-100';

                return (
                  <div key={idx} className="relative group">
                    {/* Pulsing Node */}
                    <div className={`absolute -left-6 top-1 w-3 h-3 rounded-full ${dotColor} ring-4`} />
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 group-hover:border-slate-200/80 shadow-xs space-y-1.5 transition-all">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-[#0B132B]">
                          Step {step.stepNumber}: {step.name}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          step.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          step.status === 'BLOCKED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          step.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {step.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#475569]">{step.details}</p>
                      {step.impedimentDetails && (
                        <div className="p-2 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium">
                          ⚠️ <strong>Blocker:</strong> {step.impedimentDetails}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span>Authority: <strong>{step.actor}</strong></span>
                        {step.statutoryDeadline && <span>Deadline: {step.statutoryDeadline}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Timeline */}
        {activeTab === 'TIMELINE' && (
          <div className="space-y-4">
            <div className="p-3 bg-transparent rounded-xl border border-slate-200/80 text-xs text-indigo-600 font-medium">
              Chronological log of official gazette orders, objections, hearings, and orders.
            </div>

            <div className="space-y-3">
              {segment.timeline?.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#0B132B]">{item.title}</span>
                    <span className="text-[10px] font-mono font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {item.date}
                    </span>
                  </div>
                  <p className="text-xs text-[#475569]">{item.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-[#4F46E5] font-extrabold pt-1">
                    <span>Issued By: {item.authority}</span>
                    <span className="uppercase text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-[#475569]">{item.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Evidence Documents */}
        {activeTab === 'EVIDENCE' && (
          <div className="space-y-3">
            <div className="p-3 bg-transparent rounded-xl border border-slate-200/80 text-xs text-indigo-600 font-medium">
              Geotagged site surveys, court affidavits, drone orthomosaics, and valuation orders.
            </div>

            {segment.evidenceDocuments?.map((doc, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-transparent text-[#4F46E5] border border-slate-200/80">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-[#0B132B]">{doc.title}</h5>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <span>{doc.date}</span>
                      <span>•</span>
                      <span>{doc.fileSize}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-extrabold">{doc.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAction(`Inspect document "${doc.title}"`)}
                    className="p-1.5 rounded-2xl hover:bg-slate-100 text-slate-500 hover:text-[#0B132B] cursor-pointer"
                    title="View Document"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAction(`Download artifact "${doc.title}"`)}
                    className="p-1.5 rounded-2xl hover:bg-slate-100 text-[#4F46E5] cursor-pointer"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
