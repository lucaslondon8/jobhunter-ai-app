import React, { useState, useEffect } from 'react';
import { supabase, applicationService } from '../../lib/supabase';
import { JobMatchingEngine, CoverLetterGenerator } from '../../lib/jobMatching';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building,
  Filter,
  CheckCircle,
  Star,
  ExternalLink,
  Zap,
  FileText,
  X
} from 'lucide-react';

interface JobMatchingProps {
  userCV: any;
  onApply: (jobs: any[]) => void;
}

const JobMatching: React.FC<JobMatchingProps> = ({ userCV, onApply }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [selectedJobForCover, setSelectedJobForCover] = useState<any>(null);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('');
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [filters, setFilters] = useState({
    salary: '',
    location: '',
    jobType: '',
    experience: ''
  });
  
  const jobMatchingEngine = new JobMatchingEngine();
  const coverLetterGenerator = new CoverLetterGenerator();

  useEffect(() => {
    if (userCV) {
      findJobs();
    }
  }, [userCV]);

  useEffect(() => {
    if (userCV) {
      findJobs();
    }
  }, [filters]);
  const findJobs = async () => {
    setIsLoading(true);
    
    try {
      // Analyze CV to understand user's profile
      const cvAnalysis = jobMatchingEngine.analyzeCV(userCV);
      
      // Find matching jobs based on analysis and filters
      const matchingJobs = await jobMatchingEngine.findMatchingJobs(cvAnalysis, filters);
      
      setJobs(matchingJobs);
    } catch (error) {
      console.error('Error finding jobs:', error);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const generateCoverLetter = async (job: any) => {
    setSelectedJobForCover(job);
    setIsGeneratingCover(true);
    setShowCoverLetter(true);
    
    try {
      // Analyze CV
      const cvAnalysis = jobMatchingEngine.analyzeCV(userCV);
      
      // Get user profile (you might want to pass this as a prop)
      const userProfile = {
        name: 'John Doe', // This should come from actual user data
        email: 'john@example.com'
      };
      
      // Generate cover letter
      const coverLetter = coverLetterGenerator.generateCoverLetter(cvAnalysis, job, userProfile);
      
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setGeneratedCoverLetter(coverLetter);
    } catch (error) {
      console.error('Error generating cover letter:', error);
      setGeneratedCoverLetter('Error generating cover letter. Please try again.');
    } finally {
      setIsGeneratingCover(false);
    }
  };
  const toggleJobSelection = (jobId: number) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleBulkApply = () => {
    handleRealBulkApply();
  };

  const handleRealBulkApply = async () => {
    if (selectedJobs.length === 0) return;

    setIsApplying(true);

    try {
      // Get current session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }

      const selectedJobData = jobs.filter(job => selectedJobs.includes(job.id));
      
      // Submit applications via our backend service
      const result = await applicationService.submitApplications(
        selectedJobData,
        userCV,
        session.access_token
      );

      // Create local application records for immediate UI update
      const localApplications = selectedJobData.map(job => ({
        id: Date.now() + Math.random(),
        jobId: job.id,
        title: job.title,
        company: job.company,
        appliedDate: new Date().toISOString(),
        status: 'processing' as const
      }));

      onApply(localApplications);
      setSelectedJobs([]);

      // Show success message with details
      const { successful, failed, total } = result.summary;
      const message = `Applied to ${successful}/${total} jobs successfully!${failed > 0 ? ` ${failed} applications need manual review.` : ''}`;
      
      // In a real app, this would be a toast notification
      alert(message);

    } catch (error) {
      console.error('Bulk apply error:', error);
      alert(`Failed to submit applications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsApplying(false);
    }
  };

  if (!userCV) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Matching</h1>
          <p className="text-gray-600">Upload your CV first to find matching job opportunities</p>
        </div>

        <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No CV Uploaded</h3>
          <p className="text-gray-600 mb-6">Upload your CV to get personalized job recommendations</p>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105">
            Upload CV
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finding Perfect Matches</h1>
          <p className="text-gray-600">Our AI is searching thousands of job opportunities for you...</p>
        </div>

        <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Search className="w-8 h-8 text-white" />
          </div>
          <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-gray-600">Analyzing job requirements and matching with your skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Matches</h1>
          <p className="text-gray-600">Found {jobs.length} jobs matching your profile</p>
        </div>
        
        {selectedJobs.length > 0 && (
          <button
            onClick={handleBulkApply}
            disabled={isApplying}
            className={`text-white px-6 py-3 rounded-xl font-semibold transition-all transform flex items-center space-x-2 ${
              isApplying 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-600 to-blue-600 hover:shadow-lg hover:scale-105'
            }`}
          >
            {isApplying ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Applying...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Apply to {selectedJobs.length} Jobs</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.salary}
            onChange={(e) => handleFilterChange('salary', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Salary Range</option>
            <option value="0-50k">$0 - $50k</option>
            <option value="50k-100k">$50k - $100k</option>
            <option value="100k-150k">$100k - $150k</option>
            <option value="150k+">$150k+</option>
          </select>

          <select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Location</option>
            <option value="all">All Locations</option>
            <option value="remote">Remote</option>
            <option value="san-francisco">San Francisco</option>
            <option value="new-york">New York</option>
            <option value="austin">Austin</option>
            <option value="seattle">Seattle</option>
          </select>

          <select
            value={filters.jobType}
            onChange={(e) => handleFilterChange('jobType', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Job Type</option>
            <option value="all">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="freelance">Freelance</option>
          </select>

          <select
            value={filters.experience}
            onChange={(e) => handleFilterChange('experience', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Experience</option>
            <option value="all">All Levels</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
            <option value="lead">Lead/Principal</option>
          </select>
        </div>
      </div>

      {/* Job Cards */}
      <div className="space-y-6">
        {jobs.map((job) => (
          <div
            key={job.id}
            className={`bg-white rounded-2xl p-6 border-2 transition-all cursor-pointer ${
              selectedJobs.includes(job.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
            onClick={() => toggleJobSelection(job.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                  {job.logo}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      job.match >= 90 ? 'bg-green-100 text-green-800' :
                      job.match >= 80 ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {job.match}% Match
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Building className="w-4 h-4" />
                      <span>{job.company}</span>
                    </div>
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
                  
                  <p className="text-gray-700 mb-4">{job.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.map((req: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {selectedJobs.includes(job.id) && (
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                )}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    generateCoverLetter(job);
                  }}
                  className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                  title="Generate Cover Letter"
                >
                  <FileText className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                  <ExternalLink className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-yellow-600 transition-colors">
                  <Star className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your filters or updating your CV</p>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105">
            Refresh Search
          </button>
        </div>
      )}

      {/* Cover Letter Modal */}
      {showCoverLetter && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Cover Letter</h3>
                <p className="text-gray-600">{selectedJobForCover?.title} at {selectedJobForCover?.company}</p>
              </div>
              <button
                onClick={() => setShowCoverLetter(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {isGeneratingCover ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-gray-600">Generating personalized cover letter...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea
                    value={generatedCoverLetter}
                    onChange={(e) => setGeneratedCoverLetter(e.target.value)}
                    className="w-full h-96 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Your personalized cover letter will appear here..."
                  />
                  
                  <div className="flex space-x-4">
                    <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                      Copy to Clipboard
                    </button>
                    <button className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 transition-all">
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobMatching;