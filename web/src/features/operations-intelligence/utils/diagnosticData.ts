export interface DiagnosticIssue {
  id: string;
  projectId: string;
  projectName: string;
  problem: string;
  evidence: string;
  rootCause: string;
  affectedDependencies: string[];
  responsibleOwnerName: string;
  responsibleOwnerRole: string;
  recommendedAction: string;
  expectedImpact: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'OPEN' | 'IN_MITIGATION' | 'ORDER_ISSUED';
  isStagnant: boolean;
  daysStagnant?: number;
}

export const DETECTED_DIAGNOSTIC_ISSUES: DiagnosticIssue[] = [
  {
    id: 'iss-comp-01',
    projectId: 'proj-bullet-train-sec-3',
    projectName: 'Mumbai-Ahmedabad High Speed Rail (MAHSR)',
    problem: 'Compensation Award & Solatium Verification Delayed in Manikpur Revenue Circle',
    evidence: '17 Cadastral compensation files pending sign-off for > 34 days; 3 title ownership discrepancies flagged during Section 15 inquiry.',
    rootCause: 'Revenue mutation records pending updation from 7/12 extract registry and missing tree asset valuation sign-off.',
    affectedDependencies: [
      'Section 23 Award Decree sign-off',
      'PFMS direct bank credit transmission',
      'Section 38 physical possession handover',
      'Viaduct civil foundation piling (Contractor PKG-C3)',
    ],
    responsibleOwnerName: 'Shri Vikram Joshi',
    responsibleOwnerRole: 'Competent Authority for Land Acquisition (CALA & SDO)',
    recommendedAction: 'Direct Special Land Acquisition Officer (SLAO) to execute joint mutation reconciliation with Talathi and approve provisional 50% solatium under Section 30.',
    expectedImpact: 'Recovers 18 days of critical path delay; unlocks ₹14.8 Cr in direct beneficiary PFMS credits.',
    severity: 'CRITICAL',
    status: 'OPEN',
    isStagnant: false,
  },
  {
    id: 'iss-forest-02',
    projectId: 'proj-eastern-dfc',
    projectName: 'Eastern Dedicated Freight Corridor (EDFC-UP)',
    problem: 'Silent Stagnation on Inter-Departmental Forest Canal Crossing Clearance',
    evidence: 'File has had zero statutory activity for 42 consecutive days; no formal objection logged in portal.',
    rootCause: 'Inter-agency jurisdictional disagreement over compensatory afforestation land handover in Mirzapur forest division.',
    affectedDependencies: [
      'Canal siphon crossing clearance',
      'Track laying civil works package 204',
      'Overall project target commissioning date (Dec 2027)',
    ],
    responsibleOwnerName: 'Dr. Alok Nath Tripathy',
    responsibleOwnerRole: 'Principal Chief Conservator of Forests (MoEFCC Nodal)',
    recommendedAction: 'Convene State High-Powered Clearance Board meeting chaired by Chief Secretary; substitute non-forest land parcel from state revenue bank.',
    expectedImpact: 'Clears 45 days of unmitigated stagnation; prevents ₹2.4 Cr/month contractor standby claims.',
    severity: 'HIGH',
    status: 'OPEN',
    isStagnant: true,
    daysStagnant: 42,
  },
  {
    id: 'iss-survey-03',
    projectId: 'proj-delhi-mumbai-exp',
    projectName: 'Delhi-Mumbai Expressway (PKG-17)',
    problem: 'Disputed Joint Measurement Survey (JMS) on North-West Quadrant Boundary Pillars',
    evidence: 'Field grievance GRV-2026-08912 lodged alleging 4-meter homestead encroachment on Khasra #143/2-B.',
    rootCause: 'Manual total-station survey discrepancy versus DGPS drone orthophoto control points.',
    affectedDependencies: [
      'Section 19 boundary demarcation gazette',
      'Right-of-Way (RoW) fencing contractor mobilization',
    ],
    responsibleOwnerName: 'Ramesh Sawant',
    responsibleOwnerRole: 'District Field Supervisor',
    recommendedAction: 'Deploy DGPS Joint Survey Sentinel mobile unit for instant ground-truth coordinate re-calibration.',
    expectedImpact: 'Resolves citizen dispute within 48 hours; avoids High Court writ petition filing.',
    severity: 'MEDIUM',
    status: 'IN_MITIGATION',
    isStagnant: false,
  },
];
