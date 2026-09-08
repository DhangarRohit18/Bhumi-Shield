import React, { useState } from 'react';
import { Village, Parcel, AffectedFamily, CompensationAward, RRCase, LegalCase } from '../../../../types';
import { MapPin, ChevronRight, QrCode, DollarSign, Home, Scale, Eye, PlusCircle, CheckCircle, Edit3, Trash2, X, Lock } from 'lucide-react';
import { parcelService, compensationService } from '../../../../services/entities.service';
import { auditService } from '../../../../services/audit.service';
import { useAuth } from '../../../../contexts/AuthContext';
import { hasPermission, getPermissionReason } from '../../../../utils/rbac';

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

  // RBAC Permission checks
  const canIntake = hasPermission(activeRole, 'INTAKE_PARCEL');
  const canEdit = hasPermission(activeRole, 'EDIT_PARCEL');
  const canSignAward = hasPermission(activeRole, 'SIGN_AWARD_DECREE');
  const canDisburse = hasPermission(activeRole, 'MARK_PARCEL_DISBURSED');

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
    if (!canIntake) {
      alert(getPermissionReason(activeRole, 'INTAKE_PARCEL'));
      return;
    }
    setEditingParcel(null);
    setKhasraNo('');
    setAreaAcres('2.5');
    setLandClass('Agricultural');
    setValuation('12500000');
    setVillageId(villages[0]?.id || 'vil-manikpur');
    setModalOpen(true);
  };

  const openEditModal = (p: Parcel) => {
    if (!canEdit) {
      alert(getPermissionReason(activeRole, 'EDIT_PARCEL'));
      return;
    }
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
    if (nextStatus === 'AWARDED' && !canSignAward) {
      alert(getPermissionReason(activeRole, 'SIGN_AWARD_DECREE'));
      return;
    }
    if (nextStatus === 'DISBURSED' && !canDisburse) {
      alert(getPermissionReason(activeRole, 'MARK_PARCEL_DISBURSED'));
      return;
    }

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
    <div className="space-y-6 ">
      {/* Village Filter & Real-time Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#0B132B] text-white border border-[#0B132B]">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#0B132B]">4-Tier Cadastral Hierarchy & Live Land Ledger</h2>
            <p className="text-xs text-slate-500 font-medium">Project ➔ Revenue Village ➔ Cadastral Khasra ➔ Linked Case (Real-time Firestore Sync)</p>
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
            className="bg-transparent border border-[#CBD5E1] rounded-xl px-3 py-1.5 text-xs text-[#0B132B] focus:outline-none focus:border-[#0B132B] cursor-pointer font-extrabold shadow-soft"
          >
            <option value="">All Revenue Villages ({villages.length})</option>
            {villages.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.censusCode})
              </option>
            ))}
          </select>

          {canIntake ? (
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-brand-gradient hover:bg-[#3730A3] text-white border border-[#4F46E5] rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-soft transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>+ Intake Cadastral Plot</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F1F5F9] border border-[#CBD5E1] text-[11px] font-extrabold text-slate-500" title="Intake restricted to authorized Acquisition and Revenue officers">
              <Lock className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>Intake Restricted</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Parcels Cadastral Table with Real-time Edit Buttons */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 overflow-hidden shadow-soft bg-white">
          <div className="p-4 bg-transparent border-b border-slate-200/80 flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-[#0B132B]">Live Cadastral Plots in Jurisdiction ({filteredParcels.length})</h3>
            <span className="text-[11px] text-indigo-600 font-extrabold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              <span>Live Subscriptions Active</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#0B132B]">
              <thead className="bg-transparent/50 text-[10px] uppercase tracking-wider text-slate-500 font-extrabold border-b border-slate-200/80">
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
              <tbody className="divide-y divide-[#E0E7FF]/40">
                {filteredParcels.map((p) => {
                  const isSelected = p.id === (activeParcel?.id || '');
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedParcelId(p.id!)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-50 border-l-4 border-l-[#4F46E5]' : 'hover:bg-transparent/60'
                      }`}
                    >
                      <td className="p-3 font-extrabold text-[#0B132B] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{p.khasraSurveyNo}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-transparent text-indigo-600 border border-slate-200/80">
                          {p.landClassification}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[#0B132B] font-medium">{p.areaAcres}</td>
                      <td className="p-3 font-mono font-extrabold text-[#0B132B]">
                        ₹{(p.totalCompensationINR / 100000).toFixed(2)} L
                      </td>
                      <td className="p-3 font-mono text-[10px] text-slate-500">
                        {p.qrAssetId || 'UNTAGGED'}
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#0B132B] text-white">
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        {canEdit ? (
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-2xl hover:bg-indigo-50 text-indigo-600 hover:text-[#0B132B] transition-all cursor-pointer"
                            title="Edit Cadastral Plot"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="p-1.5 text-[#94A3B8]" title="Read-Only View">
                            <Lock className="w-3.5 h-3.5 inline" />
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Deep Case Inspector (Parcel -> Case) with Real-Time Mutation Actions */}
        <div className="p-5 rounded-2xl border border-slate-200/80 shadow-soft bg-white space-y-4 ">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div>
              <span className="text-[10px] font-mono text-indigo-600 font-extrabold">INSPECTING CADASTRAL PLOT</span>
              <h3 className="text-sm font-extrabold text-[#0B132B]">Khasra #{activeParcel?.khasraSurveyNo || '142/A-1'}</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#0B132B] text-white">
              {activeParcel?.status || 'AWARDED'}
            </span>
          </div>

          {/* Quick Statutory Transition Trigger with RBAC Enforcement */}
          <div className="p-3.5 bg-transparent rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold text-indigo-600">Statutory Status Action</span>
              <span className="text-[9px] font-mono font-extrabold text-indigo-600">
                {canSignAward ? '✓ Authorized' : '🔒 Restricted'}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => activeParcel?.id && handleUpdateStatus(activeParcel.id, 'AWARDED')}
                disabled={!canSignAward}
                className={`flex-1 py-1.5 px-2 rounded-2xl text-[11px] font-extrabold transition-all shadow-xs ${
                  canSignAward
                    ? 'bg-brand-gradient hover:bg-[#3730A3] text-white cursor-pointer'
                    : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                }`}
                title={canSignAward ? 'Sign Section 23 Award Decree' : getPermissionReason(activeRole, 'SIGN_AWARD_DECREE')}
              >
                Sign Award Decree
              </button>
              <button
                onClick={() => activeParcel?.id && handleUpdateStatus(activeParcel.id, 'DISBURSED')}
                disabled={!canDisburse}
                className={`flex-1 py-1.5 px-2 rounded-2xl text-[11px] font-extrabold transition-all shadow-xs ${
                  canDisburse
                    ? 'bg-white hover:bg-indigo-50 text-[#0B132B] border border-slate-200/80 cursor-pointer'
                    : 'bg-[#F1F5F9] text-[#94A3B8] border border-[#E2E8F0] cursor-not-allowed'
                }`}
                title={canDisburse ? 'Mark Compensation Disbursed' : getPermissionReason(activeRole, 'MARK_PARCEL_DISBURSED')}
              >
                Mark Disbursed
              </button>
            </div>
          </div>

          {/* 1. Compensation Award Case Card */}
          <div className="p-4 rounded-xl bg-transparent border border-[#E2E8F0] space-y-2 text-xs">
            <div className="flex items-center justify-between font-extrabold text-[#0B132B]">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#0B132B]" />
                <span>Statutory Award Decree</span>
              </span>
              <span className="text-[10px] text-[#0B132B] font-extrabold">{activeComp?.disbursementStatus || 'CREDITED'}</span>
            </div>
            <div className="text-[11px] text-slate-500 space-y-1 font-medium">
              <div className="flex justify-between"><span>Basic Land Value:</span><span className="text-[#0B132B]">₹{((activeParcel?.estimatedMarketValueINR || 12500000) / 100000).toFixed(2)} L</span></div>
              <div className="flex justify-between"><span>100% Solatium (Sec 30):</span><span className="text-[#0B132B] font-extrabold">₹{((activeParcel?.calculatedSolatiumINR || 12500000) / 100000).toFixed(2)} L</span></div>
              <div className="flex justify-between pt-1 border-t border-[#E2E8F0] font-extrabold text-[#0B132B]">
                <span>Total Disbursed:</span><span className="text-[#0B132B]">₹{((activeParcel?.totalCompensationINR || 27500000) / 100000).toFixed(2)} L</span>
              </div>
            </div>
          </div>

          {/* 2. Project Affected Family (PAF) & R&R Case */}
          <div className="p-4 rounded-xl bg-transparent border border-[#E2E8F0] space-y-2 text-xs">
            <div className="flex items-center justify-between font-extrabold text-[#0B132B]">
              <span className="flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-[#0B132B]" />
                <span>R&R Entitlement Case</span>
              </span>
              <span className="text-[10px] text-[#0B132B] font-extrabold">{activePAF?.rrEntitlementStatus || 'ALLOCATED'}</span>
            </div>
            <div className="text-[11px] text-slate-500 space-y-1 font-medium">
              <p className="font-extrabold text-[#0B132B]">{activePAF?.headOfFamilyName || 'Smt. Anusaya Pandurang Patil'}</p>
              <p>Category: {activePAF?.category || 'OBC'} • Family Size: {activePAF?.familyMembersCount || 5}</p>
              <p>Bank: {activePAF?.bankAccountNumberMasked || 'XXXXXX4092'}</p>
            </div>
          </div>

          {/* 3. Native AR Field Sentinel Inspection Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#0B132B] to-[#1E293B] text-white border border-[#334155] space-y-3 text-xs shadow-soft">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-extrabold text-white">
                <span className="text-sm">📱</span>
                <span>AR Ground Demarcation</span>
              </span>
              <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-brand-gradient text-white">
                ARCore DGPS
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              Verify Khasra #{activeParcel?.khasraSurveyNo || '142/A-1'} physical boundary pillars on-site with real-time 3D camera overlays and sub-meter DGPS lock.
            </p>
            <a
              href="/bhumi-shield-ar-sentinel-v1.0.apk"
              download="bhumi-shield-ar-sentinel-v1.0.apk"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-brand-gradient hover:bg-[#3730A3] text-white font-extrabold text-xs transition-all shadow-xs"
            >
              <span>Download AR Sentinel APK</span>
              <span className="text-[10px] font-mono opacity-80">(35.6 MB)</span>
            </a>
          </div>
        </div>
      </div>

      {/* MODAL: Real-Time Add / Edit Cadastral Plot */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[#0B132B]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 ">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <h2 className="text-sm font-extrabold text-[#0B132B]">
                {editingParcel ? `Edit Khasra #${editingParcel.khasraSurveyNo}` : 'Intake New Cadastral Plot'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-[#0B132B] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveParcel} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#0B132B] mb-1 font-extrabold">Revenue Village</label>
                <select
                  value={villageId}
                  onChange={(e) => setVillageId(e.target.value)}
                  className="w-full bg-transparent border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-[#0B132B] font-medium"
                >
                  {villages.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} ({v.censusCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#0B132B] mb-1 font-extrabold">Khasra / Survey Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 144/1-C"
                  value={khasraNo}
                  onChange={(e) => setKhasraNo(e.target.value)}
                  className="w-full bg-transparent border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-[#0B132B] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0B132B] mb-1 font-extrabold">Area (Acres)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={areaAcres}
                    onChange={(e) => setAreaAcres(e.target.value)}
                    className="w-full bg-transparent border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-[#0B132B] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[#0B132B] mb-1 font-extrabold">Classification</label>
                  <select
                    value={landClass}
                    onChange={(e: any) => setLandClass(e.target.value)}
                    className="w-full bg-transparent border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-[#0B132B] font-medium"
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
                <label className="block text-[#0B132B] mb-1 font-extrabold">Basic Valuation (₹ INR)</label>
                <input
                  type="number"
                  required
                  value={valuation}
                  onChange={(e) => setValuation(e.target.value)}
                  className="w-full bg-transparent border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-[#0B132B] font-medium"
                />
                <p className="text-[10px] text-[#0B132B] mt-1 font-extrabold">
                  + 100% Solatium will be automatically computed: ₹{((parseFloat(valuation) || 0) * 2 / 100000).toFixed(2)} Lakhs Total Award
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-transparent text-[#0B132B] rounded-xl text-xs font-extrabold border border-[#CBD5E1] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#0B132B] hover:bg-[#1E293B] text-white border border-[#0B132B] font-extrabold rounded-xl text-xs cursor-pointer shadow-soft"
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
