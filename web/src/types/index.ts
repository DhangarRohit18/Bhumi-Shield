// BHUMI-SHIELD Domain & Firestore Schema Types (28+ Collections)

export type UserRole =
  | 'National Admin'
  | 'State Admin'
  | 'District Officer'
  | 'Acquisition Officer'
  | 'Field Supervisor'
  | 'Field Officer'
  | 'Auditor'
  | 'Public User';

export interface BaseEntity {
  id?: string;
  createdAt: number;
  updatedAt: number;
  createdBy?: string;
  updatedBy?: string;
  isDeleted?: boolean;
}

// 1. users
export interface UserProfile extends BaseEntity {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: UserRole;
  stateId?: string;
  districtId?: string;
  departmentId?: string;
  isActive: boolean;
  assignedProjects?: string[];
  lastLoginAt?: number;
}

// 2. roles
export interface RoleDefinition extends BaseEntity {
  name: UserRole;
  description: string;
  permissions: string[];
  isSystem: boolean;
}

// 3. states
export interface StateMaster extends BaseEntity {
  name: string;
  code: string;
  totalDistricts: number;
  activeProjectsCount: number;
}

// 4. districts
export interface DistrictMaster extends BaseEntity {
  stateId: string;
  name: string;
  code: string;
  headquarters: string;
}

// 5. departments
export interface Department extends BaseEntity {
  name: string;
  code: string;
  category: 'Highway' | 'Railway' | 'Irrigation' | 'Urban' | 'Energy' | 'Other';
  nodalOfficerName?: string;
}

// 6. projects
export interface Project extends BaseEntity {
  name: string;
  code: string;
  stateId: string;
  districtIds: string[];
  departmentId: string;
  description: string;
  totalAreaRequiredAcres: number;
  totalBudgetINR: number;
  currentStage: 'Preliminary' | 'SIA_Study' | 'Sec_11_Gazette' | 'Sec_19_Declaration' | 'Award_Enquiry' | 'Disbursement' | 'Possession' | 'Completed';
  startDate: string;
  targetCompletionDate: string;
  status: 'ACTIVE' | 'DELAYED' | 'LITIGATION' | 'COMPLETED' | 'HALTED';
  gisBoundaryGeoJSON?: string;
}

// 7. villages
export interface Village extends BaseEntity {
  projectId: string;
  districtId: string;
  name: string;
  censusCode: string;
  totalParcelsCount: number;
}

// 8. parcels
export interface Parcel extends BaseEntity {
  projectId: string;
  villageId: string;
  khasraSurveyNo: string;
  areaAcres: number;
  landClassification: 'Agricultural' | 'Commercial' | 'Residential' | 'Barren' | 'Forest';
  estimatedMarketValueINR: number;
  calculatedSolatiumINR: number;
  totalCompensationINR: number;
  status: 'IDENTIFIED' | 'SURVEYED' | 'NOTIFIED' | 'VALUED' | 'AWARDED' | 'DISBURSED' | 'POSSESSED';
  qrAssetId?: string;
  geoCenter?: { lat: number; lng: number };
}

// 9. affected_families (PAFs)
export interface AffectedFamily extends BaseEntity {
  projectId: string;
  parcelIds: string[];
  headOfFamilyName: string;
  aadharNumberMasked: string;
  familyMembersCount: number;
  category: 'SC' | 'ST' | 'OBC' | 'GENERAL' | 'BPL';
  bankAccountNumberMasked: string;
  ifscCode: string;
  totalCompensationEntitledINR: number;
  totalDisbursedINR: number;
  rrEntitlementStatus: 'ELIGIBLE' | 'ALLOCATED' | 'DISBURSED' | 'REJECTED';
}

// 10. workflow_events
export interface WorkflowEvent extends BaseEntity {
  projectId: string;
  parcelId?: string;
  stage: string;
  actionTaken: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  comments: string;
  statusChangeFrom?: string;
  statusChangeTo?: string;
  gazetteOrderNo?: string;
}

// 11. tasks
export interface TaskItem extends BaseEntity {
  projectId: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  assignedRole: UserRole;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
}

// 12. approvals
export interface ApprovalRecord extends BaseEntity {
  entityType: 'PROJECT' | 'PARCEL' | 'COMPENSATION_AWARD' | 'RR_CASE';
  entityId: string;
  projectId: string;
  requestedBy: string;
  requestedByName: string;
  approverRole: UserRole;
  approvedBy?: string;
  approvedByName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
  decisionRemarks?: string;
  decisionTimestamp?: number;
}

// 13. documents
export interface LegalDocument extends BaseEntity {
  projectId: string;
  parcelId?: string;
  title: string;
  documentType: 'GAZETTE_SEC_11' | 'GAZETTE_SEC_19' | 'SIA_REPORT' | 'AWARD_DECREE' | 'SALE_DEED' | 'COURT_ORDER' | 'VALUATION_REPORT';
  currentVersionNo: number;
  currentDownloadUrl: string;
  fileSizeBytes: number;
  sha256Checksum: string;
}

