// src/components/dashboard/JobMatching.tsx (Corrected & Final)

import React, { useState, useEffect } from 'react';
import { supabase, applicationService } from '../../lib/supabase';
import { JobMatchingEngine, CoverLetterGenerator } from '../../lib/jobMatching';
import { 
  Search, MapPin, DollarSign, Clock, Building, Filter, CheckCircle,
  Star, ExternalLink, Zap, FileText, X, Upload, Target, AlertCircle, 
  Download, Edit, Trash2 
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
  
  // ... (All other state and functions from the full script) ...
  
  const toggleJobSelection = (jobId: number) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  return (
    <div className="space-y-8">
      {/* ... (Your full component JSX) ... */}
      
      {userCV && jobs.length > 0 && (
        <div className="space-y-6">
          {jobs.map((job) => (
            // FIX: Check if the job object exists before trying to render it
            job && (
              <div key={job.id} onClick={() => toggleJobSelection(job.id)} className={`...`}>
                {/* ... (Inner job card JSX) ... */}
                <div className={`...`}>
                  {/* FIX: job.match is now safe to access */}
                  {job.match}% Match 
                </div>
                {/* ... */}
              </div>
            )
          ))}
        </div>
      )}
      
      {/* ... (Rest of the component JSX) ... */}
    </div>
  );
};

export default JobMatching;
