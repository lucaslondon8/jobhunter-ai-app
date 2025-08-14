// supabase/functions/parse-cv/index.ts

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

// Enhanced text analysis functions
function extractSkills(text: string): string[] {
  const skillsDatabase = [
    // Programming Languages
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
    // Web Technologies
    'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Next.js', 'HTML', 'CSS', 'SASS', 'Bootstrap', 'Tailwind',
    // Databases
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'Supabase', 'Firebase',
    // Cloud & DevOps
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab',
    // Data & Analytics
    'Tableau', 'Power BI', 'Excel', 'Google Analytics', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch',
    // Business Skills
    'Project Management', 'Agile', 'Scrum', 'Operations Management', 'Supply Chain', 'Lean Six Sigma',
    // Marketing
    'Digital Marketing', 'SEO', 'SEM', 'Content Marketing', 'Social Media Marketing', 'Email Marketing',
    // Design
    'Figma', 'Adobe Creative Suite', 'Photoshop', 'Illustrator', 'UI/UX Design', 'Graphic Design'
  ];
  
  const foundSkills = new Set<string>();
  const lowerText = text.toLowerCase();

  skillsDatabase.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.add(skill);
    }
  });
  
  return Array.from(foundSkills).slice(0, 20);
}

function extractRoles(text: string): string[] {
  const rolesDatabase = [
    'Software Engineer', 'Software Developer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
    'DevOps Engineer', 'Data Scientist', 'Data Analyst', 'Product Manager', 'Project Manager',
    'Business Analyst', 'Operations Manager', 'Marketing Manager', 'Digital Marketing Specialist',
    'UX Designer', 'UI Designer', 'Graphic Designer', 'Sales Manager', 'Account Manager',
    'Customer Success Manager', 'HR Manager', 'Finance Manager', 'Consultant', 'Architect'
  ];
  
  const foundRoles = new Set<string>();
  const lowerText = text.toLowerCase();

  rolesDatabase.forEach(role => {
    if (lowerText.includes(role.toLowerCase())) {
      foundRoles.add(role);
    }
  });
  
  return Array.from(foundRoles).slice(0, 5);
}

function extractPersonalInfo(text: string): any {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phoneRegex = /(\+?[\d\s\-\(\)]{10,})/g;
  
  const emails = text.match(emailRegex) || [];
  const phones = text.match(phoneRegex) || [];
  
  return {
    email: emails[0] || '',
    phone: phones[0] || '',
    // Extract name from first few lines (basic heuristic)
    name: extractNameFromText(text)
  };
}

function extractNameFromText(text: string): string {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const firstLine = lines[0] || '';
  
  // Simple heuristic: if first line looks like a name (2-4 words, no special chars)
  const namePattern = /^[A-Za-z\s]{2,50}$/;
  if (namePattern.test(firstLine.trim()) && firstLine.trim().split(' ').length <= 4) {
    return firstLine.trim();
  }
  
  return '';
}

function generateSummary(text: string): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const relevantSentences = sentences.slice(0, 3).join('. ');
  return relevantSentences.length > 200 ? 
    relevantSentences.substring(0, 200) + '...' : 
    relevantSentences;
}

async function parseTextFile(buffer: ArrayBuffer): Promise<string> {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(buffer);
}

async function parsePDFFile(buffer: ArrayBuffer): Promise<string> {
  try {
    // For now, return a placeholder since PDF parsing requires complex libraries
    // In production, you'd use a PDF parsing library
    return "PDF parsing not yet implemented. Please upload a .txt or .docx file for now.";
  } catch (error) {
    throw new Error('Failed to parse PDF file');
  }
}

async function parseDocxFile(buffer: ArrayBuffer): Promise<string> {
  try {
    // For now, return a placeholder since DOCX parsing requires complex libraries
    // In production, you'd use a DOCX parsing library
    return "DOCX parsing not yet implemented. Please upload a .txt file for now.";
  } catch (error) {
    throw new Error('Failed to parse DOCX file');
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('CV parsing request received');
    
    const authHeader = req.headers.get('Authorization');
    const { user, error: authError } = await getUserFromToken(authHeader || '');
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(JSON.stringify({ error: authError || 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('User authenticated:', user.id);

    const formData = await req.formData();
    const file = formData.get('cv') as File;

    if (!file) {
      console.error('No file uploaded');
      return new Response(JSON.stringify({ error: 'No file uploaded' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('File received:', file.name, file.type, file.size);

    let textContent = '';
    const buffer = await file.arrayBuffer();

    // Parse based on file type
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      textContent = await parsePDFFile(buffer);
    } else if (file.type.includes('word') || file.name.toLowerCase().endsWith('.docx')) {
      textContent = await parseDocxFile(buffer);
    } else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
      textContent = await parseTextFile(buffer);
    } else {
      // Try to parse as text anyway
      textContent = await parseTextFile(buffer);
    }

    console.log('Text extracted, length:', textContent.length);

    if (!textContent || textContent.length < 50) {
      return new Response(JSON.stringify({ 
        error: 'Could not extract meaningful text from the file. Please ensure your CV contains readable text.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Perform comprehensive analysis
    const skills = extractSkills(textContent);
    const roles = extractRoles(textContent);
    const personalInfo = extractPersonalInfo(textContent);
    const summary = generateSummary(textContent);

    const analysis = {
      skills,
      roles,
      summary,
      personalInfo,
      textLength: textContent.length,
      fileInfo: {
        name: file.name,
        type: file.type,
        size: file.size
      }
    };

    console.log('Analysis completed:', {
      skillsFound: skills.length,
      rolesFound: roles.length,
      hasPersonalInfo: !!personalInfo.email
    });

    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('CV Parsing Error:', error);
    return new Response(JSON.stringify({ 
      error: `CV parsing failed: ${error.message}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});