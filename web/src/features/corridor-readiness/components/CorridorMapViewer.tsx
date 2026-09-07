import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { CorridorReadinessProject, CorridorSegment } from '../../../types';
import { CORRIDOR_STATUS_CONFIG } from '../../../data/corridorReadinessData';
import { Layers, MapPin, Sparkles, AlertCircle, Globe, Mountain, Satellite, Map as MapIcon, Train, Activity } from 'lucide-react';

export type BasemapLayerType = 'TERRAIN' | 'OPTICAL' | 'SATELLITE';

interface CorridorMapViewerProps {
  project: CorridorReadinessProject;
  allProjects?: CorridorReadinessProject[];
  segments: CorridorSegment[];
  selectedSegmentId: string | null;
  onSelectSegment: (segment: CorridorSegment) => void;
  onSelectProject?: (projectId: string) => void;
  onOpenARVerification?: (waypointCode: string) => void;
}

const MapRecenterController: React.FC<{
  center: [number, number];
  zoom: number;
  selectedSegment: CorridorSegment | null;
  isPanIndiaView: boolean;
}> = ({ center, zoom, selectedSegment, isPanIndiaView }) => {
  const map = useMap();

  useEffect(() => {
    if (isPanIndiaView) {
      map.flyTo([22.5937, 78.9629], 5, { duration: 1.2 });
    } else if (selectedSegment && selectedSegment.center) {
      map.flyTo(selectedSegment.center, 12, { duration: 1.2 });
    } else if (center) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, selectedSegment, isPanIndiaView, map]);

  return null;
};

