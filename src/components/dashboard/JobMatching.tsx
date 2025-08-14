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
    // ... function is unchanged
  };

  useEffect(() => {
    // ... hook is unchanged
  }, [userCV]);

  const toggleJobSelection = (jobId: number) => {
    // ... function is unchanged
  };

  const handleFileUpload = (file: File) => {
    // ... function is unchanged
  };

  return (
    <div className="space-y-8">
      {/* ... header and CV upload sections are unchanged ... */}
      
      {!isLoading && jobs.length > 0 && (
        <>
            <div className="flex justify-end">
                {/* ... button is unchanged ... */}
            </div>
            <div className="space-y-4">
            {/* CORRECTED: Filter out any null/undefined jobs before mapping */}
            {jobs.filter(job => !!job).map((job) => (
                // The check for job.match is now redundant but kept for safety
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
