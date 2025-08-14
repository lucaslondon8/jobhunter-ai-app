import { createClient } from '@supabase/supabase-js';

// Correctly access the Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface Application {
  id: string;
  user_id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  job_url?: string;
  status: 'pending' | 'submitted' | 'processing' | 'interview' | 'accepted' | 'rejected' | 'failed';
  applied_at: string;
  updated_at: string;
  response_received_at?: string;
  notes?: string;
  salary_range?: string;
  location?: string;
  job_type?: string;
  application_data?: any;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  cv_data?: any;
  preferences?: any;
  created_at: string;
  updated_at: string;
}

// Application service functions
export const applicationService = {
  // Fetch all applications for the current user
  async getApplications(): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('applied_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }

    return data || [];
  },

  // Submit bulk job applications
  async submitApplications(
    jobs: any[], 
    userProfile: any, 
    authToken: string,
    progressCallback?: (jobId: string, status: string) => void
  ) {
    // Group jobs by application type for optimized processing
    const jobsByType = this.groupJobsByApplicationType(jobs);
    const results = [];
    let totalSuccessful = 0;
    let totalFailed = 0;

    // Process each application type with specialized handlers
    for (const [applicationType, typeJobs] of Object.entries(jobsByType)) {
      try {
        // Update progress for jobs of this type
        if (progressCallback) {
          typeJobs.forEach(job => {
            progressCallback(job.id.toString(), `Processing ${applicationType} application...`);
          });
        }
        
        const result = await this.processApplicationsByType(
          applicationType as any,
          typeJobs,
          userProfile,
          authToken,
          progressCallback
        );
        results.push(result);
        totalSuccessful += result.successful;
        totalFailed += result.failed;
      } catch (error) {
        console.error(`Failed to process ${applicationType} applications:`, error);
        totalFailed += typeJobs.length;
        results.push({
          type: applicationType,
          successful: 0,
          failed: typeJobs.length,
          jobs: typeJobs.map(job => ({ ...job, status: 'failed', error: error.message }))
        });
      }
    }

    return {
      summary: {
        successful: totalSuccessful,
        failed: totalFailed,
        total: jobs.length
      },
      details: results
    };
  },

  // Group jobs by their application type for batch processing
  groupJobsByApplicationType(jobs: any[]) {
    return jobs.reduce((groups, job) => {
      const type = job.applicationType || 'unknown';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(job);
      return groups;
    }, {} as Record<string, any[]>);
  },

  // Process applications based on their type using specialized handlers
  async processApplicationsByType(
    applicationType: 'easy_apply' | 'external_form_simple' | 'external_form_complex' | 'api_direct' | 'unknown',
    jobs: any[],
    userProfile: any,
    authToken: string,
    progressCallback?: (jobId: string, status: string) => void
  ) {
    const endpoint = this.getEndpointForApplicationType(applicationType);
    
    // Update progress
    if (progressCallback) {
      jobs.forEach(job => {
        progressCallback(job.id.toString(), `Submitting to ${endpoint}...`);
      });
    }
    
    const response = await fetch(`${supabaseUrl}/functions/v1/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        applicationType,
        jobs: jobs.map(job => ({
          jobId: job.id.toString(),
          jobTitle: job.title,
          companyName: job.company,
          jobUrl: job.url,
          salaryRange: job.salary,
          location: job.location,
          jobType: job.type,
          requirements: job.requirements,
          applicationType: job.applicationType
        })),
        userProfile: {
          fullName: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone,
          cvData: userProfile.cvData
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to submit ${applicationType} applications`);
    }

    const result = await response.json();
    return {
      type: applicationType,
      successful: result.summary?.successful || 0,
      failed: result.summary?.failed || jobs.length,
      jobs: result.jobs || jobs.map(job => ({ ...job, status: 'failed' }))
    };
  },

  // Map application types to their specialized endpoint handlers
  getEndpointForApplicationType(applicationType: string): string {
    const endpointMap = {
      'easy_apply': 'apply-easy',
      'external_form_simple': 'apply-simple-form',
      'external_form_complex': 'apply-complex-form',
      'api_direct': 'apply-api-direct',
      'unknown': 'apply-manual-review'
    };
    
    return endpointMap[applicationType as keyof typeof endpointMap] || 'apply-manual-review';
  },

  // Update application status
  async updateApplicationStatus(applicationId: string, status: Application['status'], notes?: string) {
    const { data, error } = await supabase
      .from('applications')
      .update({ 
        status, 
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating application:', error);
      throw error;
    }

    return data;
  }
};

// User profile service functions
export const profileService = {
  // Get user profile
  async getProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile doesn't exist yet, return null
        console.log('Profile not found for user:', user.id);
        return null;
      }
      console.error('Error fetching profile:', error);
      throw error;
    }

    return data;
  },

  // Update user profile
  async updateProfile(profile: Partial<UserProfile>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        email: user.email,
        ...profile,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    return data;
  }
};

// Authentication helpers
export const authService = {
  // Sign up
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Create user profile
    if (data.user) {
      await profileService.updateProfile({
        full_name: fullName,
        email: email
      });
    }

    return data;
  },

  // Sign in
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }
};

