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
    'Scala', 'R', 'MATLAB', 'Perl', 'Objective-C', 'Dart', 'Elixir', 'Haskell', 'Clojure', 'F#',
    
    // Web Technologies
    'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Next.js', 'Nuxt.js', 'Svelte', 'jQuery',
    'HTML', 'CSS', 'SASS', 'SCSS', 'LESS', 'Bootstrap', 'Tailwind CSS', 'Material-UI', 'Chakra UI',
    'Webpack', 'Vite', 'Parcel', 'Rollup', 'Babel', 'ESLint', 'Prettier',
    
    // Backend & APIs
    'REST API', 'GraphQL', 'Apollo', 'gRPC', 'WebSocket', 'Socket.io', 'Express.js', 'Koa.js',
    'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Laravel', 'Symfony', 'Ruby on Rails',
    'ASP.NET', 'Entity Framework', 'Hibernate', 'Sequelize', 'Prisma', 'TypeORM',
    
    // Databases
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server',
    'Cassandra', 'DynamoDB', 'Elasticsearch', 'Neo4j', 'InfluxDB', 'CouchDB',
    'Supabase', 'Firebase', 'PlanetScale', 'Fauna',
    
    // Cloud & DevOps
    'AWS', 'Azure', 'Google Cloud', 'GCP', 'Digital Ocean', 'Heroku', 'Vercel', 'Netlify',
    'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions', 'CircleCI', 'Travis CI',
    'Terraform', 'Ansible', 'Chef', 'Puppet', 'Vagrant', 'Nginx', 'Apache',
    'Linux', 'Ubuntu', 'CentOS', 'RHEL', 'Debian', 'Shell Scripting', 'Bash',
    
    // Version Control & Tools
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN', 'Mercurial',
    'VS Code', 'IntelliJ', 'Eclipse', 'Vim', 'Emacs', 'Sublime Text',
    'Postman', 'Insomnia', 'Swagger', 'OpenAPI',
    
    // Testing
    'Jest', 'Mocha', 'Chai', 'Cypress', 'Selenium', 'Playwright', 'Puppeteer',
    'JUnit', 'TestNG', 'PyTest', 'RSpec', 'PHPUnit', 'Unit Testing', 'Integration Testing',
    'End-to-End Testing', 'Test-Driven Development', 'TDD', 'BDD',
    
    // Data & Analytics
    'Tableau', 'Power BI', 'Looker', 'Grafana', 'Kibana', 'D3.js', 'Chart.js',
    'Excel', 'Google Analytics', 'Google Tag Manager', 'Mixpanel', 'Amplitude',
    'Pandas', 'NumPy', 'SciPy', 'Matplotlib', 'Seaborn', 'Plotly',
    'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'OpenCV',
    'Apache Spark', 'Hadoop', 'Kafka', 'Airflow', 'dbt',
    
    // Mobile Development
    'React Native', 'Flutter', 'Ionic', 'Xamarin', 'Cordova', 'PhoneGap',
    'iOS Development', 'Android Development', 'Xcode', 'Android Studio',
    
    // Business & Management Skills
    'Project Management', 'Agile', 'Scrum', 'Kanban', 'Waterfall', 'PRINCE2', 'PMP',
    'Operations Management', 'Supply Chain', 'Lean Six Sigma', 'Process Improvement',
    'Business Analysis', 'Requirements Gathering', 'Stakeholder Management',
    'Risk Management', 'Change Management', 'Quality Assurance', 'Quality Control',
    'Budget Management', 'Financial Analysis', 'Cost Analysis', 'ROI Analysis',
    'Strategic Planning', 'Business Development', 'Market Research', 'Competitive Analysis',
    
    // Marketing & Sales
    'Digital Marketing', 'SEO', 'SEM', 'Google Ads', 'Facebook Ads', 'LinkedIn Ads',
    'Content Marketing', 'Social Media Marketing', 'Email Marketing', 'Affiliate Marketing',
    'Influencer Marketing', 'Brand Management', 'Public Relations', 'Copywriting',
    'Marketing Automation', 'HubSpot', 'Salesforce', 'Marketo', 'Mailchimp',
    'A/B Testing', 'Conversion Optimization', 'Customer Acquisition', 'Lead Generation',
    'Sales Management', 'Account Management', 'Customer Success', 'CRM',
    
    // Design & Creative
    'Figma', 'Sketch', 'Adobe XD', 'InVision', 'Zeplin', 'Framer',
    'Adobe Creative Suite', 'Photoshop', 'Illustrator', 'InDesign', 'After Effects',
    'UI/UX Design', 'User Experience', 'User Interface', 'Graphic Design', 'Web Design',
    'Wireframing', 'Prototyping', 'User Research', 'Usability Testing', 'Design Systems',
    'Typography', 'Color Theory', 'Branding', 'Logo Design', 'Print Design',
    
    // Soft Skills
    'Leadership', 'Team Management', 'Communication', 'Problem Solving', 'Critical Thinking',
    'Analytical Skills', 'Attention to Detail', 'Time Management', 'Multitasking',
    'Adaptability', 'Creativity', 'Innovation', 'Collaboration', 'Teamwork',
    'Presentation Skills', 'Public Speaking', 'Negotiation', 'Conflict Resolution',
    'Mentoring', 'Training', 'Documentation', 'Technical Writing'
  ];
  
  const foundSkills = new Set<string>();
  const lowerText = text.toLowerCase();

  skillsDatabase.forEach(skill => {
    // More flexible matching - check for skill variations
    const skillLower = skill.toLowerCase();
    if (lowerText.includes(skillLower) || 
        lowerText.includes(skillLower.replace(/[.\-\s]/g, '')) ||
        lowerText.includes(skillLower.replace(/\.js$/, '')) ||
        lowerText.includes(skillLower.replace(/\s+/g, ''))) {
      foundSkills.add(skill);
    }
  });
  
  return Array.from(foundSkills).slice(0, 25);
}

