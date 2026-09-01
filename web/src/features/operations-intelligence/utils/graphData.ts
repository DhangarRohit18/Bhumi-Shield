// Dependency Graph & Critical Path Nodes
export interface DependencyNode {
  id: string;
  label: string;
  stage: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'BLOCKED' | 'PENDING';
  isCriticalPath: boolean;
  responsibleRole: string;
  responsibleOfficer: string;
  durationDaysEstimated: number;
  slackDays: number;
}

export interface DependencyEdge {
  from: string;
  to: string;
  dependencyType: 'STATUTORY_MANDATE' | 'NOC_CLEARANCE' | 'SURVEY_SIGN_OFF';
}

export const SAMPLE_DEPENDENCY_NODES: DependencyNode[] = [
  {
    id: 'node-sec4',
    label: 'Section 4(1) Project Requisition',
    stage: 'Proposal',
    status: 'COMPLETED',
    isCriticalPath: true,
    responsibleRole: 'Executing Agency Head',
    responsibleOfficer: 'Er. Rajesh Kulkarni (NHSRCL)',
    durationDaysEstimated: 30,
    slackDays: 0,
  },
  {
    id: 'node-sia',
    label: 'Social Impact Assessment (SIA) Study & Public Hearing',
    stage: 'SIA_Study',
    status: 'COMPLETED',
    isCriticalPath: true,
    responsibleRole: 'SIA Expert Directorate',
    responsibleOfficer: 'Dr. Meenakshi Rao',
    durationDaysEstimated: 60,
    slackDays: 0,
  },
  {
    id: 'node-sec11',
    label: 'Section 11(1) Preliminary Gazette Notification',
    stage: 'Sec_11_Gazette',
    status: 'COMPLETED',
    isCriticalPath: true,
    responsibleRole: 'District Magistrate',
    responsibleOfficer: 'District Collector (Palghar)',
    durationDaysEstimated: 45,
    slackDays: 0,
  },
  {
    id: 'node-sec15',
    label: 'Section 15(2) Hearing of Claims & Title Objections',
    stage: 'Objections',
    status: 'COMPLETED',
    isCriticalPath: true,
    responsibleRole: 'Acquisition Officer (CALA)',
    responsibleOfficer: 'Shri Vikram Joshi, SDO & CALA',
    durationDaysEstimated: 60,
    slackDays: 0,
  },
  {
    id: 'node-forest-noc',
    label: 'Inter-Departmental Forest & Coastal Zone Clearance (MoEFCC)',
    stage: 'NOC_Clearance',
    status: 'BLOCKED',
    isCriticalPath: false,
    responsibleRole: 'State Forest Officer',
    responsibleOfficer: 'Principal Chief Conservator (Forests)',
    durationDaysEstimated: 90,
    slackDays: 14,
  },
  {
    id: 'node-sec19',
    label: 'Section 19(1) Final Acquisition Declaration in Gazette',
    stage: 'Sec_19_Declaration',
    status: 'COMPLETED',
    isCriticalPath: true,
    responsibleRole: 'Revenue Department',
    responsibleOfficer: 'Principal Secretary (Revenue)',
    durationDaysEstimated: 30,
    slackDays: 0,
  },
  {
    id: 'node-jms-survey',
    label: 'Joint Tree, Well & Borewell Valuation Survey (JMS)',
    stage: 'Award_Enquiry',
    status: 'IN_PROGRESS',
    isCriticalPath: true,
    responsibleRole: 'Field Supervisor',
    responsibleOfficer: 'Ramesh Sawant & Agricultural Officer',
    durationDaysEstimated: 25,
    slackDays: 0,
  },
  {
    id: 'node-sec23-award',
    label: 'Section 23 & 30 Final Compensation Award Decree Sign-off',
    stage: 'Award_Enquiry',
    status: 'BLOCKED',
    isCriticalPath: true,
    responsibleRole: 'Acquisition Officer (CALA)',
    responsibleOfficer: 'Shri Vikram Joshi, SDO & CALA',
    durationDaysEstimated: 20,
    slackDays: 0,
  },
  {
    id: 'node-pfms-disburse',
    label: 'Direct DBT / PFMS Bank Transmission to PAF Accounts',
    stage: 'Disbursement',
    status: 'PENDING',
    isCriticalPath: true,
    responsibleRole: 'Treasury & PFMS Officer',
    responsibleOfficer: 'District Accounts Officer',
    durationDaysEstimated: 15,
    slackDays: 0,
  },
  {
    id: 'node-sec38-possession',
    label: 'Section 38 Physical Possession & Land Vesting Transfer',
    stage: 'Possession',
    status: 'PENDING',
    isCriticalPath: true,
    responsibleRole: 'District Collector & CALA',
    responsibleOfficer: 'District Magistrate & CALA',
    durationDaysEstimated: 10,
    slackDays: 0,
  },
];

export const SAMPLE_DEPENDENCY_EDGES: DependencyEdge[] = [
  { from: 'node-sec4', to: 'node-sia', dependencyType: 'STATUTORY_MANDATE' },
  { from: 'node-sia', to: 'node-sec11', dependencyType: 'STATUTORY_MANDATE' },
  { from: 'node-sec11', to: 'node-sec15', dependencyType: 'STATUTORY_MANDATE' },
  { from: 'node-sec15', to: 'node-sec19', dependencyType: 'STATUTORY_MANDATE' },
  { from: 'node-sec11', to: 'node-forest-noc', dependencyType: 'NOC_CLEARANCE' },
  { from: 'node-sec19', to: 'node-jms-survey', dependencyType: 'SURVEY_SIGN_OFF' },
  { from: 'node-jms-survey', to: 'node-sec23-award', dependencyType: 'STATUTORY_MANDATE' },
  { from: 'node-forest-noc', to: 'node-sec23-award', dependencyType: 'NOC_CLEARANCE' },
  { from: 'node-sec23-award', to: 'node-pfms-disburse', dependencyType: 'STATUTORY_MANDATE' },
  { from: 'node-pfms-disburse', to: 'node-sec38-possession', dependencyType: 'STATUTORY_MANDATE' },
];
