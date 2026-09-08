import React from 'react';
import {
  Globe,
  Route,
  Cpu,
  Brain,
  Shield,
  Sprout,
  Sparkles,
  Home,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export type MainWorkspaceId =
  | 'command_center'
  | 'corridor_readiness'
  | 'digital_twin'
  | 'ops_intelligence'
  | 'admin'
  | 'krishi_sathi'
  | 'structural_valuations';

interface SidebarProps {
  activeTab: MainWorkspaceId;
  setActiveTab: (t: MainWorkspaceId) => void;
}

// Statutory RBAC Permission Matrix for Workspace Access
const ROLE_WORKSPACE_PERMISSIONS: Record<UserRole, MainWorkspaceId[]> = {
  'NATIONAL_EXECUTIVE': ['command_center', 'digital_twin', 'ops_intelligence', 'admin', 'krishi_sathi', 'structural_valuations'],
  'FIELD_ACQUISITION': ['digital_twin', 'ops_intelligence', 'krishi_sathi', 'structural_valuations'],
  'AUDIT_CITIZEN': ['command_center', 'digital_twin', 'admin', 'structural_valuations'],
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
    badge?: string;
    icon: any;
  }[] = [
    {
      id: 'command_center',
      name: 'Command Center',
      icon: Globe,
    },
    {
      id: 'digital_twin',
      name: 'Digital Twin',
      icon: Cpu,
    },
    {
      id: 'ops_intelligence',
      name: 'Interventions',
      icon: Brain,
    },
    {
      id: 'admin',
      name: 'Audit & Security',
      icon: Shield,
    },
    {
      id: 'krishi_sathi',
      name: 'Krishi Sathi',
      badge: 'AR',
      icon: Sprout,
    },
    {
      id: 'structural_valuations',
      name: 'Land with Property',
      badge: 'BSR',
      icon: Home,
    },
  ];

  const visibleWorkspaces = allWorkspaces.filter((w) => allowedWorkspaces.includes(w.id));

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 p-4 flex flex-col justify-between shrink-0 font-sans shadow-[4px_0_24px_-12px_rgba(0,0,0,0.03)] z-40">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-soft bg-white border border-slate-100 flex items-center justify-center">
            <img src="/logo.png" alt="Bhumi-Shield Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-[#0B132B]">
                BHUMI-SHIELD
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-indigo-600/90 block leading-tight">
              Land OS Platform
            </span>
          </div>
        </div>

        {/* Navigation Modules */}
        <div className="space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400 px-3 mb-2">
            Workspaces
          </p>

          <div className="space-y-1">
            {visibleWorkspaces.map((w) => {
              const Icon = w.icon;
              const isActive = activeTab === w.id;

              return (
                <button
                  key={w.id}
                  onClick={() => setActiveTab(w.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-[#0B132B] text-white shadow-soft font-extrabold'
                      : 'text-slate-600 hover:text-[#0B132B] hover:bg-slate-100/70 font-extrabold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-white/15 text-white'
                          : 'bg-slate-100 text-slate-500 group-hover:text-indigo-600 group-hover:bg-indigo-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs tracking-tight truncate">{w.name}</span>
                  </div>

                  {w.badge && (
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                      }`}
                    >
                      {w.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>


    </aside>
  );
};