// 14. document_versions
export interface DocumentVersion extends BaseEntity {
  documentId: string;
  versionNo: number;
  storagePath: string;
  downloadUrl: string;
  fileSizeBytes: number;
  sha256Checksum: string;
  changeNotes: string;
  uploadedBy: string;
}

// 15. compensation
export interface CompensationAward extends BaseEntity {
  projectId: string;
  parcelId: string;
  affectedFamilyId: string;
  basicLandValueINR: number;
  solatiumFactor: number; // usually 1.0 (100%)
  solatiumAmountINR: number;
  assetsValuationINR: number; // trees, wells, structures
  interestAmountINR: number;
  totalPayableINR: number;
  disbursementStatus: 'DRAFT' | 'APPROVED' | 'PFMS_TRANSMITTED' | 'CREDITED' | 'DISPUTED';
  disbursementDate?: string;
  utrTransactionRef?: string;
}

// 16. rr_cases
export interface RRCase extends BaseEntity {
  projectId: string;
  affectedFamilyId: string;
  entitlementType: 'CONSTRUCTED_HOUSE' | 'RESETTLEMENT_GRANT' | 'LIVELIHOOD_SUPPORT' | 'JOB_ALLOCATION';
  entitlementAmountINR: number;
  allottedPlotLocation?: string;
  status: 'SANCTIONED' | 'PROCESSING' | 'COMPLETED';
}

// 17. legal_cases
export interface LegalCase extends BaseEntity {
  projectId: string;
  parcelId?: string;
  courtName: string;
  caseNumber: string;
  litigantName: string;
  advocateName: string;
  natureOfDispute: 'ENHANCEMENT_CLAIM' | 'TITLE_DISPUTE' | 'PROCEDURAL_CHALLENGE' | 'STAY_PETITION';
  stayGranted: boolean;
  nextHearingDate: string;
  status: 'PENDING' | 'DISPOSED' | 'HEARD_ORDER_RESERVED';
}

// 18. grievances
export interface Grievance extends BaseEntity {
  projectId: string;
  parcelId?: string;
  trackingToken: string;
  applicantName: string;
  applicantPhone: string;
  category: 'COMPENSATION_DELAY' | 'INCORRECT_SURVEY' | 'RR_BENEFIT_MISSING' | 'ILLEGAL_POSSESSION';
  subject: string;
  description: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  status: 'OPEN' | 'INVESTIGATING' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';
  resolutionNotes?: string;
  slaDeadline: string;
}

// 19. field_visits
export interface FieldVisit extends BaseEntity {
  projectId: string;
  villageId: string;
  parcelIds: string[];
  scheduledDate: string;
  supervisorId: string;
  fieldOfficerIds: string[];
  purpose: 'GROUND_VERIFICATION' | 'OBJECTION_HEARING' | 'BOUNDARY_DEMARCATION' | 'VALUATION_SURVEY';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  completionReport?: string;
}

// 20. field_evidence
export interface FieldEvidence extends BaseEntity {
  projectId: string;
  parcelId: string;
  visitId?: string;
  evidenceType: 'PHOTO_GEOTAGGED' | 'DRONE_ORTHOPHOTO' | 'VIDEO_WALKTHROUGH' | 'WITNESS_STATEMENT_AUDIO';
  downloadUrl: string;
  gpsCoordinates: { lat: number; lng: number; altitude?: number };
  accuracyMeters: number;
  capturedByOfficerName: string;
  capturedByOfficerUid: string;
  tamperProofHash: string;
  notes: string;
}

// 21. qr_assets
export interface QRAsset extends BaseEntity {
  assetCode: string;
  projectId: string;
  parcelId: string;
  pillarNumber: string;
  qrPayload: string;
  lastScannedAt?: number;
  lastScannedBy?: string;
  status: 'INSTALLED' | 'VERIFIED' | 'DAMAGED' | 'TAMPERED';
}

// 22. iot_devices
export interface IoTDevice extends BaseEntity {
  deviceId: string;
  projectId: string;
  deviceType: 'BOUNDARY_INTRUSION_SENSOR' | 'GROUND_STABILITY_MONITOR' | 'DRONE_SURVEILLANCE_HUB';
  location: { lat: number; lng: number };
  batteryPercentage: number;
  firmwareVersion: string;
  status: 'ONLINE' | 'OFFLINE' | 'WARNING' | 'ALERT';
  lastHeartbeat: number;
}

// 23. iot_events
export interface IoTEvent extends BaseEntity {
  deviceId: string;
  projectId: string;
  eventType: 'TAMPER_ALERT' | 'DISPLACEMENT_TRIGGER' | 'GEOFENCE_BREACH' | 'HEARTBEAT';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  telemetryPayload: Record<string, any>;
  timestamp: number;
}

