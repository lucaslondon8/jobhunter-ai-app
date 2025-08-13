// src/lib/jobMatching.ts (Corrected & Final)

import { CVAnalysis } from './cvParser';

export interface JobOpportunity {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  posted: string;
  match: number; // This property is required by the frontend
  description: string;
  requirements: string[];
  url?: string;
  applicationType: 'easy_apply' | 'external_form_simple' | 'external_form_complex' | 'unknown';
}

export class JobMatchingEngine {

  async findMatchingJobs(cvAnalysis: any, filters: any, authToken: string): Promise<JobOpportunity[]> {
    try {
      const realJobs = await this.searchRealJobs(cvAnalysis, filters, authToken);
      if (realJobs && realJobs.length > 0) {
        return realJobs;
      }
      // Fallback to mock jobs if the API fails or returns no results
      return this.generateMockJobs(cvAnalysis);
    } catch (apiError) {
      console.warn('API search failed, falling back to mock jobs:', apiError);
      return this.generateMockJobs(cvAnalysis);
    }
  }

  private async searchRealJobs(cvAnalysis: any, filters: any, authToken: string): Promise<JobOpportunity[]> {
    const primaryRole = (cvAnalysis.roles && cvAnalysis.roles[0]) || 'software developer';
    const location = filters.location || 'london';

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/job-handler?what=${encodeURIComponent(primaryRole)}&where=${encodeURIComponent(location)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Job API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.results) return [];

    // THE FIX: Map over the real API results and add the required 'match' property
    return data.results.map((job: any): JobOpportunity => ({
      id: job.id,
      title: job.title,
      company: job.company?.display_name || 'N/A',
      location: job.location?.display_name || 'N/A',
      salary: job.salary_min ? `£${job.salary_min} - £${job.salary_max}` : 'Not specified',
      posted: new Date(job.created).toLocaleDateString(),
      match: this.calculateMatchScore(cvAnalysis, job), // CRITICAL: Calculate and add the match score
      description: job.description,
      requirements: (job.description.match(/•\s(.*?)\n/g) || []).slice(0, 3).map((r: string) => r.slice(2).trim()),
      url: job.redirect_url,
      applicationType: this.determineApplicationType(job.redirect_url),
    }));
  }
  
  private calculateMatchScore(cvAnalysis: any, job: any): number {
    // This is a simple scoring algorithm. It can be made much more sophisticated.
    let score = 50; // Base score
    const jobText = `${job.title} ${job.description}`.toLowerCase();
    
    // Add points for matching skills
    if (cvAnalysis.skills) {
      cvAnalysis.skills.forEach((skill: string) => {
        if (jobText.includes(skill.toLowerCase())) {
          score += 5;
        }
      });
    }

    // Add points for matching role titles
    if (cvAnalysis.roles) {
        cvAnalysis.roles.forEach((role: string) => {
          if (job.title.toLowerCase().includes(role.toLowerCase())) {
            score += 15;
          }
        });
    }
    
    return Math.min(score, 98); // Cap score at 98%
  }

  private determineApplicationType(url: string): JobOpportunity['applicationType'] {
    if (!url) return 'unknown';
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('linkedin.com/jobs/view')) return 'easy_apply';
    if (lowerUrl.includes('workday') || lowerUrl.includes('greenhouse')) return 'external_form_complex';
    return 'external_form_simple';
  }

  private generateMockJobs(cvAnalysis: any): JobOpportunity[] {
    // This is a fallback and should be consistent with the real data structure
    return [
      {
        id: 1, title: 'Mock Software Engineer', company: 'Fallback Corp', location: 'London',
        salary: '£60,000', posted: '2 days ago', match: 85, description: 'A mock job description.',
        requirements: ['React', 'Node.js'], applicationType: 'easy_apply'
      }
    ];
  }
}

export class CoverLetterGenerator {
  generateCoverLetter(cvAnalysis: CVAnalysis, job: JobOpportunity, userProfile: any): string {
    return `Dear ${job.company}, based on my skills in ${cvAnalysis.skills.join(', ')}, I am a great fit for the ${job.title} role.`;
  }
}
