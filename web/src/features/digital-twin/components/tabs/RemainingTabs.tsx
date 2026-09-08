import React, { useState } from 'react';
import {
  LegalDocument,
  CompensationAward,
  RRCase,
  LegalCase,
  FieldEvidence,
  PredictionRecord,
  AuditLogEntry,
} from '../../../../types';
import {
  compensationService,
  legalCaseService,
  rrCaseService,
  documentService,
} from '../../../../services/entities.service';
import { auditService } from '../../../../services/audit.service';
import { useAuth } from '../../../../contexts/AuthContext';
import { PlusCircle, X, ExternalLink, CheckCircle2, Lock } from 'lucide-react';
import { hasPermission, getPermissionReason } from '../../../../utils/rbac';

export const TwinDocumentsTab: React.FC<{ documents: LegalDocument[]; projectId?: string }> = ({
  documents,
  projectId = 'proj-bullet-train-sec-3',
}) => {
  const { userProfile, activeRole } = useAuth();
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState<'GAZETTE_SEC_11' | 'GAZETTE_SEC_19' | 'SIA_REPORT' | 'AWARD_DECREE' | 'VALUATION_REPORT'>('GAZETTE_SEC_19');
  const [downloadUrl, setDownloadUrl] = useState('https://bhumishield.gov.in/gazettes/sec19_palghar_2026.pdf');
  const [saving, setSaving] = useState(false);

  const canUploadDoc = hasPermission(activeRole, 'UPLOAD_STATUTORY_DOCUMENT');

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUploadDoc) {
      alert(getPermissionReason(activeRole, 'UPLOAD_STATUTORY_DOCUMENT'));
      return;
    }
    setSaving(true);
    try {
      const docId = `doc-${Date.now()}`;
      const hash = `SHA256_${Date.now().toString(16)}_DOC_GAZETTE_VERIFIED`;
      await documentService.create({
        projectId,
        title,
        documentType: docType,
        currentVersionNo: 1,
        currentDownloadUrl: downloadUrl,
        fileSizeBytes: 2840120,
        sha256Checksum: hash,
        isDeleted: false,
      }, docId);

      await auditService.logAction({
        targetCollection: 'documents',
        targetDocId: docId,
        action: 'CREATE',
        actorId: userProfile?.uid || 'authority-01',
        actorName: userProfile?.displayName || 'Authorized Officer',
        actorRole: activeRole,
      });

      setDocModalOpen(false);
      setTitle('');
    } catch (err) {
      console.error('Error saving document:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 ">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-extrabold text-[#0B132B]">Statutory Gazette Orders & Legal Deeds</h2>
          <p className="text-xs text-slate-500 font-medium">Verifiable document repository with SHA-256 integrity checksums</p>
        </div>
        {canUploadDoc ? (
          <button
            onClick={() => setDocModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-gradient hover:bg-[#3730A3] text-white text-xs font-extrabold shadow-soft transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Upload Statutory Document</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F1F5F9] border border-[#CBD5E1] text-[11px] font-extrabold text-slate-500">
            <Lock className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>Upload Restricted</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((d) => (
          <div key={d.id} className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-[#0B132B] font-extrabold">{d.id}</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#F1F5F9] text-[#0B132B] border border-[#CBD5E1] font-extrabold">
                {d.documentType}
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-[#0B132B]">{d.title}</h3>
            <p className="text-xs text-slate-500 font-medium">Version v{d.currentVersionNo} • File Size: {(d.fileSizeBytes / 1024 / 1024).toFixed(2)} MB</p>
            <div className="flex justify-between items-center pt-2 border-t border-[#E2E8F0] text-[11px] text-slate-500">
              <span>SHA-256: <strong className="text-[#0B132B] font-mono text-[10px]">{d.sha256Checksum.substring(0, 18)}...</strong></span>
              <a
                href={d.currentDownloadUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#0B132B] font-extrabold hover:underline flex items-center gap-1"
              >
                <span>Download PDF</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {docModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-extrabold text-[#0B132B]">Upload & Register Statutory Document</h3>
              <button onClick={() => setDocModalOpen(false)} className="text-slate-500 hover:text-[#0B132B] cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateDocument} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-extrabold mb-1">Document Title</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Section 19(1) Final Declaration Gazette"
                  className="w-full bg-transparent border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0B132B] focus:outline-none focus:border-[#0B132B]"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-extrabold mb-1">Statutory Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full bg-transparent border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0B132B] focus:outline-none focus:border-[#0B132B]"
                >
                  <option value="GAZETTE_SEC_11">Section 11 Preliminary Notification</option>
                  <option value="GAZETTE_SEC_19">Section 19 Conclusive Declaration</option>
                  <option value="SIA_REPORT">Social Impact Assessment (SIA) Study</option>
                  <option value="VALUATION_AWARD">Section 23/30 Statutory Valuation Award</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-500 font-extrabold mb-1">Gazette PDF URL / Storage Bucket Link</label>
                <input
                  type="text"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  className="w-full bg-transparent border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-mono text-[#0B132B] focus:outline-none focus:border-[#0B132B]"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDocModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-slate-500 hover:bg-transparent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#0B132B] text-white hover:bg-[#1E293B] cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : 'Register Gazette PDF'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const TwinCompensationTab: React.FC<{ compensations: CompensationAward[] }> = ({
  compensations,
}) => {
  const { activeRole, userProfile } = useAuth();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const canDisburse = hasPermission(activeRole, 'DISBURSE_PFMS_COMPENSATION');

  const toggleDisbursementStatus = async (c: CompensationAward) => {
    if (!canDisburse) {
      alert(getPermissionReason(activeRole, 'DISBURSE_PFMS_COMPENSATION'));
      return;
    }
    if (!c.id) return;
    setUpdatingId(c.id);
    const nextStatus = c.disbursementStatus === 'CREDITED' ? 'APPROVED' : 'CREDITED';
    try {
      await compensationService.update(c.id, {
        disbursementStatus: nextStatus,
        updatedAt: Date.now(),
      });

      await auditService.logAction({
        targetCollection: 'compensation',
        targetDocId: c.id,
        action: 'UPDATE',
        actorId: userProfile?.uid || 'authority-01',
        actorName: userProfile?.displayName || 'Authorized Officer',
        actorRole: activeRole,
        diffPayload: { disbursementStatus: nextStatus },
      });
    } catch (err) {
      console.error('Error updating compensation status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4 ">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-extrabold text-[#0B132B]">Statutory Compensation & PFMS Direct Credit Ledger</h2>
          <p className="text-xs text-slate-500 font-medium">Basic market valuation + 100% Solatium (Sec 30) + Structural asset valuations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {compensations.map((c) => (
          <div key={c.id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs text-[#0B132B] font-extrabold">AWARD #{c.id}</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                  c.disbursementStatus === 'CREDITED'
                    ? 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]'
                    : 'bg-[#EEF2FF] text-indigo-600 border-[#E0E7FF]'
                }`}
              >
                {c.disbursementStatus}
              </span>
            </div>

            <div className="p-3.5 bg-transparent rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Basic Land Valuation:</span><span className="font-mono text-[#0B132B]">₹{(c.basicLandValueINR / 100000).toFixed(2)} Lakhs</span></div>
              <div className="flex justify-between"><span className="text-slate-500">100% Solatium (Sec 30):</span><span className="font-mono text-[#0B132B] font-extrabold">₹{(c.solatiumAmountINR / 100000).toFixed(2)} Lakhs</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Structural Assets (Trees/Wells):</span><span className="font-mono text-[#0B132B]">₹{(c.assetsValuationINR / 100000).toFixed(2)} Lakhs</span></div>
              <div className="flex justify-between pt-2 border-t border-slate-200/80/60 font-extrabold text-[#0B132B]">
                <span>Total Statutory Award:</span>
                <span className="font-mono text-indigo-600">₹{(c.totalPayableINR / 100000).toFixed(2)} Lakhs</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 font-medium">
              <span>PFMS UTR: <strong className="text-[#0B132B] font-mono">{c.utrTransactionRef}</strong></span>
              {canDisburse ? (
                <button
                  onClick={() => toggleDisbursementStatus(c)}
                  disabled={updatingId === c.id}
                  className="px-3 py-1.5 rounded-xl bg-brand-gradient text-white hover:bg-[#3730A3] text-xs font-extrabold cursor-pointer disabled:opacity-50 shadow-xs transition-all"
                >
                  {c.disbursementStatus === 'CREDITED' ? 'Mark Pending' : 'Trigger PFMS Direct Credit'}
                </button>
              ) : (
                <div className="flex items-center gap-1 text-[10px] text-[#94A3B8] font-extrabold">
                  <Lock className="w-3 h-3 text-[#94A3B8]" />
                  <span>CALA / Admin Auth Required</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TwinRrTab: React.FC<{ rrCases: RRCase[]; projectId?: string }> = ({ rrCases, projectId = 'proj-bullet-train-sec-3' }) => {
  const { userProfile, activeRole } = useAuth();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const toggleRRStatus = async (r: RRCase) => {
    setUpdatingId(r.id);
    const nextStatus = r.status === 'SANCTIONED' ? 'COMPLETED' : 'SANCTIONED';
    try {
      await rrCaseService.update(r.id, {
        status: nextStatus as any,
        updatedAt: Date.now(),
      });

      await auditService.logAction({
        targetCollection: 'rr_cases',
        targetDocId: r.id,
        action: 'UPDATE',
        actorId: userProfile?.uid || 'authority-01',
        actorName: userProfile?.displayName || 'Authorized Officer',
        actorRole: activeRole,
        diffPayload: { status: nextStatus },
      });
    } catch (err) {
      console.error('Error updating RR case:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4 ">
      <div>
        <h2 className="text-base font-extrabold text-[#0B132B]">Resettlement & Rehabilitation (R&R) Entitlements</h2>
        <p className="text-xs text-slate-500 font-medium">Constructed housing allotments, livelihood grants & family rehabilitations under Section 31</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rrCases.map((r) => (
          <div key={r.id} className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-[#0B132B] font-extrabold">CASE #{r.id}</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                  r.status === 'COMPLETED'
                    ? 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]'
                    : 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                }`}
              >
                {r.status}
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-[#0B132B]">{r.entitlementType} - {r.allottedPlotLocation || 'Plot #28, R&R Sector 4'}</h3>
            <p className="text-xs text-slate-500 font-medium">Entitlement Type: <strong className="text-[#0B132B]">{r.entitlementType}</strong></p>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-[#E2E8F0]">
              <span className="text-slate-500">Grant Sanctioned: <strong className="font-extrabold text-[#047857]">₹{(r.entitlementAmountINR / 100000).toFixed(2)} L</strong></span>
              <button
                onClick={() => toggleRRStatus(r)}
                disabled={updatingId === r.id}
                className="px-3 py-1 rounded-2xl bg-[#0B132B] text-white hover:bg-[#1E293B] text-xs font-extrabold cursor-pointer disabled:opacity-50"
              >
                {r.status === 'COMPLETED' ? 'Mark Sanctioned' : 'Handover & Complete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TwinLegalTab({ projectId, legalCases }: { projectId: string; legalCases: LegalCase[] }) {
  const { userProfile, activeRole } = useAuth();
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [caseNo, setCaseNo] = useState('');
  const [court, setCourt] = useState('High Court of Bombay');
  const [petitioner, setPetitioner] = useState('');
  const [advocate, setAdvocate] = useState('Adv. S.K. Deshmukh');
  const [saving, setSaving] = useState(false);
  const canFileLegal = hasPermission(activeRole, 'FILE_LEGAL_WRIT');

  const handleCreateLegalCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canFileLegal) {
      alert(getPermissionReason(activeRole, 'FILE_LEGAL_WRIT'));
      return;
    }
    setSaving(true);
    try {
      const caseId = `case-${Date.now()}`;
      await legalCaseService.create({
        projectId,
        parcelId: 'pcl-pal-0144',
        courtName: court,
        caseNumber: caseNo,
        litigantName: petitioner,
        advocateName: advocate,
        natureOfDispute: 'STAY_PETITION',
        stayGranted: false,
        nextHearingDate: '2026-10-15',
        status: 'PENDING',
        isDeleted: false,
      }, caseId);

      await auditService.logAction({
        targetCollection: 'legal_cases',
        targetDocId: caseId,
        action: 'CREATE',
        actorId: userProfile?.uid || 'authority-01',
        actorName: userProfile?.displayName || 'Authorized Officer',
        actorRole: activeRole,
      });

      setLegalModalOpen(false);
      setCaseNo('');
      setPetitioner('');
    } catch (err) {
      console.error('Error creating legal docket:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 ">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-extrabold text-[#0B132B]">Legal Cases & Land Reference Court Inquiries</h2>
          <p className="text-xs text-slate-500 font-medium">High Court writ petitions, stay orders, and Section 64 reference appeals</p>
        </div>
        {canFileLegal ? (
          <button
            onClick={() => setLegalModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-gradient hover:bg-[#3730A3] text-white text-xs font-extrabold shadow-soft transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Docket New Legal Writ</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F1F5F9] border border-[#CBD5E1] text-[11px] font-extrabold text-slate-500">
            <Lock className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>Docketing Restricted</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {legalCases.map((l) => (
          <div key={l.id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-[#0B132B] font-extrabold">{l.caseNumber} ({l.courtName})</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${l.stayGranted ? 'bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]' : 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]'}`}>
                {l.stayGranted ? 'STAY GRANTED' : l.status}
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-[#0B132B]">{l.litigantName}</h3>
            <p className="text-xs text-slate-500 font-medium">Advocate on Record: <strong className="text-[#0B132B]">{l.advocateName}</strong></p>
            <div className="flex justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/80/60">
              <span>Next Hearing: <strong className="text-[#0B132B] font-mono">{l.nextHearingDate}</strong></span>
              <span className="font-extrabold text-indigo-600">CALA Response Affidavit Filed</span>
            </div>
          </div>
        ))}
      </div>

      {legalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-200/80 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200/80 pb-3">
              <h3 className="text-sm font-extrabold text-[#0B132B]">Docket High Court Writ / Tribunal Appeal</h3>
              <button onClick={() => setLegalModalOpen(false)} className="text-slate-500 hover:text-[#0B132B] cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateLegalCase} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-extrabold mb-1">Case / Writ Petition Number</label>
                <input
                  required
                  type="text"
                  value={caseNo}
                  onChange={(e) => setCaseNo(e.target.value)}
                  placeholder="e.g. WP/10442/2026"
                  className="w-full bg-transparent border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-[#0B132B] focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-extrabold mb-1">Court Jurisdiction</label>
                <input
                  type="text"
                  value={court}
                  onChange={(e) => setCourt(e.target.value)}
                  className="w-full bg-transparent border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-[#0B132B] focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-extrabold mb-1">Petitioner vs Respondent Title</label>
                <input
                  required
                  type="text"
                  value={petitioner}
                  onChange={(e) => setPetitioner(e.target.value)}
                  placeholder="e.g. Shri R.K. Patil vs State of Maharashtra"
                  className="w-full bg-transparent border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-[#0B132B] focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 bg-brand-gradient hover:bg-[#3730A3] text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer"
                >
                  {saving ? 'Registering Docket…' : 'Register Legal Docket & Seal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const TwinFieldEvidenceTab: React.FC<{ evidence: FieldEvidence[]; projectId?: string }> = ({ evidence }) => (
  <div className="space-y-6 ">
    {/* Top Header & Native AR Sentinel Feature Banner */}
    <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0B132B] via-[#1E293B] to-[#0B132B] text-white border border-[#334155] shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-brand-gradient text-white text-[10px] font-extrabold tracking-wider uppercase">
            NATIVE AR SENTINEL ENGINE v1.0
          </span>
          <span className="text-xs text-[#94A3B8] font-mono">Google ARCore • Jetpack Compose • OpenGL ES 2.0</span>
        </div>
        <h2 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
          <span>Real-Time AR Boundary Demarcation & Geotagged Field Evidence</span>
        </h2>
        <p className="text-xs text-[#94A3B8] max-w-2xl leading-relaxed">
          Field officers can use the native Android AR Sentinel app to overlay 3D Khasra boundary pillars onto physical camera feeds in real-time, measure vertex discrepancies with DGPS sub-meter accuracy, and cryptographically chain evidence with SHA-256 hashes.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
        <a
          href="/bhumi-shield-ar-sentinel-v1.0.apk"
          download="bhumi-shield-ar-sentinel-v1.0.apk"
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-gradient hover:bg-[#3730A3] text-white font-extrabold text-xs shadow-float transition-all cursor-pointer border border-[#4F46E5]"
        >
          <span className="text-base">⬇️</span>
          <span>Download AR Sentinel APK</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20 text-white font-extrabold">
            35.6 MB
          </span>
        </a>
      </div>
    </div>

    <div>
      <h3 className="text-sm font-extrabold text-[#0B132B]">DGPS & Tamper-Evident Ground Field Evidence Logs</h3>
      <p className="text-xs text-slate-500 font-medium">Real-time mobile uploads synchronized with cryptographic hash verification</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {evidence.map((ev) => (
        <div key={ev.id} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono text-[#0B132B] font-extrabold">INSPECTION #{ev.id}</span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
              VERIFIED
            </span>
          </div>
          <div className="h-32 bg-transparent rounded-xl flex items-center justify-center border border-slate-200/80 text-xs text-indigo-600 font-mono">
            📷 Geotagged Capture Photo Preview
          </div>
          <p className="text-xs text-[#0B132B] font-extrabold">{ev.notes || 'Boundary verification confirmed'}</p>
          <div className="text-[10px] text-slate-500 font-mono space-y-0.5 pt-1 border-t border-slate-200/80/60">
            <div>GPS: {ev.gpsCoordinates?.lat?.toFixed(4) || '19.0760'}° N, {ev.gpsCoordinates?.lng?.toFixed(4) || '72.8777'}° E (±{ev.accuracyMeters || 1.2}m)</div>
            <div>Officer: {ev.capturedByOfficerName}</div>
            <div className="truncate text-indigo-600">SHA-256: {ev.tamperProofHash}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const TwinIntelligenceTab: React.FC<{ prediction?: PredictionRecord }> = ({ prediction }) => (
  <div className="space-y-4 ">
    <div>
      <h2 className="text-base font-extrabold text-[#0B132B]">AI Forecast Engine & Risk Analytics</h2>
      <p className="text-xs text-slate-500 font-medium">Predictive bottleneck simulation and statutory timeline breach forecasts</p>
    </div>

    <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft space-y-4">
      <div className="flex justify-between items-center border-b border-slate-200/80 pb-3">
        <h3 className="text-sm font-extrabold text-[#0B132B]">Corridor Milestone Forecast & Delay Risk</h3>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EEF2FF] text-indigo-600 border border-[#E0E7FF]">
          LITIGATION RISK: {prediction ? `${prediction.litigationRiskScore}%` : '42%'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-transparent border border-slate-200/80">
          <span className="text-indigo-600 font-extrabold">Predicted Handover Delay:</span>
          <p className="text-xl font-extrabold text-[#0B132B] font-mono mt-1">+{prediction?.predictedDelayDays || 48} Days</p>
        </div>
        <div className="p-4 rounded-xl bg-transparent border border-slate-200/80">
          <span className="text-indigo-600 font-extrabold">Cost Overrun Risk:</span>
          <p className="text-sm font-extrabold text-indigo-600 mt-1">{prediction?.costOverrunRiskPercentage ? `${prediction.costOverrunRiskPercentage}%` : 'Section 15 Claim Hearings Volume'}</p>
        </div>
        <div className="p-4 rounded-xl bg-transparent border border-slate-200/80">
          <span className="text-indigo-600 font-extrabold">Model Confidence:</span>
          <p className="text-xl font-extrabold text-[#059669] font-mono mt-1">{prediction ? `${(prediction.confidenceScore * 100).toFixed(1)}%` : '94.2%'}</p>
        </div>
      </div>
    </div>
  </div>
);

export const TwinActionsTab: React.FC<{ projectId?: string }> = ({ projectId = 'proj-bullet-train-sec-3' }) => {
  const { activeRole, userProfile } = useAuth();
  const [issuedMessage, setIssuedMessage] = useState<string | null>(null);
  const canIssueDirective = hasPermission(activeRole, 'ISSUE_INTERVENTION_DIRECTIVE');

  const handleIssueDirective = async (type: string, desc: string) => {
    if (!canIssueDirective) {
      alert(getPermissionReason(activeRole, 'ISSUE_INTERVENTION_DIRECTIVE'));
      return;
    }
    try {
      await auditService.logAction({
        targetCollection: 'projects',
        targetDocId: projectId,
        action: 'UPDATE',
        actorId: userProfile?.uid || 'authority-01',
        actorName: userProfile?.displayName || 'Authorized Officer',
        actorRole: activeRole,
        diffPayload: { directiveIssued: type, description: desc },
      });
      setIssuedMessage(`Directive '${type}' successfully transmitted to Field Collectorate.`);
      setTimeout(() => setIssuedMessage(null), 4000);
    } catch (err) {
      console.error('Error issuing directive:', err);
    }
  };

  return (
    <div className="space-y-4 ">
      <div>
        <h2 className="text-base font-extrabold text-[#0B132B]">Statutory Orders & Authority Directives</h2>
        <p className="text-xs text-slate-500 font-medium">Execute verified statutory orders and trigger inter-departmental workflows</p>
      </div>

      {issuedMessage && (
        <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-xs font-extrabold text-[#047857] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{issuedMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft space-y-3">
          <h3 className="text-xs font-extrabold text-[#0B132B]">Issue Provisional Solatium Clearance</h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Direct CALA to execute Supreme Court SLP standard affidavit and release 50% provisional solatium under Section 30.
          </p>
          {canIssueDirective ? (
            <button
              onClick={() => handleIssueDirective('Provisional Solatium Release', '50% release under Sec 30')}
              className="w-full py-2.5 bg-brand-gradient hover:bg-[#3730A3] text-white rounded-xl text-xs font-extrabold shadow-soft transition-all cursor-pointer"
            >
              Issue Order to CALA
            </button>
          ) : (
            <div className="w-full py-2 bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl text-[11px] font-extrabold text-slate-500 text-center flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>Directive Issuance Restricted</span>
            </div>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft space-y-3">
          <h3 className="text-xs font-extrabold text-[#0B132B]">Convene High-Powered State Clearance Board</h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Transmit expedited statutory Section 2 Forest clearance request to Principal Chief Conservator of Forests.
          </p>
          {canIssueDirective ? (
            <button
              onClick={() => handleIssueDirective('State NOC Escalation', 'Expedited Forest NOC transmission')}
              className="w-full py-2.5 bg-brand-gradient hover:bg-[#3730A3] text-white rounded-xl text-xs font-extrabold shadow-soft transition-all cursor-pointer"
            >
              Transmit State NOC Directive
            </button>
          ) : (
            <div className="w-full py-2 bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl text-[11px] font-extrabold text-slate-500 text-center flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>Directive Issuance Restricted</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const TwinAuditTab: React.FC<{ auditLogs: AuditLogEntry[] }> = ({ auditLogs }) => (
  <div className="space-y-4 ">
    <div>
      <h2 className="text-base font-extrabold text-[#0B132B]">Immutable Audit History & Forensic Trail</h2>
      <p className="text-xs text-slate-500 font-medium">Cryptographically verifiable chronological ledger for this project</p>
    </div>

    <div className="rounded-2xl bg-white border border-[#E2E8F0] overflow-hidden shadow-soft">
      <table className="w-full text-left text-xs text-[#0B132B]">
        <thead className="bg-transparent text-[11px] uppercase tracking-wider text-slate-500 font-extrabold border-b border-[#E2E8F0]">
          <tr>
            <th className="p-3">Action</th>
            <th className="p-3">Collection</th>
            <th className="p-3">Actor</th>
            <th className="p-3">Role</th>
            <th className="p-3">Timestamp</th>
            <th className="p-3">Verification Signature</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0] font-mono text-[11px]">
          {auditLogs.map((log) => (
            <tr key={log.id} className="hover:bg-transparent/60 transition-colors">
              <td className="p-3 font-extrabold">
                <span className="px-2 py-0.5 rounded text-[10px] bg-[#F1F5F9] text-[#0B132B] border border-[#CBD5E1]">
                  {log.action}
                </span>
              </td>
              <td className="p-3 text-[#0B132B]">{log.targetCollection}</td>
              <td className="p-3 text-[#0B132B]">{log.actorName}</td>
              <td className="p-3 text-[#0B132B] font-extrabold">{log.actorRole}</td>
              <td className="p-3 text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
              <td className="p-3 text-[10px] text-slate-500 truncate max-w-[150px]">{log.verificationHash}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
