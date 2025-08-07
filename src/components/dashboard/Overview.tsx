import React from 'react';
import { 
  TrendingUp, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Target,
  Zap
} from 'lucide-react';

interface OverviewProps {
  user: any;
  applications: any[];
}

const Overview: React.FC<OverviewProps> = ({ user, applications }) => {
  const stats = {
    totalApplications: applications.length,
    inProgress: applications.filter(app => app.status === 'pending').length,
    interviews: applications.filter(app => app.status === 'interview').length,
    success: applications.filter(app => app.status === 'accepted').length,
  };

  const recentActivity = [
    { action: 'Applied to Software Engineer at TechCorp', time: '2 hours ago', type: 'application' },
    { action: 'Interview scheduled with DataFlow Inc', time: '1 day ago', type: 'interview' },
    { action: 'CV updated with new skills', time: '2 days ago', type: 'update' },
    { action: 'Bulk applied to 15 positions', time: '3 days ago', type: 'bulk' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-blue-100 text-lg">
          You're doing great! Here's your job search progress overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.totalApplications}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Total Applications</h3>
          <p className="text-sm text-gray-600">All time applications sent</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.inProgress}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">In Progress</h3>
          <p className="text-sm text-gray-600">Applications under review</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.interviews}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Interviews</h3>
          <p className="text-sm text-gray-600">Scheduled interviews</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.success}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Success Rate</h3>
          <p className="text-sm text-gray-600">Offers received</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <button className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Find New Jobs</h3>
                <p className="text-sm text-gray-600">Discover perfect job matches</p>
              </div>
            </button>

            <button className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Bulk Apply</h3>
                <p className="text-sm text-gray-600">Apply to multiple jobs instantly</p>
              </div>
            </button>

            <button className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">View Analytics</h3>
                <p className="text-sm text-gray-600">Track your success metrics</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'application' ? 'bg-blue-100' :
                  activity.type === 'interview' ? 'bg-green-100' :
                  activity.type === 'update' ? 'bg-purple-100' : 'bg-orange-100'
                }`}>
                  {activity.type === 'application' && <FileText className="w-4 h-4 text-blue-600" />}
                  {activity.type === 'interview' && <Calendar className="w-4 h-4 text-green-600" />}
                  {activity.type === 'update' && <AlertCircle className="w-4 h-4 text-purple-600" />}
                  {activity.type === 'bulk' && <Zap className="w-4 h-4 text-orange-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;