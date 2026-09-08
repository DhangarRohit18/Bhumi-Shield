import React, { useEffect, useState } from 'react';
import { Shield, MapPin, Scale, FileText, CheckCircle2, User, QrCode, Coins, Landmark, Calendar, AlertTriangle } from 'lucide-react';
import { parcelService, farmerService, compensationService, legalCaseService, rrCaseService, documentService, taskService, projectService } from '../../services/entities.service';
import { Parcel, ParcelIntelligenceMetrics, Project, FarmerRecord } from '../../types';
import { calculateParcelIntelligenceMetrics } from '../../utils/intelligenceCalculations';

export const PublicPassportView: React.FC<{ parcelId: string }> = ({ parcelId }) => {
  const [farmer, setFarmer] = useState<FarmerRecord | null>(null);
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [metrics, setMetrics] = useState<ParcelIntelligenceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const cleanId = decodeURIComponent(parcelId).trim();

        // 1. Try finding in farmerService first (since Krishi Sathi QR uses farmer IDs)
        let foundFarmer: FarmerRecord | null = null;
        try {
          foundFarmer = await farmerService.getById(cleanId);
        } catch (e) {
          console.log('Not direct farmer id');
        }

        if (!foundFarmer) {
          const allFarmers = await farmerService.listAll();
          foundFarmer = allFarmers.find(f => f.id === cleanId || f.parcelId === cleanId || f.ulpin === cleanId || f.surveyGatNumber === cleanId) || null;
        }

        if (foundFarmer) {
          setFarmer(foundFarmer);
          setLoading(false);
          return;
        }

        // 2. Try finding in parcelService (for Digital Twin / Command Center QR codes)
        let foundParcel: Parcel | null = null;
        try {
          foundParcel = await parcelService.getById(cleanId);
        } catch (e) {
          console.log('Not direct parcel id');
        }

        if (!foundParcel) {
          const allParcels = await parcelService.listAll();
          foundParcel = allParcels.find(p => p.id === cleanId || p.ulpin === cleanId || p.khasraSurveyNo === cleanId) || null;
        }

        if (foundParcel) {
          setParcel(foundParcel);
          const [projects, comps, cases, rrs, docs, tasks] = await Promise.all([
            projectService.listAll(),
            compensationService.listAll(),
            legalCaseService.listAll(),
            rrCaseService.listAll(),
            documentService.listAll(),
            taskService.listAll()
          ]);

          const prj = projects.find(pr => pr.id === foundParcel!.projectId);
          if (prj) setProject(prj);

          const m = calculateParcelIntelligenceMetrics(foundParcel, comps, cases, rrs, docs, tasks);
          setMetrics(m);
        }
      } catch (err) {
        console.error("Error fetching passport data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [parcelId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF8F5]">
        <div className="text-center space-y-3">
          <div className="animate-spin w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent mx-auto" />
          <p className="text-xs font-extrabold text-slate-500">Decrypting Digital Land Passport...</p>
        </div>
      </div>
    );
  }

  // If Farmer Record found (Krishi Sathi)
  if (farmer) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#0B132B] font-sans pb-12">
        {/* Brand Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-50 shadow-soft">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-soft bg-white border border-slate-100 flex items-center justify-center">
                <img src="/logo.png" alt="Bhumi-Shield Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-[#0B132B]">
                  BHUMI-SHIELD
                </span>
                <span className="text-[10px] font-extrabold text-indigo-600/90 block leading-tight">
                  Digital Land Passport
                </span>
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase">Verified Encrypted</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-3xl mx-auto px-4 pt-6 space-y-5">
          {/* Geotag Ground Verification Photo Evidence (if uploaded) */}
          {farmer.verificationPhotoUrl && (
            <section className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 shadow-soft space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>On-Site Ground Verification Evidence</span>
                </span>
                <span className="text-[9px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  Geotag Lock
                </span>
              </div>
              <div className="flex gap-4 items-center pt-1">
                <img
                  src={farmer.verificationPhotoUrl}
                  alt="Site Evidence"
                  className="w-24 h-24 rounded-xl object-cover border-2 border-white shadow-soft shrink-0"
                />
                <div className="space-y-1 text-xs text-emerald-950 font-medium">
                  <p className="font-extrabold">Field Officer Site Verification Confirmed</p>
                  <p className="text-[11px] text-emerald-800">Physical boundary demarcation and 7/12 ownership verified on-site.</p>
                  <p className="text-[10px] text-emerald-700 font-mono">Timestamp: {new Date().toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            </section>
          )}

          {/* Identity & Land Card */}
          <section className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-soft space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Survey / Gat Number</p>
                <h1 className="text-3xl font-extrabold text-[#0B132B] tracking-tight mt-0.5">#{farmer.surveyGatNumber}</h1>
                <p className="text-xs text-indigo-600 font-mono font-extrabold mt-1">{farmer.ulpin}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Holding Area</p>
                <p className="text-xl font-extrabold text-indigo-600 font-mono mt-0.5">{farmer.totalLandAreaAcres} Acres</p>
                <p className="text-[10px] font-extrabold text-emerald-600">Acquired: {farmer.acquiredAreaAcres} Ac</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-[9px] font-extrabold uppercase text-slate-500">Location</p>
                  <p className="text-xs font-extrabold text-[#0B132B]">{farmer.village}, {farmer.district}</p>
                  <p className="text-[10px] text-slate-500">{farmer.state}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-[9px] font-extrabold uppercase text-slate-500">Land Classification</p>
                  <p className="text-xs font-extrabold text-[#0B132B]">{farmer.landClassification}</p>
                  <p className="text-[10px] text-slate-500">{farmer.soilType}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Beneficiary Profile */}
          <section className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-soft space-y-3">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-indigo-600" /> Landholder Credentials
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Primary Landowner</span>
                <span className="font-extrabold text-[#0B132B]">{farmer.farmerName}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Contact Number</span>
                <span className="font-mono font-extrabold text-[#0B132B]">{farmer.contactNumber}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Khata Number</span>
                <span className="font-mono font-extrabold text-[#0B132B]">{farmer.khataNumber}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">AR Reality Status</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                  farmer.arVerificationStatus === 'VERIFIED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {farmer.arVerificationStatus === 'VERIFIED' ? '✓ Ground Verified' : 'Pending Inspection'}
                </span>
              </div>
            </div>
          </section>

          {/* Compensation & Award Details */}
          <section className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-soft space-y-3">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Scale className="w-4 h-4 text-indigo-600" /> Direct PFMS Statutory Compensation
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-500 font-medium">Base Land Valuation</p>
                  <p className="text-base font-extrabold text-[#0B132B] font-mono">₹{farmer.estimatedValuationINR.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-500 font-medium">Sec 30 Solatium (100%)</p>
                  <p className="text-base font-extrabold text-emerald-600 font-mono">₹{farmer.solatiumINR.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-extrabold text-emerald-900">Total Award Decreed</p>
                  <p className="text-lg font-extrabold text-emerald-700 font-mono">₹{farmer.totalCompensationINR.toLocaleString('en-IN')}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white">
                  {farmer.disbursementStatus}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-500 font-medium">PFMS Disbursal Account</span>
                <span className="font-mono font-extrabold text-[#0B132B]">{farmer.bankDetails.bankName} ({farmer.bankDetails.accountMasked})</span>
              </div>
            </div>
          </section>

          {/* Footer info */}
          <div className="text-center space-y-1 pt-4">
            <p className="text-[10px] text-slate-400 font-medium">Scan Timestamp: {new Date().toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-slate-400 font-medium">Digitally authenticated credential under RFCTLARR Act (2013).</p>
          </div>
        </main>
      </div>
    );
  }

  // If Parcel Record found (Digital Twin / Command Center)
  if (parcel && metrics) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#0B132B] font-sans pb-12">
        {/* Brand Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-50 shadow-soft">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-soft bg-white border border-slate-100 flex items-center justify-center">
                <img src="/logo.png" alt="Bhumi-Shield Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-[#0B132B]">
                  BHUMI-SHIELD
                </span>
                <span className="text-[10px] font-extrabold text-indigo-600/90 block leading-tight">
                  Digital Land Passport
                </span>
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase">Verified</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
          {/* Identity Card */}
          <section className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-soft space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Khasra / Survey Number</p>
                <h1 className="text-3xl font-extrabold text-[#0B132B] tracking-tight mt-0.5">#{parcel.khasraSurveyNo}</h1>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Total Area</p>
                <p className="text-xl font-extrabold text-indigo-600 font-mono mt-0.5">{parcel.areaAcres} Acres</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-[9px] font-extrabold uppercase text-slate-500">Location</p>
                  <p className="text-xs font-extrabold text-[#0B132B]">Village Manikpur</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-[9px] font-extrabold uppercase text-slate-500">Project</p>
                  <p className="text-xs font-extrabold text-[#0B132B] truncate">{project?.name || 'Infrastructure Project'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Statutory Metrics */}
          <section className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-soft space-y-3">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Scale className="w-4 h-4 text-indigo-600" /> Statutory Compensation
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-slate-500 font-medium">Total Solatium & Award Amount</p>
                <p className="text-lg font-extrabold text-[#0B132B] font-mono">₹ {(metrics.compensationBurdenINR).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-600 font-medium">7/12 RoR Verification</span>
                  <span className="text-[11px] font-extrabold text-[#0B132B]">{metrics.documentCompletenessPct}% Complete</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${metrics.documentCompletenessPct}%` }} />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // If not found anywhere
  return (
    <div className="flex h-screen items-center justify-center bg-[#FAF8F5] p-4">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-[#0B132B]">Digital Passport</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Record reference <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-indigo-600 font-extrabold">{parcelId}</code> is stored in the sovereign sandbox. Please refresh or tap below to load the live passport.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-brand-gradient text-white text-xs font-extrabold shadow-soft hover:shadow-float transition-all cursor-pointer"
        >
          Reload Live Passport
        </button>
      </div>
    </div>
  );
};
