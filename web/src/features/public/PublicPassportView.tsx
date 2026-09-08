import React, { useEffect, useState, useMemo } from 'react';
import { Shield, MapPin, Scale, FileText, CheckCircle2, User } from 'lucide-react';
import { parcelService, compensationService, legalCaseService, rrCaseService, documentService, taskService, projectService } from '../../services/entities.service';
import { Parcel, ParcelIntelligenceMetrics, Project } from '../../types';
import { calculateParcelIntelligenceMetrics } from '../../utils/intelligenceCalculations';

export const PublicPassportView: React.FC<{ parcelId: string }> = ({ parcelId }) => {
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [metrics, setMetrics] = useState<ParcelIntelligenceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch parcel
        const p = await parcelService.getById(parcelId);
        if (!p) {
          setLoading(false);
          return;
        }
        setParcel(p);

        // Fetch related entities to calculate metrics
        const [projects, comps, cases, rrs, docs, tasks] = await Promise.all([
          projectService.listAll(),
          compensationService.listAll(),
          legalCaseService.listAll(),
          rrCaseService.listAll(),
          documentService.listAll(),
          taskService.listAll()
        ]);

        const prj = projects.find(pr => pr.id === p.projectId);
        if (prj) setProject(prj);

        const m = calculateParcelIntelligenceMetrics(p, comps, cases, rrs, docs, tasks);
        setMetrics(m);
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
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!parcel || !metrics) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF8F5]">
        <div className="text-center space-y-4">
          <Shield className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-xl font-extrabold text-[#0B132B]">Passport Not Found</h2>
          <p className="text-sm text-slate-500">The requested Digital Land Passport could not be located.</p>
        </div>
      </div>
    );
  }

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

        {/* Ownership Details */}
        <section className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-soft space-y-3">
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <User className="w-4 h-4" /> Beneficiary Details
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-slate-500 font-medium">Primary Owner</span>
              <span className="text-xs font-extrabold text-[#0B132B]">Shri. Tukaram Gaikwad</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-slate-500 font-medium">Co-owners</span>
              <span className="text-xs font-extrabold text-[#0B132B]">{metrics.ownershipCount} Registered</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-slate-500 font-medium">Title Status</span>
              {metrics.ownershipConflict ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">Dispute Active</span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">Clear Title</span>
              )}
            </div>
          </div>
        </section>

        {/* Compensation Status */}
        <section className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-soft space-y-3">
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Scale className="w-4 h-4" /> Statutory Rights & Compensation
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

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500 font-medium">R&R Entitlements</span>
              {metrics.pendingRRCount > 0 ? (
                <span className="text-xs font-extrabold text-indigo-600">Pending Resettlement</span>
              ) : (
                <span className="text-xs font-extrabold text-emerald-600">All Allocated</span>
              )}
            </div>
            
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-slate-500 font-medium">Active Litigation</span>
              {metrics.hasActiveLitigation ? (
                <span className="text-xs font-extrabold text-red-600">{metrics.litigationCaseNo || 'Yes'}</span>
              ) : (
                <span className="text-xs font-extrabold text-slate-500">None</span>
              )}
            </div>
          </div>
        </section>

        {/* Footer info */}
        <div className="text-center space-y-1 pt-4">
          <p className="text-[10px] text-slate-400 font-medium">Scan timestamp: {new Date().toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400 font-medium">This is a digitally generated credential under RFCTLARR Act (2013).</p>
        </div>

      </main>
    </div>
  );
};
