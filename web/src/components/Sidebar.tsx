import React from 'react';
import {
  Globe,
  Cpu,
  Brain,
  Shield,
  Database,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export type MainWorkspaceId =
  | 'command_center'
  | 'digital_twin'
  | 'ops_intelligence'
  | 'admin';

interface SidebarProps {
  activeTab: MainWorkspaceId;
  setActiveTab: (t: MainWorkspaceId) => void;
  seeding: boolean;
  handleSeed: () => void;
}

// Statutory RBAC Permission Matrix for Workspace Access
const ROLE_WORKSPACE_PERMISSIONS: Record<UserRole, MainWorkspaceId[]> = {
  'National Admin': ['command_center', 'digital_twin', 'ops_intelligence', 'admin'],
  'State Admin': ['command_center', 'digital_twin', 'ops_intelligence'],
  'District Officer': ['command_center', 'digital_twin', 'ops_intelligence'],
  'Acquisition Officer': ['digital_twin', 'ops_intelligence'],
  'Field Supervisor': ['ops_intelligence', 'digital_twin'],
  'Field Officer': ['digital_twin'],
  'Auditor': ['admin', 'command_center', 'digital_twin'],
  'Public User': ['command_center', 'digital_twin'],
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  seeding,
  handleSeed,
}) => {
  const { activeRole } = useAuth();

  const allowedWorkspaces = ROLE_WORKSPACE_PERMISSIONS[activeRole] || ['command_center'];

  const allWorkspaces: {
    id: MainWorkspaceId;
    name: string;
    description: string;
    icon: any;
  }[] = [
    {
      id: 'command_center',
      name: 'National Command Center',
      description: 'National overview, GIS corridors & drill-down',
      icon: Globe,
    },
    {
      id: 'digital_twin',
      name: 'Project Digital Twin',
      description: 'Unified project workspace with 12 specialized tabs',
      icon: Cpu,
    },
    {
      id: 'ops_intelligence',
      name: 'Operations & Intelligence',
      description: '7-layer diagnostics, DAG critical path & What-If',
      icon: Brain,
    },
    {
      id: 'admin',
      name: 'Administration & Security',
      description: 'Master RBAC, SLA rules, PII protection & audit',
      icon: Shield,
    },
  ];

  const visibleWorkspaces = allWorkspaces.filter((w) => allowedWorkspaces.includes(w.id));

  return (
    <aside className="w-full md:w-64 border-r border-[#E2D9CC] bg-[#FDFBF7] p-4 flex flex-col justify-between shrink-0 font-sans">
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#786C5E] px-3 mb-2">
          Authorized Workspaces ({activeRole})
        </p>

        {visibleWorkspaces.map((w) => {
          const Icon = w.icon;
          const isActive = activeTab === w.id;
          return (
            <button
              key={w.id}
              onClick={() => setActiveTab(w.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 border border-[#C5B49E] shadow-sm ring-1 ring-[#C5B49E]/50 font-bold'
                  : 'text-[#786C5E] hover:text-slate-900 hover:bg-[#FAF8F5]'
              }`}
            >
              <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isActive ? 'bg-[#E2D9CC] text-[#4A3B2C]' : 'bg-[#FAF8F5] text-[#786C5E]'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-snug">{w.name}</p>
                <p className="text-[10px] text-[#786C5E] mt-0.5 leading-snug line-clamp-1">{w.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 pt-4 border-t border-[#E2D9CC] space-y-2">
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold border border-[#C5B49E] text-[#4A3B2C] bg-[#E2D9CC] hover:bg-[#D5C7B7] transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5" />
            <span>Reset Demo Seed Dataset</span>
          </span>
          <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
        </button>

        <div className="p-2.5 rounded-lg bg-white border border-[#E2D9CC] text-[11px] text-[#786C5E] flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#8C7355] shrink-0" />
          <span>Active Role: <strong className="text-slate-900">{activeRole}</strong></span>
        </div>
      </div>
    </aside>
  );
};