function extractRoles(text: string): string[] {
  const rolesDatabase = [
    // Software Development
    'Software Engineer', 'Software Developer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
    'Web Developer', 'Mobile Developer', 'iOS Developer', 'Android Developer', 'React Developer',
    'JavaScript Developer', 'Python Developer', 'Java Developer', 'C# Developer', 'PHP Developer',
    'Ruby Developer', 'Go Developer', 'Rust Developer', 'Swift Developer', 'Kotlin Developer',
    
    // Engineering & Technical
    'DevOps Engineer', 'Site Reliability Engineer', 'SRE', 'Cloud Engineer', 'Infrastructure Engineer',
    'Security Engineer', 'Cybersecurity Engineer', 'Network Engineer', 'Systems Engineer',
    'Database Administrator', 'DBA', 'Data Engineer', 'Machine Learning Engineer', 'AI Engineer',
    'QA Engineer', 'Test Engineer', 'Automation Engineer', 'Build Engineer', 'Release Engineer',
    
    // Data & Analytics
    'Data Scientist', 'Data Analyst', 'Business Intelligence Analyst', 'BI Analyst',
    'Research Analyst', 'Financial Analyst', 'Business Analyst', 'Systems Analyst',
    'Marketing Analyst', 'Operations Analyst', 'Risk Analyst', 'Quantitative Analyst',
    
    // Management & Leadership
    'Product Manager', 'Project Manager', 'Program Manager', 'Engineering Manager',
    'Technical Lead', 'Team Lead', 'Development Lead', 'Scrum Master', 'Agile Coach',
    'Operations Manager', 'IT Manager', 'Technology Manager', 'Director of Engineering',
    'VP of Engineering', 'CTO', 'Chief Technology Officer', 'Head of Engineering',
    
    // Design & UX
    'UX Designer', 'UI Designer', 'Product Designer', 'Graphic Designer', 'Web Designer',
    'Visual Designer', 'Interaction Designer', 'User Researcher', 'UX Researcher',
    'Design Lead', 'Creative Director', 'Art Director',
    
    // Marketing & Sales
    'Marketing Manager', 'Digital Marketing Manager', 'Content Marketing Manager',
    'Social Media Manager', 'SEO Specialist', 'SEM Specialist', 'Marketing Specialist',
    'Brand Manager', 'Product Marketing Manager', 'Growth Manager', 'Performance Marketing Manager',
    'Sales Manager', 'Account Manager', 'Customer Success Manager', 'Sales Representative',
    'Business Development Manager', 'Partnership Manager', 'Channel Manager',
    
    // Operations & Business
    'Operations Manager', 'Business Operations Manager', 'Supply Chain Manager',
    'Logistics Manager', 'Process Manager', 'Quality Manager', 'Compliance Manager',
    'Finance Manager', 'Financial Controller', 'Accountant', 'Budget Analyst',
    'HR Manager', 'Human Resources Manager', 'Talent Acquisition Manager', 'Recruiter',
    
    // Consulting & Strategy
    'Consultant', 'Management Consultant', 'Strategy Consultant', 'Business Consultant',
    'Technical Consultant', 'IT Consultant', 'Digital Consultant', 'Transformation Consultant',
    'Solution Architect', 'Enterprise Architect', 'Technical Architect', 'Cloud Architect',
    'Security Architect', 'Data Architect', 'Software Architect'
  ];
  
  const foundRoles = new Set<string>();
  const lowerText = text.toLowerCase();

  rolesDatabase.forEach(role => {
    const roleLower = role.toLowerCase();
    if (lowerText.includes(roleLower)) {
      foundRoles.add(role);
    }
  });
  
  return Array.from(foundRoles).slice(0, 8);
}

