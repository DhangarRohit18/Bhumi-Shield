import React from 'react';
import { FarmerRecord } from '../../types';
import { farmerService } from '../../services/entities.service';
import {
  X,
  MapPin,
  FileText,
  Users,
  CreditCard,
  QrCode,
  Compass,
  Map as MapIcon,
  History,
  Coins,
  Calendar,
  Landmark,
  ShieldCheck,
  CheckCircle2,
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
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl border-l border-slate-200/80 flex flex-col  animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-[#F0FDF4] via-[#F8FAFC] to-[#EEF2FF] border-b border-[#E2E8F0] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#059669] text-white flex items-center justify-center font-extrabold shadow-soft text-base">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-[#0B132B]">{farmer.farmerName}</h3>
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
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3 text-indigo-600" />
              <span>
                {farmer.village}, {farmer.talukaTehsil}, {farmer.district} ({farmer.state})
              </span>
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-2xl text-slate-500 hover:text-[#0B132B] hover:bg-[#F1F5F9] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Quick Statutory Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-transparent border border-[#E2E8F0]">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total Holding</span>
            <p className="text-base font-extrabold text-[#0B132B] mt-0.5">{farmer.totalLandAreaAcres} Ac</p>
            <p className="text-[10px] text-[#059669] font-medium">Acquired: {farmer.acquiredAreaAcres} Ac</p>
          </div>

          <div className="p-3 rounded-xl bg-transparent border border-[#E2E8F0]">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total Award</span>
            <p className="text-base font-extrabold text-indigo-600 mt-0.5">
              ₹{(farmer.totalCompensationINR / 100000).toFixed(1)} L
            </p>
            <p className="text-[10px] text-slate-500">100% Solatium Incl.</p>
          </div>

          <div className="p-3 rounded-xl bg-transparent border border-[#E2E8F0]">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">PFMS Credit</span>
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                farmer.disbursementStatus === 'DISBURSED'
                  ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                  : farmer.disbursementStatus === 'UNDER_DISPUTE'
                  ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                  : 'bg-[#EEF2FF] text-indigo-600 border-[#E0E7FF]'
              }`}
            >
              {farmer.disbursementStatus}
            </span>
            <p className="text-[9px] text-slate-500 mt-0.5 font-mono">{farmer.bankDetails.accountMasked}</p>
          </div>
        </div>

        {/* Digital Passport QR Code & Field Verification Section */}
        <div className="p-4 rounded-xl border border-indigo-100 bg-gradient-to-tr from-white to-indigo-50/60 shadow-soft space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#0B132B] flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-[#4F46E5]" />
                <span>Real-Time Digital Passport QR</span>
              </h4>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                Scan with Google Lens or camera to verify landholder credentials instantly.
              </p>
            </div>
            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Gateway
            </span>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <div className="p-2 bg-white rounded-xl shadow-soft border border-slate-200 shrink-0">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(window.location.origin + '/passport/' + (farmer.parcelId || farmer.id))}`}
                alt="Farmer Passport QR Code"
                className="w-24 h-24"
              />
            </div>
            
            {/* Field Acquisition Ground Evidence Upload */}
            <div className="flex-1 space-y-2">
              <div className="p-2.5 rounded-xl bg-white border border-indigo-100 text-xs space-y-1.5">
                <p className="font-extrabold text-[#0B132B] text-[11px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Field Verification Evidence</span>
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Field Officers: Upload ground photo verification of site visit & boundary demarcation.
                </p>
                
                {farmer.verificationPhotoUrl ? (
                  <div className="pt-1 flex items-center gap-2">
                    <img src={farmer.verificationPhotoUrl} alt="Uploaded Evidence" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                    <div>
                      <span className="text-[10px] font-extrabold text-emerald-700 block">✓ Photo Evidence Synced</span>
                      <span className="text-[9px] text-slate-400 font-mono">Geotag Lock Confirmed</span>
                    </div>
                  </div>
                ) : (
                  <label className="mt-1 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] cursor-pointer shadow-xs transition-all">
                    <span>📷 Upload Site Evidence Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            if (result) {
                              farmer.verificationPhotoUrl = result;
                              farmer.arVerificationStatus = 'VERIFIED';
                              farmerService.update(farmer.id, {
                                verificationPhotoUrl: result,
                                arVerificationStatus: 'VERIFIED'
                              }).catch(err => console.error(err));
                              alert('✅ Ground evidence photo successfully uploaded & verified for Khasra #' + farmer.surveyGatNumber);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 7/12 & Khatauni Land Record Card */}
        <div className="p-4 rounded-xl bg-transparent border border-[#E2E8F0] space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#0B132B] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#4F46E5]" />
              <span>Official 7/12 & Khatauni Land Record</span>
            </h4>
            <span className="font-mono text-[10px] font-extrabold text-indigo-600 bg-[#EEF2FF] px-2 py-0.5 rounded border border-[#E0E7FF]">
              {farmer.ulpin}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-slate-500">Survey / Gat No:</span>
              <strong className="text-[#0B132B] font-mono">{farmer.surveyGatNumber}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-slate-500">Hissa Number:</span>
              <strong className="text-[#0B132B] font-mono">{farmer.hissaNumber}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-slate-500">Khata Number:</span>
              <strong className="text-[#0B132B] font-mono">{farmer.khataNumber}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-slate-500">Classification:</span>
              <strong className="text-[#0B132B]">{farmer.landClassification}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-slate-500">Soil Type:</span>
              <span className="text-[#0B132B] font-medium">{farmer.soilType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
              <span className="text-slate-500">Tenure Class:</span>
              <span className="text-[#0B132B] font-medium text-[11px]">{farmer.tenureType}</span>
            </div>
          </div>
        </div>

        {/* Joint Holders & Title Breakdown */}
        <div className="p-4 rounded-xl bg-transparent border border-[#E2E8F0] space-y-2">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#0B132B] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Joint Title Holders & Successors ({farmer.jointHolders.length})</span>
          </h4>
          <div className="space-y-1.5 pt-1">
            {farmer.jointHolders.map((holder, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-2xl bg-white border border-[#E2E8F0] text-xs"
              >
                <div>
                  <p className="font-extrabold text-[#0B132B]">{holder.name}</p>
                  <p className="text-[10px] text-slate-500">Relation: {holder.relation}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#F1F5F9] text-[#0B132B] font-mono font-extrabold text-[11px]">
                  Share: {holder.shareFraction}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Valuation & Bank PFMS Gateway */}
        <div className="p-4 rounded-xl bg-transparent border border-[#E2E8F0] space-y-2.5">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#0B132B] flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-[#059669]" />
            <span>Direct PFMS Bank Entitlement</span>
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-white rounded-2xl border border-[#E2E8F0]">
              <p className="text-[10px] text-slate-500">Base Valuation</p>
              <p className="font-mono font-extrabold text-[#0B132B]">₹{farmer.estimatedValuationINR.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-2 bg-white rounded-2xl border border-[#E2E8F0]">
              <p className="text-[10px] text-slate-500">Sec 30 Solatium (100%)</p>
              <p className="font-mono font-extrabold text-[#059669]">₹{farmer.solatiumINR.toLocaleString('en-IN')}</p>
            </div>
            <div className="col-span-2 p-2.5 bg-[#ECFDF5] rounded-2xl border border-[#A7F3D0] flex justify-between items-center">
              <div>
                <p className="text-[10px] font-extrabold text-[#065F46]">Disbursal Bank</p>
                <p className="font-extrabold text-[#064E3B] text-xs">{farmer.bankDetails.bankName}</p>
                <p className="font-mono text-[10px] text-[#047857]">
                  A/C: {farmer.bankDetails.accountMasked} • IFSC: {farmer.bankDetails.ifsc}
                </p>
              </div>
              <span className="font-extrabold text-sm text-[#047857] font-mono">
                ₹{farmer.totalCompensationINR.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Comprehensive Land Ownership & Buy/Sell Transaction History */}
        <div className="p-4 rounded-xl bg-transparent border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#0B132B] flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#4F46E5]" />
              <span>Chain of Title & Transaction History (Buy / Sell / Inheritance)</span>
            </h4>
            <span className="text-[10px] font-extrabold text-[#4F46E5] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
              {farmer.landOwnershipHistory?.length || 0} Deed Records
            </span>
          </div>

          {/* Historical Timeline */}
          <div className="space-y-2.5">
            {farmer.landOwnershipHistory && farmer.landOwnershipHistory.length > 0 ? (
              farmer.landOwnershipHistory.map((rec, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#4F46E5] flex items-center justify-center font-extrabold text-[10px] border border-[#BFDBFE]">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-extrabold text-xs text-[#0B132B]">{rec.ownerName}</p>
                        <p className="text-[10px] text-slate-500">
                          Tenure: <span className="font-medium text-[#0B132B]">{rec.periodFrom} – {rec.periodTo}</span> ({rec.relationType})
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                        rec.transactionType === 'SALE_DEED'
                          ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                          : rec.transactionType === 'SUCCESSION_WARIS'
                          ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                          : rec.transactionType === 'ACQUISITION_NOTIFIED'
                          ? 'bg-[#EEF2FF] text-indigo-600 border-[#E0E7FF]'
                          : 'bg-transparent text-[#475569] border-[#CBD5E1]'
                      }`}
                    >
                      {rec.transactionType.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-[#F1F5F9]">
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Coins className="w-3 h-3 text-indigo-600" /> Transaction Price:
                      </span>
                      <span className="font-extrabold text-[#0B132B] font-mono">
                        {rec.considerationAmountINR !== undefined
                          ? `₹${rec.considerationAmountINR.toLocaleString('en-IN')}`
                          : 'Succession (₹0)'}
                      </span>
                    </div>

                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#4F46E5]" /> Mutation Date:
                      </span>
                      <span className="font-extrabold text-[#0B132B]">{rec.mutationApprovalDate}</span>
                    </div>

                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">Area Transferred:</span>
                      <span className="font-mono font-extrabold text-[#0B132B]">{rec.areaTransferredAcres} Acres</span>
                    </div>

                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">Mutation / Ferfar No:</span>
                      <span className="font-mono font-extrabold text-[#059669]">Ferfar #{rec.mutationEntryNo}</span>
                    </div>

                    <div className="col-span-2 flex justify-between py-0.5 text-[10px] bg-transparent p-1.5 rounded border border-[#E2E8F0]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Landmark className="w-3 h-3 text-slate-500" /> Sub-Registrar / SRO:
                      </span>
                      <span className="font-medium text-[#0B132B]">{rec.subRegistrarOffice} (Deed Reg #{rec.deedRegistrationNo})</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 bg-white rounded-2xl border border-[#E2E8F0] text-center text-xs text-slate-500">
                No historical deeds recorded.
              </div>
            )}
          </div>
        </div>

        {/* Encumbrance & Bank Loan Charge Status (Form 15/16) */}
        <div className="p-4 rounded-xl bg-transparent border border-[#E2E8F0] space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#0B132B] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
              <span>Encumbrance & Land Charge Certificate (Nil / Active Mortgages)</span>
            </h4>
          </div>

          {farmer.encumbrances && farmer.encumbrances.length > 0 ? (
            <div className="space-y-1.5">
              {farmer.encumbrances.map((enc, idx) => (
                <div key={idx} className="p-2.5 bg-white rounded-2xl border border-[#E2E8F0] flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-[#0B132B]">{enc.institutionName}</p>
                      <span
                        className={`px-2 py-0.2 rounded-full text-[9px] font-extrabold ${
                          enc.status === 'NOC_ISSUED' || enc.status === 'DISCHARGED'
                            ? 'bg-[#ECFDF5] text-[#059669]'
                            : 'bg-[#FEF2F2] text-[#DC2626]'
                        }`}
                      >
                        {enc.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Type: {enc.loanType.replace(/_/g, ' ')} • Charge Date: {enc.chargeDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-extrabold text-[#0B132B]">
                      {enc.chargeAmountINR > 0 ? `₹${enc.chargeAmountINR.toLocaleString('en-IN')}` : '₹0 (Nil Charge)'}
                    </p>
                    {enc.nocCertificateNo && (
                      <span className="text-[9px] text-[#059669] font-mono">NOC: {enc.nocCertificateNo}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2.5 bg-[#ECFDF5] rounded-2xl border border-[#A7F3D0] flex items-center gap-2 text-xs text-[#065F46]">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              <span className="font-extrabold">Zero Encumbrance / Clean Freehold Title (No Outstanding Institutional Liens)</span>
            </div>
          )}
        </div>

        {/* DGPS Ground Demarcation Pillars */}
        <div className="p-4 rounded-xl bg-transparent border border-[#E2E8F0] space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#0B132B] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span>DGPS Boundary Corner Pillars ({farmer.dgpsPillars.length})</span>
            </h4>
            <span className="text-[10px] font-mono text-[#4F46E5] font-extrabold flex items-center gap-1">
              <QrCode className="w-3 h-3" /> {farmer.qrPasscode}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            {farmer.dgpsPillars.map((pillar) => (
              <div
                key={pillar.pillarId}
                className="p-2 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-between"
              >
                <div>
                  <span className="font-mono font-extrabold text-[#0B132B] text-[11px]">{pillar.pillarId}</span>
                  <p className="text-[9px] text-slate-500 font-mono">
                    {pillar.lat.toFixed(4)}, {pillar.lng.toFixed(4)}
                  </p>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] font-mono font-extrabold">
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
          className="w-full py-2.5 rounded-xl bg-brand-gradient hover:bg-[#3730A3] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-soft transition-all cursor-pointer"
        >
          <MapIcon className="w-4 h-4" />
          <span>Visualise Cadastral Land & AR Demarcation</span>
        </button>
      </div>
    </div>
  );
};
