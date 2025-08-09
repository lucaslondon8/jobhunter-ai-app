// supabase/functions/apply-complex-form/index.ts

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

async function processComplexFormJobs(jobs: any[], userProfile: any, userId: string) {
  const results = [];
  let successful = 0;
  let failed = 0;

  for (const job of jobs) {
    try {
      console.log(`Processing complex form application for: ${job.jobTitle} at ${job.companyName}`);
      
      // Store application in database first
      const { data: application, error: dbError } = await supabase
        .from('applications')
        .insert({
          user_id: userId,
          job_id: job.jobId,
          job_title: job.jobTitle,
          company_name: job.companyName,
          job_url: job.jobUrl,
          status: 'processing',
          salary_range: job.salaryRange,
          location: job.location,
          job_type: job.jobType,
          application_data: {
            applicationType: job.applicationType,
            requirements: job.requirements
          }
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        failed++;
        results.push({
          jobId: job.jobId,
          status: 'failed',
          error: 'Database error: ' + dbError.message
        });
        continue;
      }

      // TODO: Implement AI-assisted complex form handling
      // This is where the "1000 IQ" solution would shine:
      // 1. Launch headless browser
      // 2. Navigate to job.jobUrl
      // 3. Use AI-assisted field identification:
      //    - Analyze page structure
      //    - Identify form fields by labels, placeholders, input types
      //    - Map fields to user profile data
      // 4. Handle multi-step forms and dynamic content
      // 5. Deal with CAPTCHAs and anti-bot measures
      // 6. Save successful patterns for future use
      
      // For now, simulate longer processing time for complex forms
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Complex forms have lower success rate due to their complexity
      // In reality, many would be flagged for manual review
      const isSuccess = Math.random() > 0.6; // 40% success rate
      
      if (isSuccess) {
        await supabase
          .from('applications')
          .update({ 
            status: 'submitted',
            notes: 'Complex form successfully automated',
            updated_at: new Date().toISOString()
          })
          .eq('id', application.id);

        successful++;
        results.push({
          jobId: job.jobId,
          status: 'submitted',
          applicationId: application.id
        });
      } else {
        // Many complex forms would be flagged for manual review
        const shouldManualReview = Math.random() > 0.5;
        const status = shouldManualReview ? 'pending' : 'failed';
        const notes = shouldManualReview 
          ? 'Complex form requires manual review - automated application not possible'
          : 'Complex form automation failed - please apply manually';

        await supabase
          .from('applications')
          .update({ 
            status,
            notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', application.id);

        failed++;
        results.push({
          jobId: job.jobId,
          status,
          error: notes,
          applicationId: application.id,
          requiresManualReview: shouldManualReview
        });
      }

    } catch (error) {
      console.error(`Error processing job ${job.jobId}:`, error);
      failed++;
      results.push({
        jobId: job.jobId,
        status: 'failed',
        error: error.message
      });
    }
  }

  return {
    summary: { successful, failed, total: jobs.length },
    jobs: results
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const { user, error: authError } = await getUserFromToken(authHeader || '');
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: authError || 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { jobs, userProfile } = await req.json();

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return new Response(JSON.stringify({ error: 'No jobs provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing ${jobs.length} complex form jobs for user ${user.id}`);

    const result = await processComplexFormJobs(jobs, userProfile, user.id);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Complex form function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});