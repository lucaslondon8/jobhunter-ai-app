import React, { useState, useEffect } from 'react';
import { supabase, applicationService } from '../../lib/supabase';
import { JobMatchingEngine } from '../../lib/jobMatching';
import { 
  Zap, 
  FileText, 
  Upload, 
  Search, 
  Target, 
  MapPin, 
  Building, 
  DollarSign,
  Clock,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface JobMatchingProps {
  user: any;
  userCV: any;
  onApply: (jobs: any[]) => void;
  onCVUpdate: (cv: any) => void;
}

const JobMatching: React.FC<JobMatchingProps> = ({ user, userCV, onApply, onCVUpdate }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    location: 'london',
    jobType: 'all',
    salaryMin: ''
  });
  
  const canBulkApply = user.plan === 'pro' || user.plan === 'plus+';
  const jobMatchingEngine = new JobMatchingEngine();

  const findJobs = async () => {
    if (!userCV) {
      alert('Please upload your CV first to find matching jobs.');
      return;
    }

    setIsLoading(true);
    setJobs([]);
    setSelectedJobs([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const matchingJobs = await jobMatchingEngine.findMatchingJobs(
        userCV,
        searchFilters,
        session.access_token
      );

      console.log('Found jobs:', matchingJobs.length);
      setJobs(matchingJobs);
    } catch (error) {
      console.error('Error finding jobs:', error);
      alert('Failed to find jobs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userCV) {
      findJobs();
    }
  }, [userCV]);

  const toggleJobSelection = (jobId: number) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('cv', file);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      console.log('Uploading CV file:', file.name, file.type, file.size);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-cv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to parse CV (${response.status})`);
      }

      const cvAnalysis = await response.json();
      console.log('CV Analysis:', cvAnalysis);
      onCVUpdate(cvAnalysis);
      
      // Show success message
      const skillsCount = cvAnalysis.skills?.length || 0;
      const rolesCount = cvAnalysis.roles?.length || 0;
      const achievementsCount = cvAnalysis.keyAchievements?.length || 0;
      
      alert(`✅ CV parsed successfully!\n\n📊 Analysis Results:\n• ${skillsCount} skills identified\n• ${rolesCount} roles detected\n• ${achievementsCount} key achievements found\n• Seniority level: ${cvAnalysis.seniorityLevel || 'Not determined'}\n\nYou can now search for matching jobs!`);
    } catch (error) {
      console.error('Error uploading CV:', error);
      alert(`Failed to parse CV: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkApply = async () => {
    if (selectedJobs.length === 0) {
      alert('Please select at least one job to apply to.');
      return;
    }

    if (!canBulkApply) {
      alert('Bulk apply is only available for Pro and Plus+ plans. Please upgrade your plan.');
      return;
    }

    setIsApplying(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const selectedJobsData = jobs.filter(job => selectedJobs.includes(job.id));
      
      const result = await applicationService.submitApplications(
        selectedJobsData,
        { 
          name: user.name, 
          email: user.email, 
          cvData: userCV 
        },
        session.access_token,
        (jobId, status) => {
          console.log(`Job ${jobId}: ${status}`);
        }
      );

      console.log('Application results:', result);
      
      if (result.summary.successful > 0) {
        alert(`Successfully applied to ${result.summary.successful} jobs!`);
        onApply(selectedJobsData);
        setSelectedJobs([]);
      } else {
        alert('No applications were successful. Please try again.');
      }
    } catch (error) {
      console.error('Error applying to jobs:', error);
      alert('Failed to apply to jobs. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Matching</h1>
        <p className="text-gray-600">Find and apply to jobs that match your profile</p>
      </div>

      {/* CV Upload Section */}
      {!userCV && (
        <div className={`bg-white rounded-2xl p-8 border border-gray-200 text-center ${isLoading ? 'opacity-50' : ''}`}>
          <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Your CV</h3>
          <p className="text-gray-600 mb-6">
            Upload your CV to get personalized job matches and automated applications
          </p>
          {isLoading && (
            <div className="mb-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-blue-600">Parsing your CV...</p>
            </div>
          )}
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
            id="cv-upload"
            disabled={isLoading}
          />
          <label
            htmlFor="cv-upload"
            className={`px-6 py-3 rounded-xl font-semibold transition-colors cursor-pointer inline-block ${
              isLoading 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Processing...' : 'Choose CV File'}
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Supported formats: PDF, DOCX, TXT • Maximum size: 10MB
          </p>
        </div>
      )}

      {/* Search Filters */}
      {userCV && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={searchFilters.location}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., London, Manchester"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
              <select
                value={searchFilters.jobType}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, jobType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Salary</label>
              <input
                type="text"
                value={searchFilters.salaryMin}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, salaryMin: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 50000"
              />
            </div>
          </div>
          <button
            onClick={findJobs}
            disabled={isLoading}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Search Jobs'}
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Finding perfect job matches...</p>
        </div>
      )}

      {/* Jobs List */}
      {!isLoading && jobs.length > 0 && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">
              Found {jobs.length} matching jobs
            </h3>
            {canBulkApply && selectedJobs.length > 0 && (
              <button
                onClick={handleBulkApply}
                disabled={isApplying}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50"
              >
                {isApplying ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Applying to {selectedJobs.length} jobs...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Apply to {selectedJobs.length} jobs</span>
                  </div>
                )}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {jobs.filter(job => !!job).map((job) => (
              job && typeof job.match !== 'undefined' && (
                <div 
                  key={job.id} 
                  onClick={() => toggleJobSelection(job.id)} 
                  className={`bg-white rounded-2xl p-6 border-2 transition-all cursor-pointer hover:shadow-lg ${
                    selectedJobs.includes(job.id) 
                      ? 'border-blue-500 shadow-lg bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{job.title}</h3>
                          <p className="text-gray-600 mb-2">{job.company}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4" />
                              <span>{job.salary}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{job.posted}</span>
                            </div>
                          </div>
                          {job.requirements && job.requirements.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {job.requirements.slice(0, 3).map((req: string, index: number) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                  {req}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          <Target className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-lg text-blue-600">{job.match}% Match</span>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          job.applicationType === 'easy_apply' ? 'bg-green-100 text-green-800' :
                          job.applicationType === 'external_form_simple' ? 'bg-blue-100 text-blue-800' :
                          job.applicationType === 'external_form_complex' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {job.applicationType === 'easy_apply' ? 'Easy Apply' :
                           job.applicationType === 'external_form_simple' ? 'Simple Form' :
                           job.applicationType === 'external_form_complex' ? 'Complex Form' :
                           'Manual Review'}
                        </span>
                      </div>
                      {job.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                      {selectedJobs.includes(job.id) && (
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </>
      )}

      {/* No Jobs Found */}
      {!isLoading && userCV && jobs.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Found</h3>
          <p className="text-gray-600 mb-6">
            We couldn't find any jobs matching your criteria. Try adjusting your search filters.
          </p>
          <button
            onClick={findJobs}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Search Again
          </button>
        </div>
      )}
    </div>
  );
};

export default JobMatching;
