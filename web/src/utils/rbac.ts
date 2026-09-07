// ============================================================
// rbac.ts - Statutory RBAC Engine for BHUMI-SHIELD
// Defines granular permissions, capability checks, and role definitions
// aligned with the RFCTLARR Act (2013) and MoRTH hierarchy.
// ============================================================

import { UserRole } from '../types';

export type Permission =
  // Workspace Level Access
  | 'VIEW_COMMAND_CENTER'
  | 'VIEW_CORRIDOR_READINESS'
  | 'VIEW_DIGITAL_TWIN'
  | 'VIEW_OPS_INTELLIGENCE'
  | 'VIEW_ADMIN_WORKSPACE'
  | 'VIEW_KRISHI_SATHI'
  | 'REGISTER_FARMER'

  // Digital Twin Tabs
  | 'TAB_OVERVIEW'
  | 'TAB_LIFECYCLE'
  | 'TAB_GIS'
  | 'TAB_PARCELS'
  | 'TAB_DOCUMENTS'
  | 'TAB_COMPENSATION'
  | 'TAB_RR'
  | 'TAB_LEGAL'
  | 'TAB_FIELD_EVIDENCE'
  | 'TAB_INTELLIGENCE'
  | 'TAB_ACTIONS'
  | 'TAB_AUDIT'

  // Statutory Actions & Powers
  | 'INTAKE_PARCEL'
  | 'EDIT_PARCEL'
  | 'SIGN_AWARD_DECREE'
  | 'MARK_PARCEL_DISBURSED'
  | 'ADVANCE_LIFECYCLE_STAGE'
  | 'ISSUE_INTERVENTION_DIRECTIVE'
  | 'REASSIGN_OFFICER_WORKLOAD'
  | 'UPLOAD_STATUTORY_DOCUMENT'
  | 'DISBURSE_PFMS_COMPENSATION'
  | 'CREATE_RR_CASE'
  | 'FILE_LEGAL_WRIT'
  | 'UPLOAD_FIELD_EVIDENCE'
  | 'OVERRIDE_PII_MASKING'
  | 'RESET_DEMO_DATA'
  | 'RUN_WHAT_IF_SIMULATION';

export interface RoleCapability {
  role: UserRole;
  title: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  scope: 'Pan-India' | 'State-Wide' | 'District-Wide' | 'Corridor-Specific' | 'Revenue Circle' | 'Auditing / Vigilance' | 'Citizen Portal';
  description: string;
  permissions: Permission[];
}

