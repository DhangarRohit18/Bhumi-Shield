import React, { useState } from 'react';
import { Village, Parcel, AffectedFamily, CompensationAward, RRCase, LegalCase } from '../../../../types';
import { MapPin, ChevronRight, QrCode, DollarSign, Home, Scale, Eye, PlusCircle, CheckCircle, Edit3, Trash2, X } from 'lucide-react';
import { parcelService, compensationService } from '../../../../services/entities.service';
import { auditService } from '../../../../services/audit.service';
import { useAuth } from '../../../../contexts/AuthContext';

interface ParcelsTabProps {
  villages: Village[];
  parcels: Parcel[];
  families: AffectedFamily[];
  compensations: CompensationAward[];
  rrCases: RRCase[];
  legalCases: LegalCase[];
  projectId: string;
}

export const TwinParcelsTab: React.FC<ParcelsTabProps> = ({
  villages,
  parcels,
  families,
  compensations,
  rrCases,
  legalCases,
  projectId,
}) => {
  const { activeRole, userProfile } = useAuth();
  const [selectedVillageId, setSelectedVillageId] = useState<string>('');
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);

  // Modal State for Real-Time Creation & Editing
  const [modalOpen, setModalOpen] = useState(false);
  const [editingParcel, setEditingParcel] = useState<Parcel | null>(null);
  const [khasraNo, setKhasraNo] = useState('');
  const [areaAcres, setAreaAcres] = useState('2.5');
  const [landClass, setLandClass] = useState<'Agricultural' | 'Residential' | 'Commercial' | 'Barren' | 'Forest'>('Agricultural');
  const [valuation, setValuation] = useState('12500000');
  const [villageId, setVillageId] = useState(villages[0]?.id || 'vil-manikpur');
  const [saving, setSaving] = useState(false);

  // 4-Tier Drill Down: Project -> Village -> Parcel -> Case
  const filteredParcels = selectedVillageId
    ? parcels.filter((p) => p.villageId === selectedVillageId)
    : parcels;

  const activeParcel = parcels.find((p) => p.id === selectedParcelId) || parcels[0];
  const activeComp = compensations.find((c) => c.parcelId === activeParcel?.id);
  const activePAF = families.find((f) => f.parcelIds?.includes(activeParcel?.id || ''));
  const activeRR = rrCases.find((r) => r.affectedFamilyId === activePAF?.id);
  const activeLegal = legalCases.find((l) => l.parcelId === activeParcel?.id);

  const openCreateModal = () => {
    setEditingParcel(null);
    setKhasraNo('');
    setAreaAcres('2.5');
    setLandClass('Agricultural');
    setValuation('12500000');
    setVillageId(villages[0]?.id || 'vil-manikpur');
    setModalOpen(true);
  };

  const openEditModal = (p: Parcel) => {
    setEditingParcel(p);
    setKhasraNo(p.khasraSurveyNo);
    setAreaAcres(p.areaAcres.toString());
    setLandClass(p.landClassification as any);
    setValuation(p.estimatedMarketValueINR.toString());
    setVillageId(p.villageId);
    setModalOpen(true);
  };

  const handleSaveParcel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const baseVal = parseFloat(valuation) || 0;
      const solatium = baseVal;
      const total = baseVal + solatium;

      if (editingParcel && editingParcel.id) {
        // Real-time Firestore UPDATE
        await parcelService.update(editingParcel.id, {
          khasraSurveyNo: khasraNo,
          areaAcres: parseFloat(areaAcres) || 1,
          landClassification: landClass,
          estimatedMarketValueINR: baseVal,
          calculatedSolatiumINR: solatium,
          totalCompensationINR: total,
          villageId: villageId,
        });

        await auditService.logAction({
          targetCollection: 'parcels',
          targetDocId: editingParcel.id,
          action: 'UPDATE',
          actorId: userProfile?.uid || 'authority-01',
          actorName: userProfile?.displayName || 'Authorized Officer',
          actorRole: activeRole,
          diffPayload: { khasraSurveyNo: khasraNo, totalCompensationINR: total },
        });
      } else {
        // Real-time Firestore CREATE
        const newId = await parcelService.create({
          projectId: projectId || 'proj-bullet-train-sec-3',
          villageId: villageId,
          khasraSurveyNo: khasraNo,
          areaAcres: parseFloat(areaAcres) || 1,
          landClassification: landClass,
          estimatedMarketValueINR: baseVal,
          calculatedSolatiumINR: solatium,
          totalCompensationINR: total,
          status: 'IDENTIFIED',
          qrAssetId: 'QR-PIL-MH-' + Math.floor(1000 + Math.random() * 9000),
          geoCenter: { lat: 19.6967 + (Math.random() - 0.5) * 0.05, lng: 72.7699 + (Math.random() - 0.5) * 0.05 },
        });

        await auditService.logAction({
          targetCollection: 'parcels',
          targetDocId: newId,
          action: 'CREATE',
          actorId: userProfile?.uid || 'authority-01',
          actorName: userProfile?.displayName || 'Authorized Officer',
          actorRole: activeRole,
          diffPayload: { khasraSurveyNo: khasraNo, totalCompensationINR: total },
        });
      }

      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (parcelId: string, nextStatus: 'AWARDED' | 'DISBURSED' | 'IDENTIFIED') => {
    await parcelService.update(parcelId, { status: nextStatus });
    await auditService.logAction({
      targetCollection: 'parcels',
      targetDocId: parcelId,
      action: 'UPDATE',
      actorId: userProfile?.uid || 'authority-01',
      actorName: userProfile?.displayName || 'CALA Officer',
      actorRole: activeRole,
      diffPayload: { statusChangeTo: nextStatus },
    });
  };

  return (
    <div className="space-y-6">
      {/* Village Filter & Real-time Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
            <MapPin className="w-5 h-5 text-indigo-700" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">4-Tier Cadastral Hierarchy & Live Land Ledger</h2>
            <p className="text-xs text-slate-500">Project ➔ Revenue Village ➔ Cadastral Khasra ➔ Linked Case (Real-time Firestore Sync)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedVillageId}
            onChange={(e) => {
              setSelectedVillageId(e.target.value);
              setSelectedParcelId(null);
            }}
            aria-label="Filter Revenue Village"
            className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-500 cursor-pointer"
          >
            <option value="">All Revenue Villages ({villages.length})</option>
            {villages.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.censusCode})
              </option>
            ))}
          </select>

          <button
            onClick={openCreateModal}
            className="px-3.5 py-1.5 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Intake Cadastral Plot</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Parcels Cadastral Table with Real-time Edit Buttons */}
        <div className="lg:col-span-2 rounded-xl border border-[#E2E8F0] overflow-hidden shadow-sm bg-white">
          <div className="p-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">Live Cadastral Plots in Jurisdiction ({filteredParcels.length})</h3>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span>Live Firestore Subscriptions Active</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#F8FAFC] text-[10px] uppercase tracking-wider text-slate-600 border-b border-[#E2E8F0]">
                <tr>
                  <th className="p-3">Khasra Survey #</th>
                  <th className="p-3">Classification</th>
                  <th className="p-3">Area (Ac)</th>
                  <th className="p-3">Total Compensation</th>
                  <th className="p-3">QR Pillar</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredParcels.map((p) => {
                  const isSelected = p.id === (activeParcel?.id || '');
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedParcelId(p.id!)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-amber-50/70 border-l-4 border-l-amber-600' : 'hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{p.khasraSurveyNo}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-[#F1F5F9] text-slate-800 border border-[#CBD5E1]">
                          {p.landClassification}
                        </span>
                      </td>
                      <td className="p-3 font-mono">{p.areaAcres}</td>
                      <td className="p-3 font-mono font-bold text-emerald-800">
                        ₹{(p.totalCompensationINR / 100000).toFixed(2)} L
                      </td>
                      <td className="p-3 font-mono text-[10px] text-slate-600">
                        {p.qrAssetId || 'UNTAGGED'}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'AWARDED' || p.status === 'DISBURSED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded hover:bg-[#E2E8F0] text-slate-600 hover:text-slate-900 transition-all"
                          title="Edit Cadastral Plot"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Deep Case Inspector (Parcel -> Case) with Real-Time Mutation Actions */}
        <div className="p-5 rounded-xl border border-[#E2E8F0] shadow-sm bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <span className="text-[10px] font-mono text-slate-500 font-bold">INSPECTING CADASTRAL PLOT</span>
              <h3 className="text-sm font-bold text-slate-900">Khasra #{activeParcel?.khasraSurveyNo || '142/A-1'}</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {activeParcel?.status || 'AWARDED'}
            </span>
          </div>

          {/* Quick Statutory Transition Trigger */}
          <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-500">Statutory Status Action</span>
            <div className="flex gap-2">
              <button
                onClick={() => activeParcel?.id && handleUpdateStatus(activeParcel.id, 'AWARDED')}
                className="flex-1 py-1 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold transition-all"
              >
                Sign Award Decree
              </button>
              <button
                onClick={() => activeParcel?.id && handleUpdateStatus(activeParcel.id, 'DISBURSED')}
                className="flex-1 py-1 px-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded text-[11px] font-semibold transition-all"
              >
                Mark Disbursed
              </button>
            </div>
          </div>

          {/* 1. Compensation Award Case Card */}
          <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                <span>Statutory Award Decree</span>
              </span>
              <span className="text-[10px] text-emerald-700">{activeComp?.disbursementStatus || 'CREDITED'}</span>
            </div>
            <div className="text-[11px] text-slate-600 space-y-1">
              <div className="flex justify-between"><span>Basic Land Value:</span><span>₹{((activeParcel?.estimatedMarketValueINR || 12500000) / 100000).toFixed(2)} L</span></div>
              <div className="flex justify-between"><span>100% Solatium (Sec 30):</span><span className="text-emerald-700 font-bold">₹{((activeParcel?.calculatedSolatiumINR || 12500000) / 100000).toFixed(2)} L</span></div>
              <div className="flex justify-between pt-1 border-t border-[#E2E8F0] font-bold text-slate-900">
                <span>Total Disbursed:</span><span className="text-emerald-700">₹{((activeParcel?.totalCompensationINR || 27500000) / 100000).toFixed(2)} L</span>
              </div>
            </div>
          </div>

          {/* 2. Project Affected Family (PAF) & R&R Case */}
          <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span className="flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-indigo-700" />
                <span>R&R Entitlement Case</span>
              </span>
              <span className="text-[10px] text-indigo-700 font-bold">{activePAF?.rrEntitlementStatus || 'ALLOCATED'}</span>
            </div>
            <div className="text-[11px] text-slate-600 space-y-1">
              <p className="font-semibold text-slate-900">{activePAF?.headOfFamilyName || 'Smt. Anusaya Pandurang Patil'}</p>
              <p>Category: {activePAF?.category || 'OBC'} • Family Size: {activePAF?.familyMembersCount || 5}</p>
              <p>Bank: {activePAF?.bankAccountNumberMasked || 'XXXXXX4092'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Real-Time Add / Edit Cadastral Plot */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#CBD5E1] rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-2">
              <h2 className="text-sm font-bold text-slate-900">
                {editingParcel ? `Edit Khasra #${editingParcel.khasraSurveyNo}` : 'Intake New Cadastral Plot'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveParcel} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Revenue Village</label>
                <select
                  value={villageId}
                  onChange={(e) => setVillageId(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-slate-900"
                >
                  {villages.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} ({v.censusCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Khasra / Survey Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 144/1-C"
                  value={khasraNo}
                  onChange={(e) => setKhasraNo(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Area (Acres)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={areaAcres}
                    onChange={(e) => setAreaAcres(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Classification</label>
                  <select
                    value={landClass}
                    onChange={(e: any) => setLandClass(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-slate-900"
                  >
                    <option value="Agricultural">Agricultural</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Barren">Barren</option>
                    <option value="Forest">Forest</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Basic Valuation (₹ INR)</label>
                <input
                  type="number"
                  required
                  value={valuation}
                  onChange={(e) => setValuation(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-slate-900"
                />
                <p className="text-[10px] text-emerald-700 mt-1 font-semibold">
                  + 100% Solatium will be automatically computed: ₹{((parseFloat(valuation) || 0) * 2 / 100000).toFixed(2)} Lakhs Total Award
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-[#F1F5F9] text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white font-semibold rounded-lg text-xs"
                >
                  {saving ? 'Saving to Firebase...' : editingParcel ? 'Update Plot' : 'Save Plot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
