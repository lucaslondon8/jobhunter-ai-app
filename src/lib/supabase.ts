import { createClient } from '@supabase/supabase-js';

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
  async submitApplications(jobs: any[], userProfile: any, authToken: string) {
    const response = await fetch(`${supabaseUrl}/functions/v1/apply-jobs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobs: jobs.map(job => ({
          jobId: job.id.toString(),
          jobTitle: job.title,
          companyName: job.company,
          jobUrl: job.url,
          salaryRange: job.salary,
          location: job.location,
          jobType: job.type,
          requirements: job.requirements
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
      throw new Error(errorData.error || 'Failed to submit applications');
    }

    return await response.json();
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

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
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