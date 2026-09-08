import {
  StateMaster, DistrictMaster, Project, Parcel, Village,
  FarmerRecord, Bottleneck, OfficerWorkloadRecord,
  InterventionStrategy, WorkflowEvent, CompensationAward,
  LegalDocument, LegalCase, PredictionRecord
} from "../types";

const ts = Date.now();

// ─── STATES ───────────────────────────────────────────────────────────────────
export const FALLBACK_STATES: StateMaster[] = [
  { id: "state-mh", name: "Maharashtra", code: "MH", totalDistricts: 36, activeProjectsCount: 14, createdAt: ts, updatedAt: ts },
  { id: "state-gj", name: "Gujarat", code: "GJ", totalDistricts: 33, activeProjectsCount: 12, createdAt: ts, updatedAt: ts },
  { id: "state-up", name: "Uttar Pradesh", code: "UP", totalDistricts: 75, activeProjectsCount: 28, createdAt: ts, updatedAt: ts },
  { id: "state-rj", name: "Rajasthan", code: "RJ", totalDistricts: 50, activeProjectsCount: 9, createdAt: ts, updatedAt: ts },
  { id: "state-ka", name: "Karnataka", code: "KA", totalDistricts: 31, activeProjectsCount: 8, createdAt: ts, updatedAt: ts },
];

// ─── DISTRICTS ────────────────────────────────────────────────────────────────
export const FALLBACK_DISTRICTS: DistrictMaster[] = [
  { id: "dist-palghar", stateId: "state-mh", name: "Palghar", code: "PLG", headquarters: "Palghar", createdAt: ts, updatedAt: ts },
  { id: "dist-thane", stateId: "state-mh", name: "Thane", code: "THN", headquarters: "Thane City", createdAt: ts, updatedAt: ts },
  { id: "dist-ahmedabad", stateId: "state-gj", name: "Ahmedabad", code: "AHM", headquarters: "Ahmedabad", createdAt: ts, updatedAt: ts },
  { id: "dist-surat", stateId: "state-gj", name: "Surat", code: "SRT", headquarters: "Surat", createdAt: ts, updatedAt: ts },
  { id: "dist-varanasi", stateId: "state-up", name: "Varanasi", code: "VNS", headquarters: "Varanasi", createdAt: ts, updatedAt: ts },
  { id: "dist-kanpur", stateId: "state-up", name: "Kanpur Nagar", code: "KNP", headquarters: "Kanpur", createdAt: ts, updatedAt: ts },
];

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
export const FALLBACK_PROJECTS: Project[] = [
  {
    id: "proj-bullet-train-sec-3", name: "Mumbai-Ahmedabad High Speed Rail Corridor (Section 3 - Palghar)",
    code: "MAHSR-PKG-C3", stateId: "state-mh", districtIds: ["dist-palghar", "dist-thane"],
    departmentId: "dept-nhsrcl", description: "Acquisition of 184.6 hectares for High Speed Rail Viaduct.",
    totalAreaRequiredAcres: 456.2, totalBudgetINR: 14500000000, currentStage: "Sec_19_Declaration",
    startDate: "2025-01-15", targetCompletionDate: "2027-06-30", status: "ACTIVE", createdAt: ts, updatedAt: ts,
  },
  {
    id: "proj-delhi-mumbai-exp", name: "Delhi-Mumbai Expressway Package 17 (Spur Connectivity)",
    code: "DME-EXP-P17", stateId: "state-mh", districtIds: ["dist-palghar"],
    departmentId: "dept-nhai", description: "Greenfield expressway acquisition spanning 14 revenue villages.",
    totalAreaRequiredAcres: 820.5, totalBudgetINR: 22000000000, currentStage: "Award_Enquiry",
    startDate: "2024-08-01", targetCompletionDate: "2026-12-31", status: "ACTIVE", createdAt: ts, updatedAt: ts,
  },
  {
    id: "proj-eastern-dfc", name: "Eastern Dedicated Freight Corridor (EDFC-Varanasi Bypass)",
    code: "EDFC-PKG-204", stateId: "state-up", districtIds: ["dist-varanasi"],
    departmentId: "dept-dfccil", description: "Strategic rail freight corridor clearing heavy container transit around Varanasi.",
    totalAreaRequiredAcres: 310.0, totalBudgetINR: 9800000000, currentStage: "Sec_11_Gazette",
    startDate: "2025-03-01", targetCompletionDate: "2027-12-31", status: "DELAYED", createdAt: ts, updatedAt: ts,
  },
];

