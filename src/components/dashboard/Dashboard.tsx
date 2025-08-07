import React, { useState } from 'react';
import { supabase, applicationService } from '../../lib/supabase';
import Sidebar from './dashboard/Sidebar';

const Dashboard: React.FC<DashboardProps> = ({ user, onSignOut }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userCV, setUserCV] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);

  // Load applications from database
  React.useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setIsLoadingApplications(true);
    try {
      const dbApplications = await applicationService.getApplications();
      
      // Transform database applications to match our local format
      const transformedApplications = dbApplications.map(app => ({
        id: app.id,
        jobId: app.job_id,
        title: app.job_title,
        company: app.company_name,
        appliedDate: app.applied_at,
        status: app.status,
        notes: app.notes,
        salary: app.salary_range,
        location: app.location,
        jobType: app.job_type
      }));
      
      setApplications(transformedApplications);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setIsLoadingApplications(false);
    }
  };

  const handleNewApplications = (newApplications: any[]) => {
    setApplications(prev => [...prev, ...newApplications]);
    // Refresh from database after a short delay to get updated statuses
    setTimeout(() => {
      loadApplications();
    }, 2000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'cv':
        return <CVUpload userCV={userCV} onCVUpdate={setUserCV} />;
      case 'jobs':
        return <JobMatching userCV={userCV} onApply={handleNewApplications} />;
      case 'applications':
        return <Applications applications={applications} isLoading={isLoadingApplications} />;
      default:
        return <div>Overview content</div>;
    }
  };

  return (
    <div className="dashboard">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onSignOut={onSignOut} />
      <main className="dashboard-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;