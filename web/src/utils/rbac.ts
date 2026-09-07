// ============================================================
// rbac.ts - Statutory RBAC Engine for BHUMI-SHIELD
// Defines granular permissions, capability checks, and role definitions
// aligned with the RFCTLARR Act (2013) and MoRTH hierarchy.
// ============================================================

import { UserRole } from '../types';

export type Permission =
  // Workspace Level Access
  | 'VIEW_COMMAND_CENTER'
  | 'VIEW_DIGITAL_TWIN'
  | 'VIEW_OPS_INTELLIGENCE'
  | 'VIEW_ADMIN_WORKSPACE'

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
  'National Admin': {
    role: 'National Admin',
    title: 'Cabinet Secretariat / MoRTH National Command',
    badgeBg: 'bg-[#FFF7ED]',
    badgeText: 'text-[#EA580C]',
    badgeBorder: 'border-[#FFEDD5]',
    scope: 'Pan-India',
    description: 'Supreme oversight, national corridor approvals, policy interventions, and administrative decree issuance.',
    permissions: [
      'VIEW_COMMAND_CENTER',
      'VIEW_DIGITAL_TWIN',
      'VIEW_OPS_INTELLIGENCE',
      'VIEW_ADMIN_WORKSPACE',
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
  'State Admin': {
    role: 'State Admin',
    title: 'State Revenue Dept. & Public Works Administration',
    badgeBg: 'bg-[#EFF6FF]',
    badgeText: 'text-[#1D4ED8]',
    badgeBorder: 'border-[#BFDBFE]',
    scope: 'State-Wide',
    description: 'State-level multi-district coordination, Section 11/19 gazette publishing, and inter-departmental clearances.',
    permissions: [
      'VIEW_COMMAND_CENTER',
      'VIEW_DIGITAL_TWIN',
      'VIEW_OPS_INTELLIGENCE',
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
      'ADVANCE_LIFECYCLE_STAGE',
      'ISSUE_INTERVENTION_DIRECTIVE',
      'REASSIGN_OFFICER_WORKLOAD',
      'UPLOAD_STATUTORY_DOCUMENT',
      'CREATE_RR_CASE',
      'FILE_LEGAL_WRIT',
      'RUN_WHAT_IF_SIMULATION',
    ],
  },
  'District Officer': {
    role: 'District Officer',
    title: 'District Collector / Magistrate (DM)',
    badgeBg: 'bg-[#F0FDF4]',
    badgeText: 'text-[#15803D]',
    badgeBorder: 'border-[#BBF7D0]',
    scope: 'District-Wide',
    description: 'District land acquisition authority, grievance arbitration, award validations, and CALA supervision.',
    permissions: [
      'VIEW_COMMAND_CENTER',
      'VIEW_DIGITAL_TWIN',
      'VIEW_OPS_INTELLIGENCE',
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
      'ADVANCE_LIFECYCLE_STAGE',
      'ISSUE_INTERVENTION_DIRECTIVE',
      'UPLOAD_STATUTORY_DOCUMENT',
      'CREATE_RR_CASE',
      'FILE_LEGAL_WRIT',
      'RUN_WHAT_IF_SIMULATION',
    ],
  },
  'Acquisition Officer': {
    role: 'Acquisition Officer',
    title: 'Competent Authority Land Acquisition (CALA)',
    badgeBg: 'bg-[#FEFCE8]',
    badgeText: 'text-[#A16207]',
    badgeBorder: 'border-[#FEF08A]',
    scope: 'Corridor-Specific',
    description: 'Section 23 valuation inquiry, Section 30 solatium calculations, direct award decree signing & PFMS disbursements.',
    permissions: [
      'VIEW_DIGITAL_TWIN',
      'VIEW_OPS_INTELLIGENCE',
      'TAB_OVERVIEW',
      'TAB_LIFECYCLE',
      'TAB_GIS',
      'TAB_PARCELS',
      'TAB_DOCUMENTS',
      'TAB_COMPENSATION',
      'TAB_LEGAL',
      'TAB_ACTIONS',
      'TAB_AUDIT',
      'INTAKE_PARCEL',
      'EDIT_PARCEL',
      'SIGN_AWARD_DECREE',
      'MARK_PARCEL_DISBURSED',
      'ADVANCE_LIFECYCLE_STAGE',
      'UPLOAD_STATUTORY_DOCUMENT',
      'DISBURSE_PFMS_COMPENSATION',
      'RUN_WHAT_IF_SIMULATION',
    ],
  },
  'Field Supervisor': {
    role: 'Field Supervisor',
    title: 'Assistant Director / Circle Officer (Land Records)',
    badgeBg: 'bg-[#FAF5FF]',
    badgeText: 'text-[#7E22CE]',
    badgeBorder: 'border-[#E9D5FF]',
    scope: 'Revenue Circle',
    description: 'Ground survey management, DGPS pillar inspections, cadastral drone mapping, and field team allocation.',
    permissions: [
      'VIEW_OPS_INTELLIGENCE',
      'VIEW_DIGITAL_TWIN',
      'TAB_OVERVIEW',
      'TAB_GIS',
      'TAB_PARCELS',
      'TAB_FIELD_EVIDENCE',
      'TAB_ACTIONS',
      'TAB_AUDIT',
      'INTAKE_PARCEL',
      'EDIT_PARCEL',
      'UPLOAD_FIELD_EVIDENCE',
    ],
  },
  'Field Officer': {
    role: 'Field Officer',
    title: 'Talathi / Amin / Ground Surveyor',
    badgeBg: 'bg-[#FDF2F8]',
    badgeText: 'text-[#BE185D]',
    badgeBorder: 'border-[#FBCFE8]',
    scope: 'Revenue Circle',
    description: 'On-site survey verification, QR boundary tagging, and geotagged tamper-evident photo/video capture.',
    permissions: [
      'VIEW_DIGITAL_TWIN',
      'TAB_PARCELS',
      'TAB_FIELD_EVIDENCE',
      'TAB_GIS',
      'UPLOAD_FIELD_EVIDENCE',
    ],
  },
  'Auditor': {
    role: 'Auditor',
    title: 'CAG / Statutory Vigilance & Audit Officer',
    badgeBg: 'bg-[#F1F5F9]',
    badgeText: 'text-[#334155]',
    badgeBorder: 'border-[#CBD5E1]',
    scope: 'Auditing / Vigilance',
    description: 'Cryptographic SHA-256 audit inspection, PFMS disbursement reconciliation, and statutory timeline compliance verification.',
    permissions: [
      'VIEW_ADMIN_WORKSPACE',
      'VIEW_COMMAND_CENTER',
      'VIEW_DIGITAL_TWIN',
      'TAB_OVERVIEW',
      'TAB_DOCUMENTS',
      'TAB_COMPENSATION',
      'TAB_RR',
      'TAB_AUDIT',
      'OVERRIDE_PII_MASKING',
    ],
  },
  'Public User': {
    role: 'Public User',
    title: 'Project Affected Family (PAF) / Citizen Portal',
    badgeBg: 'bg-[#ECFDF5]',
    badgeText: 'text-[#065F46]',
    badgeBorder: 'border-[#A7F3D0]',
    scope: 'Citizen Portal',
    description: 'Transparent tracking of gazette notifications, khasra awards, solatium calculator, and entitlement transparency.',
    permissions: [
      'VIEW_COMMAND_CENTER',
      'VIEW_DIGITAL_TWIN',
      'TAB_OVERVIEW',
      'TAB_LIFECYCLE',
      'TAB_GIS',
      'TAB_DOCUMENTS',
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
