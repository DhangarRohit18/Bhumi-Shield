import { FirestoreGenericService } from './firestoreGeneric.service';
import { AuditLogEntry, UserRole } from '../types';

async function generateSHA256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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
    
    // Create deterministic payload for hashing
    const payloadStr = JSON.stringify({
      targetCollection: params.targetCollection,
      targetDocId: params.targetDocId,
      action: params.action,
      actorId: params.actorId,
      timestamp,
      diffPayload: params.diffPayload || {}
    });
    
    // Tamper-Evident Hash Generation
    const verificationHash = await generateSHA256(payloadStr);

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
