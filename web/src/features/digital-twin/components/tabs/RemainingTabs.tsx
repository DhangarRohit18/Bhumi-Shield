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
import { PlusCircle, X, ExternalLink, CheckCircle2 } from 'lucide-react';

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

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="space-y-4 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-extrabold text-[#0F172A]">Statutory Gazette Orders & Legal Deeds</h2>
          <p className="text-xs text-[#64748B] font-medium">Verifiable document repository with SHA-256 integrity checksums</p>
        </div>
        <button
          onClick={() => setDocModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Upload Statutory Document</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((d) => (
          <div key={d.id} className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-[#0F172A] font-extrabold">{d.id}</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1] font-bold">
                {d.documentType}
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">{d.title}</h3>
            <p className="text-xs text-[#64748B] font-medium">Version v{d.currentVersionNo} • File Size: {(d.fileSizeBytes / 1024 / 1024).toFixed(2)} MB</p>
            <div className="flex justify-between items-center pt-2 border-t border-[#E2E8F0] text-[11px] text-[#64748B]">
              <span>SHA-256: <strong className="text-[#0F172A] font-mono text-[10px]">{d.sha256Checksum.substring(0, 18)}...</strong></span>
              <a
                href={d.currentDownloadUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#0F172A] font-extrabold hover:underline flex items-center gap-1"
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
              <h3 className="text-sm font-extrabold text-[#0F172A]">Upload & Register Statutory Document</h3>
              <button onClick={() => setDocModalOpen(false)} className="text-[#64748B] hover:text-[#0F172A] cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateDocument} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] font-bold mb-1">Document Title</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Section 19(1) Final Declaration Gazette"
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
                />
              </div>
              <div>
                <label className="block text-[#64748B] font-bold mb-1">Statutory Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
                >
                  <option value="GAZETTE_SEC_11">Section 11 Preliminary Notification</option>
                  <option value="GAZETTE_SEC_19">Section 19 Conclusive Declaration</option>
                  <option value="SIA_REPORT">Social Impact Assessment (SIA) Study</option>
                  <option value="VALUATION_AWARD">Section 23/30 Statutory Valuation Award</option>
                </select>
              </div>
              <div>
                <label className="block text-[#64748B] font-bold mb-1">Gazette PDF URL / Storage Bucket Link</label>
                <input
                  type="text"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDocModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0F172A] text-white hover:bg-[#1E293B] cursor-pointer disabled:opacity-50"
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

export const TwinCompensationTab: React.FC<{ compensations: CompensationAward[]; projectId?: string }> = ({
  compensations,
  projectId = 'proj-bullet-train-sec-3',
}) => {
  const { userProfile, activeRole } = useAuth();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const toggleDisbursementStatus = async (c: CompensationAward) => {
    setUpdatingId(c.id);
    const nextStatus = c.disbursementStatus === 'CREDITED' ? 'PENDING_CLEARANCE' : 'CREDITED';
    try {
      await compensationService.update(c.id, {
        disbursementStatus: nextStatus as any,
        utrTransactionRef: nextStatus === 'CREDITED' ? `PFMS${Date.now()}` : 'PENDING_APPROVAL',
        disbursementDate: nextStatus === 'CREDITED' ? new Date().toISOString().split('T')[0] : 'PENDING',
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
    <div className="space-y-4 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-extrabold text-[#0F172A]">Statutory Compensation & PFMS Direct Credit Ledger</h2>
          <p className="text-xs text-[#64748B] font-medium">Basic market valuation + 100% Solatium (Sec 30) + Structural asset valuations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {compensations.map((c) => (
          <div key={c.id} className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs text-[#0F172A] font-extrabold">AWARD #{c.id}</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  c.disbursementStatus === 'CREDITED'
                    ? 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]'
                    : 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                }`}
              >
                {c.disbursementStatus}
              </span>
            </div>

            <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-[#64748B]">Basic Land Valuation:</span><span className="font-mono text-[#0F172A]">₹{(c.basicLandValueINR / 100000).toFixed(2)} Lakhs</span></div>
              <div className="flex justify-between"><span className="text-[#64748B]">100% Solatium (Sec 30):</span><span className="font-mono text-[#0F172A] font-extrabold">₹{(c.solatiumAmountINR / 100000).toFixed(2)} Lakhs</span></div>
              <div className="flex justify-between"><span className="text-[#64748B]">Structural Assets (Trees/Wells):</span><span className="font-mono text-[#0F172A]">₹{(c.assetsValuationINR / 100000).toFixed(2)} Lakhs</span></div>
              <div className="flex justify-between pt-2 border-t border-[#E2E8F0] font-extrabold text-[#0F172A]">
                <span>Total Statutory Award:</span>
                <span className="font-mono text-[#047857]">₹{(c.totalPayableINR / 100000).toFixed(2)} Lakhs</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-[#64748B] pt-1 font-medium">
              <span>PFMS UTR: <strong className="text-[#0F172A] font-mono">{c.utrTransactionRef}</strong></span>
              <button
                onClick={() => toggleDisbursementStatus(c)}
                disabled={updatingId === c.id}
                className="px-3 py-1 rounded-lg bg-[#0F172A] text-white hover:bg-[#1E293B] text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {c.disbursementStatus === 'CREDITED' ? 'Mark Pending' : 'Trigger PFMS Direct Credit'}
              </button>
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
    <div className="space-y-4 font-sans">
      <div>
        <h2 className="text-base font-extrabold text-[#0F172A]">Resettlement & Rehabilitation (R&R) Entitlements</h2>
        <p className="text-xs text-[#64748B] font-medium">Constructed housing allotments, livelihood grants & family rehabilitations under Section 31</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rrCases.map((r) => (
          <div key={r.id} className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-[#0F172A] font-extrabold">CASE #{r.id}</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  r.status === 'COMPLETED'
                    ? 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]'
                    : 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                }`}
              >
                {r.status}
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">{r.entitlementType} - {r.allottedPlotLocation || 'Plot #28, R&R Sector 4'}</h3>
            <p className="text-xs text-[#64748B] font-medium">Entitlement Type: <strong className="text-[#0F172A]">{r.entitlementType}</strong></p>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-[#E2E8F0]">
              <span className="text-[#64748B]">Grant Sanctioned: <strong className="font-extrabold text-[#047857]">₹{(r.entitlementAmountINR / 100000).toFixed(2)} L</strong></span>
              <button
                onClick={() => toggleRRStatus(r)}
                disabled={updatingId === r.id}
                className="px-3 py-1 rounded-lg bg-[#0F172A] text-white hover:bg-[#1E293B] text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {r.status === 'COMPLETED' ? 'Mark Sanctioned' : 'Handover & Complete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TwinLegalTab: React.FC<{ legalCases: LegalCase[]; projectId?: string }> = ({ legalCases, projectId = 'proj-bullet-train-sec-3' }) => {
  const { userProfile, activeRole } = useAuth();
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [caseNo, setCaseNo] = useState('');
  const [court, setCourt] = useState('Bombay High Court (Appellate Side)');
  const [petitioner, setPetitioner] = useState('');
  const [advocate, setAdvocate] = useState('Adv. Priya S. Deshmukh');
  const [saving, setSaving] = useState(false);

  const handleCreateLegalCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const caseId = `leg-${Date.now()}`;
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
    <div className="space-y-4 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-extrabold text-[#0F172A]">Legal Cases & Land Reference Court Inquiries</h2>
          <p className="text-xs text-[#64748B] font-medium">High Court writ petitions, stay orders, and Section 64 reference appeals</p>
        </div>
        <button
          onClick={() => setLegalModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Docket New Legal Writ</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {legalCases.map((l) => (
          <div key={l.id} className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-[#0F172A] font-extrabold">{l.caseNumber} ({l.courtName})</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${l.stayGranted ? 'bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]' : 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]'}`}>
                {l.stayGranted ? 'STAY GRANTED' : l.status}
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">{l.litigantName}</h3>
            <p className="text-xs text-[#64748B] font-medium">Advocate on Record: <strong className="text-[#0F172A]">{l.advocateName}</strong></p>
            <div className="flex justify-between text-[11px] text-[#64748B] pt-2 border-t border-[#E2E8F0]">
              <span>Next Hearing: <strong className="text-[#0F172A] font-mono">{l.nextHearingDate}</strong></span>
              <span className="font-bold text-[#047857]">CALA Response Affidavit Filed</span>
            </div>
          </div>
        ))}
      </div>

      {legalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-extrabold text-[#0F172A]">Docket High Court Writ / Tribunal Appeal</h3>
              <button onClick={() => setLegalModalOpen(false)} className="text-[#64748B] hover:text-[#0F172A] cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateLegalCase} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] font-bold mb-1">Case / Writ Petition Number</label>
                <input
                  required
                  type="text"
                  value={caseNo}
                  onChange={(e) => setCaseNo(e.target.value)}
                  placeholder="e.g. WP/10442/2026"
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
                />
              </div>
              <div>
                <label className="block text-[#64748B] font-bold mb-1">Court Jurisdiction</label>
                <input
                  type="text"
                  value={court}
                  onChange={(e) => setCourt(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
                />
              </div>
              <div>
                <label className="block text-[#64748B] font-bold mb-1">Petitioner vs Respondent Title</label>
                <input
                  required
                  type="text"
                  value={petitioner}
                  onChange={(e) => setPetitioner(e.target.value)}
                  placeholder="e.g. Shri R.K. Patil vs State of Maharashtra"
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLegalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0F172A] text-white hover:bg-[#1E293B] cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Docketing...' : 'Docket Writ Petition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const TwinFieldEvidenceTab: React.FC<{ evidence: FieldEvidence[] }> = ({ evidence }) => (
  <div className="space-y-4 font-sans">
    <div>
      <h2 className="text-base font-extrabold text-[#0F172A]">Field Evidence & Ground Truth Sentinel</h2>
      <p className="text-xs text-[#64748B] font-medium">High-resolution geotagged photographs, drone survey orthophotos & witness records</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-mono text-[#0F172A] font-extrabold">EVD-GEO-MH-9021</span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1] font-bold">DGPS VERIFIED</span>
        </div>
        <div className="h-32 bg-[#F8FAFC] rounded-xl flex items-center justify-center border border-[#E2E8F0] text-[#64748B] text-xs font-bold">
          [Geotagged Survey Photo: Boundary Pillar QR-PIL-MH-0921]
        </div>
        <div className="text-[11px] text-[#64748B] space-y-1 font-medium">
          <p>Coordinates: <strong className="text-[#0F172A] font-mono">19.6967° N, 72.7699° E</strong> (Accuracy: 0.4m)</p>
          <p>Captured By: <strong className="text-[#0F172A]">Ramesh Sawant (Field Officer)</strong></p>
          <p>SHA-256 Proof: <strong className="text-[#0F172A] font-mono text-[10px]">9a8b7c6d5e4f3a2b1c...</strong></p>
        </div>
      </div>
    </div>
  </div>
);

export const TwinIntelligenceTab: React.FC<{ prediction?: PredictionRecord }> = ({ prediction }) => (
  <div className="space-y-4 font-sans">
    <div>
      <h2 className="text-base font-extrabold text-[#0F172A]">Predictive Intelligence & Delay Risk Forecaster</h2>
      <p className="text-xs text-[#64748B] font-medium">AI/ML risk calibration model analyzing statutory pace and court litigation probability</p>
    </div>

    <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
      <div className="flex justify-between items-center text-xs">
        <span className="font-mono text-[#0F172A] font-extrabold">{prediction?.modelName || 'BhumiShield-Forecaster-v4'}</span>
        <span className="px-2.5 py-0.5 rounded-full text-xs bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1] font-bold">
          Confidence: {((prediction?.confidenceScore || 0.94) * 100).toFixed(0)}%
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
          <p className="text-xs text-[#64748B] font-bold">Predicted Delay</p>
          <p className="text-lg font-extrabold text-[#0F172A]">+{prediction?.predictedDelayDays || 18} Days</p>
        </div>
        <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
          <p className="text-xs text-[#64748B] font-bold">Litigation Risk Index</p>
          <p className="text-lg font-extrabold text-[#0F172A]">{prediction?.litigationRiskScore || 24} / 100</p>
        </div>
        <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
          <p className="text-xs text-[#64748B] font-bold">Cost Overrun Risk</p>
          <p className="text-lg font-extrabold text-[#0F172A]">+{prediction?.costOverrunRiskPercentage || 4.8}%</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-[#0F172A] mb-1">Key Factors & AI Observations:</p>
        <ul className="list-disc list-inside text-xs text-[#64748B] space-y-1 font-medium">
          {(prediction?.factorsContributing || [
            'High compliance with Sec 19 declaration timelines',
            'PFMS direct credit activation completed',
            '1 pending High Court writ petition under review',
          ]).map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

export const TwinActionsTab: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { userProfile, activeRole } = useAuth();
  const [issuedMessage, setIssuedMessage] = useState<string | null>(null);

  const handleIssueDirective = async (type: string, desc: string) => {
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
    <div className="space-y-4 font-sans">
      <div>
        <h2 className="text-base font-extrabold text-[#0F172A]">Statutory Orders & Authority Directives</h2>
        <p className="text-xs text-[#64748B] font-medium">Execute verified statutory orders and trigger inter-departmental workflows</p>
      </div>

      {issuedMessage && (
        <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-xs font-bold text-[#047857] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{issuedMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-3">
          <h3 className="text-xs font-extrabold text-[#0F172A]">Issue Provisional Solatium Clearance</h3>
          <p className="text-[11px] text-[#64748B] font-medium">
            Direct CALA to execute Supreme Court SLP standard affidavit and release 50% provisional solatium under Section 30.
          </p>
          <button
            onClick={() => handleIssueDirective('Provisional Solatium Release', '50% release under Sec 30')}
            className="w-full py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white border border-[#0F172A] rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            Issue Order to CALA
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-3">
          <h3 className="text-xs font-extrabold text-[#0F172A]">Convene High-Powered State Clearance Board</h3>
          <p className="text-[11px] text-[#64748B] font-medium">
            Transmit expedited statutory Section 2 Forest clearance request to Principal Chief Conservator of Forests.
          </p>
          <button
            onClick={() => handleIssueDirective('State NOC Escalation', 'Expedited Forest NOC transmission')}
            className="w-full py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white border border-[#0F172A] rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            Transmit State NOC Directive
          </button>
        </div>
      </div>
    </div>
  );
};

export const TwinAuditTab: React.FC<{ auditLogs: AuditLogEntry[] }> = ({ auditLogs }) => (
  <div className="space-y-4 font-sans">
    <div>
      <h2 className="text-base font-extrabold text-[#0F172A]">Immutable Audit History & Forensic Trail</h2>
      <p className="text-xs text-[#64748B] font-medium">Cryptographically verifiable chronological ledger for this project</p>
    </div>

    <div className="rounded-2xl bg-white border border-[#E2E8F0] overflow-hidden shadow-sm">
      <table className="w-full text-left text-xs text-[#0F172A]">
        <thead className="bg-[#F8FAFC] text-[11px] uppercase tracking-wider text-[#64748B] font-extrabold border-b border-[#E2E8F0]">
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
            <tr key={log.id} className="hover:bg-[#F8FAFC]/60 transition-colors">
              <td className="p-3 font-bold">
                <span className="px-2 py-0.5 rounded text-[10px] bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1]">
                  {log.action}
                </span>
              </td>
              <td className="p-3 text-[#0F172A]">{log.targetCollection}</td>
              <td className="p-3 text-[#0F172A]">{log.actorName}</td>
              <td className="p-3 text-[#0F172A] font-bold">{log.actorRole}</td>
              <td className="p-3 text-[#64748B]">{new Date(log.timestamp).toLocaleTimeString()}</td>
              <td className="p-3 text-[10px] text-[#64748B] truncate max-w-[150px]">{log.verificationHash}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
