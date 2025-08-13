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
  
  const canBulkApply = user.plan === 'pro' || user.plan === 'plus+';
  const appLimit = user.monthly_app_limit;
  const appsRemaining = appLimit - user.monthly_app_count;
  const atLimit = appsRemaining <= 0 && user.plan !== 'plus+';

  const findJobs = async () => {
    if (!userCV) return;
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Authentication error");
      const engine = new JobMatchingEngine();
      const matchingJobs = await engine.findMatchingJobs(userCV, {}, session.access_token);
      setJobs(matchingJobs || []); // Ensure jobs is always an array
    } catch (error) {
      console.error("Error finding jobs:", error);
      setJobs([]); // On error, reset to an empty array
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    findJobs();
  }, [userCV]);

  const toggleJobSelection = (jobId: number) => {
    setSelectedJobs(prev => prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]);
  };
  
  const handleBulkApply = async () => {
    // Placeholder for your application logic
    setIsApplying(true);
    console.log("Applying to jobs:", selectedJobs);
    await new Promise(res => setTimeout(res, 2000));
    setIsApplying(false);
  };

  const handleBulkApplyClick = () => {
    if (!canBulkApply) return alert('Upgrade to Pro to use the Bulk Apply Engine!');
    if (atLimit) return alert(`You've reached your monthly limit. Upgrade for unlimited applications.`);
    handleBulkApply();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center">Job Matching</h1>
      {/* Placeholder for CV Upload Section */}
      <div className="text-center p-8 bg-gray-100 rounded-lg">
        <p>CV Upload & Analysis Section</p>
      </div>

      {isLoading && (
        <div className="text-center">
          <p>Loading jobs...</p>
        </div>
      )}

      {!isLoading && jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map((job) => (
            // THE FIX: Ensure job and job.match exist before rendering.
            job && typeof job.match !== 'undefined' && (
              <div key={job.id} onClick={() => toggleJobSelection(job.id)} className={`bg-white rounded-2xl p-6 border-2 transition-all ${selectedJobs.includes(job.id) ? 'border-blue-500 shadow-lg' : 'border-gray-200'}`}>
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
      )}
    </div>
  );
};

export default JobMatching;
