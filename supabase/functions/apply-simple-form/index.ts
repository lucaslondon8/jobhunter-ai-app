// supabase/functions/apply-simple-form/index.ts

import { createClient } from 'npm:@supabase/supabase-js@2';
// NOTE: Ensure you add puppeteer to your function's import_map.json
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

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

async function processSimpleFormJobs(jobs: any[], userProfile: any, userId: string) {
  const results = [];
  let successful = 0;
  let failed = 0;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  // --- CRITICAL TODO: SECURE AUTHENTICATION ---
  // This function assumes the application form is public.
  // If it requires a login to the job board, you must implement
  // the same secure cookie/session handling as in the 'apply-easy' function.
  // --- END CRITICAL TODO ---

  for (const job of jobs) {
    const { data: application, error: dbError } = await supabase
      .from('applications')
      .insert({
        user_id: userId,
        job_id: job.jobId,
        job_title: job.jobTitle,
        company_name: job.companyName,
        job_url: job.jobUrl,
        status: 'processing',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error on insert:', dbError);
      failed++;
      results.push({ jobId: job.jobId, status: 'failed', error: 'Database error' });
      continue;
    }

    try {
      console.log(`[AUTOMATION] Starting SIMPLE FORM application for: ${job.jobTitle}`);
      await page.goto(job.jobUrl, { waitUntil: 'networkidle2', timeout: 60000 });

      // --- REAL AUTOMATION LOGIC for SIMPLE FORMS ---
      // Fill common form fields. This requires robust selectors.
      await page.type('input[name*="name" i]', userProfile.fullName || '');
      await page.type('input[name*="email" i]', userProfile.email || '');
      await page.type('input[name*="phone" i]', userProfile.phone || '');
      
      // TODO: Handle CV/Resume upload
      // const fileInputSelector = 'input[type="file"]';
      // await page.waitForSelector(fileInputSelector);
      // const fileInput = await page.$(fileInputSelector);
      // const cvPath = await downloadUserCV(userId); // You need a function to get the user's CV file
      // await fileInput.uploadFile(cvPath);

      // Find and click the submit button
      const submitButtonSelector = 'button[type="submit"], input[type="submit"], button[id*="submit" i]';
      await page.waitForSelector(submitButtonSelector, { timeout: 10000 });
      await page.click(submitButtonSelector);
      
      // Wait for a confirmation message or navigation
      // await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      console.log(`[AUTOMATION] Successfully submitted SIMPLE FORM for ${job.jobTitle}`);
      // --- END REAL AUTOMATION LOGIC ---

      await supabase
        .from('applications')
        .update({ status: 'submitted', updated_at: new Date().toISOString() })
        .eq('id', application.id);

      successful++;
      results.push({ jobId: job.jobId, status: 'submitted', applicationId: application.id });

    } catch (error) {
      console.error(`[AUTOMATION] Error applying for job ${job.jobId}:`, error);
      await supabase
        .from('applications')
        .update({ status: 'failed', notes: error.message, updated_at: new Date().toISOString() })
        .eq('id', application.id);

      failed++;
      results.push({ jobId: job.jobId, status: 'failed', error: error.message, applicationId: application.id });
    }
  }

  await browser.close();

  return {
    summary: { successful, failed, total: jobs.length },
    jobs: results
  };
}

Deno.serve(async (req: Request) => {
  // ... (Identical Deno.serve logic as the other functions)
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  try {
    const authHeader = req.headers.get('Authorization');
    const { user, error: authError } = await getUserFromToken(authHeader || '');
    if (authError || !user) {
      return new Response(JSON.stringify({ error: authError || 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const { jobs, userProfile } = await req.json();
    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return new Response(JSON.stringify({ error: 'No jobs provided' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const result = await processSimpleFormJobs(jobs, userProfile, user.id);
    return new Response(JSON.stringify(result), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
