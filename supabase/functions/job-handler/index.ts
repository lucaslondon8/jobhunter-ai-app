// supabase/functions/job-handler/index.ts

import { createClient } from 'npm:@supabase/supabase-js@2';
// To use Puppeteer, you will need to add it to your Supabase function's import map.
// import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const ADZUNA_APP_ID = Deno.env.get('ADZUNA_APP_ID');
const ADZUNA_APP_KEY = Deno.env.get('ADZUNA_APP_KEY');
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

async function searchJobs(req: Request) {
  const authHeader = req.headers.get('Authorization');
  const { user, error: authError } = await getUserFromToken(authHeader || '');
  if (authError || !user) {
    return new Response(JSON.stringify({ error: authError || 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    return new Response(JSON.stringify({ error: 'Adzuna API credentials are not configured on the server.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(req.url);
  const what = url.searchParams.get('what') || 'software engineer';
  const where = url.searchParams.get('where') || 'london';
  const country = 'gb'; // Hardcode to Great Britain

  const params = new URLSearchParams({
    app_id: ADZUNA_APP_ID,
    app_key: ADZUNA_APP_KEY,
    results_per_page: '20',
    what,
    where,
  });

  const apiUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params.toString()}`;
  console.log('Adzuna API Request URL:', apiUrl);
  console.log('Search parameters:', { what, where, country });

  try {
    const adzunaResponse = await fetch(apiUrl);
    if (!adzunaResponse.ok) {
      const errorBody = await adzunaResponse.text();
      console.error("Adzuna API Error:", errorBody);
      console.error("Response status:", adzunaResponse.status);
      console.error("Response headers:", Object.fromEntries(adzunaResponse.headers.entries()));
      throw new Error(`Adzuna API request failed with status ${adzunaResponse.status}`);
    }
    
    const data = await adzunaResponse.json();
    console.log(`Successfully fetched ${data.results?.length || 0} jobs from Adzuna`);

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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);

  if (url.pathname.includes('job-handler') && req.method === 'GET') {
    return searchJobs(req);
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