// ─── VILLAGES ─────────────────────────────────────────────────────────────────
export const FALLBACK_VILLAGES: Village[] = [
  { id: "vil-manikpur", projectId: "proj-bullet-train-sec-3", districtId: "dist-palghar", name: "Manikpur", censusCode: "VIL-MH-52101", totalParcelsCount: 42, createdAt: ts, updatedAt: ts },
  { id: "vil-kelve", projectId: "proj-bullet-train-sec-3", districtId: "dist-palghar", name: "Kelve", censusCode: "VIL-MH-52102", totalParcelsCount: 28, createdAt: ts, updatedAt: ts },
  { id: "vil-umroli", projectId: "proj-bullet-train-sec-3", districtId: "dist-palghar", name: "Umroli", censusCode: "VIL-MH-52103", totalParcelsCount: 35, createdAt: ts, updatedAt: ts },
  { id: "vil-rohania", projectId: "proj-eastern-dfc", districtId: "dist-varanasi", name: "Rohania", censusCode: "VIL-UP-10901", totalParcelsCount: 64, createdAt: ts, updatedAt: ts },
];

// ─── PARCELS ──────────────────────────────────────────────────────────────────
export const FALLBACK_PARCELS: Parcel[] = [
  {
    id: "pcl-pal-0142", projectId: "proj-bullet-train-sec-3", villageId: "vil-manikpur",
    khasraSurveyNo: "142/A-1", ulpin: "ULPIN-MH-142A1-2026", areaAcres: 2.45,
    landClassification: "Agricultural", estimatedMarketValueINR: 12500000,
    calculatedSolatiumINR: 12500000, totalCompensationINR: 27500000, status: "AWARDED",
    geoCenter: { lat: 19.6967, lng: 72.7699 }, createdAt: ts, updatedAt: ts,
  },
  {
    id: "pcl-pal-0143", projectId: "proj-bullet-train-sec-3", villageId: "vil-kelve",
    khasraSurveyNo: "143/2-B", ulpin: "ULPIN-MH-1432B-2026", areaAcres: 1.15,
    landClassification: "Residential", estimatedMarketValueINR: 8900000,
    calculatedSolatiumINR: 8900000, totalCompensationINR: 19580000, status: "NOTIFIED",
    geoCenter: { lat: 19.6200, lng: 72.7400 }, createdAt: ts, updatedAt: ts,
  },
  {
    id: "pcl-mum-0012", projectId: "proj-bullet-train-sec-3", villageId: "vil-manikpur",
    khasraSurveyNo: "12/A-BKC", ulpin: "ULPIN-MH-12ABKC-2026", areaAcres: 3.80,
    landClassification: "Commercial", estimatedMarketValueINR: 48000000,
    calculatedSolatiumINR: 48000000, totalCompensationINR: 105600000, status: "AWARDED",
    geoCenter: { lat: 19.0760, lng: 72.8777 }, createdAt: ts, updatedAt: ts,
  },
  {
    id: "pcl-del-0011", projectId: "proj-delhi-mumbai-exp", villageId: "vil-manikpur",
    khasraSurveyNo: "11/DND-DEL", areaAcres: 4.80, landClassification: "Commercial",
    estimatedMarketValueINR: 64000000, calculatedSolatiumINR: 64000000, totalCompensationINR: 140800000,
    status: "POSSESSED", geoCenter: { lat: 28.6139, lng: 77.2090 }, createdAt: ts, updatedAt: ts,
  },
  {
    id: "pcl-knp-0712", projectId: "proj-eastern-dfc", villageId: "vil-rohania",
    khasraSurveyNo: "712/4-KNP", areaAcres: 5.60, landClassification: "Commercial",
    estimatedMarketValueINR: 32000000, calculatedSolatiumINR: 32000000, totalCompensationINR: 70400000,
    status: "NOTIFIED", geoCenter: { lat: 26.4499, lng: 80.3319 }, createdAt: ts, updatedAt: ts,
  },
  {
    id: "pcl-vns-0881", projectId: "proj-eastern-dfc", villageId: "vil-rohania",
    khasraSurveyNo: "881/P-4", areaAcres: 4.20, landClassification: "Agricultural",
    estimatedMarketValueINR: 16000000, calculatedSolatiumINR: 16000000, totalCompensationINR: 35200000,
    status: "IDENTIFIED", geoCenter: { lat: 25.3176, lng: 82.9739 }, createdAt: ts, updatedAt: ts,
  },
];

