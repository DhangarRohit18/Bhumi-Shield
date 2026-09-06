import { FirestoreGenericService } from './firestoreGeneric.service';
import {
  UserProfile,
  RoleDefinition,
  StateMaster,
  DistrictMaster,
  Department,
  Project,
  Village,
  Parcel,
  AffectedFamily,
  WorkflowEvent,
  TaskItem,
  ApprovalRecord,
  LegalDocument,
  DocumentVersion,
  CompensationAward,
  RRCase,
  LegalCase,
  Grievance,
  FieldVisit,
  FieldEvidence,
  QRAsset,
  IoTDevice,
  IoTEvent,
  Bottleneck,
  DependencyEdge,
  PredictionRecord,
  InterventionStrategy,
  SimulationRun,
  AppNotification,
  ModelFeedback,
  OfficerWorkloadRecord,
} from '../types';

export const userService = new FirestoreGenericService<UserProfile>('users');
export const roleService = new FirestoreGenericService<RoleDefinition>('roles');
export const stateService = new FirestoreGenericService<StateMaster>('states');
export const districtService = new FirestoreGenericService<DistrictMaster>('districts');
export const departmentService = new FirestoreGenericService<Department>('departments');
export const projectService = new FirestoreGenericService<Project>('projects');
export const villageService = new FirestoreGenericService<Village>('villages');
export const parcelService = new FirestoreGenericService<Parcel>('parcels');
export const affectedFamilyService = new FirestoreGenericService<AffectedFamily>('affected_families');
export const workflowEventService = new FirestoreGenericService<WorkflowEvent>('workflow_events');
export const taskService = new FirestoreGenericService<TaskItem>('tasks');
export const approvalService = new FirestoreGenericService<ApprovalRecord>('approvals');
export const documentService = new FirestoreGenericService<LegalDocument>('documents');
export const documentVersionService = new FirestoreGenericService<DocumentVersion>('document_versions');
export const compensationService = new FirestoreGenericService<CompensationAward>('compensation');
export const rrCaseService = new FirestoreGenericService<RRCase>('rr_cases');
export const legalCaseService = new FirestoreGenericService<LegalCase>('legal_cases');
export const grievanceService = new FirestoreGenericService<Grievance>('grievances');
export const fieldVisitService = new FirestoreGenericService<FieldVisit>('field_visits');
export const fieldEvidenceService = new FirestoreGenericService<FieldEvidence>('field_evidence');
export const qrAssetService = new FirestoreGenericService<QRAsset>('qr_assets');
export const iotDeviceService = new FirestoreGenericService<IoTDevice>('iot_devices');
export const iotEventService = new FirestoreGenericService<IoTEvent>('iot_events');
export const bottleneckService = new FirestoreGenericService<Bottleneck>('bottlenecks');
export const dependencyService = new FirestoreGenericService<DependencyEdge>('dependencies');
export const predictionService = new FirestoreGenericService<PredictionRecord>('predictions');
export const interventionService = new FirestoreGenericService<InterventionStrategy>('interventions');
export const simulationService = new FirestoreGenericService<SimulationRun>('simulations');
export const notificationService = new FirestoreGenericService<AppNotification>('notifications');
export const modelFeedbackService = new FirestoreGenericService<ModelFeedback>('model_feedback');
export const officerWorkloadService = new FirestoreGenericService<OfficerWorkloadRecord>('officer_workloads');
