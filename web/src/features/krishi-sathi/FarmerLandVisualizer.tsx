import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FarmerRecord } from '../../types';
import {
  X,
  Layers,
  Sparkles,
  Compass,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Smartphone,
  Info,
} from 'lucide-react';

interface FarmerLandVisualizerProps {
  farmer: FarmerRecord;
  onClose: () => void;
  onOpenDetails: (farmer: FarmerRecord) => void;
}

const CenterMapOnPolygon: React.FC<{ polygon: Array<[number, number]> }> = ({ polygon }) => {
  const map = useMap();
  React.useEffect(() => {
    if (polygon && polygon.length > 0) {
      const avgLat = polygon.reduce((sum, p) => sum + p[0], 0) / polygon.length;
      const avgLng = polygon.reduce((sum, p) => sum + p[1], 0) / polygon.length;
      map.flyTo([avgLat, avgLng], 17, { duration: 1.2 });
    }
  }, [polygon, map]);
  return null;
};

export const FarmerLandVisualizer: React.FC<FarmerLandVisualizerProps> = ({
  farmer,
  onClose,
  onOpenDetails,
}) => {
  const [mapLayer, setMapLayer] = useState<'SATELLITE' | 'STREET'>('SATELLITE');
  const [showArHud, setShowArHud] = useState<boolean>(true);
  const [selectedPillarId, setSelectedPillarId] = useState<string | null>(null);

  const centerLat = farmer.boundaryPolygon.reduce((s, p) => s + p[0], 0) / (farmer.boundaryPolygon.length || 1);
  const centerLng = farmer.boundaryPolygon.reduce((s, p) => s + p[1], 0) / (farmer.boundaryPolygon.length || 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 md:p-6 font-sans animate-in fade-in duration-200">
      <div className="w-full h-full max-w-6xl bg-[#0F172A] rounded-2xl overflow-hidden shadow-2xl border border-[#334155] flex flex-col">
        {/* Top Floating Control Bar */}
        <div className="px-5 py-3.5 bg-[#0F172A]/90 border-b border-[#334155] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EA580C] text-white flex items-center justify-center font-black shadow-sm text-sm">
              🛰️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">{farmer.farmerName}</h3>
                <span className="font-mono text-[10px] font-black text-[#F97316] bg-[#7C2D12]/40 px-2 py-0.5 rounded border border-[#EA580C]/40">
                  {farmer.ulpin}
                </span>
                <span className="font-mono text-[10px] text-[#94A3B8]">
                  Survey: {farmer.surveyGatNumber} ({farmer.village})
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] flex items-center gap-2 mt-0.5">
                <span>Holding: <strong className="text-white">{farmer.totalLandAreaAcres} Acres</strong></span>
                <span>•</span>
                <span>Acquired: <strong className="text-[#EA580C]">{farmer.acquiredAreaAcres} Acres</strong></span>
                <span>•</span>
                <span>Classification: <strong className="text-white">{farmer.landClassification}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Satellite / Street Map Toggle */}
            <div className="flex items-center bg-[#1E293B] p-1 rounded-xl border border-[#334155]">
              <button
                onClick={() => setMapLayer('SATELLITE')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mapLayer === 'SATELLITE'
                    ? 'bg-[#EA580C] text-white shadow-xs'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Satellite (ISRO/ESRI)
              </button>
              <button
                onClick={() => setMapLayer('STREET')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mapLayer === 'STREET'
                    ? 'bg-[#EA580C] text-white shadow-xs'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Cadastral Base
              </button>
            </div>

            {/* AR Sentinel HUD Toggle */}
            <button
              onClick={() => setShowArHud(!showArHud)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                showArHud
                  ? 'bg-[#059669]/20 text-[#34D399] border-[#059669]'
                  : 'bg-[#1E293B] text-[#94A3B8] border-[#334155] hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>AR Verification HUD</span>
            </button>

            {/* View Profile details */}
            <button
              onClick={() => onOpenDetails(farmer)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1E293B] hover:bg-[#334155] text-white border border-[#334155] cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>7/12 Profile</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#334155] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Map & AR Viewport Area */}
        <div className="flex-1 relative overflow-hidden">
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={17}
            style={{ width: '100%', height: '100%', background: '#0F172A' }}
            zoomControl={false}
          >
            {mapLayer === 'SATELLITE' ? (
              <TileLayer
                attribution='&copy; ESRI Satellite Imagery'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
            ) : (
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />
            )}

            <CenterMapOnPolygon polygon={farmer.boundaryPolygon} />

            {/* Cadastral Polygon Layer */}
            <Polygon
              positions={farmer.boundaryPolygon}
              pathOptions={{
                color: farmer.arVerificationStatus === 'FLAGGED_MISMATCH' ? '#EF4444' : '#EA580C',
                fillColor: farmer.arVerificationStatus === 'FLAGGED_MISMATCH' ? '#EF4444' : '#F97316',
                fillOpacity: 0.35,
                weight: 3,
                dashArray: '4, 4',
              }}
            >
              <Popup>
                <div className="p-1 font-sans text-xs">
                  <strong className="text-[#0F172A]">{farmer.farmerName}</strong>
                  <p className="text-[10px] text-[#64748B] font-mono">{farmer.ulpin}</p>
                  <p className="text-[10px] font-bold text-[#EA580C] mt-1">Area: {farmer.totalLandAreaAcres} Acres</p>
                </div>
              </Popup>
            </Polygon>

            {/* Demarcation Corner Pillars (DGPS RTK) */}
            {farmer.dgpsPillars.map((pillar) => (
              <CircleMarker
                key={pillar.pillarId}
                center={[pillar.lat, pillar.lng]}
                radius={7}
                pathOptions={{
                  color: selectedPillarId === pillar.pillarId ? '#FFFFFF' : '#10B981',
                  fillColor: '#059669',
                  fillOpacity: 0.95,
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => setSelectedPillarId(pillar.pillarId),
                }}
              >
                <Popup>
                  <div className="p-1 font-sans text-xs">
                    <strong className="text-[#0F172A] font-mono">{pillar.pillarId}</strong>
                    <p className="text-[10px] text-[#059669] font-bold">RTK Accuracy: ±{pillar.rtkAccuracyCm} cm</p>
                    <p className="text-[9px] text-[#64748B] font-mono">
                      Lat: {pillar.lat.toFixed(6)}, Lng: {pillar.lng.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          {/* AR Sentinel Camera Preview HUD Overlay */}
          {showArHud && (
            <div className="absolute top-4 left-4 z-[1000] w-72 bg-[#0F172A]/90 backdrop-blur-md rounded-2xl border border-[#334155] p-3.5 shadow-2xl text-white space-y-3 pointer-events-auto">
              <div className="flex items-center justify-between border-b border-[#334155] pb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#38BDF8] flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>AR Sentinel Lens Preview</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping"></span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">DGPS RTK Fix:</span>
                  <span className="font-mono font-bold text-[#34D399]">3D FIXED (±1.2 cm)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Heading Offset:</span>
                  <span className="font-mono font-bold text-white">342° NW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Ground Coherence:</span>
                  <span className={`font-mono font-bold ${farmer.arVerificationStatus === 'FLAGGED_MISMATCH' ? 'text-[#F87171]' : 'text-[#34D399]'}`}>
                    {farmer.arVerificationStatus === 'FLAGGED_MISMATCH' ? '82.4% (Mismatch)' : '98.6% (Locked)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">QR Demarcation:</span>
                  <span className="font-mono text-[#F97316] font-bold">{farmer.qrPasscode}</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-[#1E293B] border border-[#334155] text-[11px] text-[#CBD5E1]">
                <p className="flex items-center gap-1 text-[#38BDF8] font-bold mb-0.5">
                  <Compass className="w-3 h-3" /> Corner Pillars Extruded
                </p>
                <p className="text-[10px] text-[#94A3B8] leading-tight">
                  Click on green markers to inspect RTK centimeter accuracy at each cadastral bend.
                </p>
              </div>
            </div>
          )}

          {/* Bottom Right Geometry Card */}
          <div className="absolute bottom-4 right-4 z-[1000] bg-[#0F172A]/90 backdrop-blur-md rounded-2xl border border-[#334155] p-3 shadow-2xl text-white flex items-center gap-4 pointer-events-auto">
            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-[#94A3B8]">Total Perimeter</span>
              <p className="font-mono font-extrabold text-sm text-white">486.2 Meters</p>
            </div>
            <div className="h-8 w-px bg-[#334155]"></div>
            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-[#94A3B8]">Acquisition Share</span>
              <p className="font-mono font-extrabold text-sm text-[#EA580C]">
                {((farmer.acquiredAreaAcres / farmer.totalLandAreaAcres) * 100).toFixed(0)}% Acquired
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
