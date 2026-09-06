import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

const serviceAccountPath = path.resolve(__dirname, '../../service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: 'dataaq-69662',
});

const db = getFirestore(app);

async function seedAll28Collections() {
  console.log('🚀 EXHAUSTIVE SEEDING: Initializing all 28 collections for BHUMI-SHIELD in Cloud Firestore (dataaq-69662)...');

  const now = Date.now();

  // 1. users
  console.log('Seeding 1/28: users...');
  const users = [
    {
      id: 'usr-admin-01',
      uid: 'uid-admin-01',
      email: 'admin.national@bhumishield.gov.in',
      displayName: 'Dr. Rajesh Verma, IAS',
      phoneNumber: '+91-98201-11001',
      role: 'National Admin',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr-state-01',
      uid: 'uid-state-01',
      email: 'sec.revenue@maharashtra.gov.in',
      displayName: 'Shri A.K. Mehta, IAS',
      phoneNumber: '+91-98202-22002',
      role: 'State Admin',
      stateId: 'state-mh',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr-dist-01',
      uid: 'uid-dist-01',
      email: 'collector.palghar@gov.in',
      displayName: 'Dr. Manisha Patankar, IAS',
      phoneNumber: '+91-98203-33003',
      role: 'District Officer',
      stateId: 'state-mh',
      districtId: 'dist-palghar',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr-cala-01',
      uid: 'uid-cala-01',
      email: 'cala.palghar@gov.in',
      displayName: 'Shri Vikram Joshi, IAS',
      phoneNumber: '+91-98204-44004',
      role: 'Acquisition Officer',
      stateId: 'state-mh',
      districtId: 'dist-palghar',
      departmentId: 'dept-nhsrcl',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr-field-01',
      uid: 'uid-field-01',
      email: 'talathi.manikpur@gov.in',
      displayName: 'Shri Ramesh Sawant',
      phoneNumber: '+91-98205-55005',
      role: 'Field Officer',
      stateId: 'state-mh',
      districtId: 'dist-palghar',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const u of users) await db.collection('users').doc(u.id).set(u);

  // 2. roles
  console.log('Seeding 2/28: roles...');
  const roles = [
    { id: 'role-nat-admin', name: 'National Admin', description: 'Cabinet Secretariat / Pan-India Oversight', permissions: ['*'], isSystem: true, createdAt: now, updatedAt: now },
    { id: 'role-state-admin', name: 'State Admin', description: 'State Revenue Secretary / Inter-district coordination', permissions: ['state:*'], isSystem: true, createdAt: now, updatedAt: now },
    { id: 'role-dist-officer', name: 'District Officer', description: 'District Magistrate & Collector', permissions: ['district:*'], isSystem: true, createdAt: now, updatedAt: now },
    { id: 'role-cala', name: 'Acquisition Officer', description: 'Competent Authority for Land Acquisition (CALA/SDO)', permissions: ['parcels:write', 'awards:sign'], isSystem: true, createdAt: now, updatedAt: now },
    { id: 'role-field-officer', name: 'Field Officer', description: 'Field Revenue Inspector / Talathi', permissions: ['evidence:upload', 'surveys:write'], isSystem: true, createdAt: now, updatedAt: now },
    { id: 'role-auditor', name: 'Auditor', description: 'Principal Auditor / Vigilance Officer', permissions: ['audit:read', 'financials:read'], isSystem: true, createdAt: now, updatedAt: now },
  ];
  for (const r of roles) await db.collection('roles').doc(r.id).set(r);

  // 3. states
  console.log('Seeding 3/28: states...');
  const states = [
    { id: 'state-mh', name: 'Maharashtra', code: 'MH', totalDistricts: 36, activeProjectsCount: 14, createdAt: now, updatedAt: now },
    { id: 'state-gj', name: 'Gujarat', code: 'GJ', totalDistricts: 33, activeProjectsCount: 9, createdAt: now, updatedAt: now },
    { id: 'state-up', name: 'Uttar Pradesh', code: 'UP', totalDistricts: 75, activeProjectsCount: 22, createdAt: now, updatedAt: now },
    { id: 'state-ka', name: 'Karnataka', code: 'KA', totalDistricts: 31, activeProjectsCount: 8, createdAt: now, updatedAt: now },
    { id: 'state-tn', name: 'Tamil Nadu', code: 'TN', totalDistricts: 38, activeProjectsCount: 11, createdAt: now, updatedAt: now },
  ];
  for (const s of states) await db.collection('states').doc(s.id).set(s);

  // 4. districts
  console.log('Seeding 4/28: districts...');
  const districts = [
    { id: 'dist-palghar', stateId: 'state-mh', name: 'Palghar', code: 'PLG', headquarters: 'Palghar', createdAt: now, updatedAt: now },
    { id: 'dist-thane', stateId: 'state-mh', name: 'Thane', code: 'THN', headquarters: 'Thane City', createdAt: now, updatedAt: now },
    { id: 'dist-ahmedabad', stateId: 'state-gj', name: 'Ahmedabad', code: 'AHM', headquarters: 'Ahmedabad', createdAt: now, updatedAt: now },
    { id: 'dist-surat', stateId: 'state-gj', name: 'Surat', code: 'SRT', headquarters: 'Surat', createdAt: now, updatedAt: now },
    { id: 'dist-varanasi', stateId: 'state-up', name: 'Varanasi', code: 'VNS', headquarters: 'Varanasi', createdAt: now, updatedAt: now },
  ];
  for (const d of districts) await db.collection('districts').doc(d.id).set(d);

  // 5. departments
  console.log('Seeding 5/28: departments...');
  const departments = [
    { id: 'dept-nhsrcl', name: 'National High Speed Rail Corp (NHSRCL)', code: 'NHSRCL', category: 'Railway', nodalOfficerName: 'Er. Rajesh Kulkarni', nodalOfficerPhone: '+91-98210-99001', createdAt: now, updatedAt: now },
    { id: 'dept-nhai', name: 'National Highways Authority of India (NHAI)', code: 'NHAI', category: 'Highway', nodalOfficerName: 'Er. A.K. Sharma', nodalOfficerPhone: '+91-98210-99002', createdAt: now, updatedAt: now },
    { id: 'dept-dfccil', name: 'Dedicated Freight Corridor Corp (DFCCIL)', code: 'DFCCIL', category: 'Railway', nodalOfficerName: 'Er. Suresh Yadav', nodalOfficerPhone: '+91-98210-99003', createdAt: now, updatedAt: now },
  ];
  for (const dept of departments) await db.collection('departments').doc(dept.id).set(dept);

  // 6. projects
  console.log('Seeding 6/28: projects...');
  const projects = [
    {
      id: 'proj-bullet-train-sec-3',
      name: 'Mumbai-Ahmedabad High Speed Rail Corridor (Section 3 - Palghar)',
      code: 'MAHSR-PKG-C3',
      stateId: 'state-mh',
      districtIds: ['dist-palghar', 'dist-thane'],
      departmentId: 'dept-nhsrcl',
      description: 'Acquisition of 184.6 hectares for High Speed Rail Viaduct, Traction Sub-Stations & Palghar Station.',
      totalAreaRequiredAcres: 456.2,
      totalBudgetINR: 14500000000,
      currentStage: 'Sec_19_Declaration',
      status: 'ACTIVE',
      startDate: '2025-01-15',
      targetCompletionDate: '2027-06-30',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'proj-delhi-mumbai-exp',
      name: 'Delhi-Mumbai Expressway Corridor (Package 17 - Gujarat Section)',
      code: 'DME-PKG-17',
      stateId: 'state-gj',
      districtIds: ['dist-surat', 'dist-ahmedabad'],
      departmentId: 'dept-nhai',
      description: '8-lane access controlled greenfield alignment covering 82 km across Surat & Ahmedabad.',
      totalAreaRequiredAcres: 680.0,
      totalBudgetINR: 22000000000,
      currentStage: 'Award_Enquiry',
      status: 'DELAYED',
      startDate: '2024-06-01',
      targetCompletionDate: '2026-12-31',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'proj-eastern-dfc',
      name: 'Eastern Dedicated Freight Corridor (EDFC-UP Sonnagar to Dadri)',
      code: 'EDFC-SEC-4',
      stateId: 'state-up',
      districtIds: ['dist-varanasi'],
      departmentId: 'dept-dfccil',
      description: 'Heavy haul electrified double-line freight railway corridor connecting industrial hubs.',
      totalAreaRequiredAcres: 340.5,
      totalBudgetINR: 9800000000,
      currentStage: 'Disbursement',
      status: 'ACTIVE',
      startDate: '2023-09-01',
      targetCompletionDate: '2026-08-30',
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const p of projects) await db.collection('projects').doc(p.id).set(p);

  // 7. villages
  console.log('Seeding 7/28: villages...');
  const villages = [
    { id: 'vil-manikpur', projectId: 'proj-bullet-train-sec-3', districtId: 'dist-palghar', stateId: 'state-mh', name: 'Manikpur', censusCode: '552101', taluka: 'Palghar', totalParcelsCount: 48, acquiredParcelsCount: 32, createdAt: now, updatedAt: now },
    { id: 'vil-kelve', projectId: 'proj-bullet-train-sec-3', districtId: 'dist-palghar', stateId: 'state-mh', name: 'Kelve', censusCode: '552102', taluka: 'Palghar', totalParcelsCount: 36, acquiredParcelsCount: 18, createdAt: now, updatedAt: now },
    { id: 'vil-umroli', projectId: 'proj-bullet-train-sec-3', districtId: 'dist-palghar', stateId: 'state-mh', name: 'Umroli', censusCode: '552103', taluka: 'Palghar', totalParcelsCount: 42, acquiredParcelsCount: 29, createdAt: now, updatedAt: now },
    { id: 'vil-rohania', projectId: 'proj-eastern-dfc', districtId: 'dist-varanasi', stateId: 'state-up', name: 'Rohania', censusCode: '209301', taluka: 'Varanasi Sadar', totalParcelsCount: 54, acquiredParcelsCount: 41, createdAt: now, updatedAt: now },
  ];
  for (const v of villages) await db.collection('villages').doc(v.id).set(v);

  // 8. parcels
  console.log('Seeding 8/28: parcels...');
  const parcels = [
    {
      id: 'pcl-pal-0142',
      projectId: 'proj-bullet-train-sec-3',
      villageId: 'vil-manikpur',
      khasraSurveyNo: '142/A-1',
      areaAcres: 2.45,
      landClassification: 'Agricultural',
      estimatedMarketValueINR: 12500000,
      calculatedSolatiumINR: 12500000,
      totalCompensationINR: 27500000,
      status: 'AWARDED',
      qrAssetId: 'QR-PIL-MH-0921',
      geoCenter: { lat: 19.6967, lng: 72.7699 },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'pcl-pal-0143',
      projectId: 'proj-bullet-train-sec-3',
      villageId: 'vil-manikpur',
      khasraSurveyNo: '142/A-2',
      areaAcres: 1.8,
      landClassification: 'Residential',
      estimatedMarketValueINR: 18000000,
      calculatedSolatiumINR: 18000000,
      totalCompensationINR: 39600000,
      status: 'DISBURSED',
      qrAssetId: 'QR-PIL-MH-0922',
      geoCenter: { lat: 19.7021, lng: 72.7745 },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'pcl-pal-0144',
      projectId: 'proj-bullet-train-sec-3',
      villageId: 'vil-kelve',
      khasraSurveyNo: '88/1-C',
      areaAcres: 4.2,
      landClassification: 'Agricultural',
      estimatedMarketValueINR: 16800000,
      calculatedSolatiumINR: 16800000,
      totalCompensationINR: 36960000,
      status: 'IDENTIFIED',
      qrAssetId: 'QR-PIL-MH-0923',
      geoCenter: { lat: 19.6241, lng: 72.7312 },
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const pcl of parcels) await db.collection('parcels').doc(pcl.id).set(pcl);

  // 9. affected_families
  console.log('Seeding 9/28: affected_families...');
  const families = [
    {
      id: 'paf-0142',
      projectId: 'proj-bullet-train-sec-3',
      parcelIds: ['pcl-pal-0142'],
      villageId: 'vil-manikpur',
      headOfFamilyName: 'Smt. Anusaya Pandurang Patil',
      aadharNumberMasked: 'XXXX-XXXX-8921',
      bankAccountNumberMasked: 'XXXXXX4092 (State Bank of India)',
      category: 'OBC',
      familyMembersCount: 5,
      isVulnerableFamily: false,
      totalCompensationEntitledINR: 27500000,
      totalDisbursedINR: 27500000,
      rrEntitlementStatus: 'ALLOCATED',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'paf-0143',
      projectId: 'proj-bullet-train-sec-3',
      parcelIds: ['pcl-pal-0143'],
      villageId: 'vil-manikpur',
      headOfFamilyName: 'Shri Digambar Mhatre',
      aadharNumberMasked: 'XXXX-XXXX-4412',
      bankAccountNumberMasked: 'XXXXXX8819 (Bank of Baroda)',
      category: 'General',
      familyMembersCount: 4,
      isVulnerableFamily: false,
      totalCompensationEntitledINR: 39600000,
      totalDisbursedINR: 39600000,
      rrEntitlementStatus: 'DISBURSED',
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const f of families) await db.collection('affected_families').doc(f.id).set(f);

  // 10. workflow_events
  console.log('Seeding 10/28: workflow_events...');
  const workflowEvents = [
    {
      id: 'evt-wf-01',
      projectId: 'proj-bullet-train-sec-3',
      stage: 'Sec_19_Declaration',
      actionTaken: 'Section 19(1) Final Declaration Gazette Published',
      actorId: 'uid-cala-01',
      actorName: 'Shri Vikram Joshi',
      actorRole: 'Acquisition Officer',
      comments: 'Conclusive declaration of public purpose and boundary schedule published in Gazette.',
      gazetteOrderNo: 'MAH-GAZ-2026-NHSRCL-9901',
      createdAt: now - 86400000 * 5,
      updatedAt: now - 86400000 * 5,
    },
    {
      id: 'evt-wf-02',
      projectId: 'proj-bullet-train-sec-3',
      stage: 'Disbursement',
      actionTaken: 'PFMS Direct DBT Credit Successful for Khasra #142/A-1 & #142/A-2',
      actorId: 'uid-dist-01',
      actorName: 'District Treasury Officer',
      actorRole: 'District Officer',
      comments: 'Disbursement of ₹6.71 Crores compensation completed via electronic treasury clearance.',
      gazetteOrderNo: 'PFMS-DBT-DISB-2026-08',
      createdAt: now - 86400000 * 2,
      updatedAt: now - 86400000 * 2,
    },
  ];
  for (const w of workflowEvents) await db.collection('workflow_events').doc(w.id).set(w);

  // 11. tasks
  console.log('Seeding 11/28: tasks...');
  const tasks = [
    {
      id: 'task-jms-01',
      projectId: 'proj-bullet-train-sec-3',
      title: 'Joint Tree & Well Measurement Survey (JMS) on Khasra 142/A-1',
      description: 'Physical ground truth inspection with Forest & Agriculture team before Section 23 Award.',
      assignedTo: 'usr-field-01',
      assignedToName: 'Ramesh Sawant',
      assignedRole: 'Field Officer',
      dueDate: '2026-09-10',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'task-qr-02',
      projectId: 'proj-bullet-train-sec-3',
      title: 'Scan & Verify Boundary Pillar Marker QR-PIL-MH-0922',
      description: 'Inspect geotechnical sensor battery & verify tilt sensor telemetry on North quadrant.',
      assignedTo: 'usr-field-01',
      assignedToName: 'Ramesh Sawant',
      assignedRole: 'Field Officer',
      dueDate: '2026-09-12',
      priority: 'MEDIUM',
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const t of tasks) await db.collection('tasks').doc(t.id).set(t);

  // 12. approvals
  console.log('Seeding 12/28: approvals...');
  const approvals = [
    {
      id: 'appr-01',
      entityType: 'COMPENSATION_AWARD',
      entityId: 'cmp-0142',
      projectId: 'proj-bullet-train-sec-3',
      requestedBy: 'usr-cala-01',
      requestedByName: 'Shri Vikram Joshi',
      approverRole: 'District Officer',
      approvedBy: 'usr-dist-01',
      approvedByName: 'Dr. Manisha Patankar, IAS',
      status: 'APPROVED',
      decisionRemarks: 'Approved following joint measurement survey and verified mutation records.',
      decisionTimestamp: now - 86400000,
      createdAt: now - 86400000 * 2,
      updatedAt: now - 86400000,
    },
  ];
  for (const a of approvals) await db.collection('approvals').doc(a.id).set(a);

  // 13. documents
  console.log('Seeding 13/28: documents...');
  const documents = [
    {
      id: 'doc-sec11-gaz',
      projectId: 'proj-bullet-train-sec-3',
      title: 'Section 11 Preliminary Notification Gazette (Palghar Section)',
      documentType: 'GAZETTE_SEC_11',
      currentVersionNo: 1,
      currentDownloadUrl: 'https://bhumishield.gov.in/gazettes/sec11_palghar_2025.pdf',
      fileSizeBytes: 2450120,
      sha256Checksum: '8f4e2a1b9c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f',
      createdAt: now - 86400000 * 60,
      updatedAt: now - 86400000 * 60,
    },
    {
      id: 'doc-sec19-dec',
      projectId: 'proj-bullet-train-sec-3',
      title: 'Section 19(1) Conclusive Declaration Order',
      documentType: 'GAZETTE_SEC_19',
      currentVersionNo: 1,
      currentDownloadUrl: 'https://bhumishield.gov.in/gazettes/sec19_palghar_2026.pdf',
      fileSizeBytes: 3120400,
      sha256Checksum: '4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f8f4e2a1b9c7d6e5f',
      createdAt: now - 86400000 * 5,
      updatedAt: now - 86400000 * 5,
    },
  ];
  for (const doc of documents) await db.collection('documents').doc(doc.id).set(doc);

  // 14. document_versions
  console.log('Seeding 14/28: document_versions...');
  const docVersions = [
    {
      id: 'ver-sec19-v1',
      documentId: 'doc-sec19-dec',
      versionNo: 1,
      downloadUrl: 'https://bhumishield.gov.in/gazettes/sec19_palghar_2026.pdf',
      uploadedByOfficerName: 'Shri Vikram Joshi (CALA)',
      changeSummary: 'Initial publication of conclusive Section 19 declaration.',
      sha256Checksum: '4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f8f4e2a1b9c7d6e5f',
      fileSizeBytes: 3120400,
      createdAt: now - 86400000 * 5,
      updatedAt: now - 86400000 * 5,
    },
  ];
  for (const dv of docVersions) await db.collection('document_versions').doc(dv.id).set(dv);

  // 15. compensation
  console.log('Seeding 15/28: compensation...');
  const compensations = [
    {
      id: 'cmp-0142',
      parcelId: 'pcl-pal-0142',
      projectId: 'proj-bullet-train-sec-3',
      basicLandValueINR: 12500000,
      solatiumAmountINR: 12500000,
      assetsValuationINR: 2500000,
      totalPayableINR: 27500000,
      disbursementStatus: 'CREDITED',
      utrTransactionRef: 'PFMS202608289921409',
      disbursementDate: '2026-08-28',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cmp-0143',
      parcelId: 'pcl-pal-0143',
      projectId: 'proj-bullet-train-sec-3',
      basicLandValueINR: 18000000,
      solatiumAmountINR: 18000000,
      assetsValuationINR: 3600000,
      totalPayableINR: 39600000,
      disbursementStatus: 'CREDITED',
      utrTransactionRef: 'PFMS202608307718291',
      disbursementDate: '2026-08-30',
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const c of compensations) await db.collection('compensation').doc(c.id).set(c);

  // 16. rr_cases
  console.log('Seeding 16/28: rr_cases...');
  const rrCases = [
    {
      id: 'rr-0142',
      projectId: 'proj-bullet-train-sec-3',
      affectedFamilyId: 'paf-0142',
      housingUnitAllotted: 'Plot #42, R&R Township, Palghar West',
      cashGrantINR: 500000,
      livelihoodAssistanceStatus: 'DISBURSED',
      possessionHandoverDate: '2026-08-15',
      status: 'ALLOCATED',
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const rr of rrCases) await db.collection('rr_cases').doc(rr.id).set(rr);

  // 17. legal_cases
  console.log('Seeding 17/28: legal_cases...');
  const legalCases = [
    {
      id: 'leg-wp-9021',
      projectId: 'proj-bullet-train-sec-3',
      parcelId: 'pcl-pal-0144',
      courtName: 'Bombay High Court (Appellate Side)',
      caseNumber: 'WP/9021/2025',
      petitionerName: 'Shri R.K. Sawant & Ors vs State of Maharashtra',
      advocateName: 'Adv. S.G. Deshmukh',
      stayGranted: false,
      nextHearingDate: '2026-09-24',
      status: 'HEARING_SCHEDULED',
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const lc of legalCases) await db.collection('legal_cases').doc(lc.id).set(lc);

  // 18. grievances
  console.log('Seeding 18/28: grievances...');
  const grievances = [
    {
      id: 'grv-2026-01',
      trackingToken: 'GRV-MH-PLG-0891',
      projectId: 'proj-bullet-train-sec-3',
      parcelId: 'pcl-pal-0142',
      submittedByName: 'Shri Pandurang Patil',
      contactPhoneMasked: '9820XXXX01',
      category: 'SOLATIUM_CALCULATION',
      description: 'Request for expedited release of solatium certificate for bank credit.',
      assignedOfficerRole: 'Acquisition Officer',
      status: 'RESOLVED',
      slaDueTimestamp: now + 86400000 * 5,
      createdAt: now - 86400000 * 3,
      updatedAt: now - 86400000,
    },
  ];
  for (const grv of grievances) await db.collection('grievances').doc(grv.id).set(grv);

  // 19. field_visits
  console.log('Seeding 19/28: field_visits...');
  const fieldVisits = [
    {
      id: 'vis-01',
      projectId: 'proj-bullet-train-sec-3',
      villageId: 'vil-manikpur',
      leadOfficerName: 'Shri Ramesh Sawant (Talathi)',
      leadOfficerUid: 'uid-field-01',
      visitDate: '2026-08-25',
      squadMembers: ['Ramesh Sawant', 'S.K. Patil (Forest Guard)', 'P.V. Rao (Surveyor)'],
      purpose: 'Joint Measurement Survey for Section 23 Award Schedule',
      summaryObservations: 'All 18 cadastral boundaries physically verified intact with total-station DGPS.',
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const fv of fieldVisits) await db.collection('field_visits').doc(fv.id).set(fv);

  // 20. field_evidence
  console.log('Seeding 20/28: field_evidence...');
  const fieldEvidence = [
    {
      id: 'evd-0142',
      projectId: 'proj-bullet-train-sec-3',
      parcelId: 'pcl-pal-0142',
      evidenceType: 'PHOTO_GEOTAGGED',
      downloadUrl: 'https://storage.googleapis.com/bhumi-shield/evidence/pillar_142.jpg',
      gpsCoordinates: { lat: 19.6967, lng: 72.7699, altitude: 24.2 },
      accuracyMeters: 1.8,
      capturedByOfficerName: 'Ramesh Sawant (Talathi)',
      capturedByOfficerUid: 'uid-field-01',
      tamperProofHash: 'SHA256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      notes: 'Pillar verified intact with DGPS & AR alignment. Solatium calculation accepted.',
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const fe of fieldEvidence) await db.collection('field_evidence').doc(fe.id).set(fe);

  // 21. qr_assets
  console.log('Seeding 21/28: qr_assets...');
  const qrAssets = [
    {
      id: 'QR-PIL-MH-0921',
      assetCode: 'QR-PIL-MH-0921',
      projectId: 'proj-bullet-train-sec-3',
      parcelId: 'pcl-pal-0142',
      pillarNumber: 'PLG-KM-108-P1',
      qrPayload: 'https://bhumi-shield.gov.in/p/pcl-pal-0142?k=142A1',
      lastScannedAt: now - 86400000,
      lastScannedBy: 'Ramesh Sawant',
      status: 'VERIFIED',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'QR-PIL-MH-0922',
      assetCode: 'QR-PIL-MH-0922',
      projectId: 'proj-bullet-train-sec-3',
      parcelId: 'pcl-pal-0143',
      pillarNumber: 'PLG-KM-108-P2',
      qrPayload: 'https://bhumi-shield.gov.in/p/pcl-pal-0143?k=142A2',
      lastScannedAt: now - 86400000 * 2,
      lastScannedBy: 'Ramesh Sawant',
      status: 'INSTALLED',
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const qr of qrAssets) await db.collection('qr_assets').doc(qr.id).set(qr);

  // 22. iot_devices
  console.log('Seeding 22/28: iot_devices...');
  const iotDevices = [
    {
      id: 'iot-dev-01',
      deviceId: 'IOT-PILLAR-SN-901',
      projectId: 'proj-bullet-train-sec-3',
      deviceType: 'BOUNDARY_INTRUSION_SENSOR',
      location: { lat: 19.6967, lng: 72.7699 },
      batteryPercentage: 94,
      firmwareVersion: 'v2.4.1-gov',
      status: 'ONLINE',
      lastHeartbeat: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'iot-dev-02',
      deviceId: 'IOT-PILLAR-SN-902',
      projectId: 'proj-bullet-train-sec-3',
      deviceType: 'GROUND_STABILITY_MONITOR',
      location: { lat: 19.7021, lng: 72.7745 },
      batteryPercentage: 88,
      firmwareVersion: 'v2.4.1-gov',
      status: 'ONLINE',
      lastHeartbeat: now - 120000,
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const dev of iotDevices) await db.collection('iot_devices').doc(dev.id).set(dev);

  // 23. iot_events
  console.log('Seeding 23/28: iot_events...');
  const iotEvents = [
    {
      id: 'evt-iot-01',
      deviceId: 'IOT-PILLAR-SN-901',
      projectId: 'proj-bullet-train-sec-3',
      eventType: 'HEARTBEAT',
      severity: 'INFO',
      telemetryPayload: { batteryVoltage: 3.92, temperatureC: 28.4, tiltAngleDeg: 0.2 },
      timestamp: now - 60000,
      createdAt: now - 60000,
      updatedAt: now - 60000,
    },
  ];
  for (const ie of iotEvents) await db.collection('iot_events').doc(ie.id).set(ie);

  // 24. bottlenecks
  console.log('Seeding 24/28: bottlenecks...');
  const bottlenecks = [
    {
      id: 'btn-tree-val-01',
      projectId: 'proj-bullet-train-sec-3',
      title: 'Joint Tree & Well Valuation Delayed in Manikpur Revenue Circle',
      rootCause: 'INTER_DEPARTMENTAL_NOC',
      severity: 'CRITICAL',
      delayDaysEstimated: 18,
      status: 'IDENTIFIED',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'btn-forest-siphon',
      projectId: 'proj-eastern-dfc',
      title: 'MoEFCC Forest Clearance Stalled on Siphon Canal Section',
      rootCause: 'INTER_DEPARTMENTAL_NOC',
      severity: 'CRITICAL',
      delayDaysEstimated: 45,
      status: 'IDENTIFIED',
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const b of bottlenecks) await db.collection('bottlenecks').doc(b.id).set(b);

  // 25. dependencies
  console.log('Seeding 25/28: dependencies...');
  const dependencies = [
    {
      id: 'dep-01',
      projectId: 'proj-bullet-train-sec-3',
      sourceMilestone: 'Joint Measurement Survey (JMS)',
      targetMilestone: 'Section 23 Statutory Valuation Award',
      dependencyType: 'STATUTORY_MANDATE',
      isBlocking: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'dep-02',
      projectId: 'proj-bullet-train-sec-3',
      sourceMilestone: 'Section 23 Statutory Valuation Award',
      targetMilestone: 'PFMS Direct DBT Compensation Disbursement',
      dependencyType: 'STATUTORY_MANDATE',
      isBlocking: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const dep of dependencies) await db.collection('dependencies').doc(dep.id).set(dep);

  // 26. predictions
  console.log('Seeding 26/28: predictions...');
  const predictions = [
    {
      id: 'pred-bullet-train',
      projectId: 'proj-bullet-train-sec-3',
      modelName: 'BHUMI-SHIELD-CALIBRATED-ML-V2',
      modelVersion: '2.4.0-prod',
      confidenceScore: 0.942,
      predictedDelayDays: 18,
      litigationRiskScore: 24,
      costOverrunRiskPercentage: 6.8,
      factorsContributing: [
        'Tree valuation inter-departmental delay (+42%)',
        'Section 19 mutation lag (+26%)',
        'State Forest Board clearance (+22%)',
      ],
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const p of predictions) await db.collection('predictions').doc(p.id).set(p);

  // 27. interventions
  console.log('Seeding 27/28: interventions...');
  const interventions = [
    {
      id: 'intv-01',
      projectId: 'proj-bullet-train-sec-3',
      bottleneckId: 'btn-tree-val-01',
      recommendedAction: 'Direct CALA to execute Supreme Court SLP standard affidavit and release 50% provisional solatium under Section 30.',
      targetDepartment: 'Revenue & Legal Division (Palghar Collectorate)',
      priority: 'URGENT',
      suggestedEscalationTier: 'PRINCIPAL_SECRETARY',
      status: 'RECOMMENDED',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'intv-02',
      projectId: 'proj-eastern-dfc',
      bottleneckId: 'btn-forest-siphon',
      recommendedAction: 'Convene High-Powered State Clearance Board meeting chaired by Chief Secretary; substitute non-forest land from state bank.',
      targetDepartment: 'MoEFCC / State Forest Board',
      priority: 'HIGH',
      suggestedEscalationTier: 'CABINET_COMMITTEE',
      status: 'RECOMMENDED',
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const intv of interventions) await db.collection('interventions').doc(intv.id).set(intv);

  // 28. audit_logs
  console.log('Seeding 28/28: audit_logs...');
  const auditLogs = [
    {
      id: 'log-init-01',
      targetCollection: 'projects',
      targetDocId: 'proj-bullet-train-sec-3',
      action: 'CREATE',
      actorId: 'uid-admin-01',
      actorName: 'Dr. Rajesh Verma, IAS',
      actorRole: 'National Admin',
      timestamp: now,
      verificationHash: 'SHA256_INIT_001_MAHSR',
      ipAddress: 'gov-nic-gateway',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'log-init-02',
      targetCollection: 'parcels',
      targetDocId: 'pcl-pal-0142',
      action: 'CREATE',
      actorId: 'uid-cala-01',
      actorName: 'Shri Vikram Joshi (CALA)',
      actorRole: 'Acquisition Officer',
      timestamp: now,
      verificationHash: 'SHA256_INIT_002_PARCEL_142A1',
      ipAddress: 'collectorate-sdo-terminal',
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const al of auditLogs) await db.collection('audit_logs').doc(al.id).set(al);

  console.log('🎉 SUCCESS: All 28 Collections successfully written to Cloud Firestore (dataaq-69662)!');
  process.exit(0);
}

seedAll28Collections().catch((err) => {
  console.error('❌ Cloud Firestore Seeding Error:', err);
  process.exit(1);
});
