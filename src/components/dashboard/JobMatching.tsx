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
  X,
  Upload,
  Target,
  AlertCircle,
  Download,
  Edit,
  Trash2
} from 'lucide-react';

interface JobMatchingProps {
  userCV: any;
  onApply: (jobs: any[]) => void;
  onCVUpdate: (cv: any) => void;
}

const JobMatching: React.FC<JobMatchingProps> = ({ userCV, onApply, onCVUpdate }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [selectedJobForCover, setSelectedJobForCover] = useState<any>(null);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('');
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [applicationProgress, setApplicationProgress] = useState<{[key: string]: string}>({});
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAllSkills, setShowAllSkills] = useState(false);
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
  }, [userCV, filters]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    setIsAnalyzing(true);
    setUploadProgress(0);
    
    // Simulate file upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    
    // Real file analysis with progress
    setTimeout(() => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        // Store the actual file for processing
        const cvData = {
          id: Date.now(),
          fileName: file.name,
          fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          uploadDate: new Date().toISOString(),
          analysisScore: 85, // Will be calculated after real analysis
          skills: [], // Will be populated by real CV parsing
          experience: 'Processing...',
          suggestions: ['Analyzing CV content...'],
          file: file // Store the actual file for processing
        };
        
        onCVUpdate(cvData);
        setIsAnalyzing(false);
        setUploadProgress(0);
        
        // Trigger real CV analysis and job matching
        setTimeout(() => {
          analyzeUploadedCV(cvData);
        }, 500);
      }, 500);
    }, 2500);
  };

  // Analyze the uploaded CV content and update skills/suggestions
  const analyzeUploadedCV = async (cvData: any) => {
    try {
      const analysis = await jobMatchingEngine.analyzeCV(cvData);
      
      // Update CV data with real analysis results
      const updatedCV = {
        ...cvData,
        skills: analysis.skills,
        experience: analysis.summary,
        roles: analysis.roles,
        industries: analysis.industries,
        analysisScore: Math.min(95, 70 + analysis.skills.length * 2), // Score based on skills found
        suggestions: [
          `Identified ${analysis.skills.length} relevant skills in your CV`,
          `Detected experience in: ${analysis.roles.join(', ')}`,
          `Industry focus: ${analysis.industries.join(', ')}`,
          `Seniority level: ${analysis.seniorityLevel}`,
          `Found ${analysis.keyAchievements.length} quantifiable achievements`
        ]
      };
      
      onCVUpdate(updatedCV);
      
      // Auto-trigger job search with real analysis
      setTimeout(() => {
        findJobs();
      }, 1000);
      
    } catch (error) {
      console.error('Error analyzing CV:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };
  const findJobs = async () => {
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated. Cannot fetch jobs.");
      }
      const token = session.access_token;

      // Use real CV analysis if available, otherwise fallback to sync method
      const cvAnalysis = userCV?.file 
        ? await jobMatchingEngine.analyzeCV(userCV)
        : jobMatchingEngine.analyzeCVSync(userCV);
        
      const matchingJobs = await jobMatchingEngine.findMatchingJobs(cvAnalysis, filters, token);
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
      // Use real CV analysis for cover letter generation
      const cvAnalysis = userCV?.file 
        ? await jobMatchingEngine.analyzeCV(userCV)
        : jobMatchingEngine.analyzeCVSync(userCV);
        
      const userProfile = {
        name: cvAnalysis.personalInfo?.name || 'Professional',
        email: cvAnalysis.personalInfo?.email || 'your.email@example.com'
      };
      const coverLetter = coverLetterGenerator.generateCoverLetter(cvAnalysis, job, userProfile);
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

  const handleBulkApply = async () => {
    if (selectedJobs.length === 0) return;

    setIsApplying(true);
    setApplicationProgress({});

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }

      const selectedJobData = jobs.filter(job => selectedJobs.includes(job.id));
      
      // Initialize progress tracking
      const progressMap: {[key: string]: string} = {};
      selectedJobData.forEach(job => {
        progressMap[job.id] = 'Starting application...';
      });
      setApplicationProgress(progressMap);
      
      const result = await applicationService.submitApplications(
        selectedJobData,
        userCV,
        session.access_token,
        (jobId: string, status: string) => {
          setApplicationProgress(prev => ({
            ...prev,
            [jobId]: status
          }));
        }
      );

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

      const { successful, failed, total } = result.summary;
      
      let message = `✅ Applied to ${successful}/${total} jobs successfully!`;
      if (failed > 0) {
        message += `\n⚠️ ${failed} applications need manual review or failed.`;
      }
      
      // Show detailed results
      const manualReviewJobs = result.details
        .flatMap(detail => detail.jobs)
        .filter(job => job.requiresManualReview)
        .length;
      
      if (manualReviewJobs > 0) {
        message += `\n📋 ${manualReviewJobs} jobs flagged for manual application.`;
      }
      
      alert(message);

    } catch (error) {
      console.error('Bulk apply error:', error);
      alert(`Failed to submit applications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsApplying(false);
      setApplicationProgress({});
    }
  };

  // CV Upload Section Component
  const CVUploadSection = () => {
    if (isAnalyzing) {
      return (
        <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div className="w-full max-w-md">
              <div className="bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 text-center">{uploadProgress}% complete</p>
            </div>
            <p className="text-gray-600 text-center">
              {uploadProgress < 50 ? 'Uploading and parsing your CV...' :
               uploadProgress < 90 ? 'Analyzing skills and experience...' :
               'Generating optimization suggestions...'}
            </p>
          </div>
        </div>
      );
    }

    if (!userCV) {
      return (
        <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your CV</h2>
            <p className="text-gray-600">Let our AI analyze your resume and find perfect job matches</p>
          </div>
          
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Drop your CV here or click to browse
            </h3>
            <p className="text-gray-600 mb-4">
              Supports PDF, DOC, DOCX files up to 10MB
            </p>
            <input
              type="file"
              id="cv-upload"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
            />
            <label
              htmlFor="cv-upload"
              className="bg-[#2765FF] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer inline-block"
            >
              Choose File
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">ATS Optimization</h3>
              <p className="text-sm text-gray-600">Optimize for Applicant Tracking Systems</p>
            </div>

            <div className="text-center">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Star className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Skill Analysis</h3>
              <p className="text-sm text-gray-600">Identify and highlight key skills</p>
            </div>

            <div className="text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Smart Suggestions</h3>
              <p className="text-sm text-gray-600">Get AI-powered improvement tips</p>
            </div>
          </div>
        </div>
      );
    }

    // CV Analysis Results
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{userCV.fileName}</h3>
              <p className="text-gray-600 text-sm">{userCV.fileSize} • Uploaded {new Date(userCV.uploadDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              userCV.analysisScore >= 90 ? 'bg-green-100 text-green-800' :
              userCV.analysisScore >= 80 ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {userCV.analysisScore}% Optimized
            </div>
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onCVUpdate(null)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Skills Detected</h4>
            <div className="flex flex-wrap gap-2">
              {(showAllSkills ? userCV.skills : userCV.skills.slice(0, 6)).map((skill: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
              {userCV.skills.length > 6 && (
                <button
                  onClick={() => setShowAllSkills(!showAllSkills)}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {showAllSkills ? 'Show less' : `+${userCV.skills.length - 6} more`}
                </button>
                </span>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Top Suggestions</h4>
            <div className="space-y-2">
              {userCV.suggestions.slice(0, 3).map((suggestion: string, index: number) => (
                <div key={index} className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <CVUploadSection />
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finding Perfect Job Matches</h1>
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
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Matching</h1>
        <p className="text-gray-600">
          {userCV ? `Found ${jobs.length} jobs matching your profile` : 'Upload your CV to find perfect job matches'}
        </p>
      </div>

      <CVUploadSection />

      {!userCV && (
        <div className="text-center py-8">
          <p className="text-gray-500">Upload your CV above to start finding job matches</p>
        </div>
      )}

      {userCV && (
        <>
      <div className="flex items-center justify-between">
        {selectedJobs.length > 0 && (
          <button
            onClick={handleBulkApply}
            disabled={isApplying}
            className={`text-white px-6 py-3 rounded-xl font-semibold transition-all transform flex items-center space-x-2 relative ${
              isApplying 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#03C03C] to-blue-600 hover:shadow-lg hover:scale-105'
            }`}
          >
            {isApplying ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Applying to {selectedJobs.length} jobs...</span>
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
        </>
      )}

      {/* Application Progress */}
      {userCV && isApplying && Object.keys(applicationProgress).length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Progress</h3>
          <div className="space-y-3">
            {Object.entries(applicationProgress).map(([jobId, status]) => {
              const job = jobs.find(j => j.id.toString() === jobId);
              return (
                <div key={jobId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{job?.title}</p>
                    <p className="text-sm text-gray-600">{job?.company}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-700">{status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      {userCV && (
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

          {/* --- FINAL FIX: Updated location options to UK cities --- */}
          <select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Location</option>
            <option value="all">All Locations</option>
            <option value="remote">Remote</option>
            <option value="london">London</option>
            <option value="manchester">Manchester</option>
            <option value="birmingham">Birmingham</option>
            <option value="bristol">Bristol</option>
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
      )}

      {/* Job Cards */}
      {userCV && jobs.length > 0 && (
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
      )}

      {userCV && jobs.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your filters or updating your CV</p>
          <button onClick={findJobs} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105">
            Find Jobs
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
                    <button className="flex-1 bg-[#2765FF] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
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

