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
import { ROLE_CAPABILITIES } from '../utils/rbac';

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
  'NATIONAL_EXECUTIVE': ['command_center', 'digital_twin', 'ops_intelligence', 'admin'],
  'FIELD_ACQUISITION': ['digital_twin', 'ops_intelligence'],
  'AUDIT_CITIZEN': ['command_center', 'digital_twin', 'admin'],
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
    <aside className="w-full md:w-60 border-r border-[#BAE6FD]/60 bg-white/90 backdrop-blur-md p-4 flex flex-col justify-between shrink-0 font-sans shadow-sm">
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#0284C7] px-3 mb-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]"></span>
          <span>Workspaces</span>
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
                  ? 'bg-[#EA580C] text-white border border-[#C2410C] shadow-md font-extrabold'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#E0F2FE]'
              }`}
            >
              <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-[#9A3412] text-white' : 'bg-[#F0F7FF] text-[#0284C7]'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className={`text-xs font-extrabold ${isActive ? 'text-white' : 'text-[#0F172A]'}`}>{w.name}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-8 pt-4 border-t border-[#BAE6FD]/60 space-y-2">
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border border-[#BAE6FD] text-[#0F172A] bg-[#F0F7FF] hover:bg-[#E0F2FE] transition-all cursor-pointer shadow-sm"
        >
          <span className="flex items-center gap-2 text-[#0369A1]">
            <Database className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>Reset Demo Seed Dataset</span>
          </span>
          <RefreshCw className={`w-3.5 h-3.5 text-[#0284C7] ${seeding ? 'animate-spin' : ''}`} />
        </button>

        <div className="p-3 rounded-xl bg-[#F0F7FF] border border-[#BAE6FD] text-[11px] text-[#0369A1] space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-extrabold text-[#0F172A]">
              <Lock className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>{activeRole}</span>
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
              {ROLE_CAPABILITIES[activeRole]?.scope || 'Jurisdiction'}
            </span>
          </div>
          <p className="text-[10px] text-[#64748B] leading-tight">
            {ROLE_CAPABILITIES[activeRole]?.description || 'Statutory clearance'}
          </p>
        </div>
      </div>
    </aside>
  );
};
