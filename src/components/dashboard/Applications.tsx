import React, { useState } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  Calendar,
  ExternalLink,
  Filter,
  Search,
  MoreVertical,
  MapPin,
  Building
} from 'lucide-react';

interface ApplicationsProps {
  applications: any[];
  isLoading?: boolean;
}

const Applications: React.FC<ApplicationsProps> = ({ applications, isLoading = false }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'interview':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'interview':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch = app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: applications.length,
    processing: applications.filter(app => app.status === 'processing').length,
    submitted: applications.filter(app => app.status === 'submitted').length,
    pending: applications.filter(app => app.status === 'pending').length,
    interview: applications.filter(app => app.status === 'interview').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
        <p className="text-gray-600">Track and manage all your job applications in one place</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-8 h-8 text-gray-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Total</h3>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.processing}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Processing</h3>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.submitted}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Submitted</h3>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.pending}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Pending Review</h3>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.interview}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Interviews</h3>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.accepted}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Offers</h3>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="processing">Processing</option>
              <option value="submitted">Submitted</option>
              <option value="pending">Pending</option>
              <option value="interview">Interview</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your applications...</p>
        </div>
      ) : filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <div key={application.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{application.title}</h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(application.status)}
                        <span className="capitalize">{application.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Building className="w-4 h-4" />
                      <span>{application.company}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Applied {new Date(application.appliedDate).toLocaleDateString()}</span>
                    </div>
                    {application.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{application.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                      <span>View Job</span>
                    </button>
                    
                    {application.status === 'interview' && (
                      <button className="text-green-600 hover:text-green-700 font-medium flex items-center space-x-1 transition-colors">
                        <Calendar className="w-4 h-4" />
                        <span>Schedule Interview</span>
                      </button>
                    )}
                    
                    {application.status === 'failed' && (
                      <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        <span>Apply Manually</span>
                      </button>
                    )}
                  </div>
                </div>

                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {applications.length === 0 ? 'No Applications Yet' : 'No Matching Applications'}
          </h3>
          <p className="text-gray-600 mb-6">
            {applications.length === 0 
              ? 'Start applying to jobs to see them here'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {applications.length === 0 && (
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105">
              Find Jobs
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Applications;