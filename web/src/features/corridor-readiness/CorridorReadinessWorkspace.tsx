import React, { useState, useMemo } from 'react';
import { CORRIDOR_READINESS_PROJECTS, CORRIDOR_STATUS_CONFIG } from '../../data/corridorReadinessData';
import { CorridorReadinessProject, CorridorSegment, CorridorDelayFactor, CorridorStatusCategory } from '../../types';
import { CorridorMapViewer } from './components/CorridorMapViewer';
import { DelayFactorBreakdown } from './components/DelayFactorBreakdown';
import { SegmentDetailDrawer } from './components/SegmentDetailDrawer';
import {
  Route,
  Activity,
  Layers,
  Search,
  Filter,
  ShieldCheck,
  AlertCircle,
  MapPin,
  ChevronRight,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Building,
} from 'lucide-react';

export const CorridorReadinessWorkspace: React.FC = () => {
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>(
    CORRIDOR_READINESS_PROJECTS[0].id
  );
  const [activeFactorFilter, setActiveFactorFilter] = useState<CorridorDelayFactor | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<CorridorStatusCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectedSegment, setInspectingSegment] = useState<CorridorSegment | null>(null);
  const [arModalWaypoint, setArModalWaypoint] = useState<string | null>(null);

  // Active Corridor Data
  const currentProject = useMemo(() => {
    return (
      CORRIDOR_READINESS_PROJECTS.find((p) => p.id === selectedCorridorId) ||
      CORRIDOR_READINESS_PROJECTS[0]
    );
  }, [selectedCorridorId]);

  // Filtered Segments
  const filteredSegments = useMemo(() => {
    return currentProject.segments.filter((seg) => {
      if (activeFactorFilter !== 'ALL' && seg.delayFactor !== activeFactorFilter) {
        return false;
      }
      if (statusFilter !== 'ALL' && seg.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = seg.segmentName.toLowerCase().includes(q);
        const matchesVillage = seg.villageName.toLowerCase().includes(q);
        const matchesDistrict = seg.district.toLowerCase().includes(q);
        const matchesImpediment = seg.keyImpediment.toLowerCase().includes(q);
        return matchesName || matchesVillage || matchesDistrict || matchesImpediment;
      }
      return true;
    });
  }, [currentProject, activeFactorFilter, statusFilter, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F7FF] text-[#0F172A] font-sans space-y-5 pb-12">
      {/* Top Banner & Corridor Selector */}
      <div className="bg-white rounded-2xl p-5 border border-[#BAE6FD]/80 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#BAE6FD]/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#EA580C] text-white shadow-md">
              <Route className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-[#0F172A] tracking-tight">
                  Social Consent & Project Readiness Corridor
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
                  Corridor Risk Engine
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Spatial intelligence tracking where infrastructure projects are socially, administratively, and legally clear vs. delayed.
              </p>
            </div>
          </div>

          {/* Corridor Selection Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {CORRIDOR_READINESS_PROJECTS.map((proj) => {
              const isSelected = proj.id === selectedCorridorId;
              return (
                <button
                  key={proj.id}
                  onClick={() => {
                    setSelectedCorridorId(proj.id);
                    setInspectingSegment(null);
                    setActiveFactorFilter('ALL');
                    setStatusFilter('ALL');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap border flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-md scale-[1.02]'
                      : 'bg-[#F8FAFC] text-[#475569] border-slate-200 hover:bg-white hover:text-[#0F172A]'
                  }`}
                >
                  <Activity className={`w-3.5 h-3.5 ${isSelected ? 'text-[#38BDF8]' : 'text-[#64748B]'}`} />
                  <span>{proj.name.split(' (')[0]}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-[#475569]'}`}>
                    {proj.totalLengthKm} km
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Project Macro Metrics & Readiness Meter Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
          {/* Readiness Score Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F0F7FF] via-white to-[#E0F2FE] border border-[#BAE6FD] shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-extrabold text-[#0284C7] uppercase tracking-wider">
              Corridor Readiness Score
            </span>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-4xl font-black text-[#0F172A] font-mono tracking-tight">
                {currentProject.overallReadinessScore}
              </span>
              <span className="text-sm font-bold text-[#64748B]">/ 100</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#EA580C] h-full rounded-full transition-all duration-700"
                style={{ width: `${currentProject.overallReadinessScore}%` }}
              />
            </div>
          </div>

          {/* Cleared vs In-Process Length */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex flex-col justify-between">
            <span className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">
              Corridor Right-of-Way Status
            </span>
            <div className="flex justify-between items-baseline my-2">
              <div>
                <span className="text-2xl font-black text-emerald-600 font-mono">
                  {currentProject.clearedKm} km
                </span>
                <span className="text-[10px] block font-bold text-[#64748B]">🟢 Cleared ({( (currentProject.clearedKm / currentProject.totalLengthKm) * 100).toFixed(0)}%)</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-amber-600 font-mono">
                  {currentProject.underProcessKm} km
                </span>
                <span className="text-[10px] block font-bold text-[#64748B]">🟡 Under Process</span>
              </div>
            </div>
            <p className="text-[10px] text-[#64748B]">Total Alignment: {currentProject.totalLengthKm} km</p>
          </div>

          {/* Social Consent & Legal Impasse Constraints */}
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 flex flex-col justify-between">
            <span className="text-[11px] font-extrabold text-rose-700 uppercase tracking-wider">
              Concentrated Delay Hotspots
            </span>
            <div className="flex justify-between items-baseline my-2">
              <div>
                <span className="text-2xl font-black text-rose-600 font-mono">
                  {currentProject.disputedKm} km
                </span>
                <span className="text-[10px] block font-bold text-rose-700">🔴 Objections</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-purple-600 font-mono">
                  {currentProject.litigationKm} km
                </span>
                <span className="text-[10px] block font-bold text-purple-700">🟣 Court Stays</span>
              </div>
            </div>
            <p className="text-[10px] text-rose-800 font-bold">⚫ {currentProject.criticalBlockedKm} km Critical Blocking Delay</p>
          </div>

          {/* Target Commission & Fast-Track Actions */}
          <div className="p-4 rounded-2xl bg-[#0F172A] text-white flex flex-col justify-between shadow-sm">
            <span className="text-[11px] font-extrabold text-[#38BDF8] uppercase tracking-wider">
              Target Commissioning
            </span>
            <div className="my-1">
              <span className="text-xl font-black font-mono text-white">
                {currentProject.targetCommissionDate}
              </span>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                Statutory SLA: Fast-track resolution in progress
              </p>
            </div>
            <button
              onClick={() => {
                const disputed = currentProject.segments.find(
                  (s) => s.status === 'RED_DISPUTE' || s.status === 'BLACK_BLOCKING'
                );
                if (disputed) setInspectingSegment(disputed);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-black transition-all cursor-pointer flex items-center justify-between"
            >
              <span>Triage Critical Blockers</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* "Why is this Project Delayed?" Root-Cause Factor Breakdown */}
      <DelayFactorBreakdown
        project={currentProject}
        activeFactorFilter={activeFactorFilter}
        onSelectFactor={setActiveFactorFilter}
      />

      {/* Interactive GIS Corridor Map */}
      <CorridorMapViewer
        project={currentProject}
        segments={filteredSegments}
        selectedSegmentId={inspectedSegment?.id || null}
        onSelectSegment={(seg) => setInspectingSegment(seg)}
        onOpenARVerification={(code) => setArModalWaypoint(code)}
      />

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#BAE6FD]/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Village, Section Chainage, District, or Blocker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white transition-all"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Segments' },
            { id: 'GREEN_CLEAR', label: '🟢 Clear' },
            { id: 'AMBER_PROCESS', label: '🟡 In Process' },
            { id: 'RED_DISPUTE', label: '🔴 Objections' },
            { id: 'PURPLE_LEGAL', label: '🟣 Litigation' },
            { id: 'BLACK_BLOCKING', label: '⚫ Critical' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setStatusFilter(btn.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                statusFilter === btn.id
                  ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-xs'
                  : 'bg-[#F8FAFC] text-[#475569] border-slate-200 hover:bg-slate-100'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Segments Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-[#0F172A] tracking-tight">
            Corridor Chainage Sections & Cadastral Segments ({filteredSegments.length})
          </h3>
          <span className="text-xs text-[#64748B] font-medium">
            Click any section to inspect the full Delay Chain and Official Dossier
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSegments.map((seg) => {
            const config = CORRIDOR_STATUS_CONFIG[seg.status] || CORRIDOR_STATUS_CONFIG.GREY_NO_DATA;
            const isSelected = inspectedSegment?.id === seg.id;

            return (
              <div
                key={seg.id}
                onClick={() => setInspectingSegment(seg)}
                className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-xs hover:shadow-md ${
                  isSelected
                    ? 'border-[#EA580C] ring-2 ring-[#EA580C]/20 shadow-md'
                    : 'border-slate-200 hover:border-[#BAE6FD]'
                }`}
              >
                <div>
                  {/* Status & Chainage Pill */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${config.badgeClass}`}>
                      {seg.statusLabel}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#64748B] bg-slate-100 px-2 py-0.5 rounded">
                      {seg.lengthKm} km
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-[#0F172A] leading-tight line-clamp-1">
                    {seg.segmentName}
                  </h4>
                  <p className="text-[11px] text-[#0284C7] font-bold mt-0.5">
                    {seg.villageName} • {seg.district}
                  </p>
                  <p className="text-[11px] text-[#475569] mt-2 line-clamp-2 leading-relaxed">
                    {seg.keyImpediment}
                  </p>
                </div>

                {/* Footer Metrics */}
                <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <span>{seg.affectedLandholdersCount} Landholders</span>
                    <span>•</span>
                    <span className="text-rose-600 font-bold">{seg.recordedObjectionsCount} Objections</span>
                  </div>
                  <span className="font-mono font-black text-[#0F172A] bg-[#F0F7FF] px-2 py-0.5 rounded border border-[#BAE6FD]">
                    {seg.readinessScore}/100
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide-over Segment Detail Drawer */}
      <SegmentDetailDrawer
        segment={inspectedSegment}
        onClose={() => setInspectingSegment(null)}
        onOpenARVerification={(code) => setArModalWaypoint(code)}
      />

      {/* AR Verification Modal HUD */}
      {arModalWaypoint && (
        <div className="fixed inset-0 z-[1500] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] text-white rounded-3xl p-6 max-w-md w-full border border-[#38BDF8]/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-[#38BDF8]">
                <Sparkles className="w-5 h-5 animate-spin" />
                <h3 className="text-sm font-black tracking-tight">AR Spatial Verification HUD</h3>
              </div>
              <button
                onClick={() => setArModalWaypoint(null)}
                className="text-[#94A3B8] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-[#CBD5E1]">
              <p>
                Waypoint Code: <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded">{arModalWaypoint}</span>
              </p>
              <div className="h-44 rounded-2xl bg-slate-900 border border-slate-700 relative overflow-hidden flex flex-col items-center justify-center text-center p-4">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#38BDF8] animate-spin flex items-center justify-center mb-2">
                  <Route className="w-8 h-8 text-[#38BDF8]" />
                </div>
                <span className="text-[11px] font-bold text-[#38BDF8]">AR Camera & LiDAR Sensor Connected</span>
                <span className="text-[9px] text-[#94A3B8] mt-1">Overlaying 3D CAD Viaduct & Survey Pegs over camera feed</span>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                Field acquisition officers can physically walk the cadastral boundary in augmented reality to confirm tree counts, structures, and setback clearance.
              </p>
            </div>

            <button
              onClick={() => setArModalWaypoint(null)}
              className="w-full py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-xs transition-all cursor-pointer"
            >
              Close AR HUD
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
