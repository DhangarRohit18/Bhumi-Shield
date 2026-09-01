import { UserRole } from '../types';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  'National Admin': ['analytics.all_states', 'projects.manage', 'users.manage_all', 'roles.manage', 'audit.read_all'],
  'State Admin': ['analytics.state', 'projects.create', 'projects.manage_state', 'districts.manage'],
  'District Officer': ['projects.read_district', 'parcels.manage', 'awards.approve', 'compensation.disburse_order'],
  'Acquisition Officer': ['parcels.survey', 'parcels.valuation', 'awards.generate', 'affected_families.manage'],
  'Field Supervisor': ['field.schedule_visits', 'field.assign_officers', 'evidence.review', 'qr.verify'],
  'Field Officer': ['field.capture_evidence', 'qr.scan', 'parcels.inspect', 'grievances.intake'],
  'Auditor': ['audit.forensic_view', 'compensation.audit_trail', 'projects.read_all', 'legal.read'],
  'Public User': ['public.view_gazette', 'public.track_claim', 'grievances.submit', 'grievances.view_own'],
};

export class RbacService {
  static hasPermission(role: UserRole, permission: string): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission) || role === 'National Admin';
  }

  static canAccessRoute(role: UserRole, routePath: string): boolean {
    if (role === 'National Admin') return true;
    if (routePath.startsWith('/admin') && role !== 'State Admin') return false;
    if (routePath.startsWith('/audit') && role !== 'Auditor') return false;
    if (routePath.startsWith('/field') && !['Field Supervisor', 'Field Officer', 'Acquisition Officer'].includes(role)) return false;
    return true;
  }
}