function extractPersonalInfo(text: string): any {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phoneRegex = /(\+?[\d\s\-\(\)]{10,})/g;
  const linkedinRegex = /linkedin\.com\/in\/([a-zA-Z0-9\-]+)/gi;
  const githubRegex = /github\.com\/([a-zA-Z0-9\-]+)/gi;
  
  const emails = text.match(emailRegex) || [];
  const phones = text.match(phoneRegex) || [];
  const linkedinMatches = text.match(linkedinRegex) || [];
  const githubMatches = text.match(githubRegex) || [];
  
  return {
    email: emails[0] || '',
    phone: phones[0]?.trim() || '',
    name: extractNameFromText(text),
    linkedin: linkedinMatches[0] || '',
    github: githubMatches[0] || '',
    location: extractLocationFromText(text)
  };
}

function extractNameFromText(text: string): string {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  // Try first few lines for name
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    
    // Skip common CV headers
    if (line.toLowerCase().includes('curriculum vitae') || 
        line.toLowerCase().includes('resume') ||
        line.toLowerCase().includes('cv') ||
        line.includes('@') ||
        line.match(/^\+?[\d\s\-\(\)]+$/)) {
      continue;
    }
    
    // Check if line looks like a name (2-4 words, mostly letters)
    const namePattern = /^[A-Za-z\s\.]{2,50}$/;
    const words = line.split(/\s+/);
    
    if (namePattern.test(line) && words.length >= 2 && words.length <= 4) {
      // Additional validation - each word should start with capital letter
      const validName = words.every(word => /^[A-Z][a-z]+/.test(word));
      if (validName) {
        return line;
      }
    }
  }
  
  return '';
}

function extractLocationFromText(text: string): string {
  const locationKeywords = ['location:', 'address:', 'based in', 'located in', 'from'];
  const lines = text.split('\n');
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    for (const keyword of locationKeywords) {
      if (lowerLine.includes(keyword)) {
        const locationPart = line.substring(lowerLine.indexOf(keyword) + keyword.length).trim();
        if (locationPart.length > 0 && locationPart.length < 100) {
          return locationPart.split('\n')[0].trim();
        }
      }
    }
  }
  
  return '';
}

function generateSummary(text: string, skills: string[], roles: string[]): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30);
  
  // Find sentences that mention skills or roles
  const relevantSentences = sentences.filter(sentence => {
    const lowerSentence = sentence.toLowerCase();
    return skills.some(skill => lowerSentence.includes(skill.toLowerCase())) ||
           roles.some(role => lowerSentence.includes(role.toLowerCase())) ||
           lowerSentence.includes('experience') ||
           lowerSentence.includes('responsible') ||
           lowerSentence.includes('developed') ||
           lowerSentence.includes('managed') ||
           lowerSentence.includes('led');
  });
  
  const summaryText = relevantSentences.slice(0, 3).join('. ').trim();
  
  if (summaryText.length > 300) {
    return summaryText.substring(0, 300) + '...';
  }
  
  return summaryText || `Professional with expertise in ${skills.slice(0, 3).join(', ')} and experience in ${roles.slice(0, 2).join(', ')} roles.`;
}

async function parseTextFile(buffer: ArrayBuffer): Promise<string> {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(buffer);
}

