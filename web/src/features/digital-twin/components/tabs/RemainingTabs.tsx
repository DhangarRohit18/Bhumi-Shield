import React from 'react';
import { LegalDocument, CompensationAward, RRCase, LegalCase, FieldEvidence, PredictionRecord, AuditLogEntry } from '../../../../types';
import { Files, DollarSign, Home, Scale, Camera, TrendingUp, History, Download, CheckCircle2, QrCode } from 'lucide-react';

export const TwinDocumentsTab: React.FC<{ documents: LegalDocument[] }> = ({ documents }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-base font-bold text-slate-100">Statutory Gazette Orders & Legal Deeds</h2>
        <p className="text-xs text-slate-400">Verifiable document repository with SHA-256 integrity checksums</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 rounded-xl bg-[#0e1628] border border-slate-800 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-mono text-cyan-400 font-bold">MAH-GAZ-2026-NHSRCL-9901</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300">SEC_19_FINAL</span>
        </div>
        <h3 className="text-sm font-semibold text-slate-100">Section 19(1) Final Declaration Order (Palghar Alignment)</h3>
        <p className="text-xs text-slate-400">Official publication in Gazette of India & Maharashtra State Gazette.</p>
        <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[11px] text-slate-400">
          <span>SHA-256: <strong className="text-slate-300 font-mono text-[10px]">e3b0c44298fc1c149...</strong></span>
          <span className="text-cyan-400 font-semibold cursor-pointer">Download Verified PDF</span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#0e1628] border border-slate-800 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-mono text-indigo-400 font-bold">SIA-REP-MAHSR-PKG3</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-950 text-indigo-300">SIA_REPORT</span>
        </div>
        <h3 className="text-sm font-semibold text-slate-100">Comprehensive Social Impact Assessment (SIA) Study</h3>
        <p className="text-xs text-slate-400">Expert group appraisal committee sign-off on livelihood mitigations.</p>
        <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[11px] text-slate-400">
          <span>SHA-256: <strong className="text-slate-300 font-mono text-[10px]">7f83b1657ff1fc53b...</strong></span>
          <span className="text-cyan-400 font-semibold cursor-pointer">Download Verified PDF</span>
        </div>
      </div>
    </div>
  </div>
);

export const TwinCompensationTab: React.FC<{ compensations: CompensationAward[] }> = ({ compensations }) => (
  <div className="space-y-4">
    <div>
      <h2 className="text-base font-bold text-slate-100">Statutory Compensation & PFMS Direct Credit Ledger</h2>
      <p className="text-xs text-slate-400">Basic market valuation + 100% Solatium (Sec 30) + Structural asset valuations</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {compensations.map((c) => (
        <div key={c.id} className="p-5 rounded-2xl bg-[#0e1628] border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs text-cyan-400 font-bold">AWARD #{c.id}</span>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              {c.disbursementStatus}
            </span>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-400">Basic Land Valuation:</span><span className="font-mono">₹{(c.basicLandValueINR / 100000).toFixed(2)} Lakhs</span></div>
            <div className="flex justify-between"><span className="text-slate-400">100% Solatium (Sec 30):</span><span className="font-mono text-emerald-400 font-bold">₹{(c.solatiumAmountINR / 100000).toFixed(2)} Lakhs</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Structural Assets (Trees/Wells):</span><span className="font-mono">₹{(c.assetsValuationINR / 100000).toFixed(2)} Lakhs</span></div>
            <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-slate-100">
              <span>Total Statutory Award:</span>
              <span className="font-mono text-emerald-400">₹{(c.totalPayableINR / 100000).toFixed(2)} Lakhs</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
            <span>PFMS UTR: <strong className="text-cyan-300 font-mono">{c.utrTransactionRef || 'PFMS202608289921409'}</strong></span>
            <span>Date: {c.disbursementDate || '2026-08-28'}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const TwinRrTab: React.FC<{ rrCases: RRCase[] }> = ({ rrCases }) => (
  <div className="space-y-4">
    <div>
      <h2 className="text-base font-bold text-slate-100">Resettlement & Rehabilitation (R&R) Entitlements</h2>
      <p className="text-xs text-slate-400">Constructed housing allotments, livelihood grants & family rehabilitations under Section 31</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {rrCases.map((r) => (
        <div key={r.id} className="p-5 rounded-2xl bg-[#0e1628] border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono text-indigo-400 font-bold">CASE #{r.id}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
              {r.status}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-100">Constructed House Unit Entitlement (Palghar Sector 4)</h3>
          <p className="text-xs text-slate-400">Allotted Location: <strong className="text-slate-200">{r.allottedPlotLocation || 'Plot #28, R&R Sector 4'}</strong></p>
          <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
            <span className="text-slate-400">Grant Sanctioned:</span>
            <span className="font-bold text-teal-300">₹{(r.entitlementAmountINR / 100000).toFixed(2)} Lakhs</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const TwinLegalTab: React.FC<{ legalCases: LegalCase[] }> = ({ legalCases }) => (
  <div className="space-y-4">
    <div>
      <h2 className="text-base font-bold text-slate-100">Legal Cases & Land Reference Court Inquiries</h2>
      <p className="text-xs text-slate-400">High Court writ petitions, stay orders, and Section 64 reference appeals</p>
    </div>

    <div className="p-4 rounded-xl bg-[#0e1628] border border-slate-800 space-y-3">
      <div className="flex justify-between items-center text-xs">
        <span className="font-mono text-amber-400 font-bold">WP/8921/2026 (Bombay High Court)</span>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
          HEARING SCHEDULED
        </span>
      </div>
      <h3 className="text-sm font-semibold text-slate-100">Objection regarding Multiplication Factor applied to Manikpur Village</h3>
      <p className="text-xs text-slate-400">
        Petitioner challenging rural vs urban multiplier factor under First Schedule. Stay has NOT been granted; CALA directed to file response affidavit.
      </p>
      <div className="flex justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
        <span>Next Hearing: <strong className="text-cyan-300">18-Sep-2026</strong></span>
        <span>Advocate on Record: Adv. Priya S. Deshmukh</span>
      </div>
    </div>
  </div>
);

export const TwinFieldEvidenceTab: React.FC<{ evidence: FieldEvidence[] }> = ({ evidence }) => (
  <div className="space-y-4">
    <div>
      <h2 className="text-base font-bold text-slate-100">Field Evidence & Ground Truth Sentinel</h2>
      <p className="text-xs text-slate-400">High-resolution geotagged photographs, drone survey orthophotos & witness records</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 rounded-xl bg-[#0e1628] border border-slate-800 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-mono text-emerald-400 font-bold">EVD-GEO-MH-9021</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300">DGPS VERIFIED</span>
        </div>
        <div className="h-32 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-800 text-slate-500 text-xs">
          [Geotagged Survey Photo: Boundary Pillar QR-PIL-MH-0921]
        </div>
        <div className="text-[11px] text-slate-400 space-y-1">
          <p>Coordinates: <strong className="text-slate-200 font-mono">19.6967° N, 72.7699° E</strong> (Accuracy: 0.4m)</p>
          <p>Captured By: <strong className="text-cyan-300">Ramesh Sawant (Field Officer)</strong></p>
          <p>SHA-256 Proof: <strong className="text-slate-300 font-mono text-[10px]">9a8b7c6d5e4f3a2b1c...</strong></p>
        </div>
      </div>
    </div>
  </div>
);

export const TwinIntelligenceTab: React.FC<{ prediction?: PredictionRecord }> = ({ prediction }) => (
  <div className="space-y-4">
    <div>
      <h2 className="text-base font-bold text-slate-100">Predictive Intelligence & Delay Risk Forecaster</h2>
      <p className="text-xs text-slate-400">AI/ML risk calibration model analyzing statutory pace and court litigation probability</p>
    </div>

    <div className="p-5 rounded-2xl bg-[#0e1628] border border-slate-800 space-y-4">
      <div className="flex justify-between items-center text-xs">
        <span className="font-mono text-cyan-400 font-bold">{prediction?.modelName || 'BhumiShield-Forecaster-v4'}</span>
        <span className="px-2 py-0.5 rounded text-xs bg-cyan-950 text-cyan-300 border border-cyan-800">
          Confidence: {((prediction?.confidenceScore || 0.94) * 100).toFixed(0)}%
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 bg-slate-900 rounded-xl">
          <p className="text-xs text-slate-400">Predicted Delay</p>
          <p className="text-lg font-bold text-amber-400">+{prediction?.predictedDelayDays || 18} Days</p>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl">
          <p className="text-xs text-slate-400">Litigation Risk Index</p>
          <p className="text-lg font-bold text-emerald-400">{prediction?.litigationRiskScore || 24} / 100</p>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl">
          <p className="text-xs text-slate-400">Cost Overrun Risk</p>
          <p className="text-lg font-bold text-indigo-400">+{prediction?.costOverrunRiskPercentage || 4.8}%</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-300 mb-1">Key Factors & AI Observations:</p>
        <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
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

export const TwinActionsTab: React.FC<{ projectId: string }> = ({ projectId }) => (
  <div className="space-y-4">
    <div>
      <h2 className="text-base font-bold text-slate-100">Statutory Orders & Authority Directives</h2>
      <p className="text-xs text-slate-400">Execute verified statutory orders and trigger inter-departmental workflows</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 rounded-xl bg-[#0e1628] border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-100">Issue Provisional Solatium Clearance</h3>
        <p className="text-[11px] text-slate-400">
          Direct CALA to execute Supreme Court SLP standard affidavit and release 50% provisional solatium under Section 30.
        </p>
        <button className="w-full py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow-md">
          Issue Order to CALA
        </button>
      </div>

      <div className="p-4 rounded-xl bg-[#0e1628] border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-100">Convene High-Powered State Clearance Board</h3>
        <p className="text-[11px] text-slate-400">
          Transmit expedited statutory Section 2 Forest clearance request to Principal Chief Conservator of Forests.
        </p>
        <button className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow-md">
          Transmit State NOC Directive
        </button>
      </div>
    </div>
  </div>
);

export const TwinAuditTab: React.FC<{ auditLogs: AuditLogEntry[] }> = ({ auditLogs }) => (
  <div className="space-y-4">
    <div>
      <h2 className="text-base font-bold text-slate-100">Immutable Audit History & Forensic Trail</h2>
      <p className="text-xs text-slate-400">Cryptographically verifiable chronological ledger for this project</p>
    </div>

    <div className="rounded-2xl bg-[#0e1628] border border-slate-800 overflow-hidden shadow-lg">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-[#090f1e] text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            <th className="p-3">Action</th>
            <th className="p-3">Collection</th>
            <th className="p-3">Actor</th>
            <th className="p-3">Role</th>
            <th className="p-3">Timestamp</th>
            <th className="p-3">Verification Signature</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
          {auditLogs.map((log) => (
            <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
              <td className="p-3 font-bold">
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {log.action}
                </span>
              </td>
              <td className="p-3 text-slate-300">{log.targetCollection}</td>
              <td className="p-3 text-slate-300">{log.actorName}</td>
              <td className="p-3 text-emerald-400">{log.actorRole}</td>
              <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
              <td className="p-3 text-[10px] text-cyan-400 truncate max-w-[150px]">{log.verificationHash}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
