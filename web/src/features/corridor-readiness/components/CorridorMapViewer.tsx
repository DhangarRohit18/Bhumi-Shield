import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { CorridorReadinessProject, CorridorSegment } from '../../../types';
import { CORRIDOR_STATUS_CONFIG } from '../../../data/corridorReadinessData';
import { Layers, MapPin, Sparkles, AlertCircle, Globe } from 'lucide-react';

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
  const [isPanIndiaView, setIsPanIndiaView] = useState<boolean>(false);
  const selectedSegment = segments.find((s) => s.id === selectedSegmentId) || null;

  return (
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-[#BAE6FD]/80 shadow-md bg-white font-sans">
      {/* Top Left Floating Legend & Pan-India View Switcher */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md border border-[#BAE6FD] rounded-xl p-3 shadow-lg space-y-2 max-w-[340px]">
        <div className="flex items-center justify-between border-b border-[#BAE6FD]/50 pb-1.5 gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-pulse"></span>
            <span className="text-xs font-black text-[#0F172A] uppercase tracking-wider">
              Corridor Readiness GIS
            </span>
          </div>

          <button
            onClick={() => setIsPanIndiaView(!isPanIndiaView)}
            className={`px-2 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer border ${
              isPanIndiaView
                ? 'bg-[#0F172A] text-white border-[#0F172A]'
                : 'bg-[#F0F7FF] text-[#0284C7] border-[#BAE6FD] hover:bg-[#E0F2FE]'
            }`}
            title="Toggle Pan-India Network Overview"
          >
            <Globe className="w-3 h-3" />
            <span>{isPanIndiaView ? 'Focus Corridor' : 'Pan-India'}</span>
          </button>
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
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
          <div className="flex items-center gap-1.5 text-slate-900 col-span-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 shrink-0"></span>
            <span>⚫ Critical Delay ({project.criticalBlockedKm} km)</span>
          </div>
        </div>
      </div>

      {/* Top Right Selected Segment Badge */}
      {selectedSegment && (
        <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md border border-[#EA580C] rounded-xl p-3 shadow-lg max-w-xs animate-in fade-in">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-mono font-black text-[#EA580C] uppercase tracking-wider">
              Active Focus
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-[#0F172A]">
              Score: {selectedSegment.readinessScore}/100
            </span>
          </div>
          <h4 className="text-xs font-black text-[#0F172A] leading-tight line-clamp-1">
            {selectedSegment.segmentName}
          </h4>
          <p className="text-[10px] text-[#64748B] mt-0.5 truncate">
            {selectedSegment.villageName} • {selectedSegment.district}
          </p>
        </div>
      )}

      {/* Map Container */}
      <MapContainer
        center={project.center}
        zoom={project.zoom}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

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

