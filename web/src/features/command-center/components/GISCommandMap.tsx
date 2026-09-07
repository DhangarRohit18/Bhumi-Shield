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
import { Layers, Flame, AlertCircle, Radio, Satellite, Activity, ShieldAlert, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export type MapVisionMode = 'OPTICAL' | 'SAR_RADAR' | 'INSAR_SUBSIDENCE' | 'SAR_CHANGE';

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
  const [visionMode, setVisionMode] = useState<MapVisionMode>('OPTICAL');
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false);
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
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-sm bg-white font-sans">
      {/* Sleek Floating Satellite & SAR Radar Mode Switcher */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-xl p-2 shadow-lg space-y-1.5 max-w-[340px] sm:max-w-[400px]">
        <div className="flex items-center justify-between gap-2 border-b border-[#E2E8F0] pb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-md bg-[#EA580C] text-white">
              <Satellite className="w-3 h-3 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-[#0F172A] text-[11px] block leading-tight">
                Earth Observation & SAR
              </span>
              <span className="text-[8.5px] text-[#64748B] font-mono">
                Sentinel-1 SAR • NISAR L+S
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
              RADAR LIVE
            </span>
            <button
              onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
              className="p-1 hover:bg-[#F1F5F9] rounded text-[#64748B] hover:text-[#0F172A] transition-colors"
              title={isControlsCollapsed ? 'Expand Controls' : 'Collapse Controls'}
            >
              {isControlsCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {!isControlsCollapsed && (
          <>
            {/* Vision Mode Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
              {[
                { id: 'OPTICAL', icon: '🌍', label: 'Optical GIS' },
                { id: 'SAR_RADAR', icon: '🛰️', label: 'SAR Radar' },
                { id: 'INSAR_SUBSIDENCE', icon: '🌋', label: 'InSAR Topo' },
                { id: 'SAR_CHANGE', icon: '✅', label: 'Sec 38 Radar' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setVisionMode(mode.id as MapVisionMode)}
                  className={`px-1.5 py-1 rounded-md text-left transition-all cursor-pointer border flex items-center gap-1 ${
                    visionMode === mode.id
                      ? 'bg-[#0F172A] border-[#EA580C] text-white shadow-sm ring-1 ring-[#EA580C]/50'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#334155] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <span className="text-xs leading-none">{mode.icon}</span>
                  <span className={`text-[9.5px] font-bold truncate ${visionMode === mode.id ? 'text-white' : 'text-[#0F172A]'}`}>
                    {mode.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Layer Selection Chips (when in Optical Mode) */}
            {visionMode === 'OPTICAL' && (
              <div className="space-y-1 pt-0.5">
                <div className="grid grid-cols-3 gap-1">
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
                      className={`px-1.5 py-1 rounded text-[9px] font-extrabold transition-all cursor-pointer border truncate text-center ${
                        activeLayer === layer.id
                          ? 'bg-[#0F172A] border-[#EA580C] text-white shadow-xs scale-[1.02]'
                          : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                      }`}
                    >
                      {layer.label}
                    </button>
                  ))}
                </div>

                {/* Dynamic Active Layer Legend Bar */}
                <div className="px-2 py-1 rounded-md bg-[#F0F7FF] border border-[#BAE6FD] text-[9px] text-[#0369A1] flex items-center justify-between font-sans">
                  <span className="font-bold flex items-center gap-1 truncate">
                    <Sparkles className="w-2.5 h-2.5 text-[#EA580C] shrink-0" />
                    {activeLayer === 'DELAY_RISK' && 'Delay Risk Hotspots'}
                    {activeLayer === 'COMPENSATION_BURDEN' && 'Solatium & Awards (>₹40L)'}
                    {activeLayer === 'OWNERSHIP_COMPLEXITY' && 'Disputed Title & Partitions'}
                    {activeLayer === 'LITIGATION' && 'Court Stays & Sec 15 Injunctions'}
                    {activeLayer === 'RR_BURDEN' && 'PAF Resettlement Burden'}
                    {activeLayer === 'DOCUMENT_COMPLETENESS' && '7/12 RoR Verification'}
                  </span>
                  <span className="font-mono font-bold bg-white px-1 py-0.2 rounded border border-[#BAE6FD] text-[#0F172A] shrink-0 ml-1">
                    {parcels.length} Parcels
                  </span>
                </div>
              </div>
            )}

            {/* SAR Telemetry Live HUD (when in SAR Modes) */}
            {visionMode !== 'OPTICAL' && (
              <div className="p-2 rounded-lg bg-[#0F172A] text-white space-y-1 text-[10px] font-sans border border-[#1E293B]">
                <div className="flex items-center justify-between text-[#EA580C]">
                  <span className="flex items-center gap-1 font-bold truncate">
                    <Radio className="w-3 h-3 text-[#EA580C] animate-pulse shrink-0" />
                    <span className="text-white text-[10px] font-semibold truncate">
                      {visionMode === 'SAR_RADAR' && 'Sentinel-1 Dual-Pol GRD'}
                      {visionMode === 'INSAR_SUBSIDENCE' && 'InSAR Phase Coherence'}
                      {visionMode === 'SAR_CHANGE' && 'Sec 38 Possession Radar'}
                    </span>
                  </span>
                  <span className="text-[8.5px] font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded text-[#38BDF8] shrink-0">
                    {visionMode === 'SAR_RADAR' && '-14.2 dB'}
                    {visionMode === 'INSAR_SUBSIDENCE' && '-0.8 mm/yr'}
                    {visionMode === 'SAR_CHANGE' && '94.8% Done'}
                  </span>
                </div>
                <p className="text-[8.5px] text-[#94A3B8] leading-tight">
                  {visionMode === 'SAR_RADAR' && 'Penetrates cloud & vegetation canopy. Flags sheds before Sec 11.'}
                  {visionMode === 'INSAR_SUBSIDENCE' && 'Millimetric ground stability for HSR & expressways.'}
                  {visionMode === 'SAR_CHANGE' && 'Verifies physical clearance & excavation under Section 38.'}
                </p>
              </div>
            )}
          </>
        )}
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

      {/* Leaflet Map Canvas with dynamic radar styling */}
      <div className={`w-full h-full relative transition-all duration-700 ${
        visionMode === 'SAR_RADAR' ? 'filter contrast-150 brightness-95' :
        visionMode === 'INSAR_SUBSIDENCE' ? 'filter saturate-150 contrast-125' :
        visionMode === 'SAR_CHANGE' ? 'filter brightness-105 contrast-110' : ''
      }`}>
        {/* Animated Radar Sweep Grid when in SAR mode */}
        {visionMode === 'SAR_RADAR' && (
          <div className="absolute inset-0 pointer-events-none z-[400] bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12)_0%,transparent_70%)]">
            <div className="w-full h-full bg-[linear-gradient(to_right,rgba(6,182,212,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>
        )}

        {/* InSAR Interferometric Fringe Gradient when in InSAR mode */}
        {visionMode === 'INSAR_SUBSIDENCE' && (
          <div className="absolute inset-0 pointer-events-none z-[400] bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.1)_0%,rgba(16,185,129,0.1)_50%,transparent_80%)]" />
        )}

        <MapContainer
          center={[INDIA_CENTER.lat, INDIA_CENTER.lng]}
          zoom={INDIA_CENTER.zoom}
          className="w-full h-full"
          zoomControl={false}
        >
          {visionMode === 'OPTICAL' && (
            <TileLayer
              key="optical-layer"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}

          {visionMode === 'SAR_RADAR' && (
            <TileLayer
              key="sar-radar-layer"
              attribution='&copy; Copernicus Sentinel-1 SAR C-Band | ESA / ISRO NISAR'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              className="filter hue-rotate-180 invert-20 contrast-150"
            />
          )}

          {visionMode === 'INSAR_SUBSIDENCE' && (
            <TileLayer
              key="insar-topo-layer"
              attribution='&copy; InSAR Ground Displacement Radar | USGS / Survey of India'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
            />
          )}

          {visionMode === 'SAR_CHANGE' && (
            <TileLayer
              key="sar-change-layer"
              attribution='&copy; Sentinel-1 Temporal Change Radar Δσ⁰ | ESA'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}

          <MapViewController drillDown={drillDown} parcels={parcels} />

          {/* Strategic Corridor Polylines with visionMode-specific neon styling */}
          {STRATEGIC_CORRIDORS.map((corridor) => {
            let corridorColor = corridor.projectId === 'proj-bullet-train-sec-3' ? '#0F172A' : '#334155';
            let corridorWeight = 4;

            if (visionMode === 'SAR_RADAR') {
              corridorColor = '#06B6D4'; // Glowing Cyan Radar
              corridorWeight = 5;
            } else if (visionMode === 'INSAR_SUBSIDENCE') {
              corridorColor = '#10B981'; // Green InSAR deformation line
              corridorWeight = 5;
            } else if (visionMode === 'SAR_CHANGE') {
              corridorColor = '#8B5CF6'; // Violet possession line
              corridorWeight = 5;
            }

            return (
              <Polyline
                key={corridor.projectId + visionMode}
                positions={corridor.points}
                pathOptions={{
                  color: corridorColor,
                  weight: corridorWeight,
                  opacity: 0.95,
                  dashArray: corridor.projectId === 'proj-eastern-dfc' ? '6, 8' : undefined,
                }}
                eventHandlers={{
                  click: () => onSelectProject(corridor.projectId),
                }}
              />
            );
          })}

        {/* Intelligent Heatmap Parcel Circle Markers with Reactive Remount Keys */}
        {parcels.map((parcel) => {
          if (!parcel.geoCenter || !parcel.id) return null;
          const metrics = parcelMetricsMap.get(parcel.id);
          if (!metrics) return null;

          if (filterDelayRiskOnly && metrics.delayRiskLevel !== 'CRITICAL' && metrics.delayRiskLevel !== 'HIGH') {
            return null;
          }

          const style = getHeatmapNodeStyle(metrics, activeLayer);
          const isSelected = parcel.id === drillDown.parcelId;

          let markerColor = style.color;
          let markerFill = style.fillColor;
          let markerRadius = isSelected ? style.radius + 4 : style.radius;

          if (visionMode === 'SAR_RADAR') {
            markerColor = '#06B6D4'; // Cyan radar
            markerFill = metrics.delayRiskScore > 60 ? '#F43F5E' : '#0891B2';
          } else if (visionMode === 'INSAR_SUBSIDENCE') {
            markerColor = metrics.delayRiskScore > 70 ? '#EF4444' : '#10B981';
            markerFill = metrics.delayRiskScore > 70 ? '#F87171' : '#34D399';
          } else if (visionMode === 'SAR_CHANGE') {
            markerColor = '#8B5CF6';
            markerFill = '#A78BFA';
          }

          // Check if parcel is a high-priority focal node for the active layer
          const isLayerFocal =
            (activeLayer === 'DELAY_RISK' && (metrics.delayRiskLevel === 'CRITICAL' || metrics.delayRiskLevel === 'HIGH')) ||
            (activeLayer === 'COMPENSATION_BURDEN' && metrics.pendingCompensationINR > 4000000) ||
            (activeLayer === 'OWNERSHIP_COMPLEXITY' && metrics.ownershipConflict) ||
            (activeLayer === 'LITIGATION' && metrics.hasActiveLitigation) ||
            (activeLayer === 'RR_BURDEN' && metrics.pendingRRCount > 0) ||
            (activeLayer === 'DOCUMENT_COMPLETENESS' && metrics.documentCompletenessPct < 80);

          return (
            <React.Fragment key={`${parcel.id}-group-${activeLayer}-${visionMode}-${isSelected}`}>
              {/* Outer Pulsing Halo Ring for Focal Parcels */}
              {isLayerFocal && visionMode === 'OPTICAL' && (
                <CircleMarker
                  key={`${parcel.id}-halo-${activeLayer}`}
                  center={[parcel.geoCenter.lat, parcel.geoCenter.lng]}
                  radius={markerRadius + 6}
                  pathOptions={{
                    color: markerFill,
                    fillColor: markerFill,
                    fillOpacity: 0.25,
                    weight: 1.5,
                    dashArray: '3, 3',
                  }}
                />
              )}

              <CircleMarker
                key={`${parcel.id}-node-${activeLayer}-${visionMode}-${isSelected}`}
                center={[parcel.geoCenter.lat, parcel.geoCenter.lng]}
                radius={markerRadius}
                pathOptions={{
                  color: markerColor,
                  fillColor: markerFill,
                  fillOpacity: visionMode !== 'OPTICAL' ? 0.85 : style.fillOpacity,
                  weight: isSelected ? 3.5 : 2,
                }}
                eventHandlers={{
                  click: () => handleMarkerClick(parcel),
                }}
              >
                <Popup>
                  <div className="p-1.5 text-[#0F172A] text-xs font-sans space-y-1.5 min-w-[200px]">
                    <div className="flex items-center justify-between gap-2 border-b border-[#E2E8F0] pb-1">
                      <strong className="text-xs font-extrabold text-[#0F172A]">Khasra #{parcel.khasraSurveyNo}</strong>
                      <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-[#FFF1F2] text-[#DC2626]">
                        {metrics.delayRiskScore}% Risk
                      </span>
                    </div>

                    {/* Active Layer Specific Metric Insight */}
                    {visionMode === 'OPTICAL' && (
                      <div className="p-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[10px] space-y-0.5 font-medium">
                        {activeLayer === 'DELAY_RISK' && (
                          <p className="text-[#DC2626] font-bold">🔴 Delay Cause: {metrics.primaryRiskReason}</p>
                        )}
                        {activeLayer === 'COMPENSATION_BURDEN' && (
                          <p className="text-[#C2410C] font-bold">
                            🟠 Solatium Total: ₹{(metrics.compensationBurdenINR / 100000).toFixed(1)} Lakhs
                          </p>
                        )}
                        {activeLayer === 'OWNERSHIP_COMPLEXITY' && (
                          <p className="text-[#B45309] font-bold">
                            🟡 Title: {metrics.ownershipCount} Co-owners ({metrics.ownershipConflict ? 'Dispute Pending' : 'Clear Title'})
                          </p>
                        )}
                        {activeLayer === 'LITIGATION' && (
                          <p className="text-[#7E22CE] font-bold">
                            🟣 Court Status: {metrics.hasActiveLitigation ? metrics.litigationCaseNo || 'High Court WP Active' : 'No Litigation'}
                          </p>
                        )}
                        {activeLayer === 'RR_BURDEN' && (
                          <p className="text-[#1D4ED8] font-bold">
                            🔵 R&R Status: {metrics.pendingRRCount > 0 ? 'Resettlement Grants Pending' : 'All Entitlements Allocated'}
                          </p>
                        )}
                        {activeLayer === 'DOCUMENT_COMPLETENESS' && (
                          <p className="text-[#047857] font-bold">
                            🟢 Compliance: {metrics.documentCompletenessPct}% 7/12 RoR Records Verified
                          </p>
                        )}
                        <p className="text-[#64748B] text-[9px] pt-0.5">{metrics.recommendedAction}</p>
                      </div>
                    )}

                    {visionMode === 'SAR_RADAR' && (
                      <div className="p-1 rounded bg-[#F0FDF4] border border-[#BBF7D0] text-[10px] font-mono text-[#166534] space-y-0.5">
                        <p>📡 SAR Dual-Pol Backscatter: -13.8 dB</p>
                        <p>🛡️ Encroachment Double-Bounce: None Detected</p>
                        <p className="text-[#0284C7]">Cloud Cover: 100% Penetrated</p>
                      </div>
                    )}

                    {visionMode === 'INSAR_SUBSIDENCE' && (
                      <div className="p-1 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[10px] font-mono text-[#1E40AF] space-y-0.5">
                        <p>🌋 InSAR Ground Displacement: -0.6 mm/yr</p>
                        <p>📐 Geological Embankment Grade: A (Stable)</p>
                      </div>
                    )}

                    {visionMode === 'SAR_CHANGE' && (
                      <div className="p-1.5 rounded bg-[#FAF5FF] border border-[#E9D5FF] text-[10.5px] font-sans text-[#6B21A8] space-y-0.5">
                        <p className="font-semibold">🔍 Soil Clearance: Confirmed Cleared</p>
                        <p className="font-semibold text-[#059669]">✅ Sec 38 Possession Verified: 96.4%</p>
                      </div>
                    )}

                    <p className="text-[10px] text-[#059669] font-bold pt-1">
                      Click marker to open full Digital Land Passport
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
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
      </div>

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

