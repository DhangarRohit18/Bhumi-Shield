import { UserRole } from '../types';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  'NATIONAL_EXECUTIVE': ['analytics.all_states', 'projects.manage', 'users.manage_all', 'roles.manage', 'audit.read_all', 'projects.create', 'awards.approve', 'compensation.disburse_order'],
  'FIELD_ACQUISITION': ['parcels.survey', 'parcels.valuation', 'awards.generate', 'affected_families.manage', 'field.schedule_visits', 'field.assign_officers', 'evidence.review', 'qr.verify', 'field.capture_evidence', 'qr.scan', 'parcels.inspect'],
  'AUDIT_CITIZEN': ['audit.forensic_view', 'compensation.audit_trail', 'projects.read_all', 'legal.read', 'public.view_gazette', 'public.track_claim', 'grievances.submit', 'grievances.view_own'],
};

export class RbacService {
  static hasPermission(role: UserRole, permission: string): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission) || role === 'NATIONAL_EXECUTIVE';
  }

  static canAccessRoute(role: UserRole, routePath: string): boolean {
    if (role === 'NATIONAL_EXECUTIVE') return true;
    if (routePath.startsWith('/admin') && role !== 'AUDIT_CITIZEN') return false;
    if (routePath.startsWith('/audit') && role !== 'AUDIT_CITIZEN') return false;
    if (routePath.startsWith('/field') && role !== 'FIELD_ACQUISITION') return false;
    return true;
  }
}
