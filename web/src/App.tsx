import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { seedBhumiShieldDemoData } from './utils/seedData';
import { Header } from './components/Header';
import { Sidebar, MainWorkspaceId } from './components/Sidebar';
import { CommandCenter } from './features/command-center/CommandCenter';
import { ProjectDigitalTwin } from './features/digital-twin/ProjectDigitalTwin';
import { OperationsIntelligenceCenter } from './features/operations-intelligence/OperationsIntelligenceCenter';
import { AdministrationWorkspace } from './features/admin/AdministrationWorkspace';
import { LoginScreen } from './features/auth/LoginScreen';
import { BhumiPolicyCopilot } from './components/BhumiPolicyCopilot';
import { UserRole } from './types';

export const App: React.FC = () => {
  const { activeRole } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<MainWorkspaceId>('command_center');
  const [seeding, setSeeding] = useState<boolean>(false);
  const [seedNotification, setSeedNotification] = useState<string | null>(null);

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

  const handleSeed = async () => {
    setSeeding(true);
    setSeedNotification('Seeding multi-state corridors and cadastral plots into Firebase...');
    try {
      await seedBhumiShieldDemoData((msg) => setSeedNotification(msg));
      setSeedNotification('Synthetic evaluation dataset successfully synchronized across all workspaces.');
      setTimeout(() => setSeedNotification(null), 4000);
    } catch (err: any) {
      setSeedNotification('ERROR: ' + (err.message || err));
      setTimeout(() => setSeedNotification(null), 5000);
    } finally {
      setSeeding(false);
    }
  };

  // 1. If not authenticated, render Login Screen
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. Once authenticated, render Authorized Workspace
  return (
    <div className="flex h-screen bg-[#F0F7FF] text-[#0F172A] overflow-hidden font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        seeding={seeding}
        handleSeed={handleSeed}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F0F7FF]">
        <Header onLogout={handleLogout} />

        {seedNotification && (
          <div className="bg-[#E0F2FE] border-b border-[#BAE6FD] px-6 py-2 text-xs font-bold text-[#0369A1] flex items-center justify-between shadow-sm">
            <span>{seedNotification}</span>
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-[#F0F7FF] p-4">
          {activeTab === 'command_center' && <CommandCenter />}
          {activeTab === 'digital_twin' && <ProjectDigitalTwin />}
          {activeTab === 'ops_intelligence' && <OperationsIntelligenceCenter />}
          {activeTab === 'admin' && <AdministrationWorkspace />}
        </main>
      </div>

      {/* Floating BhumiAI Statutory & Policy RAG Copilot */}
      <BhumiPolicyCopilot />
    </div>
  );
};
