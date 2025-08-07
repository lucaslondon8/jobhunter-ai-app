// supabase/functions/job-handler/index.ts

import { createClient } from 'npm:@supabase/supabase-js@2';

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

async function applyForJobs(req: Request) {
    // This is where your original application logic would go.
    return new Response(JSON.stringify({ message: "Application logic would run here." }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}

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

