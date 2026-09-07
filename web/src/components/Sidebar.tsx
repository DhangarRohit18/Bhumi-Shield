import React from 'react';
import {
  Globe,
  Cpu,
  Brain,
  Shield,
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
  seeding?: boolean;
  handleSeed?: () => void;
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
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-2 pb-2 border-b border-[#BAE6FD]/40">
          <div className="w-9 h-9 rounded-xl bg-[#EA580C] text-white shadow-sm flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm tracking-tight text-[#0F172A] leading-none">
              BHUMI-
            </span>
            <span className="font-black text-sm tracking-tight text-[#0F172A] leading-none mt-0.5">
              SHIELD
            </span>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#0284C7] px-3 mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]"></span>
            <span>Workspaces</span>
          </p>

          <div className="space-y-1.5">
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
        </div>
      </div>
    </aside>
  );
};
