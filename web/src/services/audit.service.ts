import { FirestoreGenericService } from './firestoreGeneric.service';
import { AuditLogEntry, UserRole } from '../types';

class AuditService extends FirestoreGenericService<AuditLogEntry> {
  constructor() {
    super('audit_logs');
  }

  // Immutable audit log creation
  async logAction(params: {
    targetCollection: string;
    targetDocId: string;
    action: AuditLogEntry['action'];
    actorId: string;
    actorName: string;
    actorRole: UserRole;
    diffPayload?: Record<string, any>;
    ipAddress?: string;
  }): Promise<string> {
    const timestamp = Date.now();
    // Cryptographic-like verification signature placeholder for immutable integrity
    const verificationHash = `SIG_${params.targetCollection}_${params.targetDocId}_${timestamp}_${Math.random().toString(36).substring(2, 9)}`;

    return await this.create({
      targetCollection: params.targetCollection,
      targetDocId: params.targetDocId,
      action: params.action,
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      timestamp,
      diffPayload: params.diffPayload || {},
      ipAddress: params.ipAddress || 'browser-client',
      verificationHash,
    });
  }
}

export const auditService = new AuditService();
