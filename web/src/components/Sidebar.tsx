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
      name: 'Command Center',
      description: 'Corridor GIS & Macro Overview',
      icon: Globe,
    },
    {
      id: 'digital_twin',
      name: 'Digital Twin',
      description: 'Cadastral Plots & Sec 30 Awards',
      icon: Cpu,
    },
    {
      id: 'ops_intelligence',
      name: 'Interventions',
      description: 'Root-Cause Diagnostics & What-If',
      icon: Brain,
    },
    {
      id: 'admin',
      name: 'Audit & Security',
      description: 'SHA-256 Ledger & Access Control',
      icon: Shield,
    },
  ];

  const visibleWorkspaces = allWorkspaces.filter((w) => allowedWorkspaces.includes(w.id));

  return (
    <aside className="w-full md:w-60 border-r border-[#E2E8F0] bg-white p-4 flex flex-col justify-between shrink-0 font-sans shadow-sm">
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] px-3 mb-2">
          Workspaces
        </p>

        {visibleWorkspaces.map((w) => {
          const Icon = w.icon;
          const isActive = activeTab === w.id;
          return (
            <button
              key={w.id}
              onClick={() => setActiveTab(w.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#BF7834] text-white border border-[#BF7834] shadow-md font-extrabold'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#FFFBEB]'
              }`}
            >
              <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-[#9A5A20] text-white' : 'bg-[#F1F5F9] text-[#475569]'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className={`text-xs font-extrabold ${isActive ? 'text-white' : 'text-[#0F172A]'}`}>{w.name}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-8 pt-4 border-t border-[#E2E8F0] space-y-2">
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border border-[#CBD5E1] text-[#0F172A] bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-all cursor-pointer shadow-sm"
        >
          <span className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5" />
            <span>Reset Demo Seed Dataset</span>
          </span>
          <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
        </button>

        <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-[#64748B] flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#475569] shrink-0" />
          <span>Active Role: <strong className="text-[#0F172A]">{activeRole}</strong></span>
        </div>
      </div>
    </aside>
  );
};
