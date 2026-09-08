import React from 'react';
import {
  Globe, Route, Cpu, Brain, Shield, Home,
  Map, Activity, CheckCircle, Folder, IndianRupee, PieChart,
  Settings, List, MapPin, Scan, Camera, MessageSquare, Wifi,
  RefreshCw, FileText, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export type MainWorkspaceId =
  | 'command_center' | 'digital_twin' | 'gis_heatmap' | 'interventions' | 'administration' | 'audit'
  | 'my_tasks' | 'qr_ar' | 'evidence' | 'public_projects' | 'parcel_passport' | 'grievances';

interface SidebarProps {
  activeTab: MainWorkspaceId;
  setActiveTab: (t: MainWorkspaceId) => void;
}

const ROLE_WORKSPACE_PERMISSIONS: Record<UserRole, MainWorkspaceId[]> = {
  'NATIONAL_EXECUTIVE': [
    'command_center', 'gis_heatmap', 'digital_twin', 'interventions', 'administration'
  ],
  'FIELD_ACQUISITION': [
    'my_tasks', 'digital_twin', 'evidence', 'qr_ar'
  ],
  'AUDIT_CITIZEN': [
    'public_projects', 'parcel_passport', 'grievances', 'audit'
  ],
};

const WORKSPACE_CONFIG: Record<MainWorkspaceId, { name: string, icon: any, badge?: string }> = {
  command_center: { name: 'Command Center', icon: Globe },
  digital_twin: { name: 'Digital Twin', icon: Cpu },
  gis_heatmap: { name: 'GIS / Heatmap', icon: Map, badge: 'AI' },
  interventions: { name: 'Interventions', icon: Brain },
  administration: { name: 'Administration', icon: Settings },
  audit: { name: 'Audit', icon: Shield },
  my_tasks: { name: 'My Tasks', icon: List },
  qr_ar: { name: 'QR / AR', icon: Scan },
  evidence: { name: 'Evidence', icon: Camera },
  grievances: { name: 'Grievances', icon: MessageSquare },
  public_projects: { name: 'Public Projects', icon: Globe },
  parcel_passport: { name: 'Parcel Passport', icon: FileText }
};

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { activeRole } = useAuth();
  const allowedWorkspaces = ROLE_WORKSPACE_PERMISSIONS[activeRole] || ['command_center'];

  React.useEffect(() => {
    if (!allowedWorkspaces.includes(activeTab)) {
      setActiveTab(allowedWorkspaces[0]);
    }
  }, [activeRole, activeTab, allowedWorkspaces, setActiveTab]);

  return (
    <aside className="w-64 bg-white border-r border-[#E2E8F0] flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B132B] to-[#1C2C59] flex items-center justify-center shadow-lg shadow-blue-900/20">
            <LayoutDashboard className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-[#0B132B] leading-none mb-1">
              BHUMI-SHIELD
            </h1>
            <p className="text-[10px] font-bold text-blue-600 tracking-wider uppercase">Land OS Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 pb-6 overflow-y-auto custom-scrollbar space-y-1">
        <div className="px-3 pb-2 pt-4">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Workspaces</p>
        </div>
        {allowedWorkspaces.map((id) => {
          const ws = WORKSPACE_CONFIG[id];
          if (!ws) return null;
          const isActive = activeTab === id;
          const Icon = ws.icon;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-[#0B132B] text-white shadow-md shadow-blue-900/10'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-[#0B132B]'
              }`}
            >
              <div className="flex items-center gap-3 relative z-10">
                <Icon
                  className={`w-[18px] h-[18px] transition-colors ${
                    isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-600'
                  }`}
                  strokeWidth={2.5}
                />
                <span className={`text-sm tracking-wide ${isActive ? 'font-bold' : 'font-semibold'}`}>
                  {ws.name}
                </span>
              </div>
              {ws.badge && (
                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider relative z-10 ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-200'
                      : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
                  }`}
                >
                  {ws.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
