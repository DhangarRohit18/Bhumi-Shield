import React from 'react';
import {
  FileText,
  AlertTriangle,
  Scale,
  Users,
  ShieldAlert,
  Coins,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Parcel, ParcelIntelligenceMetrics } from '../../../types';

interface ParcelPassportDrawerProps {
  parcel: Parcel | null;
  metrics: ParcelIntelligenceMetrics | null;
  onClose: () => void;
  onOpenDigitalTwin?: (parcelId: string) => void;
}

export const ParcelPassportDrawer: React.FC<ParcelPassportDrawerProps> = ({
  parcel,
  metrics,
  onClose,
  onOpenDigitalTwin,
}) => {
  if (!parcel || !metrics) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[2000] w-full max-w-md bg-white border-l border-[#E2E8F0] shadow-2xl flex flex-col font-sans text-[#0F172A]">
      {/* Header */}
      <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#BF7834] text-white shadow-sm">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#0F172A]">
              Digital Land Passport: Khasra #{metrics.khasraNo}
            </h3>
            <p className="text-[10px] text-[#64748B] font-mono">
              Parcel ID: {parcel.id} • Village: Manikpur
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-all cursor-pointer font-bold"
        >
          ✕
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Risk & Intelligence Status Banner */}
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            metrics.delayRiskLevel === 'CRITICAL'
              ? 'bg-[#FEF2F2] border-[#FECACA]'
              : metrics.delayRiskLevel === 'HIGH'
              ? 'bg-[#FFF7ED] border-[#FFEDD5]'
              : 'bg-[#ECFDF5] border-[#A7F3D0]'
          }`}
        >
          <AlertTriangle
            className={`w-5 h-5 shrink-0 mt-0.5 ${
              metrics.delayRiskLevel === 'CRITICAL'
                ? 'text-[#DC2626]'
                : metrics.delayRiskLevel === 'HIGH'
                ? 'text-[#EA580C]'
                : 'text-[#059669]'
            }`}
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#0F172A]">
                Delay Risk: {metrics.delayRiskScore}/100 ({metrics.delayRiskLevel})
              </span>
            </div>
            <p className="text-[11px] text-[#475569] font-medium leading-relaxed">
              <strong>Root Cause:</strong> {metrics.primaryRiskReason}
            </p>
          </div>
        </div>

        {/* 6 Key Statutory Intelligence Metrics */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] text-[#64748B] flex items-center gap-1 font-semibold">
              <Coins className="w-3.5 h-3.5 text-[#BF7834]" /> Total Award
            </span>
            <p className="text-sm font-black text-[#0F172A] mt-0.5 font-mono">
              ₹{(metrics.compensationBurdenINR / 100000).toFixed(1)} L
            </p>
            <p className="text-[9px] text-[#64748B]">100% Solatium Applied</p>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] text-[#64748B] flex items-center gap-1 font-semibold">
              <Scale className="w-3.5 h-3.5 text-[#D97706]" /> Litigation
            </span>
            <p className="text-sm font-black text-[#0F172A] mt-0.5">
              {metrics.hasActiveLitigation ? 'Active Stay' : 'No Disputes'}
            </p>
            <p className="text-[9px] text-[#64748B]">
              {metrics.litigationCaseNo || 'Clear Title'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] text-[#64748B] flex items-center gap-1 font-semibold">
              <Users className="w-3.5 h-3.5 text-[#2563EB]" /> PAF Beneficiaries
            </span>
            <p className="text-sm font-black text-[#0F172A] mt-0.5 font-mono">
              {metrics.affectedFamiliesCount} Families
            </p>
            <p className="text-[9px] text-[#64748B]">
              {metrics.pendingRRCount > 0 ? `${metrics.pendingRRCount} Pending R&R` : 'R&R Clear'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] text-[#64748B] flex items-center gap-1 font-semibold">
              <FileText className="w-3.5 h-3.5 text-[#059669]" /> Compliance
            </span>
            <p className="text-sm font-black text-[#059669] mt-0.5 font-mono">
              {metrics.documentCompletenessPct}% Complete
            </p>
            <p className="text-[9px] text-[#64748B]">Sec 11/19 & SIA Uploaded</p>
          </div>
        </div>

        {/* Recommended Intervention Action */}
        <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#92400E] font-extrabold text-[11px]">
            <ShieldAlert className="w-4 h-4 text-[#D97706]" />
            <span>Recommended CALA / SLA Directive</span>
          </div>
          <p className="text-xs text-[#78350F] font-medium leading-relaxed">
            {metrics.recommendedAction}
          </p>
        </div>

        {/* Ownership & Physical Survey Breakdown */}
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
          <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-[#64748B]">
            Cadastral Properties & Spatial Identity
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Canonical ULPIN:</span>
              <strong className="text-[#EA580C] font-mono text-[11px]">{parcel.ulpin || `ULPIN-MH-${parcel.khasraSurveyNo?.replace(/[^a-zA-Z0-9]/g, '')}-2026`}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Area:</span>
              <strong className="text-[#0F172A]">{parcel.areaAcres} Acres</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Classification:</span>
              <strong className="text-[#0F172A]">{parcel.landClassification}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Statutory Stage:</span>
              <span className="font-mono font-bold text-[#EA580C]">{parcel.status}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">DGPS Pillar QR:</span>
              <span className="font-mono text-[11px] text-[#0F172A]">{parcel.qrAssetId || 'QR-PIL-MH-0921'}</span>
            </div>
            {parcel.environmentalConflict && parcel.environmentalConflict.conflictType !== 'NONE' && (
              <div className="flex justify-between py-1 border-b border-[#FECACA] bg-[#FEF2F2] px-1.5 rounded">
                <span className="text-[#DC2626] font-bold">Forest/CRZ Conflict:</span>
                <span className="font-mono font-extrabold text-[#DC2626]">{parcel.environmentalConflict.conflictType} ({parcel.environmentalConflict.clearanceStatus})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Link to Digital Twin */}
      {onOpenDigitalTwin && (
        <div className="p-4 bg-white border-t border-[#E2E8F0]">
          <button
            onClick={() => onOpenDigitalTwin(parcel.id || '')}
            className="w-full py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <span>Open in Full Digital Twin</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
