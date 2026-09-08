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
  'NATIONAL_EXECUTIVE': ['overview', 'lifecycle', 'gis', 'parcels', 'documents', 'compensation', 'audit'],
  'FIELD_ACQUISITION': ['overview', 'lifecycle', 'gis', 'parcels', 'documents', 'compensation', 'audit'],
  'AUDIT_CITIZEN': ['overview', 'lifecycle', 'gis', 'documents', 'compensation', 'audit'],
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
    { id: 'audit', name: 'Audit Ledger', icon: History, count: counts.auditLogs },
  ];

  const visibleTabs = allTabs.filter((t) => allowedTabs.includes(t.id));

  return (
    <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 py-1.5  overflow-x-auto">
      <div className="flex items-center gap-1.5 min-w-max">
        {visibleTabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0B132B] text-white shadow-soft'
                  : 'text-indigo-600 hover:text-[#0B132B] hover:bg-indigo-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-[#4F46E5]'}`} />
              <span>{t.name}</span>
              {t.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-extrabold ${
                    isActive ? 'bg-brand-gradient text-white' : 'bg-indigo-50 text-indigo-600'
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
