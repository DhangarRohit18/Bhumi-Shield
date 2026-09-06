import {
  projectService,
  parcelService,
  affectedFamilyService,
  workflowEventService,
  taskService,
  grievanceService,
  iotDeviceService,
  iotEventService,
  compensationService,
  rrCaseService,
  legalCaseService,
  bottleneckService,
  interventionService,
  predictionService,
  stateService,
  districtService,
  villageService,
  departmentService,
  officerWorkloadService,
} from '../services/entities.service';
import { auditService } from '../services/audit.service';
import { calculateOfficerWorkloadScore } from './intelligenceCalculations';

export async function seedBhumiShieldDemoData(logCallback?: (msg: string) => void) {
  const log = (msg: string) => {
    console.log(`[SEEDER] ${msg}`);
    if (logCallback) logCallback(msg);
  };

  log('Initiating BHUMI-SHIELD National Command Center Dataset Seed...');

  // 1. States
  log('Seeding National States Master...');
  await stateService.create({ name: 'Maharashtra', code: 'MH', totalDistricts: 36, activeProjectsCount: 14 }, 'state-mh');
  await stateService.create({ name: 'Gujarat', code: 'GJ', totalDistricts: 33, activeProjectsCount: 9 }, 'state-gj');
  await stateService.create({ name: 'Uttar Pradesh', code: 'UP', totalDistricts: 75, activeProjectsCount: 22 }, 'state-up');
  await stateService.create({ name: 'Karnataka', code: 'KA', totalDistricts: 31, activeProjectsCount: 8 }, 'state-ka');
  await stateService.create({ name: 'Tamil Nadu', code: 'TN', totalDistricts: 38, activeProjectsCount: 11 }, 'state-tn');

  // 2. Districts
  log('Seeding District Level Jurisdictions...');
  await districtService.create({ stateId: 'state-mh', name: 'Palghar', code: 'PLG', headquarters: 'Palghar' }, 'dist-palghar');
  await districtService.create({ stateId: 'state-mh', name: 'Thane', code: 'THN', headquarters: 'Thane City' }, 'dist-thane');
  await districtService.create({ stateId: 'state-gj', name: 'Ahmedabad', code: 'AHM', headquarters: 'Ahmedabad' }, 'dist-ahmedabad');
  await districtService.create({ stateId: 'state-gj', name: 'Surat', code: 'SRT', headquarters: 'Surat' }, 'dist-surat');
  await districtService.create({ stateId: 'state-up', name: 'Varanasi', code: 'VNS', headquarters: 'Varanasi' }, 'dist-varanasi');
  await districtService.create({ stateId: 'state-ka', name: 'Bengaluru Rural', code: 'BLR-R', headquarters: 'Bengaluru' }, 'dist-bengaluru-rural');

  // 3. Departments
  log('Seeding Executing Infrastructure Agencies...');
  await departmentService.create({ name: 'National High Speed Rail Corp (NHSRCL)', code: 'NHSRCL', category: 'Railway', nodalOfficerName: 'Er. Rajesh Kulkarni' }, 'dept-nhsrcl');
  await departmentService.create({ name: 'National Highways Authority of India (NHAI)', code: 'NHAI', category: 'Highway', nodalOfficerName: 'Er. A.K. Sharma' }, 'dept-nhai');
  await departmentService.create({ name: 'Dedicated Freight Corridor Corp (DFCCIL)', code: 'DFCCIL', category: 'Railway', nodalOfficerName: 'Er. Suresh Yadav' }, 'dept-dfccil');

  // 4. Strategic National Projects
  log('Seeding Critical National Projects...');
  const proj1Id = 'proj-bullet-train-sec-3';
  await projectService.create({
    name: 'Mumbai-Ahmedabad High Speed Rail Corridor (Section 3 - Palghar)',
    code: 'MAHSR-PKG-C3',
    stateId: 'state-mh',
    districtIds: ['dist-palghar', 'dist-thane'],
    departmentId: 'dept-nhsrcl',
    description: 'Acquisition of 184.6 hectares for High Speed Rail Viaduct and Palghar Station alignment.',
    totalAreaRequiredAcres: 456.2,
    totalBudgetINR: 14500000000,
    currentStage: 'Sec_19_Declaration',
    startDate: '2025-01-15',
    targetCompletionDate: '2027-06-30',
    status: 'ACTIVE',
  }, proj1Id);

  const proj2Id = 'proj-delhi-mumbai-exp';
  await projectService.create({
    name: 'Delhi-Mumbai Expressway Package 17 (Spur Connectivity)',
    code: 'DME-EXP-P17',
    stateId: 'state-mh',
    districtIds: ['dist-palghar'],
    departmentId: 'dept-nhai',
    description: 'Greenfield expressway acquisition spanning 14 revenue villages.',
    totalAreaRequiredAcres: 820.5,
    totalBudgetINR: 22000000000,
    currentStage: 'Award_Enquiry',
    startDate: '2024-08-01',
    targetCompletionDate: '2026-12-31',
    status: 'ACTIVE',
  }, proj2Id);

  const proj3Id = 'proj-eastern-dfc';
  await projectService.create({
    name: 'Eastern Dedicated Freight Corridor (EDFC-Varanasi Bypass)',
    code: 'EDFC-PKG-204',
    stateId: 'state-up',
    districtIds: ['dist-varanasi'],
    departmentId: 'dept-dfccil',
    description: 'Strategic rail freight corridor clearing heavy container transit around Varanasi junction.',
    totalAreaRequiredAcres: 310.0,
    totalBudgetINR: 9800000000,
    currentStage: 'Sec_11_Gazette',
    startDate: '2025-03-01',
    targetCompletionDate: '2027-12-31',
    status: 'DELAYED',
  }, proj3Id);

  // 5. Revenue Villages
  log('Seeding Revenue Circles & Villages...');
  await villageService.create({ projectId: proj1Id, districtId: 'dist-palghar', name: 'Manikpur', censusCode: 'VIL-MH-52101', totalParcelsCount: 42 }, 'vil-manikpur');
  await villageService.create({ projectId: proj1Id, districtId: 'dist-palghar', name: 'Kelve', censusCode: 'VIL-MH-52102', totalParcelsCount: 28 }, 'vil-kelve');
  await villageService.create({ projectId: proj1Id, districtId: 'dist-palghar', name: 'Umroli', censusCode: 'VIL-MH-52103', totalParcelsCount: 35 }, 'vil-umroli');
  await villageService.create({ projectId: proj3Id, districtId: 'dist-varanasi', name: 'Rohania', censusCode: 'VIL-UP-10901', totalParcelsCount: 64 }, 'vil-rohania');

  // 6. Cadastral Parcels
  log('Seeding Cadastral Land Parcels...');
  const parcel1Id = 'pcl-pal-0142';
  await parcelService.create({
    projectId: proj1Id,
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
  }, parcel1Id);

  const parcel2Id = 'pcl-pal-0143';
  await parcelService.create({
    projectId: proj1Id,
    villageId: 'vil-manikpur',
    khasraSurveyNo: '143/2-B',
    areaAcres: 1.15,
    landClassification: 'Residential',
    estimatedMarketValueINR: 8900000,
    calculatedSolatiumINR: 8900000,
    totalCompensationINR: 19580000,
    status: 'NOTIFIED',
    qrAssetId: 'QR-PIL-MH-0922',
    geoCenter: { lat: 19.6982, lng: 72.7712 },
  }, parcel2Id);

  const parcel3Id = 'pcl-vns-0881';
  await parcelService.create({
    projectId: proj3Id,
    villageId: 'vil-rohania',
    khasraSurveyNo: '881/P-4',
    areaAcres: 4.20,
    landClassification: 'Agricultural',
    estimatedMarketValueINR: 16000000,
    calculatedSolatiumINR: 16000000,
    totalCompensationINR: 35200000,
    status: 'IDENTIFIED',
    qrAssetId: 'QR-PIL-UP-4401',
    geoCenter: { lat: 25.3176, lng: 82.9739 },
  }, parcel3Id);

  // 7. Emerging Bottlenecks (Critical Operational Triage)
  log('Seeding Emerging Operational Bottlenecks...');
  await bottleneckService.create({
    projectId: proj1Id,
    title: 'High Court Writ Petition on Solatium Multiplier Factor (Manikpur Sector)',
    rootCause: 'COURT_STAY',
    severity: 'HIGH',
    delayDaysEstimated: 24,
    status: 'IDENTIFIED',
  }, 'btn-01');

  await bottleneckService.create({
    projectId: proj3Id,
    title: 'Inter-Departmental Forest NOC Pending for Rohania Canal Crossing',
    rootCause: 'INTER_DEPARTMENTAL_NOC',
    severity: 'CRITICAL',
    delayDaysEstimated: 45,
    status: 'IDENTIFIED',
  }, 'btn-02');

  await bottleneckService.create({
    projectId: proj2Id,
    title: 'Disputed Joint Measurement Survey on Khasra 143/2-B Boundary Markers',
    rootCause: 'SIA_PUBLIC_RESISTANCE',
    severity: 'MEDIUM',
    delayDaysEstimated: 12,
    status: 'UNDER_MITIGATION',
  }, 'btn-03');

  // 8. Priority Interventions (Direct 1-Click Operational Actions)
  log('Seeding Priority Actionable Interventions...');
  await interventionService.create({
    projectId: proj1Id,
    bottleneckId: 'btn-01',
    recommendedAction: 'Direct CALA to execute Supreme Court SLP standard solatium affidavit and release 50% provisional solatium under Sec 30.',
    targetDepartment: 'Revenue & Legal Division (Maharashtra)',
    priority: 'URGENT',
    suggestedEscalationTier: 'PRINCIPAL_SECRETARY',
    status: 'RECOMMENDED',
  }, 'int-01');

  await interventionService.create({
    projectId: proj3Id,
    bottleneckId: 'btn-02',
    recommendedAction: 'Convene Joint State High-Powered Committee with MoEFCC Principal Chief Conservator of Forests for expedited Section 2 clearance.',
    targetDepartment: 'Ministry of Environment, Forest & Climate Change',
    priority: 'URGENT',
    suggestedEscalationTier: 'CABINET_COMMITTEE',
    status: 'RECOMMENDED',
  }, 'int-02');

  await interventionService.create({
    projectId: proj2Id,
    bottleneckId: 'btn-03',
    recommendedAction: 'Deploy DGPS Joint Survey Mobile Sentinel squad to re-verify North-West boundary pillar coordinates.',
    targetDepartment: 'District Collectorate (Palghar)',
    priority: 'HIGH',
    suggestedEscalationTier: 'DISTRICT_COLLECTOR',
    status: 'RECOMMENDED',
  }, 'int-03');

  // 9. Affected Families & Compensations
  log('Seeding Compensation and PAF Entitlements...');
  await affectedFamilyService.create({
    projectId: proj1Id,
    parcelIds: [parcel1Id],
    headOfFamilyName: 'Smt. Anusaya Pandurang Patil',
    aadharNumberMasked: 'XXXX-XXXX-8821',
    familyMembersCount: 5,
    category: 'OBC',
    bankAccountNumberMasked: 'XXXXXX4092',
    ifscCode: 'SBIN0001244',
    totalCompensationEntitledINR: 27500000,
    totalDisbursedINR: 27500000,
    rrEntitlementStatus: 'ALLOCATED',
  }, 'paf-patil-001');

  await compensationService.create({
    projectId: proj1Id,
    parcelId: parcel1Id,
    affectedFamilyId: 'paf-patil-001',
    basicLandValueINR: 12500000,
    solatiumFactor: 1.0,
    solatiumAmountINR: 12500000,
    assetsValuationINR: 2500000,
    interestAmountINR: 0,
    totalPayableINR: 27500000,
    disbursementStatus: 'CREDITED',
    disbursementDate: '2026-08-28',
    utrTransactionRef: 'PFMS202608289921409',
  }, 'comp-award-001');

  // 10. Statutory Workflow Events (Chronological Updates)
  log('Seeding Real-time Statutory Workflow Timeline...');
  await workflowEventService.create({
    projectId: proj1Id,
    parcelId: parcel1Id,
    stage: 'Award_Disbursement',
    actionTaken: 'Direct DBT / PFMS transmission completed for Parcel 142/A-1 award decree',
    actorId: 'officer-acq-01',
    actorName: 'Shri Vikram Joshi, SDO & CALA',
    actorRole: 'Acquisition Officer',
    comments: 'Full amount ₹2.75 Cr credited to Aadhaar-linked beneficiary account.',
    statusChangeFrom: 'AWARDED',
    statusChangeTo: 'DISBURSED',
    gazetteOrderNo: 'MAH-GAZ-2026-NHSRCL-9901',
  }, 'wf-event-latest');

  await workflowEventService.create({
    projectId: proj3Id,
    stage: 'Sec_11_Gazette',
    actionTaken: 'Section 11(1) Preliminary Gazette Notification published across Varanasi',
    actorId: 'officer-dm-vns',
    actorName: 'District Magistrate (Varanasi)',
    actorRole: 'District Officer',
    comments: '60-day statutory objection window opened under Section 15.',
    statusChangeTo: 'Sec_11_Gazette',
    gazetteOrderNo: 'UP-GAZ-2026-EDFC-0182',
  }, 'wf-event-vns');

  // 11. IoT Devices & Alarms
  log('Seeding Geotechnical & Boundary Telemetry...');
  await iotDeviceService.create({
    deviceId: 'IOT-PILLAR-SN-901',
    projectId: proj1Id,
    deviceType: 'BOUNDARY_INTRUSION_SENSOR',
    location: { lat: 19.6967, lng: 72.7699 },
    batteryPercentage: 94,
    firmwareVersion: 'v2.4.1-bhumi',
    status: 'ONLINE',
    lastHeartbeat: Date.now(),
  }, 'iot-dev-901');

  await iotDeviceService.create({
    deviceId: 'IOT-PILLAR-SN-902',
    projectId: proj3Id,
    deviceType: 'GROUND_STABILITY_MONITOR',
    location: { lat: 25.3176, lng: 82.9739 },
    batteryPercentage: 88,
    firmwareVersion: 'v2.4.1-bhumi',
    status: 'WARNING',
    lastHeartbeat: Date.now() - 600000,
  }, 'iot-dev-902');

  // 12. AI Delay & Risk Predictions
  log('Seeding Machine Learning Predictions...');
  await predictionService.create({
    projectId: proj1Id,
    modelName: 'BhumiShield-Forecaster-v4',
    modelVersion: '4.2.0-rf-xgboost',
    confidenceScore: 0.94,
    predictedDelayDays: 18,
    litigationRiskScore: 24,
    costOverrunRiskPercentage: 4.8,
    factorsContributing: [
      'High compliance with Sec 19 timelines',
      'PFMS direct credit activated',
      '1 pending High Court writ petition under review',
    ],
  }, 'pred-proj1-latest');

  // 13. Officer Workload Balancer Dataset (District Palghar vs District Thane)
  log('Seeding Officer Workload Intelligence Dataset...');
  await officerWorkloadService.create({
    officerUid: 'off-mh-palghar-01',
    officerName: 'Sanjay V. Patil (CALA Palghar)',
    role: 'Acquisition Officer',
    districtId: 'dist-palghar',
    stateId: 'state-mh',
    assignedCases: 48,
    pendingCases: 38,
    completedCases: 10,
    overdueCases: 9,
    averageResolutionDays: 24,
    maxCapacity: 35,
    complexityScore: 4.2,
    calculatedWorkloadScore: calculateOfficerWorkloadScore(38, 9, 4.2, 35),
    isAvailable: false,
  }, 'off-mh-palghar-01');

  await officerWorkloadService.create({
    officerUid: 'off-mh-palghar-02',
    officerName: 'Meera Deshmukh (SDO Palghar)',
    role: 'Acquisition Officer',
    districtId: 'dist-palghar',
    stateId: 'state-mh',
    assignedCases: 42,
    pendingCases: 31,
    completedCases: 11,
    overdueCases: 7,
    averageResolutionDays: 21,
    maxCapacity: 35,
    complexityScore: 3.8,
    calculatedWorkloadScore: calculateOfficerWorkloadScore(31, 7, 3.8, 35),
    isAvailable: false,
  }, 'off-mh-palghar-02');

  await officerWorkloadService.create({
    officerUid: 'off-mh-thane-01',
    officerName: 'Anand R. Shinde (CALA Thane)',
    role: 'Acquisition Officer',
    districtId: 'dist-thane',
    stateId: 'state-mh',
    assignedCases: 18,
    pendingCases: 7,
    completedCases: 11,
    overdueCases: 1,
    averageResolutionDays: 14,
    maxCapacity: 35,
    complexityScore: 2.1,
    calculatedWorkloadScore: calculateOfficerWorkloadScore(7, 1, 2.1, 35),
    isAvailable: true,
  }, 'off-mh-thane-01');

  await officerWorkloadService.create({
    officerUid: 'off-mh-thane-02',
    officerName: 'Pooja Kulkarni (SDO Thane)',
    role: 'Acquisition Officer',
    districtId: 'dist-thane',
    stateId: 'state-mh',
    assignedCases: 16,
    pendingCases: 6,
    completedCases: 10,
    overdueCases: 0,
    averageResolutionDays: 12,
    maxCapacity: 35,
    complexityScore: 2.0,
    calculatedWorkloadScore: calculateOfficerWorkloadScore(6, 0, 2.0, 35),
    isAvailable: true,
  }, 'off-mh-thane-02');

  // 14. Audit Log Chronicle
  log('Recording Immutable Audit Trail for National Command Center...');
  await auditService.logAction({
    targetCollection: 'system',
    targetDocId: 'command-center-seed',
    action: 'CREATE',
    actorId: 'sys-national-controller',
    actorName: 'National Command Center Orchestrator',
    actorRole: 'National Admin',
    diffPayload: { status: 'SYNCHRONIZED', totalStrategicCorridors: 3, statesActive: 5 },
  });

  log('BHUMI-SHIELD National Command Center dataset successfully seeded!');
}
