// src/components/dashboard/JobMatching.tsx

import React, { useState, useEffect } from 'react';
import { supabase, applicationService } from '../../lib/supabase';
import { JobMatchingEngine, CoverLetterGenerator } from '../../lib/jobMatching';
import { CVAnalysis } from '../../lib/cvParser'; // Import the type definition
import { 
  Search, MapPin, DollarSign, Clock, Building, Filter, CheckCircle, 
  Star, ExternalLink, Zap, FileText, X, Upload, Target, AlertCircle, 
  Download, Edit, Trash2 
} from 'lucide-react';

interface JobMatchingProps {
  userCV: any; // This will now store the backend analysis result
  onApply: (jobs: any[]) => void;
  onCVUpdate: (cvAnalysis: CVAnalysis | null) => void;
}

const JobMatching: React.FC<JobMatchingProps> = ({ userCV, onApply, onCVUpdate }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  // ... other states remain the same ...

  const jobMatchingEngine = new JobMatchingEngine();
  // ... other initializations ...

  useEffect(() => {
    if (userCV) { // userCV is now the analysis object
      findJobs();
    }
  }, [userCV, filters]);

  // --- UPGRADED FILE HANDLING ---
  const handleFileUpload = async (file: File) => {
    setIsAnalyzing(true);
    setUploadProgress(30); // Start progress

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User not authenticated.");

      const formData = new FormData();
      formData.append('cv', file);

      // Call the new backend function for parsing
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-cv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      setUploadProgress(80);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to parse CV');
      }

      const analysisResult: CVAnalysis = await response.json();
      
      // Add file metadata to the analysis result for display
      const displayData = {
        ...analysisResult,
        fileName: file.name,
        fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        uploadDate: new Date().toISOString(),
        analysisScore: Math.min(95, 70 + (analysisResult.skills?.length || 0) * 2),
      };
      
      setUploadProgress(100);
      onCVUpdate(displayData);

    } catch (error) {
      console.error("Error uploading or parsing CV:", error);
      alert(error.message);
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  };
  
  const findJobs = async () => {
    if (!userCV) return;
    setIsLoading(true);
    
    try {
      // The `job-handler` function is already secure and doesn't need client-side keys
      const matchingJobs = await jobMatchingEngine.findMatchingJobs(userCV, filters);
      setJobs(matchingJobs);
    } catch (error) {
      console.error('Error finding jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ... (keep handleDrag, handleDrop, handleFileSelect)
  // ... (keep handleBulkApply, toggleJobSelection, generateCoverLetter, etc.)
  // The rest of the component's logic for UI and state management remains largely the same,
  // but it now operates on the `userCV` object which is the JSON analysis from the backend.
  
  // Example change in the CV Analysis Results section:
  // From: userCV.suggestions.slice(0, 3).map(...)
  // To: (userCV.suggestions || []).slice(0, 3).map(...)
  // Make sure to handle potentially undefined properties in the analysis object gracefully.

  // Render logic remains similar but now uses the backend-provided analysis data
  // The CVUploadSection logic will need to be adapted to the new `isAnalyzing` flow.
  // The rest of the JSX for job cards, modals, etc., remains the same.
  
  // This is a placeholder for the extensive JSX. The core logic change is in handleFileUpload.
  return (
    <div>
      {/* ... The extensive JSX from the original file ... */}
      {/* Ensure all references to `userCV.skills`, `userCV.suggestions`, etc. are still valid */}
    </div>
  );
};

export default JobMatching;
