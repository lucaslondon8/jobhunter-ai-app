// src/components/dashboard/JobMatching.tsx (Corrected)

import React, { useState, useEffect } from 'react';
import { supabase, applicationService } from '../../lib/supabase';
import { JobMatchingEngine, CoverLetterGenerator } from '../../lib/jobMatching';
import { 
  Search, MapPin, DollarSign, Clock, Building, Filter, CheckCircle,
  Star, ExternalLink, Zap, FileText, X, Upload, Target, AlertCircle, // CORRECTED: Added FileText
  Download, Edit, Trash2 
} from 'lucide-react';

// ... (Interface definitions remain the same)

const JobMatching: React.FC<JobMatchingProps> = ({ user, userCV, onApply, onCVUpdate }) => {
  // ... (All your existing state and functions: useState, findJobs, handleBulkApplyClick, etc.)

  // The main return statement
  return (
    <div className="space-y-8">
      {/* ... (Header, CV Upload Section, and Bulk Apply button remain the same) ... */}

      {/* Job Cards */}
      {userCV && jobs.length > 0 && (
        <div className="space-y-6">
        {jobs.map((job) => (
          // CORRECTED: Added a check to ensure 'job' is not null or undefined before rendering
          job && (
            <div
              key={job.id}
              className={`bg-white rounded-2xl p-6 border-2 transition-all cursor-pointer ${
                selectedJobs.includes(job.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleJobSelection(job.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                    {/* ... (All the inner JSX for the job card) ... */}
                    {/* This is where the error was happening */}
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      job.match >= 90 ? 'bg-green-100 text-green-800' :
                      job.match >= 80 ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {job.match}% Match
                    </div>
                    {/* ... (Rest of the job card JSX) ... */}
                </div>
              </div>
            </div>
          )
        ))}
      </div>
      )}

      {/* ... (The rest of your JSX for loading states, modals, etc. remains the same) ... */}
    </div>
  );
};

export default JobMatching;
