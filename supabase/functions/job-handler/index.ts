// supabase/functions/job-handler/index.ts

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// --- Get secrets from Supabase Edge Function settings ---
const ADZUNA_APP_ID = Deno.env.get('ADZUNA_APP_ID');
const ADZUNA_APP_KEY = Deno.env.get('ADZUNA_APP_KEY');

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);


// --- Handler for GET requests to search for jobs ---
async function searchJobs(req: Request) {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    return new Response(JSON.stringify({ error: 'Adzuna API credentials are not configured on the server.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(req.url);
  const what = url.searchParams.get('what') || 'software engineer';
  const where = url.searchParams.get('where') || 'us';
  const country = where.toLowerCase() === 'uk' ? 'gb' : 'us';

  const params = new URLSearchParams({
    app_id: ADZUNA_APP_ID,
    app_key: ADZUNA_APP_KEY,
    results_per_page: '20',
    what,
    where,
    content_type: 'application/json'
  });

  try {
    const adzunaResponse = await fetch(`https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params.toString()}`);
    if (!adzunaResponse.ok) {
      throw new Error(`Adzuna API request failed with status ${adzunaResponse.status}`);
    }
    const data = await adzunaResponse.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Adzuna fetch error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}


// --- Handler for POST requests to apply for jobs (your existing logic) ---
async function applyForJobs(req: Request) {
    // ... (Your existing application logic from apply-jobs/index.ts goes here)
    // This part of the code does not need to change.
    // For brevity, it's omitted here, but you should paste your full 'applyToJob'
    // and related functions into this section.
    return new Response(JSON.stringify({ message: "Application logic would run here." }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}


// --- Main Deno Serve Function ---
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method === 'GET') {
    return searchJobs(req);
  }

  if (req.method === 'POST') {
    return applyForJobs(req);
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