export const ROLE_CAPABILITIES: Record<UserRole, RoleCapability> = {
  'NATIONAL_EXECUTIVE': {
    role: 'NATIONAL_EXECUTIVE',
    title: 'National & District Executive Cockpit',
    badgeBg: 'bg-[#FFF7ED]',
    badgeText: 'text-[#EA580C]',
    badgeBorder: 'border-[#FFEDD5]',
    scope: 'Pan-India',
    description: 'Unified command consolidating Cabinet Secretariat, State Revenue, and District Collector. Sovereign oversight, Section 11/19 declarations, policy directives, What-If simulation, and officer workload balancing.',
    permissions: [
      'VIEW_COMMAND_CENTER',
      'VIEW_CORRIDOR_READINESS',
      'VIEW_DIGITAL_TWIN',
      'VIEW_OPS_INTELLIGENCE',
      'VIEW_ADMIN_WORKSPACE',
      'VIEW_KRISHI_SATHI',
      'REGISTER_FARMER',
      'TAB_OVERVIEW',
      'TAB_LIFECYCLE',
      'TAB_GIS',
      'TAB_PARCELS',
      'TAB_DOCUMENTS',
      'TAB_COMPENSATION',
      'TAB_RR',
      'TAB_LEGAL',
      'TAB_FIELD_EVIDENCE',
      'TAB_INTELLIGENCE',
      'TAB_ACTIONS',
      'TAB_AUDIT',
      'INTAKE_PARCEL',
      'EDIT_PARCEL',
      'SIGN_AWARD_DECREE',
      'MARK_PARCEL_DISBURSED',
      'ADVANCE_LIFECYCLE_STAGE',
      'ISSUE_INTERVENTION_DIRECTIVE',
      'REASSIGN_OFFICER_WORKLOAD',
      'UPLOAD_STATUTORY_DOCUMENT',
      'DISBURSE_PFMS_COMPENSATION',
      'CREATE_RR_CASE',
      'FILE_LEGAL_WRIT',
      'UPLOAD_FIELD_EVIDENCE',
      'OVERRIDE_PII_MASKING',
      'RESET_DEMO_DATA',
      'RUN_WHAT_IF_SIMULATION',
    ],
  },
  'FIELD_ACQUISITION': {
    role: 'FIELD_ACQUISITION',
    title: 'Ground Field & Statutory Acquisition Suite',
    badgeBg: 'bg-[#FEFCE8]',
    badgeText: 'text-[#A16207]',
    badgeBorder: 'border-[#FEF08A]',
    scope: 'Corridor-Specific',
    description: 'Operational suite consolidating Competent Authority Land Acquisition (CALA), Circle Officer, and Field Surveyor. Section 23 inquiry, 100% solatium computation, DGPS drone mapping, and AR boundary verification.',
    permissions: [
      'VIEW_CORRIDOR_READINESS',
      'VIEW_DIGITAL_TWIN',
      'VIEW_OPS_INTELLIGENCE',
      'VIEW_KRISHI_SATHI',
      'REGISTER_FARMER',
      'TAB_OVERVIEW',
      'TAB_LIFECYCLE',
      'TAB_GIS',
      'TAB_PARCELS',
      'TAB_DOCUMENTS',
      'TAB_COMPENSATION',
      'TAB_LEGAL',
      'TAB_FIELD_EVIDENCE',
      'TAB_ACTIONS',
      'TAB_AUDIT',
      'INTAKE_PARCEL',
      'EDIT_PARCEL',
      'SIGN_AWARD_DECREE',
      'MARK_PARCEL_DISBURSED',
      'ADVANCE_LIFECYCLE_STAGE',
      'UPLOAD_STATUTORY_DOCUMENT',
      'DISBURSE_PFMS_COMPENSATION',
      'UPLOAD_FIELD_EVIDENCE',
      'RUN_WHAT_IF_SIMULATION',
    ],
  },
  'AUDIT_CITIZEN': {
    role: 'AUDIT_CITIZEN',
    title: 'Audit, Compliance & Public Transparency Portal',
    badgeBg: 'bg-[#ECFDF5]',
    badgeText: 'text-[#065F46]',
    badgeBorder: 'border-[#A7F3D0]',
    scope: 'Auditing / Vigilance',
    description: 'Transparency & verification suite consolidating CAG / Statutory Auditor and Project Affected Families (PAF). Immutable SHA-256 ledger, PFMS disbursement reconciliation, public gazette tracking, and grievance SLA arbitration.',
    permissions: [
      'VIEW_COMMAND_CENTER',
      'VIEW_CORRIDOR_READINESS',
      'VIEW_DIGITAL_TWIN',
      'VIEW_ADMIN_WORKSPACE',
      'TAB_OVERVIEW',
      'TAB_LIFECYCLE',
      'TAB_GIS',
      'TAB_DOCUMENTS',
      'TAB_COMPENSATION',
      'TAB_RR',
      'TAB_AUDIT',
      'OVERRIDE_PII_MASKING',
    ],
  },
};


/**
 * Checks if a specific role is authorized to perform a permission action.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const cap = ROLE_CAPABILITIES[role];
  if (!cap) return false;
  return cap.permissions.includes(permission);
}

/**
 * Returns a human-friendly warning or explanation if an action is restricted for a role.
 */
export function getPermissionReason(role: UserRole, permission: Permission): string {
  if (hasPermission(role, permission)) return '';
  return `Access Restricted: '${role}' clearance does not possess statutory authority for '${permission}'.`;
}
