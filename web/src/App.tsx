import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { seedBhumiShieldDemoData } from './utils/seedData';
import { Header } from './components/Header';
import { Sidebar, MainWorkspaceId } from './components/Sidebar';
import { CommandCenter } from './features/command-center/CommandCenter';
import { CorridorReadinessWorkspace } from './features/corridor-readiness/CorridorReadinessWorkspace';
import { ProjectDigitalTwin } from './features/digital-twin/ProjectDigitalTwin';
import { OperationsIntelligenceCenter } from './features/operations-intelligence/OperationsIntelligenceCenter';
import { AdministrationWorkspace } from './features/admin/AdministrationWorkspace';
import { KrishiSathiWorkspace } from './features/krishi-sathi/KrishiSathiWorkspace';
import { StructuralValuationsWorkspace } from './features/structural-valuations/StructuralValuationsWorkspace';
import { LoginScreen } from './features/auth/LoginScreen';
import { BhumiPolicyCopilot } from './components/BhumiPolicyCopilot';
import { PublicPassportView } from './features/public/PublicPassportView';
import { projectService } from './services/entities.service';
import { UserRole } from './types';

export const App: React.FC = () => {
  const { activeRole } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<MainWorkspaceId>('command_center');
  const [seeding, setSeeding] = useState<boolean>(false);
  const [seedNotification, setSeedNotification] = useState<string | null>(null);

  // Auto-seed demo dataset if database is empty on initial load
  React.useEffect(() => {
    const unsubscribe = projectService.subscribe((projects) => {
      if (projects.length === 0) {
        console.log('[AUTO-SEED] Empty database detected. Seeding full dataset...');
        seedBhumiShieldDemoData().catch(console.error);
      }
    });
    return () => unsubscribe();
  }, []);

  // 0. Handle Public Routes before checking Auth
  const urlPath = window.location.pathname;
  if (urlPath.startsWith('/passport/')) {
    const parcelId = urlPath.split('/passport/')[1];
    return <PublicPassportView parcelId={parcelId} />;
  }

  const handleLoginSuccess = (role: UserRole) => {
    setIsAuthenticated(true);
    // Redirect to the respective consolidated role-based dashboard
    if (role === 'FIELD_ACQUISITION') {
      setActiveTab('digital_twin');
    } else if (role === 'AUDIT_CITIZEN') {
      setActiveTab('admin');
    } else {
      setActiveTab('command_center');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // 1. If not authenticated, render Login Screen
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. Once authenticated, render Authorized Workspace
  return (
    <div className="flex h-screen bg-[#FAF8F5] text-[#0B132B] overflow-hidden ">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FAF8F5]">
        <Header onLogout={handleLogout} />

        {seedNotification && (
          <div className="bg-gradient-to-r from-[#EEF2FF] to-[#FAF5FF] border-b border-indigo-100 px-6 py-2 text-xs font-bold text-indigo-900 flex items-center justify-between shadow-xs">
            <span>{seedNotification}</span>
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-[#FAF8F5]">
          {activeTab === 'command_center' && <CommandCenter />}
          {activeTab === 'corridor_readiness' && <CorridorReadinessWorkspace />}
          {activeTab === 'digital_twin' && <ProjectDigitalTwin />}
          {activeTab === 'ops_intelligence' && <OperationsIntelligenceCenter />}
          {activeTab === 'admin' && <AdministrationWorkspace />}
          {activeTab === 'krishi_sathi' && <KrishiSathiWorkspace />}
          {activeTab === 'structural_valuations' && <StructuralValuationsWorkspace />}
        </main>
      </div>

      {/* Floating BhumiAI Statutory & Policy RAG Copilot */}
      <BhumiPolicyCopilot />
    </div>
  );
};
