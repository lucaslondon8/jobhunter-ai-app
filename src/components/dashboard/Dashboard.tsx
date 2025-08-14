import React, { useState, useEffect } from 'react';
import { applicationService } from '../../lib/supabase';
import Sidebar from './dashboard/Sidebar';
import Overview from './dashboard/Overview';
// import JobMatching from './JobMatching';
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
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);

  useEffect(() => {
    console.log('Dashboard mounted for user:', user?.id);
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setIsLoadingApplications(true);
    try {
      console.log('Loading applications...');
      const dbApplications = await applicationService.getApplications();
      console.log('Applications loaded:', dbApplications?.length || 0);
      setApplications(dbApplications || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
      setApplications([]);
    } finally {
      setIsLoadingApplications(false);
    }
  };

  const handleNewApplications = (newlySubmittedJobs: any[]) => {
    setApplications(prev => [...newlySubmittedJobs, ...prev]);
    setTimeout(() => {
      loadApplications();
    }, 5000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview user={user} applications={applications} />;
      // case 'jobs':
      //   return <JobMatching user={user} userCV={userCV} onApply={handleNewApplications} onCVUpdate={setUserCV} />;
      case 'applications':
        return <Applications applications={applications} isLoading={isLoadingApplications} />;
      case 'analytics':
        return <Analytics applications={applications} />;
      case 'settings':
        return <Settings user={user} />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to jobhunter ai!</h2>
            <p className="text-gray-600">Select a tab from the sidebar to get started.</p>
          </div>
        );
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        user={user}
        onSignOut={onSignOut}
      />
      <main className="flex-1 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;