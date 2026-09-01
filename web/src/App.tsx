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
import { UserRole } from './types';

export const App: React.FC = () => {
  const { activeRole } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<MainWorkspaceId>('command_center');
  const [seeding, setSeeding] = useState<boolean>(false);
  const [seedNotification, setSeedNotification] = useState<string | null>(null);

  const handleLoginSuccess = (role: UserRole) => {
    setIsAuthenticated(true);
    // Redirect to the respective role-based dashboard
    if (role === 'Acquisition Officer' || role === 'Field Officer') {
      setActiveTab('digital_twin');
    } else if (role === 'Field Supervisor') {
      setActiveTab('ops_intelligence');
    } else if (role === 'Auditor') {
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
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Global Government Header with Logout Button */}
      <Header onLogout={handleLogout} />

      {/* Synthetic Data Evaluation Banner in Restrained Pure Beige */}
      <div className="bg-[#E2D9CC] border-b border-[#C5B49E] px-6 py-1.5 flex items-center justify-between text-[11px] text-[#4A3B2C] font-semibold">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#8C7355] animate-pulse" />
          <span>BHUMI-SHIELD PLATFORM ENVIRONMENT • EVALUATION & FIELD SENTINEL DATASET ACTIVE</span>
        </div>
        <span className="font-mono text-[10px]">RFCTLARR (2013) STATUTORY PROTOCOL</span>
      </div>

      {seedNotification && (
        <div className="bg-[#FDFBF7] border-b border-[#E2D9CC] px-6 py-2 text-xs font-semibold text-[#4A3B2C] flex items-center justify-between">
          <span>{seedNotification}</span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          seeding={seeding}
          handleSeed={handleSeed}
        />

        <main className="flex-1 overflow-y-auto bg-white">
          {activeTab === 'command_center' && <CommandCenter />}
          {activeTab === 'digital_twin' && <ProjectDigitalTwin />}
          {activeTab === 'ops_intelligence' && <OperationsIntelligenceCenter />}
          {activeTab === 'admin' && <AdministrationWorkspace />}
        </main>
      </div>
    </div>
  );
};