// ─── BOTTLENECKS ──────────────────────────────────────────────────────────────
export const FALLBACK_BOTTLENECKS: Bottleneck[] = [
  {
    id: "btn-01", projectId: "proj-bullet-train-sec-3",
    title: "High Court Writ Petition on Solatium Multiplier Factor (Manikpur Sector)",
    rootCause: "COURT_STAY", severity: "HIGH", delayDaysEstimated: 24, status: "IDENTIFIED",
    createdAt: ts, updatedAt: ts,
  },
  {
    id: "btn-02", projectId: "proj-eastern-dfc",
    title: "Inter-Departmental Forest NOC Pending for Rohania Canal Crossing",
    rootCause: "INTER_DEPARTMENTAL_NOC", severity: "CRITICAL", delayDaysEstimated: 45, status: "IDENTIFIED",
    createdAt: ts, updatedAt: ts,
  },
  {
    id: "btn-03", projectId: "proj-delhi-mumbai-exp",
    title: "Disputed Joint Measurement Survey on Khasra 143/2-B Boundary Markers",
    rootCause: "SIA_PUBLIC_RESISTANCE", severity: "MEDIUM", delayDaysEstimated: 12, status: "UNDER_MITIGATION",
    createdAt: ts, updatedAt: ts,
  },
];

// ─── INTERVENTIONS ────────────────────────────────────────────────────────────
export const FALLBACK_INTERVENTIONS: InterventionStrategy[] = [
  {
    id: "int-01", projectId: "proj-bullet-train-sec-3", bottleneckId: "btn-01",
    recommendedAction: "Direct CALA to execute Supreme Court SLP standard solatium affidavit and release 50% provisional solatium under Sec 30.",
    targetDepartment: "Revenue & Legal Division (Maharashtra)",
    priority: "URGENT", suggestedEscalationTier: "PRINCIPAL_SECRETARY", status: "RECOMMENDED",
    createdAt: ts, updatedAt: ts,
  },
  {
    id: "int-02", projectId: "proj-eastern-dfc", bottleneckId: "btn-02",
    recommendedAction: "Convene Joint State High-Powered Committee with MoEFCC Principal Chief Conservator of Forests for expedited clearance.",
    targetDepartment: "Ministry of Environment, Forest & Climate Change",
    priority: "URGENT", suggestedEscalationTier: "CABINET_COMMITTEE", status: "RECOMMENDED",
    createdAt: ts, updatedAt: ts,
  },
  {
    id: "int-03", projectId: "proj-delhi-mumbai-exp", bottleneckId: "btn-03",
    recommendedAction: "Deploy DGPS Joint Survey Mobile Sentinel squad to re-verify North-West boundary pillar coordinates.",
    targetDepartment: "District Collectorate (Palghar)",
    priority: "HIGH", suggestedEscalationTier: "DISTRICT_COLLECTOR", status: "RECOMMENDED",
    createdAt: ts, updatedAt: ts,
  },
];

