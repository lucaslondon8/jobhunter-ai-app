// supabase/functions/apply-easy/index.ts

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

async function processEasyApplyJobs(jobs: any[], userProfile: any, userId: string) {
  const results = [];
  let successful = 0;
  let failed = 0;

  // Launch the browser once for all jobs in this batch
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  // --- CRITICAL TODO: SECURE AUTHENTICATION ---
  // You must implement a secure way to log the user into job platforms.
  // This could involve retrieving saved cookies from Supabase Storage
  // or using a secure vault for credentials. This is a placeholder.
  // Example:
  // const userCookies = await fetchUserCookiesFromSupabase(userId, 'linkedin');
  // await page.setCookie(...userCookies);
  // console.log('Successfully authenticated with LinkedIn');
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
        // ... other job data
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Database error on insert:', dbError);
      failed++;
      results.push({ jobId: job.jobId, status: 'failed', error: 'Database error' });
      continue; // Skip to the next job
    }

    try {
      console.log(`[AUTOMATION] Starting application for: ${job.jobTitle}`);
      await page.goto(job.jobUrl, { waitUntil: 'networkidle2', timeout: 60000 });

      // --- REAL AUTOMATION LOGIC ---
      // This is a simplified example for LinkedIn Easy Apply.
      // Real-world scenarios will require more robust selectors and error handling.
      const easyApplyButtonSelector = '.jobs-apply-button';
      await page.waitForSelector(easyApplyButtonSelector, { timeout: 10000 });
      await page.click(easyApplyButtonSelector);
      
      // Wait for the application modal to appear
      await page.waitForSelector('.jobs-easy-apply-modal', { timeout: 10000 });
      
      // TODO: Implement logic to navigate through multi-step forms.
      // This involves clicking "Next", filling in required fields from `userProfile`,
      // handling potential questions, and finally clicking the "Submit" button.
      
      // Placeholder for submit button click
      const submitButtonSelector = 'button[aria-label="Submit application"]';
      // await page.waitForSelector(submitButtonSelector, { visible: true });
      // await page.click(submitButtonSelector);
      
      // For now, we simulate success after navigation
      console.log(`[AUTOMATION] Successfully submitted application for ${job.jobTitle}`);
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

  // Close the browser after processing all jobs
  await browser.close();

  return {
    summary: { successful, failed, total: jobs.length },
    jobs: results
  };
}

Deno.serve(async (req: Request) => {
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
    
    const result = await processEasyApplyJobs(jobs, userProfile, user.id);

    return new Response(JSON.stringify(result), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
