import React from 'react';
import { ChevronRight, Globe, Layers, Navigation, Home } from 'lucide-react';
import { StateMaster, DistrictMaster, Project, Village, Parcel } from '../../../types';

export interface DrillDownState {
  stateId?: string;
  districtId?: string;
  projectId?: string;
  villageId?: string;
  parcelId?: string;
}

interface DrillDownProps {
  drillDown: DrillDownState;
  onDrillDownChange: (newDrill: DrillDownState) => void;
  states: StateMaster[];
  districts: DistrictMaster[];
  projects: Project[];
  villages: Village[];
  parcels: Parcel[];
  isLockedToState?: boolean;
  isLockedToDistrict?: boolean;
}

export const GeographicDrillDownBar: React.FC<DrillDownProps> = ({
  drillDown,
  onDrillDownChange,
  states,
  districts,
  projects,
  villages,
  parcels,
  isLockedToState,
  isLockedToDistrict,
}) => {
  const availableDistricts = drillDown.stateId
    ? districts.filter((d) => d.stateId === drillDown.stateId)
    : districts;

  const availableProjects = projects.filter((p) => {
    if (drillDown.stateId && p.stateId !== drillDown.stateId) return false;
    if (drillDown.districtId && !p.districtIds?.includes(drillDown.districtId)) return false;
    return true;
  });

  const availableVillages = drillDown.projectId
    ? villages.filter((v) => v.projectId === drillDown.projectId)
    : drillDown.districtId
    ? villages.filter((v) => v.districtId === drillDown.districtId)
    : villages;

  const availableParcels = drillDown.villageId
    ? parcels.filter((p) => p.villageId === drillDown.villageId)
    : drillDown.projectId
    ? parcels.filter((p) => p.projectId === drillDown.projectId)
    : parcels;

  return (
    <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs  shadow-soft">
      <div className="flex items-center flex-wrap gap-1.5 font-medium text-[#0B132B]">
        <button
          onClick={() => onDrillDownChange({})}
          disabled={isLockedToState || isLockedToDistrict}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            !drillDown.stateId
              ? 'bg-[#0B132B] text-white font-extrabold border border-[#0B132B] shadow-soft'
              : 'hover:bg-indigo-50 text-indigo-600 bg-transparent'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-indigo-600" />
          <span>India (National)</span>
        </button>

        <ChevronRight className="w-3.5 h-3.5 text-[#E0E7FF] shrink-0" />

        <select
          value={drillDown.stateId || ''}
          onChange={(e) =>
            onDrillDownChange({
              stateId: e.target.value || undefined,
            })
          }
          disabled={isLockedToState || isLockedToDistrict}
          aria-label="State Selection"
          className="bg-transparent border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-[#0B132B] font-extrabold focus:outline-none focus:border-[#4F46E5] cursor-pointer shadow-xs"
        >
          <option value="">All States ({states.length})</option>
          {states.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>

        <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1] shrink-0" />

        <select
          value={drillDown.districtId || ''}
          onChange={(e) =>
            onDrillDownChange({
              ...drillDown,
              districtId: e.target.value || undefined,
              projectId: undefined,
              villageId: undefined,
              parcelId: undefined,
            })
          }
          disabled={isLockedToDistrict}
          aria-label="District Selection"
          className="bg-transparent border border-[#CBD5E1] rounded-xl px-2.5 py-1.5 text-[#0B132B] font-extrabold focus:outline-none focus:border-[#0B132B] cursor-pointer shadow-soft"
        >
          <option value="">All Districts ({availableDistricts.length})</option>
          {availableDistricts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1] shrink-0" />

        <select
          value={drillDown.projectId || ''}
          onChange={(e) =>
            onDrillDownChange({
              ...drillDown,
              projectId: e.target.value || undefined,
              villageId: undefined,
              parcelId: undefined,
            })
          }
          aria-label="Project Selection"
          className="bg-transparent border border-[#CBD5E1] rounded-xl px-2.5 py-1.5 text-[#0B132B] font-extrabold focus:outline-none focus:border-[#0B132B] cursor-pointer max-w-[180px] truncate shadow-soft"
        >
          <option value="">All Corridors ({availableProjects.length})</option>
          {availableProjects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1] shrink-0" />

        <select
          value={drillDown.villageId || ''}
          onChange={(e) =>
            onDrillDownChange({
              ...drillDown,
              villageId: e.target.value || undefined,
              parcelId: undefined,
            })
          }
          aria-label="Village Selection"
          className="bg-transparent border border-[#CBD5E1] rounded-xl px-2.5 py-1.5 text-[#0B132B] font-extrabold focus:outline-none focus:border-[#0B132B] cursor-pointer shadow-soft"
        >
          <option value="">All Villages ({availableVillages.length})</option>
          {availableVillages.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>

        <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1] shrink-0" />

        <select
          value={drillDown.parcelId || ''}
          onChange={(e) =>
            onDrillDownChange({
              ...drillDown,
              parcelId: e.target.value || undefined,
            })
          }
          aria-label="Parcel Selection"
          className="bg-transparent border border-[#CBD5E1] rounded-xl px-2.5 py-1.5 text-[#0B132B] font-mono font-extrabold focus:outline-none focus:border-[#0B132B] cursor-pointer shadow-soft"
        >
          <option value="">All Parcels ({availableParcels.length})</option>
          {availableParcels.map((p) => (
            <option key={p.id} value={p.id}>
              Survey #{p.khasraSurveyNo} ({p.status})
            </option>
          ))}
        </select>
      </div>

      {(drillDown.stateId || drillDown.districtId || drillDown.projectId || drillDown.villageId || drillDown.parcelId) && !isLockedToState && !isLockedToDistrict && (
        <button
          onClick={() => onDrillDownChange({})}
          className="text-[11px] text-[#475569] hover:text-[#0B132B] font-extrabold underline flex items-center gap-1 cursor-pointer"
        >
          <span>Reset to India Overview</span>
        </button>
      )}
    </div>
  );
};