// ─── OFFICER WORKLOADS ────────────────────────────────────────────────────────
export const FALLBACK_OFFICER_WORKLOADS: OfficerWorkloadRecord[] = [
  {
    id: "off-mh-palghar-01", officerUid: "off-mh-palghar-01", officerName: "Sanjay V. Patil (CALA Palghar)",
    role: "FIELD_ACQUISITION", districtId: "dist-palghar", stateId: "state-mh",
    assignedCases: 48, pendingCases: 38, completedCases: 10, overdueCases: 9,
    averageResolutionDays: 24, maxCapacity: 35, complexityScore: 4.2,
    calculatedWorkloadScore: 94.5, isAvailable: false, createdAt: ts, updatedAt: ts,
  },
  {
    id: "off-mh-palghar-02", officerUid: "off-mh-palghar-02", officerName: "Meera Deshmukh (SDO Palghar)",
    role: "FIELD_ACQUISITION", districtId: "dist-palghar", stateId: "state-mh",
    assignedCases: 42, pendingCases: 31, completedCases: 11, overdueCases: 7,
    averageResolutionDays: 21, maxCapacity: 35, complexityScore: 3.8,
    calculatedWorkloadScore: 86.2, isAvailable: false, createdAt: ts, updatedAt: ts,
  },
  {
    id: "off-mh-thane-01", officerUid: "off-mh-thane-01", officerName: "Anand R. Shinde (CALA Thane)",
    role: "FIELD_ACQUISITION", districtId: "dist-thane", stateId: "state-mh",
    assignedCases: 18, pendingCases: 7, completedCases: 11, overdueCases: 1,
    averageResolutionDays: 14, maxCapacity: 35, complexityScore: 2.1,
    calculatedWorkloadScore: 28.6, isAvailable: true, createdAt: ts, updatedAt: ts,
  },
  {
    id: "off-mh-thane-02", officerUid: "off-mh-thane-02", officerName: "Pooja Kulkarni (SDO Thane)",
    role: "FIELD_ACQUISITION", districtId: "dist-thane", stateId: "state-mh",
    assignedCases: 16, pendingCases: 6, completedCases: 10, overdueCases: 0,
    averageResolutionDays: 12, maxCapacity: 35, complexityScore: 2.0,
    calculatedWorkloadScore: 22.9, isAvailable: true, createdAt: ts, updatedAt: ts,
  },
  {
    id: "off-up-varanasi-01", officerUid: "off-up-varanasi-01", officerName: "Shri Manish Kumar Yadav (SDO Varanasi)",
    role: "FIELD_ACQUISITION", districtId: "dist-varanasi", stateId: "state-up",
    assignedCases: 55, pendingCases: 41, completedCases: 14, overdueCases: 11,
    averageResolutionDays: 31, maxCapacity: 35, complexityScore: 4.8,
    calculatedWorkloadScore: 98.4, isAvailable: false, createdAt: ts, updatedAt: ts,
  },
];

// ─── WORKFLOW EVENTS ──────────────────────────────────────────────────────────
export const FALLBACK_WORKFLOW_EVENTS: WorkflowEvent[] = [
  {
    id: "wf-event-latest", projectId: "proj-bullet-train-sec-3", parcelId: "pcl-pal-0142",
    stage: "Award_Disbursement",
    actionTaken: "Direct DBT / PFMS transmission completed for Parcel 142/A-1 award decree",
    actorId: "officer-acq-01", actorName: "Shri Vikram Joshi, SDO & CALA", actorRole: "FIELD_ACQUISITION",
    comments: "Full amount ₹2.75 Cr credited to Aadhaar-linked beneficiary account.",
    statusChangeFrom: "AWARDED", statusChangeTo: "DISBURSED",
    gazetteOrderNo: "MAH-GAZ-2026-NHSRCL-9901", createdAt: ts, updatedAt: ts,
  },
  {
    id: "wf-event-vns", projectId: "proj-eastern-dfc",
    stage: "Sec_11_Gazette",
    actionTaken: "Section 11(1) Preliminary Gazette Notification published across Varanasi",
    actorId: "officer-dm-vns", actorName: "District Magistrate (Varanasi)", actorRole: "NATIONAL_EXECUTIVE",
    comments: "60-day statutory objection window opened under Section 15.",
    statusChangeTo: "Sec_11_Gazette", gazetteOrderNo: "UP-GAZ-2026-EDFC-0182", createdAt: ts, updatedAt: ts,
  },
  {
    id: "wf-event-sec19", projectId: "proj-bullet-train-sec-3",
    stage: "Sec_19_Declaration",
    actionTaken: "Section 19(1) Final Declaration published in Maharashtra Government Gazette",
    actorId: "user-sec-rev-01", actorName: "Smt. Sujata Sharma, IAS", actorRole: "NATIONAL_EXECUTIVE",
    comments: "Final acquisition boundaries confirmed for Package C3 Palghar.",
    statusChangeTo: "Sec_19_Declaration", gazetteOrderNo: "MH-GAZ-2026-019-NHSRCL", createdAt: ts - 86400000, updatedAt: ts,
  },
];

