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
    <div className="fixed inset-y-0 right-0 z-[2000] w-full max-w-md bg-white border-l border-[#E2E8F0] shadow-2xl flex flex-col  text-[#0B132B]">
      {/* Header */}
      <div className="p-4 bg-transparent border-b border-[#E2E8F0] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#BF7834] text-white shadow-soft">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#0B132B]">
              Digital Land Passport: Khasra #{metrics.khasraNo}
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">
              Parcel ID: {parcel.id} • Village: Manikpur
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-2xl text-slate-500 hover:text-[#0B132B] hover:bg-[#E2E8F0] transition-all cursor-pointer font-extrabold"
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
              ? 'bg-[#EEF2FF] border-[#E0E7FF]'
              : 'bg-[#ECFDF5] border-[#A7F3D0]'
          }`}
        >
          <AlertTriangle
            className={`w-5 h-5 shrink-0 mt-0.5 ${
              metrics.delayRiskLevel === 'CRITICAL'
                ? 'text-[#DC2626]'
                : metrics.delayRiskLevel === 'HIGH'
                ? 'text-indigo-600'
                : 'text-[#059669]'
            }`}
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#0B132B]">
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
          <div className="p-3 rounded-xl bg-transparent border border-[#E2E8F0]">
            <span className="text-[10px] text-slate-500 flex items-center gap-1 font-extrabold">
              <Coins className="w-3.5 h-3.5 text-[#BF7834]" /> Total Award
            </span>
            <p className="text-sm font-extrabold text-[#0B132B] mt-0.5 font-mono">
              ₹{(metrics.compensationBurdenINR / 100000).toFixed(1)} L
            </p>
            <p className="text-[9px] text-slate-500">100% Solatium Applied</p>
          </div>

          <div className="p-3 rounded-xl bg-transparent border border-[#E2E8F0]">
            <span className="text-[10px] text-slate-500 flex items-center gap-1 font-extrabold">
              <Scale className="w-3.5 h-3.5 text-[#D97706]" /> Litigation
            </span>
            <p className="text-sm font-extrabold text-[#0B132B] mt-0.5">
              {metrics.hasActiveLitigation ? 'Active Stay' : 'No Disputes'}
            </p>
            <p className="text-[9px] text-slate-500">
              {metrics.litigationCaseNo || 'Clear Title'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-transparent border border-[#E2E8F0]">
            <span className="text-[10px] text-slate-500 flex items-center gap-1 font-extrabold">
              <Users className="w-3.5 h-3.5 text-[#2563EB]" /> PAF Beneficiaries
            </span>
            <p className="text-sm font-extrabold text-[#0B132B] mt-0.5 font-mono">
              {metrics.affectedFamiliesCount} Families
            </p>
            <p className="text-[9px] text-slate-500">
              {metrics.pendingRRCount > 0 ? `${metrics.pendingRRCount} Pending R&R` : 'R&R Clear'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-transparent border border-[#E2E8F0]">
            <span className="text-[10px] text-slate-500 flex items-center gap-1 font-extrabold">
              <FileText className="w-3.5 h-3.5 text-[#059669]" /> Compliance
            </span>
            <p className="text-sm font-extrabold text-[#059669] mt-0.5 font-mono">
              {metrics.documentCompletenessPct}% Complete
            </p>
            <p className="text-[9px] text-slate-500">Sec 11/19 & SIA Uploaded</p>
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

        {/* Dynamic Digital Passport QR Code for Google Lens */}
        <div className="p-4 rounded-xl border border-indigo-100 bg-gradient-to-tr from-white to-indigo-50 shadow-sm flex flex-col items-center text-center space-y-3">
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-[#0B132B]">Real-Time Digital Passport</h4>
            <p className="text-[10px] text-slate-500 font-medium">
              Scan this QR with Google Lens or any scanner to view live beneficiary & compensation details instantly.
            </p>
          </div>
          <div className="p-2 bg-white rounded-xl shadow-soft border border-slate-200 inline-block">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(window.location.origin + '/passport/' + parcel.id)}`} 
              alt="Digital Passport QR Code"
              className="w-32 h-32"
              loading="lazy"
            />
          </div>
          <div className="pt-1 flex items-center justify-center gap-1 text-[9px] font-extrabold uppercase text-indigo-600 tracking-wider">
            <CheckCircle2 className="w-3 h-3" /> Encrypted Public Gateway
          </div>
        </div>

        {/* Ownership & Physical Survey Breakdown */}
        <div className="p-3.5 rounded-xl bg-transparent border border-[#E2E8F0] space-y-2">
          <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500">
            Cadastral Properties & Spatial Identity
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-slate-500">Canonical ULPIN:</span>
              <strong className="text-indigo-600 font-mono text-[11px]">{parcel.ulpin || `ULPIN-MH-${parcel.khasraSurveyNo?.replace(/[^a-zA-Z0-9]/g, '')}-2026`}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-slate-500">Area:</span>
              <strong className="text-[#0B132B]">{parcel.areaAcres} Acres</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-slate-500">Classification:</span>
              <strong className="text-[#0B132B]">{parcel.landClassification}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-slate-500">Statutory Stage:</span>
              <span className="font-mono font-extrabold text-indigo-600">{parcel.status}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-slate-500">DGPS Pillar QR:</span>
              <span className="font-mono text-[11px] text-[#0B132B]">{parcel.qrAssetId || 'QR-PIL-MH-0921'}</span>
            </div>
            {parcel.environmentalConflict && parcel.environmentalConflict.conflictType !== 'NONE' && (
              <div className="flex justify-between py-1 border-b border-[#FECACA] bg-[#FEF2F2] px-1.5 rounded">
                <span className="text-[#DC2626] font-extrabold">Forest/CRZ Conflict:</span>
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
            className="w-full py-2.5 bg-[#0B132B] hover:bg-[#1E293B] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-soft transition-all cursor-pointer"
          >
            <span>Open in Full Digital Twin</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
