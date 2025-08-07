// src/lib/jobMatching.ts

// --- Get Supabase URL from environment variables ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// --- Interfaces (no changes) ---
export interface CVAnalysis {
  primaryRole: string;
  secondaryRoles: string[];
  skills: string[];
  experience: number;
  seniority: 'entry' | 'mid' | 'senior' | 'lead';
  industries: string[];
  keywords: string[];
}

export interface JobOpportunity {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  posted: string;
  match: number;
  description: string;
  requirements: string[];
  logo: string;
  role: string;
  industry: string;
  seniority: string;
  url?: string;
}

// --- Main Job Matching Engine Class ---
export class JobMatchingEngine {
  
  // --- CV Analysis logic (no changes needed here) ---
  // ... (All your CV analysis functions remain the same)

  // --- MODIFIED: Job Fetching Logic ---
  private async fetchJobsViaProxy(cvAnalysis: CVAnalysis, filters: any): Promise<JobOpportunity[]> {
    if (!SUPABASE_URL) {
      console.error("Supabase URL is not configured in the frontend.");
      return [];
    }

    const searchKeywords = cvAnalysis.primaryRole;
    const searchLocation = filters.location && filters.location !== 'all' ? filters.location : 'us';

    const params = new URLSearchParams({
      what: searchKeywords,
      where: searchLocation,
    });

    try {
      // --- Calls our own Supabase function ---
      const response = await fetch(`${SUPABASE_URL}/functions/v1/job-handler?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Proxy request failed with status ${response.status}`);
      }
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        return [];
      }

      return data.results.map((job: any): JobOpportunity => ({
        id: job.id,
        title: job.title,
        company: job.company.display_name,
        location: job.location.display_name,
        salary: job.salary_min ? `$${job.salary_min}` : 'Not specified',
        type: job.contract_time || 'Full-time',
        posted: new Date(job.created).toLocaleDateString(),
        match: 0,
        description: job.description,
        requirements: [job.category.label],
        logo: '🏢',
        role: job.category.label,
        industry: job.category.tag,
        seniority: this.determineSeniorityFromTitle(job.title),
        url: job.redirect_url,
      }));
    } catch (error) {
      console.error("Error fetching jobs via proxy:", error);
      return [];
    }
  }

  async findMatchingJobs(cvAnalysis: CVAnalysis, filters: any = {}): Promise<JobOpportunity[]> {
    const fetchedJobs = await this.fetchJobsViaProxy(cvAnalysis, filters);
    // ... (The rest of the function remains the same)
  }

  // ... (All other helper functions like calculateMatchScore, etc., remain the same)
}

// --- Cover Letter Generator (No changes here) ---
// ... (Your CoverLetterGenerator class remains the same)