// ─── COMPENSATION ─────────────────────────────────────────────────────────────
export const FALLBACK_COMPENSATION: CompensationAward[] = [
  {
    id: "comp-award-001", projectId: "proj-bullet-train-sec-3", parcelId: "pcl-pal-0142",
    affectedFamilyId: "paf-patil-001", basicLandValueINR: 12500000, solatiumFactor: 1.0,
    solatiumAmountINR: 12500000, assetsValuationINR: 2500000, interestAmountINR: 0,
    totalPayableINR: 27500000, disbursementStatus: "CREDITED",
    disbursementDate: "2026-08-28", utrTransactionRef: "PFMS202608289921409",
    createdAt: ts, updatedAt: ts,
  },
  {
    id: "comp-palghar-001", projectId: "proj-bullet-train-sec-3", parcelId: "pcl-mum-0012",
    affectedFamilyId: "paf-patil-001", basicLandValueINR: 12000000, solatiumFactor: 1.0,
    solatiumAmountINR: 12000000, assetsValuationINR: 700000, interestAmountINR: 0,
    totalPayableINR: 24700000, disbursementStatus: "CREDITED",
    disbursementDate: "2026-08-15", utrTransactionRef: "PFMS202608157890123",
    createdAt: ts, updatedAt: ts,
  },
  {
    id: "comp-palghar-002", projectId: "proj-bullet-train-sec-3", parcelId: "pcl-pal-0143",
    affectedFamilyId: "paf-patil-001", basicLandValueINR: 8000000, solatiumFactor: 1.0,
    solatiumAmountINR: 8000000, assetsValuationINR: 0, interestAmountINR: 0,
    totalPayableINR: 16000000, disbursementStatus: "APPROVED",
    createdAt: ts, updatedAt: ts,
  },
];

// ─── DOCUMENTS ────────────────────────────────────────────────────────────────
export const FALLBACK_DOCUMENTS: LegalDocument[] = [
  {
    id: "doc-gazette-sec19-palghar", projectId: "proj-bullet-train-sec-3",
    title: "Section 19(1) Final Declaration Gazette - Palghar District",
    documentType: "GAZETTE_SEC_19", currentVersionNo: 1,
    currentDownloadUrl: "https://bhumishield.gov.in/gazettes/sec19_palghar_2026.pdf",
    fileSizeBytes: 2840120, sha256Checksum: "SHA256_e3b0c44298fc1c149afbf4c8996fb924", createdAt: ts, updatedAt: ts,
  },
  {
    id: "doc-sia-pkg3", projectId: "proj-bullet-train-sec-3",
    title: "SIA Final Report - High Speed Rail Package 3",
    documentType: "SIA_REPORT", currentVersionNo: 2,
    currentDownloadUrl: "https://bhumishield.gov.in/reports/sia_nhsrcl_pkg3_v2.pdf",
    fileSizeBytes: 14501230, sha256Checksum: "SHA256_8d969eef6ecad3c29a3a629280e686cf", createdAt: ts, updatedAt: ts,
  },
];

// ─── LEGAL CASES ──────────────────────────────────────────────────────────────
export const FALLBACK_LEGAL_CASES: LegalCase[] = [
  {
    id: "case-thn-102", projectId: "proj-bullet-train-sec-3", parcelId: "pcl-pal-0143",
    caseNumber: "WP/MH/2026/102", courtName: "Bombay High Court",
    litigantName: "Thane Farmers Landowners Welfare Assoc.", advocateName: "Adv. S. K. Deshmukh",
    natureOfDispute: "ENHANCEMENT_CLAIM", stayGranted: true,
    nextHearingDate: "2026-09-24", status: "PENDING", createdAt: ts, updatedAt: ts,
  },
  {
    id: "case-tdl-889", projectId: "proj-eastern-dfc", parcelId: "pcl-knp-0712",
    caseNumber: "WP/UP/2026/889", courtName: "Allahabad High Court",
    litigantName: "Tundla Gram Panchayat Sangh", advocateName: "Adv. M. P. Singh",
    natureOfDispute: "STAY_PETITION", stayGranted: true,
    nextHearingDate: "2026-10-12", status: "PENDING", createdAt: ts, updatedAt: ts,
  },
];

// ─── PREDICTIONS ──────────────────────────────────────────────────────────────
export const FALLBACK_PREDICTIONS: PredictionRecord[] = [
  {
    id: "pred-proj1-latest", projectId: "proj-bullet-train-sec-3",
    modelName: "BhumiShield-Forecaster-v4", modelVersion: "4.2.0-rf-xgboost",
    confidenceScore: 0.94, predictedDelayDays: 18, litigationRiskScore: 24,
    costOverrunRiskPercentage: 4.8,
    factorsContributing: ["High compliance with Sec 19 timelines", "PFMS direct credit activated", "1 pending HC writ petition"],
    createdAt: ts, updatedAt: ts,
  },
];

