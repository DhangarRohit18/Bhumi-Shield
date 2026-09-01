import { workflowEventService } from './entities.service';
import { auditService } from './audit.service';
import { WorkflowEvent, UserRole } from '../types';

export class WorkflowService {
  // Record statutory land acquisition stage event
  async recordStageTransition(params: {
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
  }): Promise<string> {
    const eventId = await workflowEventService.create({
      projectId: params.projectId,
      parcelId: params.parcelId,
      stage: params.stage,
      actionTaken: params.actionTaken,
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      comments: params.comments,
      statusChangeFrom: params.statusChangeFrom,
      statusChangeTo: params.statusChangeTo,
      gazetteOrderNo: params.gazetteOrderNo,
    });

    // Also trigger immutable audit log
    await auditService.logAction({
      targetCollection: 'workflow_events',
      targetDocId: eventId,
      action: 'CREATE',
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      diffPayload: {
        stage: params.stage,
        actionTaken: params.actionTaken,
        statusChangeTo: params.statusChangeTo,
      },
    });

    return eventId;
  }
}

export const workflowService = new WorkflowService();
