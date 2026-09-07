import React from 'react';
import { FarmerRecord } from '../../types';
import {
  X,
  MapPin,
  FileText,
  Users,
  CreditCard,
  QrCode,
  Compass,
  Map as MapIcon,
} from 'lucide-react';

interface FarmerDetailsDrawerProps {
  farmer: FarmerRecord;
  onClose: () => void;
  onVisualiseLand: (farmer: FarmerRecord) => void;
}

export const FarmerDetailsDrawer: React.FC<FarmerDetailsDrawerProps> = ({
  farmer,
  onClose,
  onVisualiseLand,
}) => {
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl border-l border-[#BAE6FD] flex flex-col font-sans animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-[#F0FDF4] via-[#F8FAFC] to-[#FFF7ED] border-b border-[#E2E8F0] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#059669] text-white flex items-center justify-center font-black shadow-sm text-base">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-[#0F172A]">{farmer.farmerName}</h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                  farmer.arVerificationStatus === 'VERIFIED'
                    ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                    : farmer.arVerificationStatus === 'FLAGGED_MISMATCH'
                    ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                    : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                }`}
              >
                {farmer.arVerificationStatus === 'VERIFIED'
                  ? '✓ AR Ground Verified'
                  : farmer.arVerificationStatus === 'FLAGGED_MISMATCH'
                  ? '⚠ Discrepancy Flagged'
                  : '⏳ Visit Scheduled'}
              </span>
            </div>
            <p className="text-xs text-[#64748B] flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3 text-[#EA580C]" />
              <span>
                {farmer.village}, {farmer.talukaTehsil}, {farmer.district} ({farmer.state})
              </span>
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Quick Statutory Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Total Holding</span>
            <p className="text-base font-black text-[#0F172A] mt-0.5">{farmer.totalLandAreaAcres} Ac</p>
            <p className="text-[10px] text-[#059669] font-medium">Acquired: {farmer.acquiredAreaAcres} Ac</p>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Total Award</span>
            <p className="text-base font-black text-[#EA580C] mt-0.5">
              ₹{(farmer.totalCompensationINR / 100000).toFixed(1)} L
            </p>
            <p className="text-[10px] text-[#64748B]">100% Solatium Incl.</p>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">PFMS Credit</span>
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                farmer.disbursementStatus === 'DISBURSED'
                  ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                  : farmer.disbursementStatus === 'UNDER_DISPUTE'
                  ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                  : 'bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]'
              }`}
            >
              {farmer.disbursementStatus}
            </span>
            <p className="text-[9px] text-[#64748B] mt-0.5 font-mono">{farmer.bankDetails.accountMasked}</p>
          </div>
        </div>

        {/* 7/12 & Khatauni Land Record Card */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>Official 7/12 & Khatauni Land Record</span>
            </h4>
            <span className="font-mono text-[10px] font-black text-[#EA580C] bg-[#FFF7ED] px-2 py-0.5 rounded border border-[#FFEDD5]">
              {farmer.ulpin}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Survey / Gat No:</span>
              <strong className="text-[#0F172A] font-mono">{farmer.surveyGatNumber}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Hissa Number:</span>
              <strong className="text-[#0F172A] font-mono">{farmer.hissaNumber}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Khata Number:</span>
              <strong className="text-[#0F172A] font-mono">{farmer.khataNumber}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Classification:</span>
              <strong className="text-[#0F172A]">{farmer.landClassification}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Soil Type:</span>
              <span className="text-[#0F172A] font-medium">{farmer.soilType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Tenure Class:</span>
              <span className="text-[#0F172A] font-medium text-[11px]">{farmer.tenureType}</span>
            </div>
          </div>
        </div>

        {/* Joint Holders & Title Breakdown */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Joint Title Holders & Successors ({farmer.jointHolders.length})</span>
          </h4>
          <div className="space-y-1.5 pt-1">
            {farmer.jointHolders.map((holder, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E2E8F0] text-xs"
              >
                <div>
                  <p className="font-bold text-[#0F172A]">{holder.name}</p>
                  <p className="text-[10px] text-[#64748B]">Relation: {holder.relation}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#F1F5F9] text-[#0F172A] font-mono font-extrabold text-[11px]">
                  Share: {holder.shareFraction}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Valuation & Bank PFMS Gateway */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-[#059669]" />
            <span>Direct PFMS Bank Entitlement</span>
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-white rounded-lg border border-[#E2E8F0]">
              <p className="text-[10px] text-[#64748B]">Base Valuation</p>
              <p className="font-mono font-bold text-[#0F172A]">₹{farmer.estimatedValuationINR.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-2 bg-white rounded-lg border border-[#E2E8F0]">
              <p className="text-[10px] text-[#64748B]">Sec 30 Solatium (100%)</p>
              <p className="font-mono font-bold text-[#059669]">₹{farmer.solatiumINR.toLocaleString('en-IN')}</p>
            </div>
            <div className="col-span-2 p-2.5 bg-[#ECFDF5] rounded-lg border border-[#A7F3D0] flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-[#065F46]">Disbursal Bank</p>
                <p className="font-extrabold text-[#064E3B] text-xs">{farmer.bankDetails.bankName}</p>
                <p className="font-mono text-[10px] text-[#047857]">
                  A/C: {farmer.bankDetails.accountMasked} • IFSC: {farmer.bankDetails.ifsc}
                </p>
              </div>
              <span className="font-black text-sm text-[#047857] font-mono">
                ₹{farmer.totalCompensationINR.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* DGPS Ground Demarcation Pillars */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>DGPS Boundary Corner Pillars ({farmer.dgpsPillars.length})</span>
            </h4>
            <span className="text-[10px] font-mono text-[#0284C7] font-bold flex items-center gap-1">
              <QrCode className="w-3 h-3" /> {farmer.qrPasscode}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            {farmer.dgpsPillars.map((pillar) => (
              <div
                key={pillar.pillarId}
                className="p-2 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-between"
              >
                <div>
                  <span className="font-mono font-bold text-[#0F172A] text-[11px]">{pillar.pillarId}</span>
                  <p className="text-[9px] text-[#64748B] font-mono">
                    {pillar.lat.toFixed(4)}, {pillar.lng.toFixed(4)}
                  </p>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] font-mono font-bold">
                  ±{pillar.rtkAccuracyCm} cm
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Action to Visualise Land */}
      <div className="p-4 bg-white border-t border-[#E2E8F0]">
        <button
          onClick={() => onVisualiseLand(farmer)}
          className="w-full py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <MapIcon className="w-4 h-4" />
          <span>Visualise Cadastral Land & AR Demarcation</span>
        </button>
      </div>
    </div>
  );
};
