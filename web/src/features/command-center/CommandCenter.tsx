import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { useBottleneckEngine } from '../../hooks/useBottleneckEngine';
import {
  projectService,
  parcelService,
  stateService,
  districtService,
  villageService,
  bottleneckService,
  interventionService,
  workflowEventService,
  compensationService,
  iotDeviceService,
} from '../../services/entities.service';
import { auditService } from '../../services/audit.service';
import { NationalOperationalHeader } from './components/NationalOperationalHeader';
import { GeographicDrillDownBar, DrillDownState } from './components/GeographicDrillDownBar';
import { GISCommandMap } from './components/GISCommandMap';
import { CriticalProjectsPanel } from './components/CriticalProjectsPanel';
import { EmergingBottlenecksPanel } from './components/EmergingBottlenecksPanel';
import { PriorityInterventionsPanel } from './components/PriorityInterventionsPanel';
import { RecentChangesFeed } from './components/RecentChangesFeed';

export const CommandCenter: React.FC = () => {
  const { activeRole, userProfile } = useAuth();

  const isLockedToState = Boolean(userProfile?.stateId && activeRole !== 'NATIONAL_EXECUTIVE');
  const isLockedToDistrict = Boolean(userProfile?.districtId && activeRole !== 'NATIONAL_EXECUTIVE');

  const { data: allStates } = useFirestoreCollection(stateService);
  const { data: allDistricts } = useFirestoreCollection(districtService);
  const { data: allProjects } = useFirestoreCollection(projectService);
  const { data: allVillages } = useFirestoreCollection(villageService);
  const { data: allParcels } = useFirestoreCollection(parcelService);
  const { data: allBottlenecks } = useFirestoreCollection(bottleneckService);
  const { data: allInterventions } = useFirestoreCollection(interventionService);
  const { data: allWorkflowEvents } = useFirestoreCollection(workflowEventService);
  const { data: allAuditLogs } = useFirestoreCollection(auditService);
  const { data: allCompensations } = useFirestoreCollection(compensationService);
  const { data: allIoTDevices } = useFirestoreCollection(iotDeviceService);

  const [drillDown, setDrillDown] = useState<DrillDownState>(() => {
    if (isLockedToDistrict && userProfile?.districtId) {
      return { stateId: userProfile?.stateId, districtId: userProfile?.districtId };
    }
    if (isLockedToState && userProfile?.stateId) {
      return { stateId: userProfile?.stateId };
    }
    return {};
  });

  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      if (drillDown.projectId && p.id !== drillDown.projectId) return false;
      if (drillDown.districtId && !p.districtIds?.includes(drillDown.districtId)) return false;
      if (drillDown.stateId && p.stateId !== drillDown.stateId) return false;
      return true;
    });
  }, [allProjects, drillDown]);

  const filteredParcels = useMemo(() => {
    return allParcels.filter((p) => {
      if (drillDown.parcelId && p.id !== drillDown.parcelId) return false;
      if (drillDown.villageId && p.villageId !== drillDown.villageId) return false;
      if (drillDown.projectId && p.projectId !== drillDown.projectId) return false;
      return true;
    });
  }, [allParcels, drillDown]);

  const filteredBottlenecks = useMemo(() => {
    if (!drillDown.projectId) return allBottlenecks;
    return allBottlenecks.filter((b) => b.projectId === drillDown.projectId);
  }, [allBottlenecks, drillDown.projectId]);

  // ── Compute live bottlenecks from parcel data (bhoomisetu engine) ──
  // Use the first filtered project's stage as the context for computation.
  const focusedProject = drillDown.projectId
    ? allProjects.find((p) => p.id === drillDown.projectId)
    : allProjects[0];

  const focusedParcels = drillDown.projectId
    ? filteredParcels
    : allParcels.slice(0, 200); // limit for perf on pan-India view

  const focusedWorkflowEvents = useMemo(() => {
    if (!drillDown.projectId) return allWorkflowEvents.slice(0, 100);
    return allWorkflowEvents.filter((e) => e.projectId === drillDown.projectId);
  }, [allWorkflowEvents, drillDown.projectId]);

  const computedBottlenecks = useBottleneckEngine({
    parcels: focusedParcels,
    workflowEvents: focusedWorkflowEvents,
    currentStageKey: focusedProject?.currentStage || 'Sec_19_Declaration',
  });

  const filteredInterventions = useMemo(() => {
    if (!drillDown.projectId) return allInterventions;
    return allInterventions.filter((i) => i.projectId === drillDown.projectId);
  }, [allInterventions, drillDown.projectId]);

  const scopeLabel = useMemo(() => {
    if (drillDown.parcelId) return `Parcel #${drillDown.parcelId}`;
    if (drillDown.villageId) {
      const v = allVillages.find((x) => x.id === drillDown.villageId);
      return `Village: ${v?.name || drillDown.villageId}`;
    }
    if (drillDown.projectId) {
      const p = allProjects.find((x) => x.id === drillDown.projectId);
      return `Corridor: ${p?.code || drillDown.projectId}`;
    }
    if (drillDown.districtId) {
      const d = allDistricts.find((x) => x.id === drillDown.districtId);
      return `District: ${d?.name || drillDown.districtId}`;
    }
    if (drillDown.stateId) {
      const s = allStates.find((x) => x.id === drillDown.stateId);
      return `State: ${s?.name || drillDown.stateId}`;
    }
    return 'Pan-India Overview';
  }, [drillDown, allStates, allDistricts, allProjects, allVillages]);

  const totalDisbursedCr = useMemo(() => {
    const sum = allCompensations.reduce((acc, c) => acc + (c.totalPayableINR || 0), 0);
    return sum / 10000000;
  }, [allCompensations]);

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-[#0B132B] ">
      <NationalOperationalHeader
        activeRole={activeRole}
        scopeLabel={scopeLabel}
        totalCorridors={filteredProjects.length}
        triagedBottlenecks={filteredBottlenecks.length}
        delayedProjects={filteredProjects.filter((p) => p.status === 'DELAYED' || p.status === 'LITIGATION').length}
        totalDisbursedINR={totalDisbursedCr * 10000000}
      />

      <GeographicDrillDownBar
        drillDown={drillDown}
        onDrillDownChange={setDrillDown}
        states={allStates}
        districts={allDistricts}
        projects={allProjects}
        villages={allVillages}
        parcels={allParcels}
        isLockedToState={isLockedToState}
        isLockedToDistrict={isLockedToDistrict}
      />

      <div className="p-6 space-y-6 bg-transparent">
        <GISCommandMap
          drillDown={drillDown}
          projects={filteredProjects}
          parcels={filteredParcels}
          bottlenecks={filteredBottlenecks}
          iotDevices={allIoTDevices}
          compensations={allCompensations}
          onSelectProject={(projectId) => setDrillDown((prev) => ({ ...prev, projectId }))}
          onSelectParcel={(parcelId) => setDrillDown((prev) => ({ ...prev, parcelId }))}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CriticalProjectsPanel
            projects={filteredProjects}
            selectedProjectId={drillDown.projectId}
            onSelectProject={(projectId) => setDrillDown((prev) => ({ ...prev, projectId }))}
          />

          <EmergingBottlenecksPanel
            bottlenecks={filteredBottlenecks}
            computedBottlenecks={computedBottlenecks}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PriorityInterventionsPanel
            interventions={filteredInterventions}
          />

          <RecentChangesFeed
            workflowEvents={allWorkflowEvents}
            auditLogs={allAuditLogs as any}
          />
        </div>
      </div>
    </div>
  );
};
