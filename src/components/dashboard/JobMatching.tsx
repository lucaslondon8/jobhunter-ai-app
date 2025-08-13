// src/components/dashboard/JobMatching.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { JobMatchingEngine } from '../../lib/jobMatching';
import { Zap, FileText, Upload } from 'lucide-react';

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
  
  const canBulkApply = user.plan === 'pro' || user.plan === 'plus+';

  const findJobs = async () => {
    if (!userCV) return;
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Authentication error");
      const engine = new JobMatchingEngine();
      const matchingJobs = await engine.findMatchingJobs(userCV, {}, session.access_token);
      setJobs(matchingJobs || []);
    } catch (error) {
      console.error("Error finding jobs:", error);
      setJobs([]);
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
    setSelectedJobs(prev => prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]);
  };

  const handleFileUpload = (file: File) => {
    const cvData = {
        fileName: file.name,
        fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        uploadDate: new Date().toISOString(),
        file: file
    };
    onCVUpdate(cvData);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center">Job Matching</h1>
      
      {!userCV ? (
        <div className="bg-white rounded-2xl p-8 border text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Your CV</h3>
            <p className="text-gray-600 mb-4">Let our AI find perfect job matches for you.</p>
            <input type="file" id="cv-upload" className="hidden" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])} />
            <label htmlFor="cv-upload" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold cursor-pointer">
                Choose File
            </label>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 border">
            <h3 className="text-lg font-bold">CV Loaded: {userCV.fileName}</h3>
        </div>
      )}

      {isLoading && (
        <div className="text-center p-8"><p>Loading jobs...</p></div>
      )}

      {!isLoading && userCV && jobs.length === 0 && (
          <div className="text-center p-8 bg-white rounded-2xl border">
              <p>No job matches found. Try uploading an updated CV.</p>
          </div>
      )}

      {!isLoading && jobs.length > 0 && (
        <>
            <div className="flex justify-end">
                <button
                    onClick={() => onApply(selectedJobs)}
                    disabled={!canBulkApply || selectedJobs.length === 0 || isApplying}
                    className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold disabled:bg-gray-400 flex items-center space-x-2"
                >
                    <Zap className="w-5 h-5" />
                    <span>Apply to {selectedJobs.length} Jobs</span>
                </button>
            </div>
            <div className="space-y-4">
            {jobs.map((job) => (
                job && typeof job.match !== 'undefined' && (
                <div key={job.id} onClick={() => toggleJobSelection(job.id)} className={`bg-white rounded-2xl p-6 border-2 transition-all cursor-pointer ${selectedJobs.includes(job.id) ? 'border-blue-500 shadow-lg' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">{job.title}</h3>
                        <p className="text-gray-600">{job.company}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg text-blue-600">{job.match}% Match</p>
                    </div>
                    </div>
                </div>
                )
            ))}
            </div>
        </>
      )}
    </div>
  );
};

export default JobMatching;
