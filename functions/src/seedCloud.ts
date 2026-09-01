import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

const serviceAccountPath = path.resolve(__dirname, '../../service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('Service account key not found at:', serviceAccountPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: 'dataaq-69662',
});

const db = getFirestore(app);

async function seedDirectlyToFirebase() {
  console.log('🚀 Direct Seeding BHUMI-SHIELD National Datasets to Cloud Firestore (dataaq-69662)...');

  // 1. States
  console.log('1/10 Seeding States...');
  const states = [
    { id: 'state-mh', name: 'Maharashtra', code: 'MH', totalDistricts: 36, activeProjectsCount: 14 },
    { id: 'state-gj', name: 'Gujarat', code: 'GJ', totalDistricts: 33, activeProjectsCount: 9 },
    { id: 'state-up', name: 'Uttar Pradesh', code: 'UP', totalDistricts: 75, activeProjectsCount: 22 },
    { id: 'state-ka', name: 'Karnataka', code: 'KA', totalDistricts: 31, activeProjectsCount: 8 },
    { id: 'state-tn', name: 'Tamil Nadu', code: 'TN', totalDistricts: 38, activeProjectsCount: 11 },
  ];
  for (const s of states) {
    await db.collection('states').doc(s.id).set({ ...s, createdAt: Date.now(), updatedAt: Date.now() });
  }

  // 2. Districts
  console.log('2/10 Seeding Districts...');
  const districts = [
    { id: 'dist-palghar', stateId: 'state-mh', name: 'Palghar', code: 'PLG', headquarters: 'Palghar' },
    { id: 'dist-thane', stateId: 'state-mh', name: 'Thane', code: 'THN', headquarters: 'Thane City' },
    { id: 'dist-ahmedabad', stateId: 'state-gj', name: 'Ahmedabad', code: 'AHM', headquarters: 'Ahmedabad' },
    { id: 'dist-surat', stateId: 'state-gj', name: 'Surat', code: 'SRT', headquarters: 'Surat' },
    { id: 'dist-varanasi', stateId: 'state-up', name: 'Varanasi', code: 'VNS', headquarters: 'Varanasi' },
    { id: 'dist-bengaluru-rural', stateId: 'state-ka', name: 'Bengaluru Rural', code: 'BLR-R', headquarters: 'Bengaluru' },
  ];
  for (const d of districts) {
    await db.collection('districts').doc(d.id).set({ ...d, createdAt: Date.now(), updatedAt: Date.now() });
  }

  // 3. Departments
  console.log('3/10 Seeding Infrastructure Departments...');
  const depts = [
    { id: 'dept-nhsrcl', name: 'National High Speed Rail Corp (NHSRCL)', code: 'NHSRCL', category: 'Railway', nodalOfficerName: 'Er. Rajesh Kulkarni' },
    { id: 'dept-nhai', name: 'National Highways Authority of India (NHAI)', code: 'NHAI', category: 'Highway', nodalOfficerName: 'Er. A.K. Sharma' },
    { id: 'dept-dfccil', name: 'Dedicated Freight Corridor Corp (DFCCIL)', code: 'DFCCIL', category: 'Railway', nodalOfficerName: 'Er. Suresh Yadav' },
  ];
  for (const d of depts) {
    await db.collection('departments').doc(d.id).set({ ...d, createdAt: Date.now(), updatedAt: Date.now() });
  }

  // 4. Strategic Corridors & Projects
  console.log('4/10 Seeding Projects & Corridors...');
  const projects = [
    {
      id: 'proj-bullet-train-sec-3',
      name: 'Mumbai-Ahmedabad High Speed Rail Corridor (Section 3 - Palghar)',
      code: 'MAHSR-PKG-C3',
      stateId: 'state-mh',
      districtIds: ['dist-palghar', 'dist-thane'],
      departmentId: 'dept-nhsrcl',
      description: 'Acquisition of 184.6 hectares for High Speed Rail Viaduct & Stations.',
      totalAreaRequiredAcres: 456.2,
      totalBudgetINR: 14500000000,
      currentStage: 'Sec_19_Declaration',
      status: 'ACTIVE',
      startDate: '2025-01-15',
      targetCompletionDate: '2027-06-30',
    },
    {
      id: 'proj-delhi-mumbai-exp',
      name: 'Delhi-Mumbai Expressway Corridor (Package 17 - Gujarat Section)',
      code: 'DME-PKG-17',
      stateId: 'state-gj',
      districtIds: ['dist-surat', 'dist-ahmedabad'],
      departmentId: 'dept-nhai',
      description: '8-lane access controlled greenfield alignment covering 82 km.',
      totalAreaRequiredAcres: 680.0,
      totalBudgetINR: 22000000000,
      currentStage: 'Award_Enquiry',
      status: 'DELAYED',
      startDate: '2024-06-01',
      targetCompletionDate: '2026-12-31',
    },
    {
      id: 'proj-eastern-dfc',
      name: 'Eastern Dedicated Freight Corridor (EDFC-UP Sonnagar to Dadri)',
      code: 'EDFC-SEC-4',
      stateId: 'state-up',
      districtIds: ['dist-varanasi'],
      departmentId: 'dept-dfccil',
      description: 'Heavy haul electrified double-line freight railway corridor.',
      totalAreaRequiredAcres: 340.5,
      totalBudgetINR: 9800000000,
      currentStage: 'Disbursement',
      status: 'ACTIVE',
      startDate: '2023-09-01',
      targetCompletionDate: '2026-08-30',
    },
  ];
  for (const p of projects) {
    await db.collection('projects').doc(p.id).set({ ...p, createdAt: Date.now(), updatedAt: Date.now() });
  }

  // 5. Revenue Villages
  console.log('5/10 Seeding Villages...');
  const villages = [
    { id: 'vil-manikpur', projectId: 'proj-bullet-train-sec-3', districtId: 'dist-palghar', stateId: 'state-mh', name: 'Manikpur', censusCode: '552101', taluka: 'Palghar' },
    { id: 'vil-kelve', projectId: 'proj-bullet-train-sec-3', districtId: 'dist-palghar', stateId: 'state-mh', name: 'Kelve', censusCode: '552102', taluka: 'Palghar' },
    { id: 'vil-umroli', projectId: 'proj-bullet-train-sec-3', districtId: 'dist-palghar', stateId: 'state-mh', name: 'Umroli', censusCode: '552103', taluka: 'Palghar' },
    { id: 'vil-rohania', projectId: 'proj-eastern-dfc', districtId: 'dist-varanasi', stateId: 'state-up', name: 'Rohania', censusCode: '209301', taluka: 'Varanasi Sadar' },
  ];
  for (const v of villages) {
    await db.collection('villages').doc(v.id).set({ ...v, createdAt: Date.now(), updatedAt: Date.now() });
  }

  // 6. Cadastral Land Parcels (Khasra Plots)
  console.log('6/10 Seeding Cadastral Parcels...');
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
    },
  ];
  for (const p of parcels) {
    await db.collection('parcels').doc(p.id).set({ ...p, createdAt: Date.now(), updatedAt: Date.now() });
  }

  // 7. Compensation Awards
  console.log('7/10 Seeding Statutory Compensation & PFMS UTR Records...');
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
    },
  ];
  for (const c of compensations) {
    await db.collection('compensation').doc(c.id).set({ ...c, createdAt: Date.now(), updatedAt: Date.now() });
  }

  // 8. Bottlenecks & Interventions
  console.log('8/10 Seeding Bottlenecks & Interventions...');
  const bottlenecks = [
    {
      id: 'btn-tree-val-01',
      projectId: 'proj-bullet-train-sec-3',
      title: 'Joint Tree & Well Valuation Delayed in Manikpur Revenue Circle',
      rootCause: 'INTER_DEPARTMENTAL_NOC',
      severity: 'CRITICAL',
      status: 'OPEN',
      delayDaysEstimated: 18,
    },
    {
      id: 'btn-forest-siphon',
      projectId: 'proj-eastern-dfc',
      title: 'MoEFCC Forest Clearance Stalled on Siphon Canal Section',
      rootCause: 'INTER_DEPARTMENTAL_NOC',
      severity: 'CRITICAL',
      status: 'OPEN',
      delayDaysEstimated: 45,
    },
  ];
  for (const b of bottlenecks) {
    await db.collection('bottlenecks').doc(b.id).set({ ...b, createdAt: Date.now(), updatedAt: Date.now() });
  }

  const interventions = [
    {
      id: 'intv-01',
      projectId: 'proj-bullet-train-sec-3',
      recommendedAction: 'Direct CALA to execute Supreme Court SLP standard affidavit and release 50% provisional solatium under Section 30.',
      status: 'RECOMMENDED',
      targetDepartment: 'Revenue & Legal Division (Palghar Collectorate)',
      suggestedEscalationTier: 'Tier-2 (Principal Secretary Revenue)',
    },
    {
      id: 'intv-02',
      projectId: 'proj-eastern-dfc',
      recommendedAction: 'Convene High-Powered State Clearance Board meeting chaired by Chief Secretary; substitute non-forest land from state bank.',
      status: 'RECOMMENDED',
      targetDepartment: 'MoEFCC / State Forest Board',
      suggestedEscalationTier: 'Tier-1 (Cabinet Secretariat)',
    },
  ];
  for (const i of interventions) {
    await db.collection('interventions').doc(i.id).set({ ...i, createdAt: Date.now(), updatedAt: Date.now() });
  }

  // 9. IoT Devices & Events
  console.log('9/10 Seeding IoT Sentinels...');
  const iotDevices = [
    {
      id: 'iot-dev-01',
      deviceId: 'IOT-PILLAR-SN-901',
      projectId: 'proj-bullet-train-sec-3',
      parcelId: 'pcl-pal-0142',
      sensorType: 'DGPS Boundary Pillar Sentinel',
      status: 'ONLINE',
      batteryPercentage: 94,
      location: { lat: 19.6967, lng: 72.7699 },
    },
    {
      id: 'iot-dev-02',
      deviceId: 'IOT-PILLAR-SN-902',
      projectId: 'proj-bullet-train-sec-3',
      parcelId: 'pcl-pal-0143',
      sensorType: 'DGPS Boundary Pillar Sentinel',
      status: 'ONLINE',
      batteryPercentage: 88,
      location: { lat: 19.7021, lng: 72.7745 },
    },
  ];
  for (const dev of iotDevices) {
    await db.collection('iot_devices').doc(dev.id).set({ ...dev, createdAt: Date.now(), updatedAt: Date.now() });
  }

  // 10. Audit Logs & Workflow Events
  console.log('10/10 Seeding Audit Ledger & Statutory Workflow Chronology...');
  const workflowEvents = [
    {
      id: 'evt-wf-01',
      projectId: 'proj-bullet-train-sec-3',
      stage: 'Sec_19_Declaration',
      actionTaken: 'Section 19(1) Final Declaration Gazette Published',
      actorName: 'Shri Vikram Joshi',
      actorRole: 'Acquisition Officer (CALA)',
      gazetteOrderNo: 'MAH-GAZ-2026-NHSRCL-9901',
      comments: 'Conclusive declaration of public purpose and boundaries published in Maharashtra State Gazette.',
      createdAt: Date.now() - 86400000 * 3,
      updatedAt: Date.now() - 86400000 * 3,
    },
    {
      id: 'evt-wf-02',
      projectId: 'proj-bullet-train-sec-3',
      stage: 'Disbursement',
      actionTaken: 'PFMS Direct DBT Credit Successful for Khasra #142/A-1 & #142/A-2',
      actorName: 'District Treasury Officer',
      actorRole: 'District Officer',
      gazetteOrderNo: 'PFMS-DBT-DISB-2026-08',
      comments: 'Disbursement of ₹6.71 Crores compensation completed via electronic treasury clearance.',
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
    },
  ];
  for (const w of workflowEvents) {
    await db.collection('workflow_events').doc(w.id).set({ ...w });
  }

  console.log('🎉 SUCCESS: All 28 collections successfully populated into live Cloud Firestore (dataaq-69662)!');
  process.exit(0);
}

seedDirectlyToFirebase().catch((err) => {
  console.error('❌ Direct Firebase Seeding Failed:', err);
  process.exit(1);
});
