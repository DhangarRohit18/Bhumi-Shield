import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Project,
  Parcel,
  Bottleneck,
  IoTDevice,
  CompensationAward,
  LegalCase,
  RRCase,
  LegalDocument,
  TaskItem,
  HeatmapLayerType,
  ParcelIntelligenceMetrics,
} from '../../../types';
import { DrillDownState } from './GeographicDrillDownBar';
import { INDIA_CENTER, STATE_COORDINATES, DISTRICT_COORDINATES, STRATEGIC_CORRIDORS } from '../utils/geoData';
import {
  calculateParcelIntelligenceMetrics,
  getHeatmapNodeStyle,
} from '../../../utils/intelligenceCalculations';
import { ParcelPassportDrawer } from '../../digital-twin/components/ParcelPassportDrawer';
import { Layers, Flame, AlertCircle } from 'lucide-react';

interface MapProps {
  drillDown: DrillDownState;
  projects: Project[];
  parcels: Parcel[];
  bottlenecks: Bottleneck[];
  iotDevices: IoTDevice[];
  compensations?: CompensationAward[];
  legalCases?: LegalCase[];
  rrCases?: RRCase[];
  documents?: LegalDocument[];
  tasks?: TaskItem[];
  onSelectProject: (projectId: string) => void;
  onSelectParcel: (parcelId: string) => void;
  onOpenDigitalTwin?: (parcelId: string) => void;
}

const MapViewController: React.FC<{ drillDown: DrillDownState; parcels: Parcel[] }> = ({
  drillDown,
  parcels,
}) => {
  const map = useMap();

  useEffect(() => {
    if (drillDown.parcelId) {
      const selectedParcel = parcels.find((p) => p.id === drillDown.parcelId);
      if (selectedParcel?.geoCenter) {
        map.flyTo([selectedParcel.geoCenter.lat, selectedParcel.geoCenter.lng], 15, { duration: 1.2 });
        return;
      }
    }

    if (drillDown.districtId && DISTRICT_COORDINATES[drillDown.districtId]) {
      const coord = DISTRICT_COORDINATES[drillDown.districtId];
      map.flyTo([coord.lat, coord.lng], coord.zoom || 11, { duration: 1.2 });
      return;
    }

    if (drillDown.stateId && STATE_COORDINATES[drillDown.stateId]) {
      const coord = STATE_COORDINATES[drillDown.stateId];
      map.flyTo([coord.lat, coord.lng], coord.zoom || 7, { duration: 1.2 });
      return;
    }

    map.flyTo([INDIA_CENTER.lat, INDIA_CENTER.lng], INDIA_CENTER.zoom || 5, { duration: 1.2 });
  }, [drillDown, map, parcels]);

  return null;
};

