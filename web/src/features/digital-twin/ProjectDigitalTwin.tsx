import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import {
  projectService,
  parcelService,
  villageService,
  bottleneckService,
  workflowEventService,
  compensationService,
  rrCaseService,
  legalCaseService,
  fieldEvidenceService,
  documentService,
  taskService,
  predictionService,
  iotDeviceService,
} from '../../services/entities.service';
import { auditService } from '../../services/audit.service';
import { workflowService } from '../../services/workflow.service';
import { TwinHeader } from './components/TwinHeader';
import { TwinNavigation, TwinTabId } from './components/TwinNavigation';
import { TwinOverviewTab } from './components/tabs/TwinOverviewTab';
import { TwinLifecycleTab } from './components/tabs/TwinLifecycleTab';
import { TwinParcelsTab } from './components/tabs/TwinParcelsTab';
import { GISCommandMap } from '../command-center/components/GISCommandMap';
import {
  TwinDocumentsTab,
  TwinCompensationTab,
  TwinRrTab,
  TwinLegalTab,
  TwinFieldEvidenceTab,
  TwinIntelligenceTab,
  TwinActionsTab,
  TwinAuditTab,
} from './components/tabs/RemainingTabs';

export const ProjectDigitalTwin: React.FC = () => {
  const { activeRole, userProfile } = useAuth();
  
  // Set default initial tab based on role clearance
  const [activeTab, setActiveTab] = useState<TwinTabId>(() => {
    if (activeRole === 'Field Officer') return 'parcels';
    if (activeRole === 'Auditor') return 'audit';
    return 'overview';
  });

  // Keep activeTab aligned when role switches
  useEffect(() => {
    if (activeRole === 'Field Officer' && activeTab !== 'parcels' && activeTab !== 'field_evidence' && activeTab !== 'gis') {
      setActiveTab('parcels');
    } else if (activeRole === 'Auditor' && activeTab !== 'audit' && activeTab !== 'compensation' && activeTab !== 'documents') {
      setActiveTab('audit');
    }
  }, [activeRole]);

  const { data: allProjects } = useFirestoreCollection(projectService);
  const { data: allParcels } = useFirestoreCollection(parcelService);
  const { data: allVillages } = useFirestoreCollection(villageService);
  const { data: allBottlenecks } = useFirestoreCollection(bottleneckService);
  const { data: allWorkflowEvents } = useFirestoreCollection(workflowEventService);
  const { data: allAuditLogs } = useFirestoreCollection(auditService);
  const { data: allCompensations } = useFirestoreCollection(compensationService);
  const { data: allRRCases } = useFirestoreCollection(rrCaseService);
  const { data: allLegalCases } = useFirestoreCollection(legalCaseService);
  const { data: allFieldEvidence } = useFirestoreCollection(fieldEvidenceService);
  const { data: allDocuments } = useFirestoreCollection(documentService);
  const { data: allTasks } = useFirestoreCollection(taskService);
  const { data: allPredictions } = useFirestoreCollection(predictionService);
  const { data: allIoTDevices } = useFirestoreCollection(iotDeviceService);

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const activeProject =
    allProjects.find((p) => p.id === selectedProjectId) || allProjects[0] || {
      id: 'proj-bullet-train-sec-3',
      name: 'Mumbai-Ahmedabad High Speed Rail Corridor (Section 3 - Palghar)',
      code: 'MAHSR-PKG-C3',
      currentStage: 'Sec_19_Declaration',
      description: 'Acquisition of 184.6 hectares for High Speed Rail Viaduct.',
      totalAreaRequiredAcres: 456.2,
      totalBudgetINR: 14500000000,
      status: 'ACTIVE',
      startDate: '2025-01-15',
      targetCompletionDate: '2027-06-30',
      stateId: 'state-mh',
      districtIds: ['dist-palghar'],
      departmentId: 'dept-nhsrcl',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

  const projectParcels = allParcels.filter((p) => p.projectId === activeProject.id);
  const projectVillages = allVillages.filter((v) => v.projectId === activeProject.id);
  const projectBottlenecks = allBottlenecks.filter((b) => b.projectId === activeProject.id);
  const projectWorkflowEvents = allWorkflowEvents.filter((w) => w.projectId === activeProject.id);
  const projectCompensations = allCompensations.filter((c) => c.projectId === activeProject.id);
  const projectRRCases = allRRCases.filter((r) => r.projectId === activeProject.id);
  const projectLegalCases = allLegalCases.filter((l) => l.projectId === activeProject.id);
  const projectFieldEvidence = allFieldEvidence.filter((e) => e.projectId === activeProject.id);
  const projectDocuments = allDocuments.filter((d) => d.projectId === activeProject.id);
  const projectTasks = allTasks.filter((t) => t.projectId === activeProject.id);
  const projectPrediction = allPredictions.find((p) => p.projectId === activeProject.id);
  const projectIoTDevices = allIoTDevices.filter((d) => d.projectId === activeProject.id);

  const awardedParcelsCount = projectParcels.filter((p) => p.status === 'AWARDED' || p.status === 'DISBURSED').length;
  const totalCompSum = projectCompensations.reduce((acc, c) => acc + (c.totalPayableINR || 0), 0);

  const handleAdvanceStage = async (nextStage: string) => {
    if (!activeProject.id) return;
    await projectService.update(activeProject.id, {
      currentStage: nextStage as any,
    });

    await workflowService.recordStageTransition({
      projectId: activeProject.id,
      stage: nextStage,
      actionTaken: `Statutory milestone advanced to ${nextStage}`,
      actorId: userProfile?.uid || 'officer',
      actorName: userProfile?.displayName || 'CALA & SDO',
      actorRole: activeRole,
      comments: `Official decree verified by ${activeRole}`,
      statusChangeTo: nextStage,
      gazetteOrderNo: `MAH-GAZ-2026-ADV-${Math.floor(1000 + Math.random() * 9000)}`,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <TwinHeader
        project={activeProject}
        projects={allProjects}
        onSelectProject={setSelectedProjectId}
        bottlenecks={projectBottlenecks}
      />

      <TwinNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeRole={activeRole}
        counts={{
          parcels: projectParcels.length,
          documents: projectDocuments.length,
          compensations: projectCompensations.length,
          rrCases: projectRRCases.length,
          legalCases: projectLegalCases.length,
          evidence: projectFieldEvidence.length,
          auditLogs: allAuditLogs.length,
        }}
      />

      <div className="p-6 flex-1">
        {activeTab === 'overview' && (
          <TwinOverviewTab
            project={activeProject}
            parcelsCount={projectParcels.length}
            awardedCount={awardedParcelsCount}
            totalCompensationSum={totalCompSum}
            bottlenecks={projectBottlenecks}
            tasks={projectTasks}
            prediction={projectPrediction}
          />
        )}

        {activeTab === 'lifecycle' && (
          <TwinLifecycleTab
            currentStage={activeProject.currentStage}
            workflowEvents={projectWorkflowEvents}
            onAdvanceStage={handleAdvanceStage}
          />
        )}

        {activeTab === 'gis' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-[#2D2823]">Bhumi-Chakra: Spatial Sentinel & Corridor Bounds</h2>
                <p className="text-xs text-[#786C5E]">Interactive GIS geometry, surveyed plot polygons & boundary telemetry</p>
              </div>
            </div>
            <GISCommandMap
              drillDown={{ projectId: activeProject.id }}
              projects={[activeProject]}
              parcels={projectParcels}
              bottlenecks={projectBottlenecks}
              iotDevices={projectIoTDevices}
              compensations={projectCompensations}
              legalCases={projectLegalCases}
              rrCases={projectRRCases}
              documents={projectDocuments}
              tasks={projectTasks}
              onSelectProject={() => {}}
              onSelectParcel={() => {}}
              onOpenDigitalTwin={() => setActiveTab('parcels')}
            />
          </div>
        )}

        {activeTab === 'parcels' && (
          <TwinParcelsTab
            villages={projectVillages}
            parcels={projectParcels}
            families={[]}
            compensations={projectCompensations}
            rrCases={projectRRCases}
            legalCases={projectLegalCases}
            projectId={activeProject.id || 'proj-bullet-train-sec-3'}
          />
        )}

        {activeTab === 'documents' && <TwinDocumentsTab documents={projectDocuments} />}
        {activeTab === 'compensation' && <TwinCompensationTab compensations={projectCompensations} />}
        {activeTab === 'rr' && <TwinRrTab rrCases={projectRRCases} />}
        {activeTab === 'legal' && <TwinLegalTab legalCases={projectLegalCases} />}
        {activeTab === 'field_evidence' && <TwinFieldEvidenceTab evidence={projectFieldEvidence} />}
        {activeTab === 'intelligence' && <TwinIntelligenceTab prediction={projectPrediction} />}
        {activeTab === 'actions' && <TwinActionsTab projectId={activeProject.id || ''} />}
        {activeTab === 'audit' && <TwinAuditTab auditLogs={allAuditLogs as any} />}
      </div>
    </div>
  );
};