// 24. bottlenecks
export interface Bottleneck extends BaseEntity {
  projectId: string;
  title: string;
  rootCause: 'COURT_STAY' | 'BUDGET_APPROVAL_DELAY' | 'SIA_PUBLIC_RESISTANCE' | 'INTER_DEPARTMENTAL_NOC';
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  delayDaysEstimated: number;
  status: 'IDENTIFIED' | 'UNDER_MITIGATION' | 'RESOLVED';
}

// 25. dependencies
export interface DependencyEdge extends BaseEntity {
  projectId: string;
  sourceMilestone: string;
  targetMilestone: string;
  dependencyType: 'STATUTORY_MANDATE' | 'NOC_CLEARANCE' | 'SURVEY_SIGN_OFF';
  isBlocking: boolean;
}

// 26. predictions
export interface PredictionRecord extends BaseEntity {
  projectId: string;
  modelName: string;
  modelVersion: string;
  confidenceScore: number;
  predictedDelayDays: number;
  litigationRiskScore: number; // 0 to 100
  costOverrunRiskPercentage: number;
  factorsContributing: string[];
}

// 27. interventions
export interface InterventionStrategy extends BaseEntity {
  projectId: string;
  bottleneckId?: string;
  recommendedAction: string;
  targetDepartment: string;
  priority: 'HIGH' | 'URGENT';
  suggestedEscalationTier: 'DISTRICT_COLLECTOR' | 'PRINCIPAL_SECRETARY' | 'CABINET_COMMITTEE';
  status: 'RECOMMENDED' | 'APPLIED' | 'DISMISSED';
}

// 28. simulations
export interface SimulationRun extends BaseEntity {
  projectId: string;
  scenarioName: string;
  simulatedBudgetVariationPct: number;
  simulatedRouteRealignmentAreaPct: number;
  projectedOutcomeDelayDays: number;
  projectedCostImpactINR: number;
  runByUid: string;
}

// 29. notifications
export interface AppNotification extends BaseEntity {
  userId: string;
  targetRole?: UserRole;
  title: string;
  message: string;
  type: 'INFO' | 'ALERT' | 'APPROVAL_REQ' | 'COMPLIANCE_WARN';
  linkUri?: string;
  isRead: boolean;
}

// 30. audit_logs
export interface AuditLogEntry extends BaseEntity {
  targetCollection: string;
  targetDocId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'ROLE_SWITCH' | 'EXPORT_DATA';
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  timestamp: number;
  diffPayload?: Record<string, any>;
  ipAddress: string;
  verificationHash: string;
}

// 31. model_feedback
export interface ModelFeedback extends BaseEntity {
  predictionId: string;
  reviewedByUid: string;
  actualDelayDays?: number;
  accuracyRating: 1 | 2 | 3 | 4 | 5;
  officerObservations: string;
}

// 32. officer_workload
export interface OfficerWorkloadRecord extends BaseEntity {
  officerUid: string;
  officerName: string;
  role: UserRole;
  districtId: string;
  stateId: string;
  assignedCases: number;
  pendingCases: number;
  completedCases: number;
  overdueCases: number;
  averageResolutionDays: number;
  maxCapacity: number;
  complexityScore: number; // 1 to 5
  calculatedWorkloadScore: number; // percentage 0 to 100+
  isAvailable: boolean;
}

export interface WorkloadReassignmentPlan {
  id: string;
  sourceDistrictId: string;
  targetDistrictId: string;
  sourceOfficerUid: string;
  sourceOfficerName: string;
  targetOfficerUid: string;
  targetOfficerName: string;
  reassignedCasesCount: number;
  caseIds: string[];
  rationale: string;
  preSourceLoadPct: number;
  postSourceLoadPct: number;
  preTargetLoadPct: number;
  postTargetLoadPct: number;
  projectedDelayReductionDays: number;
  status: 'PROPOSED' | 'APPROVED' | 'REJECTED';
}

// 33. heatmap_intelligence
export type HeatmapLayerType =
  | 'DELAY_RISK'
  | 'COMPENSATION_BURDEN'
  | 'OWNERSHIP_COMPLEXITY'
  | 'LITIGATION'
  | 'RR_BURDEN'
  | 'DOCUMENT_COMPLETENESS';

export interface ParcelIntelligenceMetrics {
  parcelId: string;
  khasraNo: string;
  delayRiskScore: number; // 0 to 100
  delayRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  compensationBurdenINR: number;
  pendingCompensationINR: number;
  ownershipCount: number;
  ownershipConflict: boolean;
  hasActiveLitigation: boolean;
  litigationCaseNo?: string;
  affectedFamiliesCount: number;
  pendingRRCount: number;
  documentCompletenessPct: number;
  primaryRiskReason: string;
  recommendedAction: string;
}