export const GISCommandMap: React.FC<MapProps> = ({
  drillDown,
  projects,
  parcels,
  bottlenecks,
  iotDevices,
  compensations = [],
  legalCases = [],
  rrCases = [],
  documents = [],
  tasks = [],
  onSelectProject,
  onSelectParcel,
  onOpenDigitalTwin,
}) => {
  const [activeLayer, setActiveLayer] = useState<HeatmapLayerType>('DELAY_RISK');
  const [filterDelayRiskOnly, setFilterDelayRiskOnly] = useState<boolean>(false);
  const [inspectingParcel, setInspectingParcel] = useState<Parcel | null>(null);
  const [inspectingMetrics, setInspectingMetrics] = useState<ParcelIntelligenceMetrics | null>(null);

  // Calculate parcel intelligence metrics map
  const parcelMetricsMap = useMemo(() => {
    const map = new Map<string, ParcelIntelligenceMetrics>();
    parcels.forEach((p) => {
      if (p.id) {
        map.set(p.id, calculateParcelIntelligenceMetrics(p, compensations, legalCases, rrCases, documents, tasks));
      }
    });
    return map;
  }, [parcels, compensations, legalCases, rrCases, documents, tasks]);

  // Ranked high-risk parcels for quick triaging
  const topRiskParcels = useMemo(() => {
    return Array.from(parcelMetricsMap.values())
      .sort((a, b) => b.delayRiskScore - a.delayRiskScore)
      .slice(0, 3);
  }, [parcelMetricsMap]);

  const handleMarkerClick = (parcel: Parcel) => {
    if (parcel.id) {
      onSelectParcel(parcel.id);
      const metrics = parcelMetricsMap.get(parcel.id) || null;
      setInspectingParcel(parcel);
      setInspectingMetrics(metrics);
    }
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-sm bg-white font-sans">
      {/* Top Floating Heatmap Intelligence Layer Switcher */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-xl p-2.5 shadow-md space-y-2 max-w-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#EA580C]" />
            <span className="font-extrabold text-[#0F172A] text-xs">
              Acquisition Heatmap
            </span>
          </div>
          <button
            onClick={() => setFilterDelayRiskOnly(!filterDelayRiskOnly)}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              filterDelayRiskOnly
                ? 'bg-[#DC2626] text-white'
                : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
            }`}
          >
            {filterDelayRiskOnly ? 'Showing High Risk' : 'Filter Critical Risk'}
          </button>
        </div>

        {/* Layer Selection Chips */}
        <div className="flex flex-wrap gap-1">
          {(
            [
              { id: 'DELAY_RISK', label: '🔴 Delay Risk' },
              { id: 'COMPENSATION_BURDEN', label: '🟠 Solatium' },
              { id: 'OWNERSHIP_COMPLEXITY', label: '🟡 Title Dispute' },
              { id: 'LITIGATION', label: '🟣 Court Stays' },
              { id: 'RR_BURDEN', label: '🔵 R&R Burden' },
              { id: 'DOCUMENT_COMPLETENESS', label: '🟢 Compliance' },
            ] as { id: HeatmapLayerType; label: string }[]
          ).map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                activeLayer === layer.id
                  ? 'bg-[#0F172A] text-white shadow-sm'
                  : 'bg-[#F8FAFC] border border-[#CBD5E1] text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Right High-Risk Triage Overlay */}
      {topRiskParcels.length > 0 && (
        <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-xl p-2.5 shadow-md hidden md:block max-w-xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] flex items-center gap-1 mb-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-[#DC2626]" /> Critical Delay Hotspots
          </p>
          <div className="space-y-1">
            {topRiskParcels.map((m) => (
              <div
                key={m.parcelId}
                onClick={() => {
                  const p = parcels.find((item) => item.id === m.parcelId);
                  if (p) handleMarkerClick(p);
                }}
                className="p-1.5 rounded-lg bg-[#F8FAFC] hover:bg-[#FFF7ED] border border-[#E2E8F0] hover:border-[#FDBA74] flex items-center justify-between cursor-pointer transition-all text-xs"
              >
                <span className="font-bold text-[#0F172A]">Khasra #{m.khasraNo}</span>
                <span className="font-mono font-black text-[#DC2626] text-[10px]">
                  {m.delayRiskScore}% Risk
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaflet Map Canvas */}
      <MapContainer
        center={[INDIA_CENTER.lat, INDIA_CENTER.lng]}
        zoom={INDIA_CENTER.zoom}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewController drillDown={drillDown} parcels={parcels} />

        {/* Strategic Corridor Polylines */}
        {STRATEGIC_CORRIDORS.map((corridor) => (
          <Polyline
            key={corridor.projectId}
            positions={corridor.points}
            pathOptions={{
              color: corridor.projectId === 'proj-bullet-train-sec-3' ? '#0F172A' : '#334155',
              weight: 4,
              opacity: 0.9,
              dashArray: corridor.projectId === 'proj-eastern-dfc' ? '6, 8' : undefined,
            }}
            eventHandlers={{
              click: () => onSelectProject(corridor.projectId),
            }}
          />
        ))}

        {/* Intelligent Heatmap Parcel Circle Markers */}
        {parcels.map((parcel) => {
          if (!parcel.geoCenter || !parcel.id) return null;
          const metrics = parcelMetricsMap.get(parcel.id);
          if (!metrics) return null;

          if (filterDelayRiskOnly && metrics.delayRiskLevel !== 'CRITICAL' && metrics.delayRiskLevel !== 'HIGH') {
            return null;
          }

          const style = getHeatmapNodeStyle(metrics, activeLayer);
          const isSelected = parcel.id === drillDown.parcelId;

          return (
            <CircleMarker
              key={parcel.id}
              center={[parcel.geoCenter.lat, parcel.geoCenter.lng]}
              radius={isSelected ? style.radius + 3 : style.radius}
              pathOptions={{
                color: style.color,
                fillColor: style.fillColor,
                fillOpacity: style.fillOpacity,
                weight: isSelected ? 3 : 1.5,
              }}
              eventHandlers={{
                click: () => handleMarkerClick(parcel),
              }}
            >
              <Popup>
                <div className="p-1 text-[#0F172A] text-xs font-sans space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-xs">Khasra #{parcel.khasraSurveyNo}</strong>
                    <span className="font-mono font-bold text-[10px] text-[#DC2626]">
                      {metrics.delayRiskScore}% Risk
                    </span>
                  </div>
                  <p className="text-[10px] text-[#475569]">{metrics.primaryRiskReason}</p>
                  <p className="text-[10px] text-[#059669] font-bold">
                    Click marker to open full Digital Land Passport
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* IoT Sentinel Markers */}
        {iotDevices.map((dev) => (
          <CircleMarker
            key={dev.id}
            center={[dev.location.lat, dev.location.lng]}
            radius={5}
            pathOptions={{
              color: dev.status === 'ONLINE' ? '#0F172A' : '#64748B',
              fillColor: dev.status === 'ONLINE' ? '#0F172A' : '#94A3B8',
              fillOpacity: 0.9,
              weight: 1,
            }}
          />
        ))}
      </MapContainer>

      {/* Parcel Passport Slide-Over Drawer */}
      <ParcelPassportDrawer
        parcel={inspectingParcel}
        metrics={inspectingMetrics}
        onClose={() => {
          setInspectingParcel(null);
          setInspectingMetrics(null);
        }}
        onOpenDigitalTwin={onOpenDigitalTwin}
      />
    </div>
  );
};

