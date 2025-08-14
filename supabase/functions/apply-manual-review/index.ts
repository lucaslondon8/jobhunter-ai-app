// supabase/functions/apply-manual-review/index.ts

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

async function processManualReviewJobs(jobs: any[], userProfile: any, userId: string) {
  const results = [];
  let successful = 0;
  let failed = 0;

  for (const job of jobs) {
    try {
      console.log(`Flagging for manual review: ${job.jobTitle} at ${job.companyName}`);

      // Store application in database with pending status for manual review
      const { data: application, error: dbError } = await supabase
        .from('applications')
        .insert({
          user_id: userId,
          job_id: job.jobId,
          job_title: job.jobTitle,
          company_name: job.companyName,
          job_url: job.jobUrl,
          status: 'pending',
          salary_range: job.salaryRange,
          location: job.location,
          job_type: job.jobType,
          notes: 'Application requires manual review - automated application not supported for this job board',
          application_data: {
            applicationType: job.applicationType,
            requirements: job.requirements,
            manualReviewReason: 'Unknown application type or unsupported job board'
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

      // All jobs sent to manual review are considered "successful" in terms of processing
      // They're just flagged for the user to handle manually
      successful++;
      results.push({
        jobId: job.jobId,
        status: 'pending',
        applicationId: application.id,
        requiresManualReview: true,
        manualReviewUrl: job.jobUrl,
        message: 'Job flagged for manual application - please apply directly via the job URL'
      });

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
    return new Response('ok', { headers: corsHeaders });
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

    console.log(`Processing ${jobs.length} jobs for manual review for user ${user.id}`);

    const result = await processManualReviewJobs(jobs, userProfile, user.id);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Manual review function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
