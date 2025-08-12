// supabase/functions/parse-cv/index.ts

import { createClient } from 'npm:@supabase/supabase-js@2';
// NOTE: Add these to your import_map.json
import { pdf } from 'npm:pdf-parse@1.1.1';
import mammoth from 'npm:mammoth@1.7.0';

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

// Basic text analysis functions (can be expanded with NLP)
function extractSkills(text: string): string[] {
  const skills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'AWS', 'Docker',
    'Operations Management', 'Supply Chain', 'Lean Six Sigma', 'Project Management',
    'Digital Marketing', 'SEO', 'SEM', 'Google Analytics', 'SQL', 'Tableau'
  ];
  const foundSkills = new Set<string>();
  const lowerText = text.toLowerCase();
  
  skills.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.add(skill);
    }
  });
  return Array.from(foundSkills).slice(0, 15);
}

function extractRoles(text: string): string[] {
    const roles = ['Software Engineer', 'Developer', 'Operations Manager', 'Business Analyst', 'Marketing Manager'];
    const foundRoles = new Set<string>();
    const lowerText = text.toLowerCase();

    roles.forEach(role => {
        if (lowerText.includes(role.toLowerCase())) {
            foundRoles.add(role);
        }
    });
    return Array.from(foundRoles).slice(0, 3);
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
    
    const formData = await req.formData();
    const file = formData.get('cv') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    let textContent = '';
    const buffer = await file.arrayBuffer();
    
    if (file.type === 'application/pdf') {
      const data = await pdf(buffer);
      textContent = data.text;
    } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
      const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
      textContent = value;
    } else {
      textContent = new TextDecoder().decode(buffer);
    }

    // Perform analysis on the extracted text
    const analysis = {
      skills: extractSkills(textContent),
      roles: extractRoles(textContent),
      summary: textContent.substring(0, 200) + '...', // Basic summary
      // TODO: Add more advanced analysis (experience, education, etc.)
    };

    return new Response(JSON.stringify(analysis), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('CV Parsing Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
