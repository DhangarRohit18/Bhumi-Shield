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

  // 15. OCR & NLP Document Extraction Pipeline
  log('Seeding OCR/NLP Document Extractions...');
  await ocrExtractionService.create({
    documentId: 'doc-7x12-palghar-01',
    projectId: proj1Id,
    status: 'COMPLETED',
    extractedData: {
      khasraNumber: '142/A-1',
      ownerName: 'Ramesh Patil',
      areaValue: '0.85',
      areaUnit: 'Hectares',
      gazetteDate: '2025-02-14'
    },
    confidenceScores: {
      khasraNumber: 0.98,
      ownerName: 0.96,
      areaValue: 0.92,
      gazetteDate: 0.88
    },
    humanVerified: true
  }, 'ocr-palghar-01');

  await ocrExtractionService.create({
    documentId: 'doc-sale-deed-02',
    projectId: proj1Id,
    status: 'HUMAN_VERIFICATION_REQUIRED',
    extractedData: {
      khasraNumber: '142/A-2',
      ownerName: 'Sunita ?????',
      compensationAmount: '45,???,000'
    },
    confidenceScores: {
      khasraNumber: 0.85,
      ownerName: 0.42,
      compensationAmount: 0.38
    },
    humanVerified: false
  }, 'ocr-palghar-02');

  // 16. Audit Log Chronicle
  log('Recording Immutable Audit Trail for National Command Center...');
  await auditService.logAction({
    targetCollection: 'system',
    targetDocId: 'command-center-seed',
    action: 'CREATE',
    actorId: 'sys-national-controller',
    actorName: 'National Command Center Orchestrator',
    actorRole: 'NATIONAL_EXECUTIVE',
    diffPayload: { status: 'SYNCHRONIZED', totalStrategicCorridors: 3, statesActive: 5 },
  });

  log('BHUMI-SHIELD National Command Center dataset successfully seeded!');
}
