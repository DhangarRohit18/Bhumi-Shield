import {
  userService,
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
  compensationFairnessService,
  ocrExtractionService,
  fieldVisitService,
  fieldEvidenceService,
  farmerService,
  documentService,
  structureAssetService,
} from '../services/entities.service';
import { auditService } from '../services/audit.service';
import { calculateOfficerWorkloadScore, calculateFairnessIndex } from './intelligenceCalculations';

export async function seedBhumiShieldDemoData(logCallback?: (msg: string) => void) {
  const log = (msg: string) => {
    console.log(`[SEEDER] ${msg}`);
    if (logCallback) logCallback(msg);
  };

  log('Initiating BHUMI-SHIELD National Command Center Dataset Seed...');

  // 0. Official Users & Role Identities
  log('Seeding Official Users & Identity Verification...');
  await userService.create({
    uid: 'user-nat-exec-01',
    displayName: 'Dr. Rajiv Gauba, Cabinet Sec.',
    email: 'rajiv.gauba@nic.in',
    phoneNumber: '+91 11 2301 2345',
    role: 'NATIONAL_EXECUTIVE',
    isActive: true,
    departmentId: 'dept-nhsrcl',
  }, 'user-nat-exec-01');

  await userService.create({
    uid: 'user-sec-rev-01',
    displayName: 'Smt. Sujata Sharma, IAS (Sec. Revenue)',
    email: 'sujata.sharma@maharashtra.gov.in',
    phoneNumber: '+91 22 2202 5411',
    role: 'NATIONAL_EXECUTIVE',
    stateId: 'state-mh',
    isActive: true,
  }, 'user-sec-rev-01');

  await userService.create({
    uid: 'user-dm-palghar',
    displayName: 'Shri Vikram Joshi, IAS (DM & Collector Palghar)',
    email: 'collector.palghar@maharashtra.gov.in',
    phoneNumber: '+91 2525 252100',
    role: 'NATIONAL_EXECUTIVE',
    districtId: 'dist-palghar',
    stateId: 'state-mh',
    isActive: true,
  }, 'user-dm-palghar');

  await userService.create({
    uid: 'user-cala-palghar',
    displayName: 'Shri Sanjay V. Patil (CALA & SDO Palghar)',
    email: 'cala.palghar@maharashtra.gov.in',
    phoneNumber: '+91 2525 252204',
    role: 'FIELD_ACQUISITION',
    districtId: 'dist-palghar',
    stateId: 'state-mh',
    isActive: true,
  }, 'user-cala-palghar');

  await userService.create({
    uid: 'user-cpm-nhsrcl',
    displayName: 'Er. Rajesh Kulkarni (Chief Project Manager NHSRCL)',
    email: 'rajesh.kulkarni@nhsrcl.in',
    phoneNumber: '+91 22 6824 5000',
    role: 'FIELD_ACQUISITION',
    departmentId: 'dept-nhsrcl',
    isActive: true,
  }, 'user-cpm-nhsrcl');

  await userService.create({
    uid: 'user-auditor-cag',
    displayName: 'Smt. Nandini Sundaram (Senior Audit Officer CAG)',
    email: 'nandini.sundaram@cag.gov.in',
    phoneNumber: '+91 11 2323 5432',
    role: 'AUDIT_CITIZEN',
    isActive: true,
  }, 'user-auditor-cag');

  await userService.create({
    uid: 'user-citizen-paf',
    displayName: 'Smt. Anusaya Pandurang Patil (PAF Landowner)',
    email: 'anusaya.patil@kisanmail.in',
    phoneNumber: '+91 98230 44092',
    role: 'AUDIT_CITIZEN',
    districtId: 'dist-palghar',
    stateId: 'state-mh',
    isActive: true,
  }, 'user-citizen-paf');

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

  // 6. Cadastral Land Parcels across All Strategic National Corridors
  log('Seeding Comprehensive Pan-India Cadastral Land Parcels...');
  
  // MAHSR Corridor (Mumbai - Ahmedabad)
  await parcelService.create({
    projectId: proj1Id,
    villageId: 'vil-manikpur',
    khasraSurveyNo: '12/A-BKC',
    ulpin: 'ULPIN-MH-12ABKC-2026',
    areaAcres: 3.80,
    landClassification: 'Commercial',
    estimatedMarketValueINR: 48000000,
    calculatedSolatiumINR: 48000000,
    totalCompensationINR: 105600000,
    status: 'AWARDED',
    qrAssetId: 'QR-PIL-MH-0012',
    geoCenter: { lat: 19.0760, lng: 72.8777 },
    environmentalConflict: { conflictType: 'NONE', severity: 'LOW', overlapAreaAcres: 0, clearanceStatus: 'CLEARED' },
    satelliteObservation: { lastPassDate: '2026-09-05', radarBackscatterDb: -12.4, insarDisplacementMmPerYr: -0.2, possessionVerified: true, encroachmentDetected: false },
  }, 'pcl-mum-0012');

  await parcelService.create({
    projectId: proj1Id,
    villageId: 'vil-manikpur',
    khasraSurveyNo: '512/3-THN',
    ulpin: 'ULPIN-MH-5123THN-2026',
    areaAcres: 2.10,
    landClassification: 'Residential',
    estimatedMarketValueINR: 22000000,
    calculatedSolatiumINR: 22000000,
    totalCompensationINR: 48400000,
    status: 'NOTIFIED',
    qrAssetId: 'QR-PIL-MH-0512',
    geoCenter: { lat: 19.2183, lng: 72.9781 },
    environmentalConflict: { conflictType: 'CRZ_WETLAND', severity: 'MEDIUM', overlapAreaAcres: 0.4, clearanceStatus: 'IN_PROGRESS' },
    satelliteObservation: { lastPassDate: '2026-09-04', radarBackscatterDb: -15.1, insarDisplacementMmPerYr: -0.6, possessionVerified: false, encroachmentDetected: false },
  }, 'pcl-thn-0512');

  await parcelService.create({
    projectId: proj1Id,
    villageId: 'vil-manikpur',
    khasraSurveyNo: '142/A-1',
    ulpin: 'ULPIN-MH-142A1-2026',
    areaAcres: 2.45,
    landClassification: 'Agricultural',
    estimatedMarketValueINR: 12500000,
    calculatedSolatiumINR: 12500000,
    totalCompensationINR: 27500000,
    status: 'AWARDED',
    qrAssetId: 'QR-PIL-MH-0921',
    geoCenter: { lat: 19.6967, lng: 72.7699 },
    environmentalConflict: { conflictType: 'NONE', severity: 'LOW', overlapAreaAcres: 0, clearanceStatus: 'CLEARED' },
    satelliteObservation: { lastPassDate: '2026-09-06', radarBackscatterDb: -14.2, insarDisplacementMmPerYr: -0.8, possessionVerified: true, encroachmentDetected: false },
  }, 'pcl-pal-0142');

  await parcelService.create({
    projectId: proj1Id,
    villageId: 'vil-kelve',
    khasraSurveyNo: '143/2-B',
    ulpin: 'ULPIN-MH-1432B-2026',
    areaAcres: 1.15,
    landClassification: 'Residential',
    estimatedMarketValueINR: 8900000,
    calculatedSolatiumINR: 8900000,
    totalCompensationINR: 19580000,
    status: 'NOTIFIED',
    qrAssetId: 'QR-PIL-MH-0922',
    geoCenter: { lat: 19.6200, lng: 72.7400 },
    environmentalConflict: { conflictType: 'RESERVED_FOREST', severity: 'BLOCKING', overlapAreaAcres: 0.8, clearanceStatus: 'PENDING' },
    satelliteObservation: { lastPassDate: '2026-09-02', radarBackscatterDb: -18.2, insarDisplacementMmPerYr: -1.2, possessionVerified: false, encroachmentDetected: true },
  }, 'pcl-pal-0143');

  await parcelService.create({
    projectId: proj1Id,
    villageId: 'vil-manikpur',
    khasraSurveyNo: '88/B-VAPI',
    areaAcres: 3.10,
    landClassification: 'Commercial',
    estimatedMarketValueINR: 18500000,
    calculatedSolatiumINR: 18500000,
    totalCompensationINR: 40700000,
    status: 'NOTIFIED',
    qrAssetId: 'QR-PIL-GJ-0088',
    geoCenter: { lat: 20.3893, lng: 72.9106 },
  }, 'pcl-vapi-0088');

  await parcelService.create({
    projectId: proj1Id,
    villageId: 'vil-manikpur',
    khasraSurveyNo: '204/C-SRT',
    areaAcres: 5.40,
    landClassification: 'Commercial',
    estimatedMarketValueINR: 36000000,
    calculatedSolatiumINR: 36000000,
    totalCompensationINR: 79200000,
    status: 'AWARDED',
    qrAssetId: 'QR-PIL-GJ-0204',
    geoCenter: { lat: 21.1702, lng: 72.8311 },
  }, 'pcl-srt-0204');

  await parcelService.create({
    projectId: proj1Id,
    villageId: 'vil-manikpur',
    khasraSurveyNo: '312/1-VAD',
    areaAcres: 4.60,
    landClassification: 'Agricultural',
    estimatedMarketValueINR: 24000000,
    calculatedSolatiumINR: 24000000,
    totalCompensationINR: 52800000,
    status: 'AWARDED',
    qrAssetId: 'QR-PIL-GJ-0312',
    geoCenter: { lat: 22.3072, lng: 73.1812 },
  }, 'pcl-vad-0312');

  await parcelService.create({
    projectId: proj1Id,
    villageId: 'vil-manikpur',
    khasraSurveyNo: '401/P-AHM',
    areaAcres: 6.20,
    landClassification: 'Commercial',
    estimatedMarketValueINR: 52000000,
    calculatedSolatiumINR: 52000000,
    totalCompensationINR: 114400000,
    status: 'POSSESSED',
    qrAssetId: 'QR-PIL-GJ-0401',
    geoCenter: { lat: 23.0225, lng: 72.5714 },
  }, 'pcl-ahm-0401');

  // Delhi-Mumbai Expressway Corridor
  await parcelService.create({
    projectId: proj2Id,
    villageId: 'vil-manikpur',
    khasraSurveyNo: '11/DND-DEL',
    areaAcres: 4.80,
    landClassification: 'Commercial',
    estimatedMarketValueINR: 64000000,
    calculatedSolatiumINR: 64000000,
    totalCompensationINR: 140800000,
    status: 'POSSESSED',
    qrAssetId: 'QR-PIL-DL-0011',
    geoCenter: { lat: 28.6139, lng: 77.2090 },
  }, 'pcl-del-0011');

  await parcelService.create({
    projectId: proj2Id,
    villageId: 'vil-manikpur',
    khasraSurveyNo: '77/D-GGN',
    areaAcres: 3.50,
    landClassification: 'Agricultural',
    estimatedMarketValueINR: 28000000,
    calculatedSolatiumINR: 28000000,
    totalCompensationINR: 61600000,
    status: 'NOTIFIED',
    qrAssetId: 'QR-PIL-HR-0077',
    geoCenter: { lat: 28.2500, lng: 77.0600 },
  }, 'pcl-ggn-0077');

  await parcelService.create({
    projectId: proj2Id,
    villageId: 'vil-manikpur',
    khasraSurveyNo: '119/2-JPR',
    areaAcres: 5.10,
    landClassification: 'Agricultural',
    estimatedMarketValueINR: 19000000,
    calculatedSolatiumINR: 19000000,
    totalCompensationINR: 41800000,
    status: 'AWARDED',
    qrAssetId: 'QR-PIL-RJ-0119',
    geoCenter: { lat: 26.8900, lng: 76.3300 },
  }, 'pcl-jpr-0119');

  await parcelService.create({
    projectId: proj2Id,
    villageId: 'vil-manikpur',
    khasraSurveyNo: '605/A-KTA',
    areaAcres: 4.40,
    landClassification: 'Agricultural',
    estimatedMarketValueINR: 17500000,
    calculatedSolatiumINR: 17500000,
    totalCompensationINR: 38500000,
    status: 'NOTIFIED',
    qrAssetId: 'QR-PIL-RJ-0605',
    geoCenter: { lat: 25.1852, lng: 75.8364 },
  }, 'pcl-kta-0605');

  await parcelService.create({
    projectId: proj2Id,
    villageId: 'vil-manikpur',
    khasraSurveyNo: '220/1-RTM',
    areaAcres: 3.90,
    landClassification: 'Agricultural',
    estimatedMarketValueINR: 14000000,
    calculatedSolatiumINR: 14000000,
    totalCompensationINR: 30800000,
    status: 'IDENTIFIED',
    qrAssetId: 'QR-PIL-MP-0220',
    geoCenter: { lat: 23.3315, lng: 75.0367 },
  }, 'pcl-rtm-0220');

  // Eastern Dedicated Freight Corridor (EDFC)
  await parcelService.create({
    projectId: proj3Id,
    villageId: 'vil-rohania',
    khasraSurveyNo: '55/A-KHJ',
    areaAcres: 3.20,
    landClassification: 'Agricultural',
    estimatedMarketValueINR: 15000000,
    calculatedSolatiumINR: 15000000,
    totalCompensationINR: 33000000,
    status: 'AWARDED',
    qrAssetId: 'QR-PIL-UP-0055',
    geoCenter: { lat: 28.2500, lng: 77.8500 },
  }, 'pcl-khj-0055');

  await parcelService.create({
    projectId: proj3Id,
    villageId: 'vil-rohania',
    khasraSurveyNo: '91/C-TDL',
    areaAcres: 2.80,
    landClassification: 'Agricultural',
    estimatedMarketValueINR: 13500000,
    calculatedSolatiumINR: 13500000,
    totalCompensationINR: 29700000,
    status: 'NOTIFIED',
    qrAssetId: 'QR-PIL-UP-0091',
    geoCenter: { lat: 27.2000, lng: 78.2300 },
  }, 'pcl-tdl-0091');

  await parcelService.create({
    projectId: proj3Id,
    villageId: 'vil-rohania',
    khasraSurveyNo: '712/4-KNP',
    areaAcres: 5.60,
    landClassification: 'Commercial',
    estimatedMarketValueINR: 32000000,
    calculatedSolatiumINR: 32000000,
    totalCompensationINR: 70400000,
    status: 'NOTIFIED',
    qrAssetId: 'QR-PIL-UP-0712',
    geoCenter: { lat: 26.4499, lng: 80.3319 },
  }, 'pcl-knp-0712');

  await parcelService.create({
    projectId: proj3Id,
    villageId: 'vil-rohania',
    khasraSurveyNo: '415/2-PRY',
    areaAcres: 4.10,
    landClassification: 'Agricultural',
    estimatedMarketValueINR: 18000000,
    calculatedSolatiumINR: 18000000,
    totalCompensationINR: 39600000,
    status: 'IDENTIFIED',
    qrAssetId: 'QR-PIL-UP-0415',
    geoCenter: { lat: 25.4358, lng: 81.8463 },
  }, 'pcl-pry-0415');

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
  }, 'pcl-vns-0881');

  await parcelService.create({
    projectId: proj3Id,
    villageId: 'vil-rohania',
    khasraSurveyNo: '102/B-SON',
    areaAcres: 3.70,
    landClassification: 'Agricultural',
    estimatedMarketValueINR: 12000000,
    calculatedSolatiumINR: 12000000,
    totalCompensationINR: 26400000,
    status: 'AWARDED',
    qrAssetId: 'QR-PIL-BR-0102',
    geoCenter: { lat: 24.7955, lng: 85.0002 },
  }, 'pcl-son-0102');

  // Seed Legal Cases for realistic litigation hotspots
  await legalCaseService.create({
    projectId: proj1Id,
    parcelId: 'pcl-thn-0512',
    caseNumber: 'WP/MH/2026/102',
    courtName: 'Bombay High Court',
    litigantName: 'Thane Farmers Landowners Welfare Assoc.',
    advocateName: 'Adv. S. K. Deshmukh',
    natureOfDispute: 'ENHANCEMENT_CLAIM',
    stayGranted: true,
    nextHearingDate: '2026-09-24',
    status: 'PENDING',
  }, 'case-thn-102');

  await legalCaseService.create({
    projectId: proj2Id,
    parcelId: 'pcl-kta-0605',
    caseNumber: 'WP/RJ/2026/441',
    courtName: 'Rajasthan High Court (Jaipur Bench)',
    litigantName: 'Chambal Agro Landholders Society',
    advocateName: 'Adv. R. N. Sharma',
    natureOfDispute: 'PROCEDURAL_CHALLENGE',
    stayGranted: true,
    nextHearingDate: '2026-09-30',
    status: 'PENDING',
  }, 'case-kta-441');

  await legalCaseService.create({
    projectId: proj3Id,
    parcelId: 'pcl-tdl-0091',
    caseNumber: 'WP/UP/2026/889',
    courtName: 'Allahabad High Court',
    litigantName: 'Tundla Gram Panchayat Sangh',
    advocateName: 'Adv. M. P. Singh',
    natureOfDispute: 'STAY_PETITION',
    stayGranted: true,
    nextHearingDate: '2026-10-12',
    status: 'PENDING',
  }, 'case-tdl-889');

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
    parcelIds: ['pcl-pal-0142'],
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
    parcelId: 'pcl-pal-0142',
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
    parcelId: 'pcl-pal-0142',
    stage: 'Award_Disbursement',
    actionTaken: 'Direct DBT / PFMS transmission completed for Parcel 142/A-1 award decree',
    actorId: 'officer-acq-01',
    actorName: 'Shri Vikram Joshi, SDO & CALA',
    actorRole: 'FIELD_ACQUISITION',
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
    actorRole: 'NATIONAL_EXECUTIVE',
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
    role: 'FIELD_ACQUISITION',
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
    role: 'FIELD_ACQUISITION',
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
    role: 'FIELD_ACQUISITION',
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
    role: 'FIELD_ACQUISITION',
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

  // 14. Compensation Fairness Intelligence
  log('Seeding Compensation Fairness Analysis...');
  const fairness1 = calculateFairnessIndex(4500000, 1800000, 2100000);
  await compensationFairnessService.create({
    compensationAwardId: 'comp-palghar-01',
    parcelId: 'parcel-palghar-01',
    fairnessScore: fairness1.score,
    awardedValueINR: 4500000,
    circleRateINR: 1800000,
    surroundingAvgTransactionINR: 2100000,
    aiExplanation: fairness1.explanation,
    riskLevel: fairness1.riskLevel,
  }, 'fairness-palghar-01');

  const fairness2 = calculateFairnessIndex(12000000, 1500000, 2000000); // Intentionally high risk
  await compensationFairnessService.create({
    compensationAwardId: 'comp-palghar-02',
    parcelId: 'parcel-palghar-02',
    fairnessScore: fairness2.score,
    awardedValueINR: 12000000,
    circleRateINR: 1500000,
    surroundingAvgTransactionINR: 2000000,
    aiExplanation: fairness2.explanation,
    riskLevel: fairness2.riskLevel,
  }, 'fairness-palghar-02');

  // 14.5 Statutory Documents & Gazettes
  log('Seeding Statutory Gazette Documents...');
  await documentService.create({
    projectId: proj1Id,
    title: 'Section 19(1) Final Declaration Gazette - Palghar District',
    documentType: 'GAZETTE_SEC_19',
    currentVersionNo: 1,
    currentDownloadUrl: 'https://bhumishield.gov.in/gazettes/sec19_palghar_2026.pdf',
    fileSizeBytes: 2840120,
    sha256Checksum: 'SHA256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    isDeleted: false,
  }, 'doc-gazette-sec19-palghar');

  await documentService.create({
    projectId: proj1Id,
    title: 'SIA Final Report - High Speed Rail Package 3',
    documentType: 'SIA_REPORT',
    currentVersionNo: 2,
    currentDownloadUrl: 'https://bhumishield.gov.in/reports/sia_nhsrcl_pkg3_v2.pdf',
    fileSizeBytes: 14501230,
    sha256Checksum: 'SHA256_8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
    isDeleted: false,
  }, 'doc-sia-pkg3');

  // 15. OCR & NLP Document Extraction Pipeline
  log('Seeding OCR/NLP Document Extractions...');
  await ocrExtractionService.create({
    documentId: 'doc-gazette-sec19-palghar',
    projectId: proj1Id,
    status: 'COMPLETED',
    extractedData: {
      khasraNumber: '142/A-1',
      ownerName: 'Shri Eknath M. Patil',
      areaValue: '0.85',
      areaUnit: 'Hectares',
      gazetteDate: '2025-02-14',
      surveyNumber: '114/A',
      landClassification: 'Agricultural',
    },
    confidenceScores: {
      khasraNumber: 0.98,
      ownerName: 0.96,
      areaValue: 0.92,
      gazetteDate: 0.88,
    },
    humanVerified: true,
  }, 'ocr-712-palghar-001');

  // 15.5 Compensation Awards
  log('Seeding Compensation Data...');
  await compensationService.create({
    projectId: proj1Id,
    parcelId: 'pcl-mum-0012',
    affectedFamilyId: 'paf-patil-001',
    basicLandValueINR: 12000000,
    solatiumFactor: 1.0,
    solatiumAmountINR: 12000000,
    assetsValuationINR: 700000,
    interestAmountINR: 0,
    totalPayableINR: 24700000,
    disbursementStatus: 'CREDITED',
    disbursementDate: '2026-08-15',
    utrTransactionRef: 'PFMS202608157890123',
  }, 'comp-palghar-001');

  await compensationService.create({
    projectId: proj1Id,
    parcelId: 'pcl-pal-0143',
    affectedFamilyId: 'paf-patil-001',
    basicLandValueINR: 8000000,
    solatiumFactor: 1.0,
    solatiumAmountINR: 8000000,
    assetsValuationINR: 0,
    interestAmountINR: 0,
    totalPayableINR: 16000000,
    disbursementStatus: 'APPROVED',
  }, 'comp-palghar-002');

  // 15.6 Officer Workloads - extra district entries (Varanasi/EDFC)
  log('Seeding Additional Officer Workload Data...');
  await officerWorkloadService.create({
    officerUid: 'off-up-varanasi-01',
    officerName: 'Shri Manish Kumar Yadav (SDO Varanasi)',
    role: 'FIELD_ACQUISITION',
    districtId: 'dist-varanasi',
    stateId: 'state-up',
    assignedCases: 55,
    pendingCases: 41,
    completedCases: 14,
    overdueCases: 11,
    averageResolutionDays: 31,
    maxCapacity: 35,
    complexityScore: 4.8,
    calculatedWorkloadScore: calculateOfficerWorkloadScore(41, 11, 4.8, 35),
    isAvailable: false,
  }, 'off-up-varanasi-01');

  // 15.7 Structural Assets (Land with House)
  log('Seeding Structural Asset Data...');
  await structureAssetService.create({
    projectId: proj1Id,
    parcelId: 'pcl-mum-0012',
    farmerName: 'Shri Eknath M. Patil',
    structureType: 'PUCCA_HOUSE',
    builtUpAreaSqFt: 1200,
    assessedValueINR: 1800000, // 1200 * 1500
  }, 'structure-mum-001');

  await structureAssetService.create({
    projectId: proj1Id,
    parcelId: 'ULPIN-MH-983UM-2026',
    farmerName: 'Smt. Parvatibai Tukaram Gavit',
    structureType: 'KUTCHA_HOUSE',
    builtUpAreaSqFt: 600,
    assessedValueINR: 480000, // 600 * 800
  }, 'structure-pal-002');

  // 16. Field Reality Verification Visits & Ground Evidence
  log('Seeding General-Purpose Field Operator Verification Records...');
  await fieldVisitService.create({
    projectId: proj1Id,
    villageId: 'vil-manikpur',
    parcelIds: ['pcl-pal-0142'],
    ulpinList: ['ULPIN-MH-142A1-2026'],
    scheduledDate: '2026-09-07',
    supervisorId: 'user-cala-palghar',
    fieldOfficerIds: ['off-mh-palghar-01'],
    purpose: 'GROUND_VERIFICATION',
    status: 'COMPLETED',
    verificationStatus: 'VERIFIED',
    verificationConfidenceScore: 96,
    checklist: {
      ulpinVerified: true,
      surveyGatVerified: true,
      hissaVerified: true,
      ownershipChecked: true,
      jointHoldersChecked: true,
      occupancyChecked: true,
      areaChecked: true,
      boundaryChecked: true,
      accessChecked: true,
      structuresChecked: true,
      utilitiesChecked: true,
      encroachmentChecked: true,
      rightsClaimsChecked: true,
      disputesChecked: true,
      documentsChecked: true,
      evidenceComplete: true,
    },
    observations: [],
    supervisorReview: {
      reviewedByUid: 'user-cala-palghar',
      reviewedByName: 'Shri Sanjay V. Patil (CALA & SDO)',
      decision: 'APPROVE',
      remarks: 'DGPS boundary pillars match authoritative 7/12 land record. 100% boundary coherence confirmed.',
      reviewedAt: Date.now() - 86400000,
    },
    completionReport: 'Ground verification complete for Khasra 142/A-1. All 4 boundary pillars locked within ±1.4 cm RTK accuracy.',
  }, 'visit-palghar-0142');

  await fieldEvidenceService.create({
    projectId: proj1Id,
    parcelId: 'pcl-pal-0142',
    ulpin: 'ULPIN-MH-142A1-2026',
    visitId: 'visit-palghar-0142',
    caseId: 'CASE-PAL-142',
    evidenceType: 'PHOTO_GEOTAGGED',
    downloadUrl: '/bhumi-shield-ar-sentinel-v1.0.apk',
    gpsCoordinates: { lat: 19.6967, lng: 72.7699, altitude: 14.2 },
    accuracyMeters: 1.4,
    capturedByOfficerName: 'Ramesh V. More (Field Operator)',
    capturedByOfficerUid: 'off-mh-palghar-01',
    tamperProofHash: 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    notes: 'North-East demarcation pillar installed and verified with landowner Smt. Anusaya Patil present.',
  }, 'evid-palghar-0142');

  // Mismatch / Review-Required Field Verification Case
  await fieldVisitService.create({
    projectId: proj1Id,
    villageId: 'vil-kelve',
    parcelIds: ['pcl-pal-0143'],
    ulpinList: ['ULPIN-MH-1432B-2026'],
    scheduledDate: '2026-09-08',
    supervisorId: 'user-cala-palghar',
    fieldOfficerIds: ['off-mh-palghar-02'],
    purpose: 'BOUNDARY_DEMARCATION',
    status: 'IN_PROGRESS',
    verificationStatus: 'REVIEW_REQUIRED',
    verificationConfidenceScore: 48,
    checklist: {
      ulpinVerified: true,
      surveyGatVerified: true,
      hissaVerified: true,
      ownershipChecked: false,
      jointHoldersChecked: false,
      occupancyChecked: false,
      areaChecked: true,
      boundaryChecked: false,
      accessChecked: true,
      structuresChecked: false,
      utilitiesChecked: true,
      encroachmentChecked: false,
      rightsClaimsChecked: false,
      disputesChecked: false,
      documentsChecked: true,
      evidenceComplete: false,
    },
    observations: [
      {
        id: 'obs-01',
        type: 'STRUCTURE_FOUND',
        description: 'Unrecorded tin shed dwelling erected post-Section 11 notification.',
        expectedValue: 'Vacant Residential Land',
        actualValue: '1x Tin Shed (Commercial tea stall)',
        severity: 'CRITICAL',
        gpsCoordinates: { lat: 19.6200, lng: 72.7400, accuracyMeters: 2.1 },
        evidenceIds: ['evid-palghar-0143'],
        operatorUid: 'off-mh-palghar-02',
        timestamp: Date.now() - 3600000,
      },
      {
        id: 'obs-02',
        type: 'OWNER_MISMATCH',
        description: 'Occupant claimed unregistered succession partition not entered in revenue records.',
        expectedValue: 'Shri Keshav Patil (Single Holder)',
        actualValue: '3x Legal Heirs in physical occupation',
        severity: 'WARNING',
        evidenceIds: ['evid-palghar-0143'],
        operatorUid: 'off-mh-palghar-02',
        timestamp: Date.now() - 3400000,
      }
    ],
    completionReport: 'Ground reality mismatch identified. Encroachment and succession partition disputes require SDM review before award decree.',
  }, 'visit-palghar-0143');

  // 17. Krishi Sathi - Comprehensive Farmer Land Records (10 Farmers)
  log('Seeding 10 Comprehensive Krishi Sathi Farmer Land Records & Spatial Polygons...');
  
  // 1. Shri Dattatray B. Patil (Palghar, MH)
  await farmerService.create({
    farmerName: 'Shri Dattatray B. Patil',
    contactNumber: '+91 98231 44521',
    aadhaarMasked: 'XXXX-XXXX-8821',
    state: 'Maharashtra',
    district: 'Palghar',
    talukaTehsil: 'Palghar',
    village: 'Manikpur',
    khataNumber: 'Khata-892',
    surveyGatNumber: '142/A-1',
    hissaNumber: 'Hissa-1',
    ulpin: 'ULPIN-MH-142A1-2026',
    totalLandAreaAcres: 3.45,
    acquiredAreaAcres: 2.45,
    retainedAreaAcres: 1.00,
    landClassification: 'Agricultural',
    soilType: 'Alluvial Loam / Fertile Coastal Plain',
    tenureType: 'Occupant Class I (Freehold Khatedar)',
    jointHolders: [
      { name: 'Smt. Anusaya D. Patil', shareFraction: '1/2', relation: 'Wife' },
      { name: 'Shri Rajesh D. Patil', shareFraction: '1/2', relation: 'Son' }
    ],
    estimatedValuationINR: 12500000,
    solatiumINR: 12500000,
    totalCompensationINR: 27500000,
    disbursementStatus: 'DISBURSED',
    bankDetails: {
      bankName: 'State Bank of India (Palghar Branch)',
      accountMasked: 'XXXXXX4092',
      ifsc: 'SBIN0001244',
    },
    dgpsPillars: [
      { pillarId: 'PIL-142-NW', lat: 19.6975, lng: 72.7690, rtkAccuracyCm: 1.4 },
      { pillarId: 'PIL-142-NE', lat: 19.6976, lng: 72.7710, rtkAccuracyCm: 1.2 },
      { pillarId: 'PIL-142-SE', lat: 19.6958, lng: 72.7712, rtkAccuracyCm: 1.6 },
      { pillarId: 'PIL-142-SW', lat: 19.6957, lng: 72.7691, rtkAccuracyCm: 1.3 },
    ],
    boundaryPolygon: [
      { lat: 19.6975, lng: 72.7690 },
      { lat: 19.6976, lng: 72.7710 },
      { lat: 19.6958, lng: 72.7712 },
      { lat: 19.6957, lng: 72.7691 },
    ],
    qrPasscode: 'QR-KS-MH-142A1',
    arVerificationStatus: 'VERIFIED',
  }, 'farmer-palghar-001');

  // 2. Smt. Shakuntala Ramdas Mhatre (Kelve, MH)
  await farmerService.create({
    farmerName: 'Smt. Shakuntala Ramdas Mhatre',
    contactNumber: '+91 97654 11209',
    aadhaarMasked: 'XXXX-XXXX-3419',
    state: 'Maharashtra',
    district: 'Palghar',
    talukaTehsil: 'Palghar',
    village: 'Kelve',
    khataNumber: 'Khata-104',
    surveyGatNumber: '143/2-B',
    hissaNumber: 'Hissa-2B',
    ulpin: 'ULPIN-MH-1432B-2026',
    totalLandAreaAcres: 4.10,
    acquiredAreaAcres: 3.10,
    retainedAreaAcres: 1.00,
    landClassification: 'Agricultural',
    soilType: 'Red Laterite Coastal Soil',
    tenureType: 'Occupant Class I (Ancestral Sole)',
    jointHolders: [
      { name: 'Shri Vinayak R. Mhatre', shareFraction: '1/1', relation: 'Son & Legal Heir' }
    ],
    estimatedValuationINR: 15500000,
    solatiumINR: 15500000,
    totalCompensationINR: 34100000,
    disbursementStatus: 'IN_PROGRESS',
    bankDetails: {
      bankName: 'Bank of Baroda (Kelve Road)',
      accountMasked: 'XXXXXX9823',
      ifsc: 'BARB0KELVEX',
    },
    dgpsPillars: [
      { pillarId: 'PIL-143-N', lat: 19.6212, lng: 72.7392, rtkAccuracyCm: 2.1 },
      { pillarId: 'PIL-143-E', lat: 19.6215, lng: 72.7415, rtkAccuracyCm: 2.4 },
      { pillarId: 'PIL-143-S', lat: 19.6190, lng: 72.7418, rtkAccuracyCm: 1.9 },
      { pillarId: 'PIL-143-W', lat: 19.6188, lng: 72.7390, rtkAccuracyCm: 2.0 },
    ],
    boundaryPolygon: [
      { lat: 19.6212, lng: 72.7392 },
      { lat: 19.6215, lng: 72.7415 },
      { lat: 19.6190, lng: 72.7418 },
      { lat: 19.6188, lng: 72.7390 },
    ],
    qrPasscode: 'QR-KS-MH-1432B',
    arVerificationStatus: 'FLAGGED_MISMATCH',
  }, 'farmer-palghar-002');

  // 3. Shri Arvindbhai Shankarbhai Patel (Surat, GJ)
  await farmerService.create({
    farmerName: 'Shri Arvindbhai Shankarbhai Patel',
    contactNumber: '+91 98982 77610',
    aadhaarMasked: 'XXXX-XXXX-9901',
    state: 'Gujarat',
    district: 'Surat',
    talukaTehsil: 'Choryasi',
    village: 'Sachin',
    khataNumber: 'Khata-412',
    surveyGatNumber: '204/1',
    hissaNumber: 'Hissa-A',
    ulpin: 'ULPIN-GJ-2041A-2026',
    totalLandAreaAcres: 5.80,
    acquiredAreaAcres: 5.20,
    retainedAreaAcres: 0.60,
    landClassification: 'Agricultural',
    soilType: 'Black Cotton Heavy Clay Soil',
    tenureType: 'Occupant Class I (Freehold)',
    jointHolders: [
      { name: 'Shri Bhaveshbhai A. Patel', shareFraction: '1/2', relation: 'Son' },
      { name: 'Shri Hiteshbhai A. Patel', shareFraction: '1/2', relation: 'Son' }
    ],
    estimatedValuationINR: 31000000,
    solatiumINR: 31000000,
    totalCompensationINR: 68200000,
    disbursementStatus: 'DISBURSED',
    bankDetails: {
      bankName: 'HDFC Bank (Surat Ring Road)',
      accountMasked: 'XXXXXX5512',
      ifsc: 'HDFC0000067',
    },
    dgpsPillars: [
      { pillarId: 'PIL-SRT-01', lat: 21.1710, lng: 72.8300, rtkAccuracyCm: 1.1 },
      { pillarId: 'PIL-SRT-02', lat: 21.1718, lng: 72.8335, rtkAccuracyCm: 0.9 },
      { pillarId: 'PIL-SRT-03', lat: 21.1690, lng: 72.8339, rtkAccuracyCm: 1.2 },
      { pillarId: 'PIL-SRT-04', lat: 21.1685, lng: 72.8305, rtkAccuracyCm: 1.0 },
    ],
    boundaryPolygon: [
      { lat: 21.1710, lng: 72.8300 },
      { lat: 21.1718, lng: 72.8335 },
      { lat: 21.1690, lng: 72.8339 },
      { lat: 21.1685, lng: 72.8305 },
    ],
    qrPasscode: 'QR-KS-GJ-2041A',
    arVerificationStatus: 'VERIFIED',
  }, 'farmer-surat-003');

  // 4. Shri Jagdishprasad R. Sharma (Jaipur, RJ)
  await farmerService.create({
    farmerName: 'Shri Jagdishprasad R. Sharma',
    contactNumber: '+91 94140 22891',
    aadhaarMasked: 'XXXX-XXXX-6612',
    state: 'Rajasthan',
    district: 'Jaipur',
    talukaTehsil: 'Bassi',
    village: 'Bassi Rural',
    khataNumber: 'Khata-771',
    surveyGatNumber: '119/2',
    hissaNumber: 'Hissa-3',
    ulpin: 'ULPIN-RJ-1192J-2026',
    totalLandAreaAcres: 6.20,
    acquiredAreaAcres: 5.10,
    retainedAreaAcres: 1.10,
    landClassification: 'Agricultural',
    soilType: 'Sandy Loam Semiarid Soil',
    tenureType: 'Khatedar Tenant (Permanent)',
    jointHolders: [
      { name: 'Smt. Murti Devi Sharma', shareFraction: '1/3', relation: 'Wife' },
      { name: 'Shri Mukesh Sharma', shareFraction: '2/3', relation: 'Son' }
    ],
    estimatedValuationINR: 19000000,
    solatiumINR: 19000000,
    totalCompensationINR: 41800000,
    disbursementStatus: 'DISBURSED',
    bankDetails: {
      bankName: 'Punjab National Bank (Jaipur Bassi)',
      accountMasked: 'XXXXXX1902',
      ifsc: 'PUNB0024400',
    },
    dgpsPillars: [
      { pillarId: 'PIL-JPR-01', lat: 26.8915, lng: 76.3285, rtkAccuracyCm: 1.5 },
      { pillarId: 'PIL-JPR-02', lat: 26.8920, lng: 76.3325, rtkAccuracyCm: 1.3 },
      { pillarId: 'PIL-JPR-03', lat: 26.8885, lng: 76.3330, rtkAccuracyCm: 1.7 },
      { pillarId: 'PIL-JPR-04', lat: 26.8880, lng: 76.3288, rtkAccuracyCm: 1.4 },
    ],
    boundaryPolygon: [
      { lat: 26.8915, lng: 76.3285 },
      { lat: 26.8920, lng: 76.3325 },
      { lat: 26.8885, lng: 76.3330 },
      { lat: 26.8880, lng: 76.3288 },
    ],
    qrPasscode: 'QR-KS-RJ-1192J',
    arVerificationStatus: 'VERIFIED',
  }, 'farmer-jaipur-004');

  // 5. Shri Ramakant S. Mishra (Varanasi, UP)
  await farmerService.create({
    farmerName: 'Shri Ramakant S. Mishra',
    contactNumber: '+91 94500 88231',
    aadhaarMasked: 'XXXX-XXXX-1144',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    talukaTehsil: 'Pindra',
    village: 'Rohania',
    khataNumber: 'Khata-512',
    surveyGatNumber: '881/P-4',
    hissaNumber: 'Hissa-4',
    ulpin: 'ULPIN-UP-881P4-2026',
    totalLandAreaAcres: 4.50,
    acquiredAreaAcres: 4.20,
    retainedAreaAcres: 0.30,
    landClassification: 'Agricultural',
    soilType: 'Gangetic Alluvial Silt Soil',
    tenureType: 'Bhumidhar with Transferable Rights',
    jointHolders: [
      { name: 'Shri Govind R. Mishra', shareFraction: '1/2', relation: 'Brother' },
      { name: 'Shri Shyam R. Mishra', shareFraction: '1/2', relation: 'Brother' }
    ],
    estimatedValuationINR: 16000000,
    solatiumINR: 16000000,
    totalCompensationINR: 35200000,
    disbursementStatus: 'IN_PROGRESS',
    bankDetails: {
      bankName: 'Union Bank of India (Varanasi Cantonment)',
      accountMasked: 'XXXXXX7732',
      ifsc: 'UBIN0530182',
    },
    dgpsPillars: [
      { pillarId: 'PIL-VNS-01', lat: 25.3188, lng: 82.9715, rtkAccuracyCm: 1.8 },
      { pillarId: 'PIL-VNS-02', lat: 25.3195, lng: 82.9755, rtkAccuracyCm: 1.4 },
      { pillarId: 'PIL-VNS-03', lat: 25.3160, lng: 82.9760, rtkAccuracyCm: 1.9 },
      { pillarId: 'PIL-VNS-04', lat: 25.3155, lng: 82.9718, rtkAccuracyCm: 1.6 },
    ],
    boundaryPolygon: [
      { lat: 25.3188, lng: 82.9715 },
      { lat: 25.3195, lng: 82.9755 },
      { lat: 25.3160, lng: 82.9760 },
      { lat: 25.3155, lng: 82.9718 },
    ],
    qrPasscode: 'QR-KS-UP-881P4',
    arVerificationStatus: 'PENDING_VISIT',
  }, 'farmer-varanasi-005');

  // 6. Smt. Kaushalya Devi Yadav (Prayagraj, UP)
  await farmerService.create({
    farmerName: 'Smt. Kaushalya Devi Yadav',
    contactNumber: '+91 94152 66718',
    aadhaarMasked: 'XXXX-XXXX-4523',
    state: 'Uttar Pradesh',
    district: 'Prayagraj',
    talukaTehsil: 'Soraon',
    village: 'Mau Aima',
    khataNumber: 'Khata-328',
    surveyGatNumber: '415/2',
    hissaNumber: 'Hissa-2',
    ulpin: 'ULPIN-UP-4152P-2026',
    totalLandAreaAcres: 4.80,
    acquiredAreaAcres: 4.10,
    retainedAreaAcres: 0.70,
    landClassification: 'Agricultural',
    soilType: 'Doab Alluvial Deep Soil',
    tenureType: 'Bhumidhar with Transferable Rights',
    jointHolders: [
      { name: 'Shri Akhilesh Yadav', shareFraction: '1/2', relation: 'Son' },
      { name: 'Smt. Sarita Yadav', shareFraction: '1/2', relation: 'Daughter-in-law' }
    ],
    estimatedValuationINR: 18000000,
    solatiumINR: 18000000,
    totalCompensationINR: 39600000,
    disbursementStatus: 'PENDING',
    bankDetails: {
      bankName: 'Indian Bank (Civil Lines Prayagraj)',
      accountMasked: 'XXXXXX8819',
      ifsc: 'IDIB000C028',
    },
    dgpsPillars: [
      { pillarId: 'PIL-PRY-01', lat: 25.4370, lng: 81.8445, rtkAccuracyCm: 1.5 },
      { pillarId: 'PIL-PRY-02', lat: 25.4378, lng: 81.8480, rtkAccuracyCm: 1.2 },
      { pillarId: 'PIL-PRY-03', lat: 25.4345, lng: 81.8485, rtkAccuracyCm: 1.7 },
      { pillarId: 'PIL-PRY-04', lat: 25.4340, lng: 81.8448, rtkAccuracyCm: 1.3 },
    ],
    boundaryPolygon: [
      { lat: 25.4370, lng: 81.8445 },
      { lat: 25.4378, lng: 81.8480 },
      { lat: 25.4345, lng: 81.8485 },
      { lat: 25.4340, lng: 81.8448 },
    ],
    qrPasscode: 'QR-KS-UP-4152P',
    arVerificationStatus: 'VERIFIED',
  }, 'farmer-prayagraj-006');

  // 7. Shri Nilesh Jayant Deshmukh (Thane, MH)
  await farmerService.create({
    farmerName: 'Shri Nilesh Jayant Deshmukh',
    contactNumber: '+91 98201 33499',
    aadhaarMasked: 'XXXX-XXXX-7788',
    state: 'Maharashtra',
    district: 'Thane',
    talukaTehsil: 'Bhiwandi',
    village: 'Anjur',
    khataNumber: 'Khata-602',
    surveyGatNumber: '512/3',
    hissaNumber: 'Hissa-3',
    ulpin: 'ULPIN-MH-5123THN-2026',
    totalLandAreaAcres: 3.20,
    acquiredAreaAcres: 2.10,
    retainedAreaAcres: 1.10,
    landClassification: 'Residential',
    soilType: 'Coastal Clay Urban Fringe',
    tenureType: 'Occupant Class I (NA Converted)',
    jointHolders: [
      { name: 'Smt. Priya N. Deshmukh', shareFraction: '1/2', relation: 'Wife' },
      { name: 'Shri Jayant S. Deshmukh', shareFraction: '1/2', relation: 'Father' }
    ],
    estimatedValuationINR: 22000000,
    solatiumINR: 22000000,
    totalCompensationINR: 48400000,
    disbursementStatus: 'UNDER_DISPUTE',
    bankDetails: {
      bankName: 'ICICI Bank (Thane West)',
      accountMasked: 'XXXXXX6641',
      ifsc: 'ICIC0000102',
    },
    dgpsPillars: [
      { pillarId: 'PIL-THN-01', lat: 19.2195, lng: 72.9760, rtkAccuracyCm: 1.3 },
      { pillarId: 'PIL-THN-02', lat: 19.2202, lng: 72.9798, rtkAccuracyCm: 1.1 },
      { pillarId: 'PIL-THN-03', lat: 19.2170, lng: 72.9802, rtkAccuracyCm: 1.5 },
      { pillarId: 'PIL-THN-04', lat: 19.2165, lng: 72.9765, rtkAccuracyCm: 1.4 },
    ],
    boundaryPolygon: [
      { lat: 19.2195, lng: 72.9760 },
      { lat: 19.2202, lng: 72.9798 },
      { lat: 19.2170, lng: 72.9802 },
      { lat: 19.2165, lng: 72.9765 },
    ],
    qrPasscode: 'QR-KS-MH-5123T',
    arVerificationStatus: 'FLAGGED_MISMATCH',
  }, 'farmer-thane-007');

  // 8. Shri Mansukhbhai Gordhanbhai Vaghela (Vadodara, GJ)
  await farmerService.create({
    farmerName: 'Shri Mansukhbhai Gordhanbhai Vaghela',
    contactNumber: '+91 98791 55204',
    aadhaarMasked: 'XXXX-XXXX-2233',
    state: 'Gujarat',
    district: 'Vadodara',
    talukaTehsil: 'Karjan',
    village: 'Karjan Rural',
    khataNumber: 'Khata-994',
    surveyGatNumber: '312/1',
    hissaNumber: 'Hissa-1',
    ulpin: 'ULPIN-GJ-3121V-2026',
    totalLandAreaAcres: 5.10,
    acquiredAreaAcres: 4.60,
    retainedAreaAcres: 0.50,
    landClassification: 'Agricultural',
    soilType: 'Mahi River Alluvium Medium Black Soil',
    tenureType: 'Occupant Class I (Freehold)',
    jointHolders: [
      { name: 'Shri Kiritbhai M. Vaghela', shareFraction: '1/2', relation: 'Son' },
      { name: 'Shri Sanjaybhai M. Vaghela', shareFraction: '1/2', relation: 'Son' }
    ],
    estimatedValuationINR: 24000000,
    solatiumINR: 24000000,
    totalCompensationINR: 52800000,
    disbursementStatus: 'DISBURSED',
    bankDetails: {
      bankName: 'State Bank of India (Karjan)',
      accountMasked: 'XXXXXX3319',
      ifsc: 'SBIN0000401',
    },
    dgpsPillars: [
      { pillarId: 'PIL-VAD-01', lat: 22.3085, lng: 73.1795, rtkAccuracyCm: 1.0 },
      { pillarId: 'PIL-VAD-02', lat: 22.3092, lng: 73.1830, rtkAccuracyCm: 0.8 },
      { pillarId: 'PIL-VAD-03', lat: 22.3058, lng: 73.1835, rtkAccuracyCm: 1.2 },
      { pillarId: 'PIL-VAD-04', lat: 22.3052, lng: 73.1800, rtkAccuracyCm: 1.1 },
    ],
    boundaryPolygon: [
      { lat: 22.3085, lng: 73.1795 },
      { lat: 22.3092, lng: 73.1830 },
      { lat: 22.3058, lng: 73.1835 },
      { lat: 22.3052, lng: 73.1800 },
    ],
    qrPasscode: 'QR-KS-GJ-3121V',
    arVerificationStatus: 'VERIFIED',
  }, 'farmer-vadodara-008');

  // 9. Shri Suresh Chandra Verma (Kanpur, UP)
  await farmerService.create({
    farmerName: 'Shri Suresh Chandra Verma',
    contactNumber: '+91 94150 99412',
    aadhaarMasked: 'XXXX-XXXX-5561',
    state: 'Uttar Pradesh',
    district: 'Kanpur Nagar',
    talukaTehsil: 'Bilhaur',
    village: 'Araul',
    khataNumber: 'Khata-817',
    surveyGatNumber: '712/4',
    hissaNumber: 'Hissa-4',
    ulpin: 'ULPIN-UP-7124K-2026',
    totalLandAreaAcres: 5.60,
    acquiredAreaAcres: 5.60,
    retainedAreaAcres: 0.00,
    landClassification: 'Commercial',
    soilType: 'Heavy Alluvial Plain with Highway Frontage',
    tenureType: 'Bhumidhar with Transferable Rights',
    jointHolders: [
      { name: 'Smt. Shanti Devi Verma', shareFraction: '1/1', relation: 'Wife' }
    ],
    estimatedValuationINR: 32000000,
    solatiumINR: 32000000,
    totalCompensationINR: 70400000,
    disbursementStatus: 'IN_PROGRESS',
    bankDetails: {
      bankName: 'Canara Bank (Mall Road Kanpur)',
      accountMasked: 'XXXXXX1248',
      ifsc: 'CNRB0000219',
    },
    dgpsPillars: [
      { pillarId: 'PIL-KNP-01', lat: 26.4515, lng: 80.3300, rtkAccuracyCm: 1.4 },
      { pillarId: 'PIL-KNP-02', lat: 26.4522, lng: 80.3340, rtkAccuracyCm: 1.3 },
      { pillarId: 'PIL-KNP-03', lat: 26.4485, lng: 80.3345, rtkAccuracyCm: 1.6 },
      { pillarId: 'PIL-KNP-04', lat: 26.4480, lng: 80.3305, rtkAccuracyCm: 1.5 },
    ],
    boundaryPolygon: [
      { lat: 26.4515, lng: 80.3300 },
      { lat: 26.4522, lng: 80.3340 },
      { lat: 26.4485, lng: 80.3345 },
      { lat: 26.4480, lng: 80.3305 },
    ],
    qrPasscode: 'QR-KS-UP-7124K',
    arVerificationStatus: 'VERIFIED',
  }, 'farmer-kanpur-009');

  // 10. Smt. Parvatibai Tukaram Gavit (Kelve Tribal Pocket, Palghar, MH)
  await farmerService.create({
    farmerName: 'Smt. Parvatibai Tukaram Gavit',
    contactNumber: '+91 97633 44018',
    aadhaarMasked: 'XXXX-XXXX-9045',
    state: 'Maharashtra',
    district: 'Palghar',
    talukaTehsil: 'Palghar',
    village: 'Umroli Tribal Circle',
    khataNumber: 'Khata-219',
    surveyGatNumber: '98/3',
    hissaNumber: 'Hissa-3',
    ulpin: 'ULPIN-MH-983UM-2026',
    totalLandAreaAcres: 3.75,
    acquiredAreaAcres: 3.75,
    retainedAreaAcres: 0.00,
    landClassification: 'Agricultural',
    soilType: 'Forest Fringe Gravelly Loam',
    tenureType: 'Occupant Class II (Forest Rights Act Title Holder)',
    jointHolders: [
      { name: 'Shri Hiraman T. Gavit', shareFraction: '1/2', relation: 'Son' },
      { name: 'Smt. Sitabai T. Gavit', shareFraction: '1/2', relation: 'Daughter' }
    ],
    estimatedValuationINR: 11000000,
    solatiumINR: 11000000,
    totalCompensationINR: 24200000,
    disbursementStatus: 'DISBURSED',
    bankDetails: {
      bankName: 'Thane District Central Co-op Bank (Umroli)',
      accountMasked: 'XXXXXX5011',
      ifsc: 'TDCB0000042',
    },
    dgpsPillars: [
      { pillarId: 'PIL-UMR-01', lat: 19.6820, lng: 72.7510, rtkAccuracyCm: 1.7 },
      { pillarId: 'PIL-UMR-02', lat: 19.6828, lng: 72.7545, rtkAccuracyCm: 1.5 },
      { pillarId: 'PIL-UMR-03', lat: 19.6795, lng: 72.7550, rtkAccuracyCm: 1.8 },
      { pillarId: 'PIL-UMR-04', lat: 19.6790, lng: 72.7515, rtkAccuracyCm: 1.6 },
    ],
    boundaryPolygon: [
      { lat: 19.6820, lng: 72.7510 },
      { lat: 19.6828, lng: 72.7545 },
      { lat: 19.6795, lng: 72.7550 },
      { lat: 19.6790, lng: 72.7515 },
    ],
    qrPasscode: 'QR-KS-MH-983UM',
    arVerificationStatus: 'VERIFIED',
  }, 'farmer-palghar-010');


  // 18. Audit Log Chronicle
  log('Recording Immutable Audit Trail for National Command Center...');
  await auditService.logAction({
    targetCollection: 'system',
    targetDocId: 'command-center-seed',
    action: 'CREATE',
    actorId: 'sys-national-controller',
    actorName: 'National Command Center Orchestrator',
    actorRole: 'NATIONAL_EXECUTIVE',
    diffPayload: { status: 'SYNCHRONIZED', totalStrategicCorridors: 3, statesActive: 5, totalFarmersSeeded: 10 },
  });

  log('BHUMI-SHIELD National Command Center & Krishi Sathi dataset successfully seeded!');
}

