import React from 'react';
import {
  LayoutDashboard,
  GitBranch,
  MapPin,
  FolderOpen,
  FileText,
  DollarSign,
  Home,
  Scale,
  Camera,
  BrainCircuit,
  Zap,
  History,
} from 'lucide-react';
import { UserRole } from '../../../types';

export type TwinTabId =
  | 'overview'
  | 'lifecycle'
  | 'gis'
  | 'parcels'
  | 'documents'
  | 'compensation'
  | 'rr'
  | 'legal'
  | 'field_evidence'
  | 'intelligence'
  | 'actions'
  | 'audit';

interface TwinNavProps {
  activeTab: TwinTabId;
  onTabChange: (t: TwinTabId) => void;
  activeRole: UserRole;
  counts: {
    parcels: number;
    documents: number;
    compensations: number;
    rrCases: number;
    legalCases: number;
    evidence: number;
    auditLogs: number;
  };
}

// Role-Based Tab Permissions inside the Project Digital Twin
const ROLE_TAB_PERMISSIONS: Record<UserRole, TwinTabId[]> = {
  'National Admin': ['overview', 'lifecycle', 'gis', 'parcels', 'documents', 'compensation', 'rr', 'legal', 'field_evidence', 'intelligence', 'actions', 'audit'],
  'State Admin': ['overview', 'lifecycle', 'gis', 'parcels', 'documents', 'compensation', 'rr', 'legal', 'field_evidence', 'intelligence', 'actions', 'audit'],
  'District Officer': ['overview', 'lifecycle', 'gis', 'parcels', 'documents', 'compensation', 'rr', 'legal', 'field_evidence', 'intelligence', 'actions', 'audit'],
  'Acquisition Officer': ['overview', 'lifecycle', 'gis', 'parcels', 'documents', 'compensation', 'legal', 'actions', 'audit'],
  'Field Supervisor': ['overview', 'gis', 'parcels', 'field_evidence', 'actions', 'audit'],
  'Field Officer': ['parcels', 'field_evidence', 'gis'],
  'Auditor': ['overview', 'documents', 'compensation', 'rr', 'audit'],
  'Public User': ['overview', 'lifecycle', 'gis', 'documents'],
};

export const TwinNavigation: React.FC<TwinNavProps> = ({
  activeTab,
  onTabChange,
  activeRole,
  counts,
}) => {
  const allowedTabs = ROLE_TAB_PERMISSIONS[activeRole] || ['overview', 'lifecycle', 'gis', 'parcels'];

  const allTabs: { id: TwinTabId; name: string; icon: any; count?: number }[] = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'lifecycle', name: 'Statutory Lifecycle', icon: GitBranch },
    { id: 'gis', name: 'Corridor GIS', icon: MapPin },
    { id: 'parcels', name: 'Parcels & Khasra', icon: FolderOpen, count: counts.parcels },
    { id: 'documents', name: 'Gazette & Documents', icon: FileText, count: counts.documents },
    { id: 'compensation', name: 'Compensation & PFMS', icon: DollarSign, count: counts.compensations },
    { id: 'rr', name: 'R&R Entitlements', icon: Home, count: counts.rrCases },
    { id: 'legal', name: 'Legal Writs', icon: Scale, count: counts.legalCases },
    { id: 'field_evidence', name: 'Field Evidence', icon: Camera, count: counts.evidence },
    { id: 'intelligence', name: 'AI Forecasts', icon: BrainCircuit },
    { id: 'actions', name: 'Directives', icon: Zap },
    { id: 'audit', name: 'Audit Ledger', icon: History, count: counts.auditLogs },
  ];

  const visibleTabs = allTabs.filter((t) => allowedTabs.includes(t.id));

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-[#BAE6FD]/60 px-4 py-1.5 font-sans overflow-x-auto">
      <div className="flex items-center gap-1.5 min-w-max">
        {visibleTabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0F172A] text-white shadow-sm'
                  : 'text-[#0369A1] hover:text-[#0F172A] hover:bg-[#E0F2FE]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#EA580C]' : 'text-[#0284C7]'}`} />
              <span>{t.name}</span>
              {t.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? 'bg-[#EA580C] text-white' : 'bg-[#E0F2FE] text-[#0369A1]'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