// ─── FARMERS ──────────────────────────────────────────────────────────────────
export const FALLBACK_FARMERS: FarmerRecord[] = [
  {
    id: "farmer-palghar-001", farmerName: "Shri Dattatray B. Patil", contactNumber: "+91 98231 44521",
    aadhaarMasked: "XXXX-XXXX-8821", state: "Maharashtra", district: "Palghar",
    talukaTehsil: "Palghar", village: "Manikpur", khataNumber: "Khata-892",
    surveyGatNumber: "142/A-1", hissaNumber: "Hissa-1", ulpin: "ULPIN-MH-142A1-2026",
    totalLandAreaAcres: 3.45, acquiredAreaAcres: 2.45, retainedAreaAcres: 1.00,
    landClassification: "Agricultural", soilType: "Alluvial Loam Coastal Plain",
    tenureType: "Occupant Class I (Freehold Khatedar)",
    jointHolders: [{ name: "Smt. Anusaya D. Patil", shareFraction: "1/2", relation: "Wife" }, { name: "Shri Rajesh D. Patil", shareFraction: "1/2", relation: "Son" }],
    estimatedValuationINR: 13750000, solatiumINR: 13750000, totalCompensationINR: 27500000,
    disbursementStatus: "DISBURSED",
    bankDetails: { bankName: "State Bank of India (Palghar Branch)", accountMasked: "XXXXXX4092", ifsc: "SBIN0001244" },
    dgpsPillars: [{ pillarId: "PIL-142-NW", lat: 19.6975, lng: 72.7690, rtkAccuracyCm: 1.4 }],
    boundaryPolygon: [{ lat: 19.6975, lng: 72.7690 }, { lat: 19.6980, lng: 72.7720 }, { lat: 19.6950, lng: 72.7730 }, { lat: 19.6945, lng: 72.7695 }],
    qrPasscode: "QR-KS-MH-142A1", arVerificationStatus: "VERIFIED", createdAt: ts, updatedAt: ts,
  },
  {
    id: "farmer-kanpur-009", farmerName: "Shri Suresh Chandra Verma", contactNumber: "+91 94150 99412",
    aadhaarMasked: "XXXX-XXXX-5561", state: "Uttar Pradesh", district: "Kanpur Nagar",
    talukaTehsil: "Bilhaur", village: "Araul", khataNumber: "Khata-817",
    surveyGatNumber: "712/4", hissaNumber: "Hissa-4", ulpin: "ULPIN-UP-7124K-2026",
    totalLandAreaAcres: 5.60, acquiredAreaAcres: 5.60, retainedAreaAcres: 0.00,
    landClassification: "Commercial", soilType: "Heavy Alluvial Plain",
    tenureType: "Bhumidhar with Transferable Rights",
    jointHolders: [{ name: "Smt. Shanti Devi Verma", shareFraction: "1/1", relation: "Wife" }],
    estimatedValuationINR: 35200000, solatiumINR: 35200000, totalCompensationINR: 70400000,
    disbursementStatus: "IN_PROGRESS",
    bankDetails: { bankName: "Canara Bank (Mall Road Kanpur)", accountMasked: "XXXXXX1248", ifsc: "CNRB0000219" },
    dgpsPillars: [{ pillarId: "PIL-KNP-01", lat: 26.4515, lng: 80.3300, rtkAccuracyCm: 1.4 }],
    boundaryPolygon: [{ lat: 26.4515, lng: 80.3300 }, { lat: 26.4520, lng: 80.3340 }, { lat: 26.4490, lng: 80.3350 }, { lat: 26.4485, lng: 80.3310 }],
    qrPasscode: "QR-KS-UP-7124K", arVerificationStatus: "VERIFIED", createdAt: ts, updatedAt: ts,
  },
  {
    id: "farmer-jaipur-004", farmerName: "Shri Jagdishprasad R. Sharma", contactNumber: "+91 94140 22891",
    aadhaarMasked: "XXXX-XXXX-6612", state: "Rajasthan", district: "Jaipur",
    talukaTehsil: "Bassi", village: "Bassi Rural", khataNumber: "Khata-771",
    surveyGatNumber: "119/2", hissaNumber: "Hissa-3", ulpin: "ULPIN-RJ-1192J-2026",
    totalLandAreaAcres: 6.20, acquiredAreaAcres: 5.10, retainedAreaAcres: 1.10,
    landClassification: "Agricultural", soilType: "Sandy Loam Semiarid Soil",
    tenureType: "Khatedar Tenant (Permanent)",
    jointHolders: [{ name: "Shri Rameshwarlal Sharma", shareFraction: "1/2", relation: "Brother" }],
    estimatedValuationINR: 20900000, solatiumINR: 20900000, totalCompensationINR: 41800000,
    disbursementStatus: "DISBURSED",
    bankDetails: { bankName: "Punjab National Bank (Jaipur Bassi)", accountMasked: "XXXXXX1902", ifsc: "PUNB0021900" },
    dgpsPillars: [{ pillarId: "PIL-BAS-01", lat: 26.8320, lng: 76.0410, rtkAccuracyCm: 1.2 }],
    boundaryPolygon: [{ lat: 26.8320, lng: 76.0410 }, { lat: 26.8325, lng: 76.0450 }, { lat: 26.8295, lng: 76.0460 }, { lat: 26.8290, lng: 76.0415 }],
    qrPasscode: "QR-KS-RJ-1192J", arVerificationStatus: "VERIFIED", createdAt: ts, updatedAt: ts,
  },
  {
    id: "farmer-palghar-002", farmerName: "Smt. Kalavati S. More", contactNumber: "+91 97654 11823",
    aadhaarMasked: "XXXX-XXXX-3341", state: "Maharashtra", district: "Palghar",
    talukaTehsil: "Vasai", village: "Kelve", khataNumber: "Khata-219",
    surveyGatNumber: "88/B-1", hissaNumber: "Hissa-2", ulpin: "ULPIN-MH-88B1-2026",
    totalLandAreaAcres: 2.80, acquiredAreaAcres: 2.80, retainedAreaAcres: 0.00,
    landClassification: "Agricultural", soilType: "Red Laterite Upland",
    tenureType: "Occupant Class I (Freehold Khatedar)",
    jointHolders: [],
    estimatedValuationINR: 11200000, solatiumINR: 11200000, totalCompensationINR: 22400000,
    disbursementStatus: "PENDING",
    bankDetails: { bankName: "Bank of Maharashtra (Vasai Branch)", accountMasked: "XXXXXX9821", ifsc: "MAHB0001002" },
    dgpsPillars: [{ pillarId: "PIL-88B-SE", lat: 19.6201, lng: 72.7410, rtkAccuracyCm: 1.8 }],
    boundaryPolygon: [{ lat: 19.6201, lng: 72.7405 }, { lat: 19.6210, lng: 72.7440 }, { lat: 19.6185, lng: 72.7445 }, { lat: 19.6178, lng: 72.7412 }],
    qrPasscode: "QR-KS-MH-88B1", arVerificationStatus: "PENDING_VISIT", createdAt: ts, updatedAt: ts,
  },
  {
    id: "farmer-varanasi-003", farmerName: "Shri Ramkhelawan P. Yadav", contactNumber: "+91 98391 77612",
    aadhaarMasked: "XXXX-XXXX-2291", state: "Uttar Pradesh", district: "Varanasi",
    talukaTehsil: "Rohania", village: "Rohania", khataNumber: "Khata-503",
    surveyGatNumber: "55/A-KHJ", hissaNumber: "Hissa-1", ulpin: "ULPIN-UP-55AK-2026",
    totalLandAreaAcres: 3.20, acquiredAreaAcres: 3.20, retainedAreaAcres: 0.00,
    landClassification: "Agricultural", soilType: "Gangetic Alluvial Heavy Clay",
    tenureType: "Bhumidhar with Transferable Rights",
    jointHolders: [{ name: "Shri Suresh P. Yadav", shareFraction: "1/2", relation: "Brother" }],
    estimatedValuationINR: 15000000, solatiumINR: 15000000, totalCompensationINR: 30000000,
    disbursementStatus: "DISBURSED",
    bankDetails: { bankName: "Union Bank of India (Varanasi)", accountMasked: "XXXXXX4411", ifsc: "UBIN0542811" },
    dgpsPillars: [{ pillarId: "PIL-ROH-NE", lat: 25.3185, lng: 82.9745, rtkAccuracyCm: 1.6 }],
    boundaryPolygon: [{ lat: 25.3185, lng: 82.9740 }, { lat: 25.3192, lng: 82.9780 }, { lat: 25.3160, lng: 82.9785 }, { lat: 25.3155, lng: 82.9748 }],
    qrPasscode: "QR-KS-UP-55AK", arVerificationStatus: "VERIFIED", createdAt: ts, updatedAt: ts,
  },
];