export const CorridorMapViewer: React.FC<CorridorMapViewerProps> = ({
  project,
  allProjects = [],
  segments,
  selectedSegmentId,
  onSelectSegment,
  onSelectProject,
  onOpenARVerification,
}) => {
  const [basemap, setBasemap] = useState<BasemapLayerType>('TERRAIN');
  const [isPanIndiaView, setIsPanIndiaView] = useState<boolean>(false);
  const selectedSegment = segments.find((s) => s.id === selectedSegmentId) || null;

  const isRailway = project.code.includes('CR') || project.code.includes('DFCCIL') || project.code.includes('MAHSR') || project.name.toLowerCase().includes('railway') || project.name.toLowerCase().includes('train');

  return (
    <div className="relative w-full h-[560px] rounded-2xl overflow-hidden border border-slate-200/80 shadow-soft bg-white font-sans">
      {/* Top Left Floating Legend, Basemap Switcher & Pan-India View */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3.5 shadow-float space-y-2.5 max-w-[360px]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-indigo-600 text-white shadow-2xs">
              {isRailway ? <Train className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
            </div>
            <div>
              <span className="text-xs font-black text-[#0B132B] uppercase tracking-wider block leading-tight">
                {isRailway ? 'Rail Corridor GIS' : 'Corridor Readiness GIS'}
              </span>
              <span className="text-[9px] font-bold text-slate-500 font-mono">
                {project.state} • {project.totalLengthKm} km
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsPanIndiaView(!isPanIndiaView)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer border ${
              isPanIndiaView
                ? 'bg-[#0B132B] text-white border-[#0B132B]'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
            }`}
            title="Toggle Pan-India Network Overview"
          >
            <Globe className="w-3 h-3" />
            <span>{isPanIndiaView ? 'Focus Corridor' : 'Pan-India'}</span>
          </button>
        </div>

        {/* Basemap Switcher Buttons (Mountain Terrain / Topo / Sat / Street) */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setBasemap('TERRAIN')}
            className={`px-2 py-1 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              basemap === 'TERRAIN'
                ? 'bg-white text-emerald-800 shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mountain className="w-3 h-3 text-emerald-600" />
            <span>🏔️ Mountain Topo</span>
          </button>

          <button
            onClick={() => setBasemap('SATELLITE')}
            className={`px-2 py-1 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              basemap === 'SATELLITE'
                ? 'bg-white text-indigo-800 shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Satellite className="w-3 h-3 text-indigo-600" />
            <span>🛰️ Satellite</span>
          </button>

          <button
            onClick={() => setBasemap('OPTICAL')}
            className={`px-2 py-1 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              basemap === 'OPTICAL'
                ? 'bg-white text-blue-800 shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3 h-3 text-blue-600" />
            <span>🗺️ Carto</span>
          </button>
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold pt-0.5">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span>🟢 Cleared ({project.clearedKm} km)</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
            <span>🟡 In Process ({project.underProcessKm} km)</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
            <span>🔴 Objections ({project.disputedKm} km)</span>
          </div>
          <div className="flex items-center gap-1.5 text-purple-700">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0"></span>
            <span>🟣 Litigation ({project.litigationKm} km)</span>
          </div>
        </div>
      </div>

      {/* Top Right Live Telemetry & Elevation HUD */}
      <div className="absolute top-3 right-3 z-[1000] space-y-2 max-w-xs">
        {/* Real-time Track Laying & Mountain Telemetry Widget */}
        <div className="bg-[#0B132B]/95 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-float text-white space-y-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                {isRailway ? 'Live Track Telemetry' : 'Live Earthwork Telemetry'}
              </span>
            </div>
            <span className="text-[9px] font-mono text-cyan-300 font-bold bg-white/10 px-1.5 py-0.5 rounded">
              DGPS RTK LIVE
            </span>
          </div>

          <div className="space-y-1 text-[11px] font-medium text-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-400">Track Formation Rate:</span>
              <span className="font-mono font-black text-white">180 m / day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Balaghat Mountain Ridge:</span>
              <span className="font-mono font-bold text-amber-300">680m ASL (1:100 Gradient)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Active Machine:</span>
              <span className="font-mono text-cyan-200 text-[10px]">RVNL P&T Ballast Packer #04</span>
            </div>
          </div>
        </div>

        {/* Selected Segment Badge */}
        {selectedSegment && (
          <div className="bg-white/95 backdrop-blur-md border border-indigo-500/80 rounded-2xl p-3 shadow-float animate-in fade-in">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-mono font-black text-indigo-600 uppercase tracking-wider">
                Active Focus
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                Score: {selectedSegment.readinessScore}/100
              </span>
            </div>
            <h4 className="text-xs font-black text-[#0B132B] leading-tight line-clamp-1">
              {selectedSegment.segmentName}
            </h4>
            <p className="text-[10px] text-slate-500 mt-0.5 truncate">
              {selectedSegment.villageName} • {selectedSegment.district}
            </p>
          </div>
        )}
      </div>

      {/* Map Container */}
      <MapContainer
        center={project.center}
        zoom={project.zoom}
        className="w-full h-full"
        zoomControl={false}
      >
        {/* Basemap Tiles based on selected mode */}
        {basemap === 'TERRAIN' && (
          <TileLayer
            key="terrain-layer"
            attribution='&copy; USGS, Esri World Topo Map, OpenTopoMap Mountain Shaded Relief'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        {basemap === 'SATELLITE' && (
          <TileLayer
            key="satellite-layer"
            attribution='&copy; Esri World Imagery, Maxar, Earthstar Geographics'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        {basemap === 'OPTICAL' && (
          <TileLayer
            key="carto-layer"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}

        <MapRecenterController
          center={project.center}
          zoom={project.zoom}
          selectedSegment={selectedSegment}
          isPanIndiaView={isPanIndiaView}
        />

        {/* Background Strategic Routes across India */}
        {allProjects.map((otherProj) => {
          if (otherProj.id === project.id) return null;

          // Collect all coordinates for this corridor
          const points = otherProj.segments.flatMap((s) => s.coordinates);
          if (!points.length) return null;

          return (
            <React.Fragment key={`bg-proj-${otherProj.id}`}>
              <Polyline
                positions={points}
                pathOptions={{
                  color: '#64748B',
                  weight: 3.5,
                  opacity: 0.6,
                  dashArray: '4, 4',
                }}
                eventHandlers={{
                  click: () => {
                    setIsPanIndiaView(false);
                    onSelectProject?.(otherProj.id);
                  },
                }}
              >
                <Tooltip sticky>
                  <div className="p-1 text-xs font-sans">
                    <strong className="font-extrabold text-[#0F172A] block">{otherProj.name}</strong>
                    <span className="text-[10px] text-[#0284C7] font-bold">{otherProj.totalLengthKm} km • Click to Switch</span>
                  </div>
                </Tooltip>
              </Polyline>

              {/* Waypoint Marker at Corridor Origin */}
              <CircleMarker
                center={otherProj.center}
                radius={5}
                pathOptions={{
                  color: '#0F172A',
                  fillColor: '#38BDF8',
                  fillOpacity: 0.9,
                  weight: 1.5,
                }}
                eventHandlers={{
                  click: () => {
                    setIsPanIndiaView(false);
                    onSelectProject?.(otherProj.id);
                  },
                }}
              />
            </React.Fragment>
          );
        })}

        {/* Render Active Project Segment Polylines */}
        {segments.map((seg) => {
          const config = CORRIDOR_STATUS_CONFIG[seg.status] || CORRIDOR_STATUS_CONFIG.GREY_NO_DATA;
          const isSelected = seg.id === selectedSegmentId;

          return (
            <React.Fragment key={seg.id}>
              {/* Outer Selection Highlight Ring */}
              {isSelected && (
                <Polyline
                  positions={seg.coordinates}
                  pathOptions={{
                    color: '#EA580C',
                    weight: 12,
                    opacity: 0.5,
                  }}
                />
              )}

              {/* Base Color Coded Segment Polyline */}
              <Polyline
                positions={seg.coordinates}
                pathOptions={{
                  color: config.polylineColor,
                  weight: isSelected ? 7 : 5,
                  opacity: 0.95,
                  dashArray: seg.status === 'BLACK_BLOCKING' ? '6, 6' : undefined,
                }}
                eventHandlers={{
                  click: () => onSelectSegment(seg),
                }}
              >
                <Tooltip sticky>
                  <div className="p-1 text-xs font-sans">
                    <strong className="font-extrabold text-[#0F172A] block">{seg.segmentName}</strong>
                    <span className="text-[10px] text-[#64748B]">{seg.villageName} • Readiness {seg.readinessScore}/100</span>
                  </div>
                </Tooltip>
              </Polyline>

              {/* Waypoint Marker at Segment Center */}
              <CircleMarker
                center={seg.center}
                radius={isSelected ? 9 : 7}
                pathOptions={{
                  color: isSelected ? '#EA580C' : '#FFFFFF',
                  fillColor: config.polylineColor,
                  fillOpacity: 1,
                  weight: 2.5,
                }}
                eventHandlers={{
                  click: () => onSelectSegment(seg),
                }}
              >
                <Popup>
                  <div className="p-2 text-xs font-sans space-y-1.5 min-w-[220px]">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-extrabold text-[#0F172A]">{seg.villageName}</span>
                      <span className="font-mono font-bold text-[10px] text-[#EA580C]">{seg.readinessScore}/100</span>
                    </div>
                    <p className="text-[11px] text-[#475569]">{seg.keyImpediment}</p>
                    <div className="flex justify-between items-center pt-1 border-t text-[10px] text-[#0284C7] font-bold">
                      <span>{seg.affectedLandholdersCount} Landholders</span>
                      <button
                        onClick={() => onSelectSegment(seg)}
                        className="text-[#EA580C] underline font-bold cursor-pointer"
                      >
                        Inspect Details →
                      </button>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

