import React, { useState } from 'react';
import Sidebar from './dashboard/Sidebar';
import Overview from './dashboard/Overview';
import CVUpload from './dashboard/CVUpload';
import JobMatching from './dashboard/JobMatching';
import Applications from './dashboard/Applications';
import Analytics from './dashboard/Analytics';
import Settings from './dashboard/Settings';

interface DashboardProps {
  user: any;
  onSignOut: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onSignOut }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userCV, setUserCV] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview user={user} applications={applications} />;
      case 'cv':
        return null; // CV upload is now integrated into job matching
      case 'jobs':
        return <JobMatching userCV={userCV} onApply={handleNewApplications} onCVUpdate={setUserCV} />;
      case 'applications':
        return <Applications applications={applications} />;
      case 'analytics':
        return <Analytics applications={applications} />;
      case 'settings':
        return <Settings user={user} />;
      default:
        return <Overview user={user} applications={applications} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        user={user}
        onSignOut={onSignOut}
      />
      <main className="flex-1 ml-64">
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;