async function parsePDFFile(buffer: ArrayBuffer): Promise<string> {
  try {
    // Import PDF.js for robust PDF parsing
    const pdfjsLib = await import('npm:pdfjs-dist@4.0.379');
    
    // Load the PDF document
    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items with proper spacing
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

async function parseDocxFile(buffer: ArrayBuffer): Promise<string> {
  try {
    // Import mammoth for DOCX parsing
    const mammoth = await import('npm:mammoth@1.8.0');
    
    // Convert buffer to the format mammoth expects
    const uint8Array = new Uint8Array(buffer);
    
    // Extract text from DOCX
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    
    if (result.messages && result.messages.length > 0) {
      console.warn('DOCX parsing warnings:', result.messages);
    }
    
    return result.value.trim();
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error(`Failed to parse DOCX: ${error.message}`);
  }
}

function detectSeniorityLevel(text: string, roles: string[]): string {
  const lowerText = text.toLowerCase();
  
  // Senior level indicators
  const seniorIndicators = [
    'senior', 'lead', 'principal', 'staff', 'architect', 'manager', 'director',
    'head of', 'vp', 'vice president', 'cto', 'chief', 'expert', 'specialist'
  ];
  
  // Junior level indicators
  const juniorIndicators = [
    'junior', 'entry level', 'graduate', 'intern', 'trainee', 'associate',
    'assistant', 'beginner', 'new grad'
  ];
  
  // Mid level indicators
  const midIndicators = [
    'mid level', 'intermediate', 'experienced', 'regular', 'standard'
  ];
  
  // Check for explicit seniority mentions
  if (seniorIndicators.some(indicator => lowerText.includes(indicator))) {
    return 'Senior';
  }
  
  if (juniorIndicators.some(indicator => lowerText.includes(indicator))) {
    return 'Junior';
  }
  
  if (midIndicators.some(indicator => lowerText.includes(indicator))) {
    return 'Mid-Level';
  }
  
  // Infer from roles
  const seniorRoles = roles.filter(role => 
    seniorIndicators.some(indicator => role.toLowerCase().includes(indicator))
  );
  
  if (seniorRoles.length > 0) {
    return 'Senior';
  }
  
  // Default based on content complexity
  const yearMatches = text.match(/(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/gi);
  if (yearMatches) {
    const years = yearMatches.map(match => {
      const num = match.match(/\d+/);
      return num ? parseInt(num[0]) : 0;
    });
    const maxYears = Math.max(...years);
    
    if (maxYears >= 7) return 'Senior';
    if (maxYears >= 3) return 'Mid-Level';
    if (maxYears >= 0) return 'Junior';
  }
  
  return 'Mid-Level'; // Default assumption
}

function extractKeyAchievements(text: string): string[] {
  const achievementKeywords = [
    'achieved', 'accomplished', 'delivered', 'improved', 'increased', 'decreased',
    'reduced', 'optimized', 'implemented', 'developed', 'created', 'built',
    'led', 'managed', 'launched', 'established', 'founded', 'grew', 'scaled'
  ];
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const achievements = [];
  
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    
    // Look for sentences with achievement keywords and numbers/percentages
    const hasAchievementKeyword = achievementKeywords.some(keyword => 
      lowerSentence.includes(keyword)
    );
    
    const hasMetric = /\d+%|\$\d+|£\d+|€\d+|\d+k|\d+m|\d+ million|\d+ thousand/.test(sentence);
    
    if (hasAchievementKeyword && (hasMetric || lowerSentence.includes('award') || lowerSentence.includes('recognition'))) {
      achievements.push(sentence.trim());
    }
  }
  
  return achievements.slice(0, 5);
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

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File too large. Maximum size is 10MB.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let textContent = '';
    const buffer = await file.arrayBuffer();

    // Parse based on file type with robust error handling
    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        console.log('Parsing PDF file...');
        textContent = await parsePDFFile(buffer);
      } else if (file.type.includes('word') || 
                 file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                 file.name.toLowerCase().endsWith('.docx')) {
        console.log('Parsing DOCX file...');
        textContent = await parseDocxFile(buffer);
      } else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
        console.log('Parsing TXT file...');
        textContent = await parseTextFile(buffer);
      } else {
        // Try to parse as text anyway for unknown types
        console.log('Unknown file type, attempting text parsing...');
        textContent = await parseTextFile(buffer);
      }
    } catch (parseError) {
      console.error('File parsing failed:', parseError);
      return new Response(JSON.stringify({ 
        error: `Failed to parse ${file.type || 'file'}: ${parseError.message}. Please ensure the file is not corrupted and try again.` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Text extracted, length:', textContent.length);

    if (!textContent || textContent.length < 50) {
      return new Response(JSON.stringify({ 
        error: 'Could not extract meaningful text from the file. Please ensure your CV contains readable text and is not password protected or corrupted.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Perform comprehensive analysis
    console.log('Analyzing CV content...');
    const skills = extractSkills(textContent);
    const roles = extractRoles(textContent);
    const personalInfo = extractPersonalInfo(textContent);
    const summary = generateSummary(textContent, skills, roles);
    const seniorityLevel = detectSeniorityLevel(textContent, roles);
    const keyAchievements = extractKeyAchievements(textContent);

    const analysis = {
      skills,
      roles,
      summary,
      personalInfo,
      seniorityLevel,
      keyAchievements,
      textLength: textContent.length,
      fileInfo: {
        name: file.name,
        type: file.type,
        size: file.size
      },
      processingInfo: {
        parsedSuccessfully: true,
        parsingMethod: file.type === 'application/pdf' ? 'PDF.js' :
                      file.type.includes('word') ? 'Mammoth' : 'Text',
        timestamp: new Date().toISOString()
      }
    };

    console.log('Analysis completed successfully:', {
      skillsFound: skills.length,
      rolesFound: roles.length,
      hasPersonalInfo: !!personalInfo.email,
      seniorityLevel,
      achievementsFound: keyAchievements.length
    });

    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('CV Parsing Error:', error);
    return new Response(JSON.stringify({ 
      error: `CV parsing failed: ${error.message}. Please try again or contact support if the issue persists.` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});