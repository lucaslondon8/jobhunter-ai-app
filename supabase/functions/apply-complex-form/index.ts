// supabase/functions/apply-complex-form/index.ts

import { createClient } from 'npm:@supabase/supabase-js@2';
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BROWSERLESS_API_KEY = Deno.env.get('BROWSERLESS_API_KEY')!;
const BROWSERLESS_CONNECT_URL = `wss://chrome.browserless.io?token=${BROWSERLESS_API_KEY}`;

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

const fieldMappings = {
  fullName: ['name', 'full_name', 'fullname'],
  firstName: ['fname', 'first_name', 'firstname'],
  lastName: ['lname', 'last_name', 'lastname'],
  email: ['email', 'email_address'],
  phone: ['phone', 'phone_number', 'mobile', 'telephone'],
  location: ['location', 'city', 'address'],
  portfolio: ['portfolio', 'website', 'url', 'github', 'linkedin'],
};

async function processComplexFormJobs(jobs: any[], userProfile: any, userId: string) {
  const results = [];
  let successful = 0;
  let failed = 0;
  let browser;

  try {
    browser = await puppeteer.connect({ browserWSEndpoint: BROWSERLESS_CONNECT_URL });
    const page = await browser.newPage();

    for (const job of jobs) {
        const { data: application, error: dbError } = await supabase.from('applications').insert({
            user_id: userId,
            job_id: job.jobId,
            job_title: job.jobTitle,
            company_name: job.companyName,
            job_url: job.jobUrl,
            status: 'processing'
        }).select().single();

        if (dbError) {
            console.error(`Database error for job ${job.jobId}:`, dbError);
            failed++;
            results.push({ jobId: job.jobId, status: 'failed', error: 'Database error' });
            continue;
        }

        try {
            console.log(`[AUTOMATION] Navigating to Complex Form job: ${job.jobUrl}`);
            await page.goto(job.jobUrl, { waitUntil: 'networkidle2', timeout: 60000 });

            const inputs = await page.$$('input, textarea, select');
            for (const input of inputs) {
                const properties = await page.evaluate(el => {
                    const label = document.querySelector(`label[for="${el.id}"]`);
                    return { id: el.id, name: el.name, type: el.type, placeholder: el.placeholder, ariaLabel: el.getAttribute('aria-label'), labelText: label ? label.textContent : null };
                }, input);

                const combinedText = `${properties.id} ${properties.name} ${properties.placeholder} ${properties.ariaLabel} ${properties.labelText}`.toLowerCase();
                
                let matchedField = null;
                for (const [key, variations] of Object.entries(fieldMappings)) {
                    if (variations.some(v => combinedText.includes(v))) {
                        matchedField = key;
                        break;
                    }
                }
                
                if (matchedField && userProfile[matchedField]) {
                    await input.type(userProfile[matchedField]);
                }
            }

            const submitButtonSelector = 'button[type="submit"], input[type="submit"], button[id*="submit" i]';
            await page.waitForSelector(submitButtonSelector, { timeout: 10000 });
            // await page.click(submitButtonSelector);

            await supabase.from('applications').update({ status: 'submitted' }).eq('id', application.id);
            successful++;
            results.push({ jobId: job.jobId, status: 'submitted', applicationId: application.id });
        } catch (error) {
            console.error(`Automation failed for job ${job.jobId}:`, error);
            await supabase.from('applications').update({ status: 'failed', notes: error.message }).eq('id', application.id);
            failed++;
            results.push({ jobId: job.jobId, status: 'failed', error: error.message, applicationId: application.id });
        }
    }
    return { summary: { successful, failed, total: jobs.length }, jobs: results };
  } catch (e) {
      console.error("Browserless.io connection failed:", e);
      throw new Error("Could not connect to browser automation service.");
  } finally {
      if (browser) {
          await browser.close();
      }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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
    
    const result = await processComplexFormJobs(jobs, userProfile, user.id);
    return new Response(JSON.stringify(result), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
