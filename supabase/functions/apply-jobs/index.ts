import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface JobApplication {
  jobId: string;
  jobTitle: string;
  companyName: string;
  jobUrl?: string;
  salaryRange?: string;
  location?: string;
  jobType?: string;
  requirements?: string[];
}

interface ApplicationRequest {
  jobs: JobApplication[];
  userProfile: {
    fullName: string;
    email: string;
    phone?: string;
    cvData: any;
  };
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyToJob(job: JobApplication, userProfile: any, userId: string): Promise<{ success: boolean; message: string; applicationId?: string }> {
  try {
    // Insert application record into database
    const { data: application, error: insertError } = await supabase
      .from('applications')
      .insert({
        user_id: userId,
        job_id: job.jobId,
        job_title: job.jobTitle,
        company_name: job.companyName,
        job_url: job.jobUrl,
        salary_range: job.salaryRange,
        location: job.location,
        job_type: job.jobType,
        status: 'processing',
        application_data: {
          requirements: job.requirements,
          userProfile: userProfile
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return { success: false, message: 'Failed to create application record' };
    }

    // Simulate application submission process
    // In a real implementation, this would:
    // 1. Parse the job URL to determine the job board
    // 2. Use appropriate APIs or web scraping to submit the application
    // 3. Handle different job board formats (LinkedIn, Indeed, company websites, etc.)
    
    const applicationResult = await simulateJobApplication(job, userProfile);
    
    // Update application status based on result
    const newStatus = applicationResult.success ? 'submitted' : 'failed';
    const { error: updateError } = await supabase
      .from('applications')
      .update({ 
        status: newStatus,
        notes: applicationResult.message,
        updated_at: new Date().toISOString()
      })
      .eq('id', application.id);

    if (updateError) {
      console.error('Status update error:', updateError);
    }

    return {
      success: applicationResult.success,
      message: applicationResult.message,
      applicationId: application.id
    };

  } catch (error) {
    console.error('Application submission error:', error);
    return { success: false, message: 'Unexpected error during application submission' };
  }
}

async function simulateJobApplication(job: JobApplication, userProfile: any): Promise<{ success: boolean; message: string }> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

  // Simulate different outcomes based on job characteristics
  const successRate = calculateSuccessRate(job, userProfile);
  const isSuccessful = Math.random() < successRate;

  if (isSuccessful) {
    return {
      success: true,
      message: `Successfully applied to ${job.jobTitle} at ${job.companyName}`
    };
  } else {
    const failureReasons = [
      'Application portal temporarily unavailable',
      'Position no longer accepting applications',
      'Technical error during submission',
      'Application requires manual review'
    ];
    
    return {
      success: false,
      message: failureReasons[Math.floor(Math.random() * failureReasons.length)]
    };
  }
}

function calculateSuccessRate(job: JobApplication, userProfile: any): number {
  let baseRate = 0.85; // 85% base success rate

  // Adjust based on job characteristics
  if (job.location?.toLowerCase().includes('remote')) {
    baseRate += 0.05; // Remote jobs have higher success rate
  }

  // Adjust based on user profile match
  if (userProfile.cvData?.skills) {
    const skillMatch = job.requirements?.some(req => 
      userProfile.cvData.skills.some((skill: string) => 
        skill.toLowerCase().includes(req.toLowerCase())
      )
    );
    if (skillMatch) {
      baseRate += 0.1;
    }
  }

  return Math.min(baseRate, 0.95); // Cap at 95%
}

async function getUserFromToken(authHeader: string): Promise<{ user: any; error?: string }> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.replace('Bearer ', '');
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return { user: null, error: 'Invalid or expired token' };
  }

  return { user };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    const { user, error: authError } = await getUserFromToken(authHeader || '');
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: authError || 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const requestData: ApplicationRequest = await req.json();
    
    if (!requestData.jobs || !Array.isArray(requestData.jobs) || requestData.jobs.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No jobs provided for application' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Update or create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        full_name: requestData.userProfile.fullName,
        email: requestData.userProfile.email,
        phone: requestData.userProfile.phone,
        cv_data: requestData.userProfile.cvData,
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Profile update error:', profileError);
    }

    // Process applications in parallel for better performance
    const applicationPromises = requestData.jobs.map(job => 
      applyToJob(job, requestData.userProfile, user.id)
    );

    const results = await Promise.all(applicationPromises);
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Applied to ${successCount} jobs successfully. ${failureCount} applications failed.`,
        results: results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failureCount
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});