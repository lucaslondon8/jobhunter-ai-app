import React from 'react';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award,
  BarChart3,
  PieChart,
  Calendar,
  Users
} from 'lucide-react';

interface AnalyticsProps {
  applications: any[];
}

const Analytics: React.FC<AnalyticsProps> = ({ applications }) => {
  // Calculate analytics data
  const totalApplications = applications.length;
  const successRate = totalApplications > 0 ? 
    ((applications.filter(app => app.status === 'accepted').length / totalApplications) * 100).toFixed(1) : 0;
  const responseRate = totalApplications > 0 ? 
    ((applications.filter(app => app.status !== 'pending').length / totalApplications) * 100).toFixed(1) : 0;
  const averageResponseTime = '3.2'; // Mock data

  const statusCounts = {
    pending: applications.filter(app => app.status === 'pending').length,
    interview: applications.filter(app => app.status === 'interview').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };

  const weeklyData = [
    { week: 'Week 1', applications: 12, responses: 8 },
    { week: 'Week 2', applications: 18, responses: 12 },
    { week: 'Week 3', applications: 24, responses: 16 },
    { week: 'Week 4', applications: 15, responses: 11 },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Track your job search performance and optimize your strategy</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Success Rate</h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">{successRate}%</span>
            <span className="text-sm text-green-600">+2.3%</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Response Rate</h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">{responseRate}%</span>
            <span className="text-sm text-green-600">+5.1%</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Days</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Avg Response Time</h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">{averageResponseTime}</span>
            <span className="text-sm text-green-600">-0.8 days</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Total Applications</h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">{totalApplications}</span>
            <span className="text-sm text-green-600">This month</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Application Status Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center space-x-2 mb-6">
            <PieChart className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Application Status</h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(statusCounts).map(([status, count]) => {
              const percentage = totalApplications > 0 ? ((count / totalApplications) * 100).toFixed(1) : 0;
              const colors = {
                pending: 'bg-yellow-500',
                interview: 'bg-blue-500',
                accepted: 'bg-green-500',
                rejected: 'bg-red-500'
              };
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${colors[status as keyof typeof colors]}`}></div>
                    <span className="capitalize font-medium text-gray-700">{status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-900 font-semibold">{count}</span>
                    <span className="text-sm text-gray-500">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Performance */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Weekly Performance</h3>
          </div>
          
          <div className="space-y-4">
            {weeklyData.map((week, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{week.week}</span>
                  <span className="text-gray-500">{week.applications} applications</span>
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(week.applications / 30) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(week.responses / 30) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Applications</span>
                  <span>{week.responses} responses</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">AI-Powered Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">What's Working Well</h4>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Your response rate is 15% above average</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Applications on Tuesdays get 23% more responses</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Remote positions show higher success rates</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Recommendations</h4>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Focus on mid-size companies (100-500 employees)</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Add more quantified achievements to your CV</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Consider applying to more fintech positions</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;