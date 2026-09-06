import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Project, Parcel, Bottleneck, IoTDevice } from '../../../types';
import { DrillDownState } from './GeographicDrillDownBar';
import { INDIA_CENTER, STATE_COORDINATES, DISTRICT_COORDINATES, STRATEGIC_CORRIDORS } from '../utils/geoData';

interface MapProps {
  drillDown: DrillDownState;
  projects: Project[];
  parcels: Parcel[];
  bottlenecks: Bottleneck[];
  iotDevices: IoTDevice[];
  onSelectProject: (projectId: string) => void;
  onSelectParcel: (parcelId: string) => void;
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
  onSelectProject,
  onSelectParcel,
}) => {
  return (
    <div className="relative w-full h-[480px] rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-sm bg-white font-sans">
      {/* Map Floating Header Bar */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs shadow-sm pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0F172A] animate-ping" />
          <span className="font-extrabold text-[#0F172A] uppercase tracking-wider text-[11px]">
            GIS Cadastral & Corridor Spatial Layer
          </span>
        </div>
        <p className="text-[10px] text-[#64748B] mt-0.5 font-medium">
          {STRATEGIC_CORRIDORS.length} National Alignments • {parcels.length} Cadastral Plots • {iotDevices.length} Sentinels
        </p>
      </div>

      {/* Leaflet Map Canvas using OpenStreetMap clean tiles */}
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

        {/* Strategic Corridor Polylines in Deep Slate */}
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
          >
            <Popup>
              <div className="p-1 text-[#0F172A] text-xs font-sans">
                <p className="font-extrabold">{corridor.projectName}</p>
                <p className="text-[10px] text-[#64748B]">Click to focus corridor metrics</p>
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* Cadastral Land Parcel Markers in Slate Tones */}
        {parcels.map((parcel) => {
          if (!parcel.geoCenter) return null;
          const isAwarded = parcel.status === 'AWARDED' || parcel.status === 'DISBURSED';
          const isSelected = parcel.id === drillDown.parcelId;

          return (
            <CircleMarker
              key={parcel.id}
              center={[parcel.geoCenter.lat, parcel.geoCenter.lng]}
              radius={isSelected ? 10 : 7}
              pathOptions={{
                color: isAwarded ? '#0F172A' : '#475569',
                fillColor: isAwarded ? '#0F172A' : '#64748B',
                fillOpacity: 0.85,
                weight: isSelected ? 3 : 1,
              }}
              eventHandlers={{
                click: () => onSelectParcel(parcel.id!),
              }}
            >
              <Popup>
                <div className="p-1 text-[#0F172A] text-xs font-sans">
                  <p className="font-extrabold text-[#0F172A]">Survey #{parcel.khasraSurveyNo}</p>
                  <p className="text-[11px] text-[#334155]">Area: {parcel.areaAcres} Acres ({parcel.landClassification})</p>
                  <p className="text-[11px] font-bold text-[#0F172A]">
                    Award: ₹{(parcel.totalCompensationINR / 100000).toFixed(2)} Lakhs
                  </p>
                  <p className="text-[10px] text-[#64748B] font-mono">Status: {parcel.status}</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* IoT Sentinel Telemetry Markers */}
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
          >
            <Popup>
              <div className="p-1 text-[#0F172A] text-xs font-sans">
                <p className="font-bold">{dev.deviceId}</p>
                <p className="text-[10px] text-[#64748B]">Battery: {dev.batteryPercentage}% • Status: {dev.status}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Map Legend Footer */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-white/95 backdrop-blur-sm border border-[#E2E8F0] rounded-xl px-3 py-2 text-[10px] shadow-sm flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0F172A]" />
          <span className="text-[#0F172A] font-bold">Awarded Parcel</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#475569]" />
          <span className="text-[#0F172A] font-bold">Under Inquiry</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]" />
          <span className="text-[#0F172A] font-bold">IoT Sentinel</span>
        </div>
      </div>
    </div>
  );
};
