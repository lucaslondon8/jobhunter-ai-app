// src/lib/jobMatching.ts

import { CVContentParser, CVAnalysis } from './cvParser';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface JobOpportunity {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  posted: string;
  match: number;
  description: string;
  requirements: string[];
  logo: string;
  role: string;
  industry: string;
  seniority: string;
  url?: string;
  applicationType: 'easy_apply' | 'external_form_simple' | 'external_form_complex' | 'api_direct' | 'unknown';
}

export class JobMatchingEngine {
  private cvParser: CVContentParser;
  
  constructor() {
    this.cvParser = new CVContentParser();
  }

  // Dynamic role detection patterns - not hardcoded to specific roles
  private rolePatterns = {
    // Technical roles
    'Software Engineer': ['software engineer', 'developer', 'programmer', 'coding', 'programming', 'software development', 'full stack', 'frontend', 'backend', 'web developer'],
    'Data Scientist': ['data scientist', 'data analysis', 'machine learning', 'ai', 'artificial intelligence', 'python', 'r programming', 'statistics', 'analytics'],
    'DevOps Engineer': ['devops', 'infrastructure', 'cloud', 'aws', 'azure', 'kubernetes', 'docker', 'ci/cd', 'deployment'],
    'Product Manager': ['product manager', 'product management', 'roadmap', 'user stories', 'agile', 'scrum master', 'product strategy'],
    
    // Business roles
    'Operations Manager': ['operations', 'operational', 'process', 'efficiency', 'workflow', 'logistics', 'supply chain', 'procurement'],
    'Business Analyst': ['business analyst', 'business analysis', 'requirements', 'stakeholder', 'process improvement', 'documentation'],
    'Project Manager': ['project manager', 'project management', 'pmp', 'agile', 'scrum', 'waterfall', 'gantt', 'risk management'],
    'Marketing Manager': ['marketing', 'digital marketing', 'social media', 'campaigns', 'brand', 'advertising', 'content marketing'],
    'Sales Manager': ['sales', 'business development', 'account management', 'crm', 'lead generation', 'revenue', 'client relations'],
    
    // Finance roles
    'Financial Analyst': ['financial analyst', 'finance', 'accounting', 'financial modeling', 'budgeting', 'forecasting', 'excel'],
    'Accountant': ['accountant', 'accounting', 'bookkeeping', 'tax', 'audit', 'financial statements', 'gaap'],
    
    // Healthcare roles
    'Nurse': ['nurse', 'nursing', 'patient care', 'healthcare', 'medical', 'clinical', 'rn', 'bsn'],
    'Doctor': ['doctor', 'physician', 'medical', 'clinical', 'patient', 'diagnosis', 'treatment', 'md'],
    
    // Education roles
    'Teacher': ['teacher', 'education', 'classroom', 'curriculum', 'lesson plans', 'student', 'pedagogy'],
    'Professor': ['professor', 'research', 'academic', 'university', 'phd', 'publications', 'teaching'],
    
    // Design roles
    'UX Designer': ['ux designer', 'user experience', 'ui design', 'wireframes', 'prototyping', 'user research', 'figma'],
    'Graphic Designer': ['graphic designer', 'design', 'creative', 'adobe', 'photoshop', 'illustrator', 'branding'],
    
    // Legal roles
    'Lawyer': ['lawyer', 'attorney', 'legal', 'law', 'litigation', 'contracts', 'compliance', 'juris doctor'],
    
    // HR roles
    'HR Manager': ['hr manager', 'human resources', 'recruitment', 'hiring', 'employee relations', 'benefits', 'payroll'],
    
    // Engineering roles
    'Mechanical Engineer': ['mechanical engineer', 'engineering', 'cad', 'design', 'manufacturing', 'solidworks', 'autocad'],
    'Civil Engineer': ['civil engineer', 'construction', 'infrastructure', 'structural', 'project management', 'autocad'],
    
    // Customer service roles
    'Customer Service': ['customer service', 'customer support', 'help desk', 'client relations', 'communication', 'problem solving']
  };

  // Dynamic skill categories - automatically detected
  private skillCategories = {
    technical: ['programming', 'coding', 'software', 'development', 'database', 'cloud', 'api', 'framework', 'library'],
    business: ['management', 'strategy', 'analysis', 'planning', 'operations', 'process', 'improvement', 'efficiency'],
    analytical: ['data', 'analytics', 'statistics', 'reporting', 'metrics', 'kpi', 'dashboard', 'excel', 'sql'],
    creative: ['design', 'creative', 'visual', 'branding', 'marketing', 'content', 'photography', 'video'],
    communication: ['communication', 'presentation', 'writing', 'public speaking', 'negotiation', 'interpersonal'],
    leadership: ['leadership', 'team', 'management', 'supervision', 'mentoring', 'coaching', 'delegation'],
    financial: ['finance', 'accounting', 'budgeting', 'forecasting', 'financial', 'cost', 'revenue', 'profit'],
    healthcare: ['medical', 'clinical', 'patient', 'healthcare', 'nursing', 'diagnosis', 'treatment', 'therapy'],
    education: ['teaching', 'education', 'training', 'curriculum', 'instruction', 'learning', 'academic'],
    legal: ['legal', 'law', 'compliance', 'regulatory', 'contracts', 'litigation', 'attorney']
  };

  // Dynamic industry detection
  private industryKeywords = {
    technology: ['software', 'tech', 'it', 'computer', 'digital', 'internet', 'mobile', 'app', 'saas'],
    healthcare: ['healthcare', 'medical', 'hospital', 'clinic', 'pharmaceutical', 'biotech', 'health'],
    finance: ['finance', 'banking', 'investment', 'insurance', 'fintech', 'financial services', 'accounting'],
    education: ['education', 'university', 'school', 'academic', 'learning', 'training', 'e-learning'],
    manufacturing: ['manufacturing', 'production', 'factory', 'industrial', 'automotive', 'aerospace'],
    retail: ['retail', 'e-commerce', 'sales', 'customer', 'store', 'shopping', 'consumer'],
    consulting: ['consulting', 'advisory', 'strategy', 'management consulting', 'professional services'],
    media: ['media', 'advertising', 'marketing', 'communications', 'publishing', 'journalism'],
    nonprofit: ['nonprofit', 'ngo', 'charity', 'foundation', 'social impact', 'community'],
    government: ['government', 'public sector', 'federal', 'state', 'municipal', 'civil service']
  };

  private classifyApplicationType(jobUrl: string): 'easy_apply' | 'external_form_simple' | 'external_form_complex' | 'api_direct' | 'unknown' {
    if (!jobUrl) return 'unknown';
    
    const url = jobUrl.toLowerCase();
    
    // LinkedIn Easy Apply detection
    if (url.includes('linkedin.com') && url.includes('easy-apply')) {
      return 'easy_apply';
    }
    
    // Indeed Easy Apply detection
    if (url.includes('indeed.com') && url.includes('apply')) {
      return 'easy_apply';
    }
    
    // Known job boards with simple forms
    const simpleFormDomains = [
      'glassdoor.com',
      'monster.com',
      'ziprecruiter.com',
      'careerbuilder.com'
    ];
    
    if (simpleFormDomains.some(domain => url.includes(domain))) {
      return 'external_form_simple';
    }
    
    // Company career pages (usually more complex)
    const complexFormIndicators = [
      '/careers/',
      '/jobs/',
      '/apply/',
      'workday.com',
      'greenhouse.io',
      'lever.co',
      'bamboohr.com'
    ];
    
    if (complexFormIndicators.some(indicator => url.includes(indicator))) {
      return 'external_form_complex';
    }
    
    return 'unknown';
  }

  async analyzeCV(userCV: any): Promise<CVAnalysis> {
    if (!userCV || !userCV.file) return this.getDefaultAnalysis();
    
    try {
      // Extract actual text content from the uploaded file
      const cvText = await this.cvParser.extractTextFromFile(userCV.file);
      
      // Analyze the extracted content
      const analysis = this.cvParser.analyzeCV(cvText);
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing CV:', error);
      return this.getDefaultAnalysis();
    }
  }

  // Legacy method for backward compatibility
  analyzeCVSync(userCV: any): CVAnalysis {
    const text = this.extractTextFromCV(userCV);
    const skills = this.dynamicallyExtractSkills(text);
    const experience = this.calculateExperience(text);
    const roles = this.dynamicallyIdentifyRoles(text, skills);
    const industries = this.dynamicallyIdentifyIndustries(text);
    const educationLevel = this.extractEducationLevel(text);
    const certifications = this.extractCertifications(text);
    const languages = this.extractLanguages(text);
    const achievements = this.extractAchievements(text);
    
    return {
      primaryRole: roles[0] || 'Professional',
      secondaryRoles: roles.slice(1, 4),
      skills,
      experience,
      seniority: this.determineSeniority(experience, text, roles),
      industries,
      keywords: this.extractKeywords(text),
      educationLevel,
      certifications,
      languages,
      achievements
    };
  }

  private extractTextFromCV(cvData: any): string {
    if (typeof cvData === 'string') return cvData.toLowerCase();
    if (cvData?.content) return cvData.content.toLowerCase();
    if (cvData?.skills) return cvData.skills.join(' ').toLowerCase();
    if (cvData?.fileName) {
      // For demo purposes, simulate CV content based on filename or mock realistic content
      return this.generateMockCVContent(cvData);
    }
    return '';
  }

  private generateMockCVContent(cvData: any): string {
    // Intelligent CV content generation based on filename and context
    const fileName = cvData.fileName?.toLowerCase() || '';
    
    // Detect profession from filename
    if (fileName.includes('operations') || fileName.includes('business')) {
      return `
        lucas rizzo operations manager business analyst with 8 years experience in operations management
        business analysis process improvement project management team leadership stakeholder management
        supply chain logistics procurement vendor management inventory management cost optimization
        budget management financial analysis data analysis reporting excel powerbi tableau sql
        lean six sigma continuous improvement quality management performance metrics kpi dashboard
        cross functional teams change management risk management compliance audit vendor relations
        contract negotiation cost reduction efficiency improvement workflow optimization
        bachelor degree business administration mba operations management certified project manager pmp
        lean six sigma black belt supply chain professional fluent english spanish
        achieved 30% cost reduction led teams 20 people implemented erp system 25% efficiency improvement
        managed budgets 5 million pounds annual revenue operations director senior operations manager
        business process analyst senior business analyst operations coordinator supply chain manager
      `.toLowerCase();
    }
    
    if (fileName.includes('software') || fileName.includes('developer') || fileName.includes('engineer')) {
      return `
        software engineer full stack developer with 6 years experience software development
        javascript typescript react nodejs python java spring boot microservices rest api
        aws azure docker kubernetes jenkins git github agile scrum devops ci cd
        mysql postgresql mongodb redis elasticsearch html css sass bootstrap tailwind
        unit testing integration testing jest cypress selenium automated testing
        bachelor degree computer science software engineering certified aws solutions architect
        fluent english developed scalable applications serving 100k users optimized performance 40%
        led development team 8 developers implemented microservices architecture reduced deployment time 60%
        senior software engineer lead developer technical architect full stack engineer
      `.toLowerCase();
    }
    
    if (fileName.includes('marketing') || fileName.includes('digital')) {
      return `
        digital marketing manager with 5 years experience digital marketing social media marketing
        google analytics google ads facebook ads instagram marketing email marketing content marketing
        seo sem ppc campaign management brand management marketing automation hubspot salesforce
        adobe creative suite photoshop illustrator canva video editing social media strategy
        influencer marketing affiliate marketing conversion optimization a b testing analytics reporting
        bachelor degree marketing communications certified google ads certified facebook blueprint
        fluent english spanish increased brand awareness 150% generated 2 million leads
        managed marketing budget 500k pounds roi 300% digital marketing specialist marketing coordinator
      `.toLowerCase();
    }
    
    // Default fallback for unknown professions
    return `
      experienced professional with 5 years experience project management team leadership
      communication skills problem solving analytical thinking microsoft office excel powerpoint
      data analysis reporting stakeholder management process improvement customer service
      bachelor degree business administration fluent english achieved significant improvements
      led successful projects managed teams delivered results on time and budget
    `.toLowerCase();
  }

  private dynamicallyExtractSkills(text: string): string[] {
    const allSkills = new Set<string>();
    
    // Comprehensive skill detection across all industries
    const skillCategories = {
      // Technical/IT Skills
      technical: [
        'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift',
        'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring',
        'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github',
        'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind', 'devops', 'ci/cd',
        'machine learning', 'ai', 'tensorflow', 'pytorch', 'scikit-learn'
      ],
      
      // Business & Operations Skills
      business: [
        'operations management', 'business analysis', 'project management', 'process improvement',
        'supply chain management', 'logistics', 'procurement', 'vendor management', 'inventory management',
        'cost optimization', 'budget management', 'financial analysis', 'cost analysis', 'budgeting',
        'forecasting', 'financial modeling', 'stakeholder management', 'team leadership',
        'change management', 'risk management', 'quality management', 'compliance', 'audit',
        'lean', 'six sigma', 'kaizen', 'continuous improvement', 'performance metrics',
        'kpi', 'dashboard', 'reporting', 'data analysis', 'business intelligence',
        'excel', 'powerbi', 'tableau', 'looker', 'google analytics', 'erp', 'crm',
        'agile', 'scrum', 'kanban', 'waterfall', 'pmp', 'prince2'
      ],
      
      // Marketing & Sales Skills
      marketing: [
        'digital marketing', 'social media marketing', 'content marketing', 'email marketing',
        'seo', 'sem', 'ppc', 'google ads', 'facebook ads', 'instagram marketing',
        'brand management', 'campaign management', 'marketing automation', 'hubspot',
        'salesforce', 'adobe creative suite', 'photoshop', 'illustrator', 'canva',
        'video editing', 'social media strategy', 'influencer marketing', 'affiliate marketing',
        'conversion optimization', 'a/b testing', 'analytics', 'google analytics'
      ],
      
      // Finance & Accounting Skills
      finance: [
        'financial analysis', 'accounting', 'bookkeeping', 'financial modeling',
        'budgeting', 'forecasting', 'cost accounting', 'management accounting',
        'financial reporting', 'tax preparation', 'audit', 'compliance',
        'quickbooks', 'sage', 'xero', 'excel', 'financial planning', 'investment analysis',
        'risk assessment', 'cash flow management', 'accounts payable', 'accounts receivable'
      ],
      
      // Healthcare Skills
      healthcare: [
        'patient care', 'clinical assessment', 'medical terminology', 'healthcare administration',
        'electronic health records', 'ehr', 'hipaa compliance', 'medical coding',
        'nursing', 'clinical research', 'patient safety', 'quality improvement',
        'healthcare management', 'medical billing', 'pharmacy', 'laboratory'
      ],
      
      // Design & Creative Skills
      creative: [
        'graphic design', 'ui design', 'ux design', 'web design', 'logo design',
        'branding', 'typography', 'color theory', 'adobe creative suite',
        'photoshop', 'illustrator', 'indesign', 'figma', 'sketch', 'canva',
        'video editing', 'motion graphics', 'photography', 'creative direction'
      ],
      
      // Soft Skills
      soft: [
        'communication', 'leadership', 'teamwork', 'problem solving', 'critical thinking',
        'time management', 'organization', 'attention to detail', 'adaptability',
        'negotiation', 'presentation', 'public speaking', 'writing', 'research',
        'customer service', 'conflict resolution', 'decision making', 'strategic thinking'
      ]
    };

    // Flatten all skills into one array
    const allSkillsList = Object.values(skillCategories).flat();
    
    // Find skills mentioned in CV text
    allSkillsList.forEach(skill => {
      if (text.includes(skill.toLowerCase())) {
        allSkills.add(skill);
      }
    });

    // Enhanced compound skill detection
    const compoundSkillPatterns = [
      /microsoft\s+\w+/g,
      /google\s+\w+/g,
      /adobe\s+\w+/g,
      /supply\s+chain/g,
      /business\s+\w+/g,
      /operations\s+\w+/g,
      /project\s+management/g,
      /process\s+improvement/g,
      /vendor\s+management/g,
      /cost\s+\w+/g,
      /financial\s+\w+/g,
      /\w+\s+management/g,
      /\w+\s+analysis/g,
      /\w+\s+development/g,
      /lean\s+six\s+sigma/g,
      /continuous\s+improvement/g
    ];

    compoundSkillPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (match.length > 4) { // Filter out short matches
            allSkills.add(match.trim());
          }
        });
      }
    });

    // Prioritize skills by relevance and frequency
    const skillsArray = Array.from(allSkills);
    
    // Sort by length (longer = more specific = higher priority)
    skillsArray.sort((a, b) => b.length - a.length);
    
    return skillsArray.slice(0, 15); // Return top 15 most relevant skills
  }

  private dynamicallyIdentifyRoles(text: string, skills: string[]): string[] {
    const roleScores: { [key: string]: number } = {};
    
    // Enhanced role patterns with more comprehensive coverage
    const enhancedRolePatterns = {
      // Business & Operations Roles
      'Operations Manager': [
        'operations manager', 'operations director', 'operations coordinator', 'ops manager',
        'business operations', 'operational excellence', 'process improvement', 'supply chain',
        'logistics', 'procurement', 'vendor management', 'inventory management', 'cost optimization'
      ],
      'Business Analyst': [
        'business analyst', 'business analysis', 'ba', 'requirements analysis', 'process analysis',
        'stakeholder management', 'business requirements', 'functional requirements', 'gap analysis',
        'business process', 'workflow analysis', 'system analysis', 'data analysis'
      ],
      'Project Manager': [
        'project manager', 'project management', 'pm', 'pmp', 'agile', 'scrum master',
        'project coordinator', 'program manager', 'delivery manager', 'implementation manager',
        'change management', 'risk management', 'resource management', 'timeline management'
      ],
      'Supply Chain Manager': [
        'supply chain', 'logistics', 'procurement', 'sourcing', 'vendor management',
        'inventory management', 'distribution', 'warehouse management', 'transportation',
        'supplier relations', 'contract management', 'cost management'
      ],
      
      // Technical Roles (only if clearly indicated)
      'Software Engineer': [
        'software engineer', 'software developer', 'full stack developer', 'backend developer',
        'frontend developer', 'web developer', 'application developer', 'systems engineer',
        'programming', 'coding', 'software development', 'javascript', 'python', 'java'
      ],
      'DevOps Engineer': [
        'devops engineer', 'devops', 'infrastructure engineer', 'cloud engineer',
        'site reliability engineer', 'platform engineer', 'deployment engineer',
        'aws', 'azure', 'kubernetes', 'docker', 'jenkins', 'ci/cd', 'automation'
      ],
      
      // Other Professional Roles
      'Marketing Manager': [
        'marketing manager', 'digital marketing', 'marketing coordinator', 'brand manager',
        'social media manager', 'content marketing', 'campaign manager', 'marketing analyst'
      ],
      'Financial Analyst': [
        'financial analyst', 'finance', 'accounting', 'financial planning', 'budgeting',
        'financial modeling', 'investment analysis', 'cost analysis', 'financial reporting'
      ],
      'Sales Manager': [
        'sales manager', 'account manager', 'business development', 'sales representative',
        'client relations', 'customer success', 'revenue management', 'crm', 'lead generation'
      ]
    };
    
    // Score roles based on keyword matches
    Object.entries(enhancedRolePatterns).forEach(([role, keywords]) => {
      let score = 0;
      
      // Direct keyword matches
      keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          // Higher scoring for exact matches
          score += keyword.length > 15 ? 10 : keyword.length > 10 ? 7 : keyword.length > 5 ? 5 : 3;
        }
      });
      
      // Skill alignment bonus
      skills.forEach(skill => {
        if (keywords.some(keyword => 
          keyword.includes(skill.toLowerCase()) || 
          skill.toLowerCase().includes(keyword)
        )) {
          score += 6; // Increased skill alignment bonus
        }
      });
      
      // Job title detection bonus
      if (text.includes(role.toLowerCase())) {
        score += 15; // Higher bonus for exact role mentions
      }
      
      if (score > 0) roleScores[role] = score;
    });

    // Enhanced fallback logic
    if (Object.keys(roleScores).length === 0) {
      // Try to infer from dominant skill categories
      const businessKeywords = ['management', 'analysis', 'operations', 'business', 'process'];
      const techKeywords = ['development', 'programming', 'software', 'engineer', 'technical'];
      
      let businessScore = 0;
      let techScore = 0;
      
      businessKeywords.forEach(keyword => {
        if (text.includes(keyword)) businessScore += 3;
      });
      
      techKeywords.forEach(keyword => {
        if (text.includes(keyword)) techScore += 3;
      });
      
      if (businessScore > techScore) {
        roleScores['Business Professional'] = businessScore;
      } else if (techScore > businessScore) {
        roleScores['Technical Professional'] = techScore;
      } else {
        roleScores['Professional'] = 1;
      }
    }
    
    return Object.entries(roleScores)
      .sort(([,a], [,b]) => b - a)
      .map(([role]) => role)
      .slice(0, 3); // Focus on top 3 most relevant roles
  }

  private dynamicallyIdentifyIndustries(text: string): string[] {
    const industryScores: { [key: string]: number } = {};
    
    Object.entries(this.industryKeywords).forEach(([industry, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          score += keyword.length > 8 ? 3 : 2;
        }
      });
      if (score > 0) industryScores[industry] = score;
    });
    
    return Object.entries(industryScores)
      .sort(([,a], [,b]) => b - a)
      .map(([industry]) => industry)
      .slice(0, 3);
  }

  private extractEducationLevel(text: string): string {
    const educationLevels = [
      { level: 'PhD', patterns: ['phd', 'doctorate', 'doctoral', 'ph.d'] },
      { level: 'Masters', patterns: ['masters', 'master\'s', 'mba', 'ms', 'ma', 'm.s', 'm.a'] },
      { level: 'Bachelors', patterns: ['bachelor', 'bachelor\'s', 'bs', 'ba', 'b.s', 'b.a', 'degree'] },
      { level: 'Associates', patterns: ['associate', 'associates', 'aa', 'as', 'a.a', 'a.s'] },
      { level: 'High School', patterns: ['high school', 'diploma', 'ged'] }
    ];

    for (const edu of educationLevels) {
      if (edu.patterns.some(pattern => text.includes(pattern))) {
        return edu.level;
      }
    }
    return 'Not specified';
  }

  private extractCertifications(text: string): string[] {
    const certificationPatterns = [
      'pmp', 'certified', 'certification', 'aws certified', 'google certified',
      'microsoft certified', 'cisco', 'comptia', 'itil', 'prince2', 'scrum master',
      'six sigma', 'lean', 'cpa', 'cfa', 'frm', 'phr', 'shrm'
    ];

    return certificationPatterns.filter(cert => text.includes(cert.toLowerCase()));
  }

  private extractLanguages(text: string): string[] {
    const languages = [
      'english', 'spanish', 'french', 'german', 'italian', 'portuguese', 'chinese',
      'japanese', 'korean', 'arabic', 'russian', 'hindi', 'dutch', 'swedish'
    ];

    const foundLanguages = languages.filter(lang => text.includes(lang.toLowerCase()));
    
    // Add fluency indicators
    const fluencyPatterns = ['fluent', 'native', 'bilingual', 'conversational', 'proficient'];
    if (fluencyPatterns.some(pattern => text.includes(pattern))) {
      foundLanguages.push('multilingual');
    }

    return foundLanguages;
  }

  private extractAchievements(text: string): string[] {
    const achievements = [];
    
    // Look for quantified achievements
    const achievementPatterns = [
      /(\d+)%\s*(increase|improvement|reduction|growth)/gi,
      /saved\s*\$?(\d+[k|m]?)/gi,
      /increased\s*.*?(\d+)%/gi,
      /reduced\s*.*?(\d+)%/gi,
      /managed\s*.*?\$?(\d+[k|m]?)/gi,
      /led\s*.*?(\d+)\s*people/gi,
      /team\s*of\s*(\d+)/gi
    ];

    achievementPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        achievements.push(...matches.slice(0, 3)); // Limit to 3 per pattern
      }
    });

    return achievements.slice(0, 5); // Return top 5 achievements
  }

  private calculateExperience(text: string): number {
    // Look for explicit experience mentions
    const experiencePatterns = [
      /(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/gi,
      /(\d+)\+?\s*(?:years?|yrs?)/gi
    ];

    let maxExperience = 0;
    
    experiencePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const years = parseInt(match.match(/\d+/)?.[0] || '0');
          maxExperience = Math.max(maxExperience, years);
        });
      }
    });

    // If no explicit experience found, estimate from job positions
    if (maxExperience === 0) {
      const jobIndicators = (text.match(/(?:worked|employed|position|role|job|company)/gi) || []).length;
      maxExperience = Math.min(jobIndicators * 1.5, 15); // Estimate 1.5 years per job mention, max 15
    }

    return Math.max(1, Math.min(maxExperience, 50)); // Between 1-50 years
  }

  private determineSeniority(experience: number, text: string, roles: string[]): 'entry' | 'mid' | 'senior' | 'lead' {
    // Check for explicit seniority indicators
    const seniorityIndicators = {
      lead: ['director', 'head of', 'vp', 'vice president', 'chief', 'ceo', 'cto', 'cfo', 'lead', 'principal'],
      senior: ['senior', 'sr.', 'specialist', 'expert', 'supervisor', 'manager', 'lead'],
      mid: ['coordinator', 'analyst', 'associate', 'consultant', 'officer'],
      entry: ['junior', 'entry', 'graduate', 'trainee', 'assistant', 'intern']
    };

    // Check text for seniority keywords
    for (const [level, keywords] of Object.entries(seniorityIndicators)) {
      if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
        return level as 'entry' | 'mid' | 'senior' | 'lead';
      }
    }

    // Fallback to experience-based determination
    if (experience >= 10) return 'lead';
    if (experience >= 7) return 'senior';
    if (experience >= 3) return 'mid';
    return 'entry';
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    
    // Filter for meaningful keywords
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
      'below', 'between', 'among', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
      'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his',
      'her', 'its', 'our', 'their', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'may', 'might', 'must', 'can', 'am', 'is', 'are',
      'was', 'were', 'be', 'been', 'being', 'get', 'got', 'getting', 'make', 'made',
      'making', 'take', 'took', 'taking', 'come', 'came', 'coming', 'go', 'went', 'going'
    ]);
    
    const relevantWords = words.filter(word => 
      word.length > 3 && 
      !stopWords.has(word)
    );
    
    return relevantWords.slice(0, 20);
  }

  private getDefaultAnalysis(): CVAnalysis {
    return {
      primaryRole: 'Professional',
      secondaryRoles: [],
      skills: [],
      experience: 0,
      seniority: 'entry',
      industries: [],
      keywords: [],
      educationLevel: 'Not specified',
      certifications: [],
      languages: ['English'],
      achievements: []
    };
  }

  async generateMockJobs(cvAnalysis: CVAnalysis): Promise<JobOpportunity[]> {
    console.log('Generating mock jobs for CV analysis:', cvAnalysis);
    
    // Determine job types based on CV analysis
    const primaryRole = cvAnalysis.primaryRole || 'Operations Manager';
    const skills = cvAnalysis.skills || [];
    const seniorityLevel = cvAnalysis.seniority || 'mid';
    
    let jobTemplates = [];
    
    // Generate jobs based on detected roles
    if (cvAnalysis.primaryRole.includes('Operations Manager') || primaryRole.includes('Operations')) {
      jobTemplates = [
        {
          title: 'Senior Operations Manager',
          company: 'TechFlow Solutions',
          location: 'London, UK',
          salary: '£65,000 - £85,000',
          description: 'Lead operational excellence initiatives and manage cross-functional teams to optimize business processes and drive efficiency improvements.',
          requirements: ['Operations Management', 'Process Improvement', 'Team Leadership', 'Budget Management', 'Stakeholder Management'],
          logo: '🏢'
        },
        {
          title: 'Operations Director',
          company: 'Strategic Solutions Ltd',
          location: 'London, UK',
          salary: '£80,000 - £120,000',
          description: 'Strategic leadership role overseeing all operational functions and driving organizational efficiency across multiple departments.',
          requirements: ['Strategic Planning', 'Operations Management', 'Leadership', 'P&L Management', 'Change Management'],
          logo: '🎯'
        },
        {
          title: 'Supply Chain Operations Manager',
          company: 'LogiCorp International',
          location: 'Birmingham, UK',
          salary: '£55,000 - £75,000',
          description: 'Oversee end-to-end supply chain operations and vendor relationships to ensure efficient delivery and cost optimization.',
          requirements: ['Supply Chain Management', 'Vendor Management', 'Procurement', 'Cost Optimization', 'Logistics'],
          logo: '🚚'
        }
      ];
    } else if (cvAnalysis.primaryRole.includes('Business Analyst') || primaryRole.includes('Business')) {
      jobTemplates = [
        {
          title: 'Senior Business Analyst',
          company: 'Global Dynamics',
          location: 'Manchester, UK',
          salary: '£45,000 - £65,000',
          description: 'Analyze business processes and identify opportunities for operational improvements and strategic initiatives.',
          requirements: ['Business Analysis', 'Data Analysis', 'Process Mapping', 'Requirements Gathering', 'Excel'],
          logo: '📊'
        },
        {
          title: 'Business Operations Analyst',
          company: 'Insight Analytics',
          location: 'Bristol, UK',
          salary: '£40,000 - £55,000',
          description: 'Support business operations through data analysis, process optimization, and performance reporting.',
          requirements: ['Business Analysis', 'Data Analysis', 'Reporting', 'Process Improvement', 'SQL'],
          logo: '📈'
        }
      ];
    } else {
      // Default to general business/operations roles
      jobTemplates = [
        {
          title: 'Business Operations Manager',
          company: 'Growth Partners',
          location: 'London, UK',
          salary: '£50,000 - £70,000',
          description: 'Manage day-to-day business operations and drive process improvements across the organization.',
          requirements: ['Operations Management', 'Process Improvement', 'Project Management', 'Team Leadership'],
          logo: '💼'
        }
      ];
    }
    
    // Add process improvement roles if relevant skills detected
    if (skills.some(skill => skill.toLowerCase().includes('lean') || skill.toLowerCase().includes('six sigma') || skill.toLowerCase().includes('process'))) {
      jobTemplates.push({
        title: 'Process Improvement Specialist',
        company: 'Efficiency Partners',
        location: 'Remote, UK',
        salary: '£50,000 - £70,000',
        description: 'Drive continuous improvement initiatives using Lean Six Sigma methodologies to optimize business processes.',
        requirements: ['Lean Six Sigma', 'Process Improvement', 'Change Management', 'Project Management', 'Data Analysis'],
        logo: '⚡'
      });
    }
    
    // Transform templates to full job objects
    const jobs = jobTemplates.map((job, index) => ({
      id: index + 1,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      type: 'Full-time',
      posted: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      match: this.calculateJobMatchForMockJob(cvAnalysis, job),
      description: job.description,
      requirements: job.requirements,
      logo: job.logo,
      role: job.title,
      industry: 'Business',
      seniority: seniorityLevel,
      url: `https://example.com/jobs/${index + 1}`,
      applicationType: 'external_form_simple' as const
    }));
    
    console.log(`Generated ${jobs.length} mock jobs:`, jobs.map(j => ({ title: j.title, match: j.match })));
    
    return jobs.sort((a, b) => b.match - a.match);
  }
  
  private calculateJobMatchForMockJob(cvAnalysis: any, job: any): number {
    let matchScore = 70; // Base score for relevant jobs
    
    // Role matching
    const cvRoles = [cvAnalysis.primaryRole, ...cvAnalysis.secondaryRoles] || [];
    const jobTitle = job.title.toLowerCase();
    
    for (const role of cvRoles) {
      if (jobTitle.includes(role.toLowerCase().split(' ')[0])) {
        matchScore += 15;
        break;
      }
    }
    
    // Skills matching
    const cvSkills = cvAnalysis.skills || [];
    const jobRequirements = job.requirements || [];
    
    let skillMatches = 0;
    for (const requirement of jobRequirements) {
      for (const skill of cvSkills) {
        if (skill.toLowerCase().includes(requirement.toLowerCase()) || 
            requirement.toLowerCase().includes(skill.toLowerCase())) {
          skillMatches++;
          break;
        }
      }
    }
    
    const skillMatchPercentage = (skillMatches / jobRequirements.length) * 20;
    matchScore += skillMatchPercentage;
    
    // Seniority matching
    const seniority = cvAnalysis.seniority || '';
    if (seniority === 'senior' && jobTitle.includes('senior')) {
      matchScore += 5;
    } else if (seniority === 'lead' && (jobTitle.includes('manager') || jobTitle.includes('director'))) {
      matchScore += 5;
    }
    
    return Math.min(Math.round(matchScore), 98); // Cap at 98%
  }

  async findJobs(cvAnalysis: CVAnalysis): Promise<JobOpportunity[]> {
    // For now, return mock jobs. In production, this would call real job APIs
    const scoredJobs = await this.generateMockJobs(cvAnalysis);
    
    return scoredJobs;
  }

  private calculateDynamicMatchScore(job: JobOpportunity, cvAnalysis: CVAnalysis): number {
    let score = 0;
    const jobTitleLower = job.title.toLowerCase();
    const jobDescLower = job.description.toLowerCase();
    const combinedJobText = `${jobTitleLower} ${jobDescLower}`;
    
    // 1. Role Matching (50% weight) - Increased weight for better accuracy
    const primaryRoleMatch = this.calculateRoleMatch(combinedJobText, cvAnalysis.primaryRole);
    const secondaryRoleMatch = Math.max(...cvAnalysis.secondaryRoles.map(role => 
      this.calculateRoleMatch(combinedJobText, role)
    ));
    
    score += primaryRoleMatch * 0.5 * 100; // 50% weight for primary role
    score += secondaryRoleMatch * 0.15 * 100; // 15% weight for secondary roles
    
    // 2. Skills Matching (25% weight) - Dynamic based on user's actual skills
    const skillMatchScore = this.calculateSkillMatch(combinedJobText, cvAnalysis.skills);
    score += skillMatchScore * 0.25 * 100;
    
    // 3. Seniority Matching (10% weight)
    const seniorityMatch = this.calculateSeniorityMatch(job.title, cvAnalysis.seniority);
    score += seniorityMatch * 0.1 * 100;
    
    // 4. Industry Matching (5% weight)
    const industryMatch = this.calculateIndustryMatch(combinedJobText, cvAnalysis.industries);
    score += industryMatch * 0.05 * 100;
    
    // 5. Experience Level Bonus (5% weight)
    const experienceMatch = this.calculateExperienceMatch(combinedJobText, cvAnalysis.experience);
    score += experienceMatch * 0.05 * 100;
    
    // 6. Anti-mismatch penalty - heavily penalize completely wrong roles
    const mismatchPenalty = this.calculateMismatchPenalty(combinedJobText, cvAnalysis);
    score -= mismatchPenalty;
    
    // Bonus factors
    score += this.calculateBonusFactors(job, cvAnalysis);
    
    // Ensure score is within bounds
    return Math.max(0, Math.min(Math.round(score), 99));
  }

  private calculateRoleMatch(jobText: string, userRole: string): number {
    if (!userRole || userRole === 'Professional') return 0;
    
    const roleWords = userRole.toLowerCase().split(' ');
    let matchScore = 0;
    
    // Exact role match
    if (jobText.includes(userRole.toLowerCase())) {
      matchScore = 1.0;
    } else {
      // Partial role word matches
      const matchedWords = roleWords.filter(word => jobText.includes(word));
      matchScore = matchedWords.length / roleWords.length;
    }
    
    // Check for role synonyms and related terms
    const roleSynonyms = this.rolePatterns[userRole] || [];
    const synonymMatches = roleSynonyms.filter(synonym => jobText.includes(synonym.toLowerCase()));
    
    if (synonymMatches.length > 0) {
      matchScore = Math.max(matchScore, synonymMatches.length / roleSynonyms.length * 0.8);
    }
    
    return matchScore;
  }

  private calculateSkillMatch(jobText: string, userSkills: string[]): number {
    if (userSkills.length === 0) return 0;
    
    let totalSkillScore = 0;
    let skillsFound = 0;
    
    userSkills.forEach(skill => {
      if (jobText.includes(skill.toLowerCase())) {
        skillsFound++;
        // Weight skills by specificity (longer = more specific = higher score)
        const skillWeight = skill.length > 15 ? 3 : skill.length > 10 ? 2 : 1;
        totalSkillScore += skillWeight;
      }
    });
    
    // Calculate percentage of skills matched, weighted by importance
    const maxPossibleScore = userSkills.reduce((sum, skill) => {
      return sum + (skill.length > 15 ? 3 : skill.length > 10 ? 2 : 1);
    }, 0);
    
    return maxPossibleScore > 0 ? totalSkillScore / maxPossibleScore : 0;
  }

  private calculateSeniorityMatch(jobTitle: string, userSeniority: string): number {
    const jobSeniority = this.determineSeniorityFromTitle(jobTitle);
    const seniorityHierarchy = ['entry', 'mid', 'senior', 'lead'];
    
    const userIndex = seniorityHierarchy.indexOf(userSeniority);
    const jobIndex = seniorityHierarchy.indexOf(jobSeniority);
    
    if (userIndex === jobIndex) return 1.0; // Perfect match
    if (Math.abs(userIndex - jobIndex) === 1) return 0.7; // Adjacent level
    if (Math.abs(userIndex - jobIndex) === 2) return 0.4; // Two levels apart
    return 0.1; // Very different levels
  }

  private calculateIndustryMatch(jobText: string, userIndustries: string[]): number {
    if (userIndustries.length === 0) return 0.5; // Neutral if no industry specified
    
    let bestMatch = 0;
    userIndustries.forEach(industry => {
      const industryKeywords = this.industryKeywords[industry] || [industry];
      const matchCount = industryKeywords.filter(keyword => 
        jobText.includes(keyword.toLowerCase())
      ).length;
      
      const matchRatio = matchCount / industryKeywords.length;
      bestMatch = Math.max(bestMatch, matchRatio);
    });
    
    return bestMatch;
  }

  private calculateExperienceMatch(jobText: string, userExperience: number): number {
    // Look for experience requirements in job description
    const expPatterns = [
      /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/gi,
      /(\d+)-(\d+)\s*(?:years?|yrs?)/gi
    ];
    
    let jobExpRequirement = 0;
    expPatterns.forEach(pattern => {
      const matches = jobText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const numbers = match.match(/\d+/g);
          if (numbers) {
            jobExpRequirement = Math.max(jobExpRequirement, parseInt(numbers[0]));
          }
        });
      }
    });
    
    if (jobExpRequirement === 0) return 0.8; // No requirement specified, slight positive
    
    // Calculate match based on how well user experience aligns
    const difference = Math.abs(userExperience - jobExpRequirement);
    if (difference === 0) return 1.0;
    if (difference <= 2) return 0.9;
    if (difference <= 5) return 0.7;
    return 0.3;
  }

  private calculateBonusFactors(job: JobOpportunity, cvAnalysis: CVAnalysis): number {
    let bonus = 0;
    
    // Remote work bonus (popular preference)
    if (job.location.toLowerCase().includes('remote')) {
      bonus += 3;
    }
    
    // Major city bonus
    const majorCities = ['london', 'manchester', 'birmingham', 'bristol', 'edinburgh'];
    if (majorCities.some(city => job.location.toLowerCase().includes(city))) {
      bonus += 2;
    }
    
    // Recent posting bonus
    const postedDate = new Date(job.posted);
    const daysSincePosted = (Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePosted <= 7) bonus += 2;
    else if (daysSincePosted <= 30) bonus += 1;
    
    // Easy apply bonus (higher success rate)
    if (job.applicationType === 'easy_apply') {
      bonus += 2;
    }
    
    // Company size indicators (if available in description)
    const jobDesc = job.description.toLowerCase();
    if (jobDesc.includes('startup') || jobDesc.includes('scale-up')) bonus += 1;
    if (jobDesc.includes('fortune') || jobDesc.includes('global')) bonus += 1;
    
    return Math.min(bonus, 10); // Cap bonus at 10 points
  }
  
  private determineSeniorityFromTitle(title: string): 'entry' | 'mid' | 'senior' | 'lead' {
    const lowerTitle = title.toLowerCase();
    
    // Leadership roles
    if (lowerTitle.includes('director') || lowerTitle.includes('head of') || 
        lowerTitle.includes('vp') || lowerTitle.includes('vice president') || 
        lowerTitle.includes('chief') || lowerTitle.includes('lead') || 
        lowerTitle.includes('principal')) return 'lead';
    
    // Senior roles
    if (lowerTitle.includes('senior') || lowerTitle.includes('sr.') || 
        lowerTitle.includes('specialist') || lowerTitle.includes('expert') ||
        lowerTitle.includes('supervisor') || lowerTitle.includes('manager')) return 'senior';
    
    // Entry level roles
    if (lowerTitle.includes('junior') || lowerTitle.includes('entry') || 
        lowerTitle.includes('graduate') || lowerTitle.includes('trainee') ||
        lowerTitle.includes('assistant') || lowerTitle.includes('intern')) return 'entry';
    
    return 'mid';
  }

  private calculateMismatchPenalty(jobText: string, cvAnalysis: CVAnalysis): number {
    let penalty = 0;
    
    // Define role categories that shouldn't mix
    const roleCategories = {
      technical: ['software', 'developer', 'engineer', 'programming', 'coding', 'devops', 'technical'],
      business: ['operations', 'business', 'management', 'analyst', 'coordinator', 'administrator'],
      healthcare: ['nurse', 'doctor', 'medical', 'clinical', 'healthcare', 'patient'],
      creative: ['designer', 'creative', 'marketing', 'brand', 'content', 'social media'],
      finance: ['financial', 'accounting', 'finance', 'budget', 'audit', 'investment']
    };
    
    // Determine user's primary category
    let userCategory = 'general';
    let maxCategoryScore = 0;
    
    Object.entries(roleCategories).forEach(([category, keywords]) => {
      let categoryScore = 0;
      keywords.forEach(keyword => {
        if (cvAnalysis.primaryRole.toLowerCase().includes(keyword) ||
            cvAnalysis.skills.some(skill => skill.toLowerCase().includes(keyword))) {
          categoryScore += 1;
        }
      });
      
      if (categoryScore > maxCategoryScore) {
        maxCategoryScore = categoryScore;
        userCategory = category;
      }
    });
    
    // Apply penalty for jobs in wrong categories
    if (userCategory !== 'general') {
      Object.entries(roleCategories).forEach(([category, keywords]) => {
        if (category !== userCategory) {
          keywords.forEach(keyword => {
            if (jobText.includes(keyword)) {
              penalty += 20; // Heavy penalty for wrong category
            }
          });
        }
      });
    }
    
    return Math.min(penalty, 50); // Cap penalty at 50 points
  }
}

export class CoverLetterGenerator {
  generateCoverLetter(cvAnalysis: CVAnalysis, job: JobOpportunity, userProfile: any): string {
    const template = this.selectDynamicTemplate(cvAnalysis.primaryRole, cvAnalysis.industries[0]);
    
    return template
      .replace('{COMPANY}', job.company)
      .replace('{POSITION}', job.title)
      .replace('{USER_NAME}', userProfile.name || 'Candidate')
      .replace('{PRIMARY_SKILL}', cvAnalysis.skills[0] || 'professional skills')
      .replace('{EXPERIENCE}', cvAnalysis.experience.toString())
      .replace('{RELEVANT_SKILLS}', this.getRelevantSkills(cvAnalysis, job))
      .replace('{SPECIFIC_ACHIEVEMENT}', this.generateDynamicAchievement(cvAnalysis, job))
      .replace('{COMPANY_VALUE}', this.getCompanyValue(job.company, cvAnalysis.industries[0]));
  }

  private selectDynamicTemplate(primaryRole: string, primaryIndustry: string): string {
    // Dynamic template selection based on role and industry
    const roleType = this.categorizeRole(primaryRole);
    const industryType = primaryIndustry || 'general';
    
    const templates = {
      technical: `Dear Hiring Manager,

I am writing to express my strong interest in the {POSITION} position at {COMPANY}. With {EXPERIENCE} years of experience in {PRIMARY_SKILL} and technical expertise, I am excited about the opportunity to contribute to your development team.

In my previous roles, I have {SPECIFIC_ACHIEVEMENT}. My technical skills in {RELEVANT_SKILLS} align perfectly with your requirements, and I am particularly drawn to {COMPANY_VALUE}.

I would welcome the opportunity to discuss how my technical background and passion for innovation can benefit your organization.

Best regards,
{USER_NAME}`,

      business: `Dear Hiring Manager,

I am writing to express my strong interest in the {POSITION} position at {COMPANY}. With {EXPERIENCE} years of experience in business operations and expertise in {PRIMARY_SKILL}, I am excited about the opportunity to contribute to your organization's success.

In my previous roles, I have {SPECIFIC_ACHIEVEMENT}. My business expertise in {RELEVANT_SKILLS} aligns perfectly with your requirements, and I am particularly drawn to {COMPANY_VALUE}.

I would welcome the opportunity to discuss how my background in business management and passion for driving results can benefit your organization.

Best regards,
{USER_NAME}`,

      creative: `Dear Hiring Manager,

I am writing to express my strong interest in the {POSITION} position at {COMPANY}. With {EXPERIENCE} years of creative experience and expertise in {PRIMARY_SKILL}, I am excited about the opportunity to bring my creative vision to your team.

In my previous roles, I have {SPECIFIC_ACHIEVEMENT}. My creative skills in {RELEVANT_SKILLS} align perfectly with your requirements, and I am particularly drawn to {COMPANY_VALUE}.

I would welcome the opportunity to discuss how my creative background and passion for innovative design can benefit your organization.

Best regards,
{USER_NAME}`,

      healthcare: `Dear Hiring Manager,

I am writing to express my strong interest in the {POSITION} position at {COMPANY}. With {EXPERIENCE} years of healthcare experience and expertise in {PRIMARY_SKILL}, I am excited about the opportunity to contribute to patient care and your healthcare mission.

In my previous roles, I have {SPECIFIC_ACHIEVEMENT}. My healthcare expertise in {RELEVANT_SKILLS} aligns perfectly with your requirements, and I am particularly drawn to {COMPANY_VALUE}.

I would welcome the opportunity to discuss how my healthcare background and commitment to patient care can benefit your organization.

Best regards,
{USER_NAME}`
    };

    return templates[roleType] || templates.business;
  }

  private categorizeRole(role: string): string {
    const roleLower = role.toLowerCase();
    
    if (roleLower.includes('engineer') || roleLower.includes('developer') || 
        roleLower.includes('programmer') || roleLower.includes('technical')) {
      return 'technical';
    }
    
    if (roleLower.includes('designer') || roleLower.includes('creative') || 
        roleLower.includes('artist') || roleLower.includes('marketing')) {
      return 'creative';
    }
    
    if (roleLower.includes('nurse') || roleLower.includes('doctor') || 
        roleLower.includes('medical') || roleLower.includes('healthcare')) {
      return 'healthcare';
    }
    
    return 'business'; // Default to business template
  }

  private getRelevantSkills(cvAnalysis: CVAnalysis, job: JobOpportunity): string {
    const jobText = `${job.title} ${job.description}`.toLowerCase();
    
    // Find skills that appear in both CV and job description
    const matchingSkills = cvAnalysis.skills.filter(skill =>
      jobText.includes(skill.toLowerCase())
    );
    
    // If we have matching skills, use them; otherwise use top user skills
    const skillsToShow = matchingSkills.length > 0 
      ? matchingSkills.slice(0, 4)
      : cvAnalysis.skills.slice(0, 4);
    
    return skillsToShow.join(', ') || 'relevant professional skills';
  }

  private generateDynamicAchievement(cvAnalysis: CVAnalysis, job: JobOpportunity): string {
    // Use actual achievements if available
    if (cvAnalysis.achievements.length > 0) {
      return `successfully ${cvAnalysis.achievements[0].toLowerCase()}`;
    }
    
    // Generate role-appropriate achievements
    const roleType = this.categorizeRole(cvAnalysis.primaryRole);
    const achievementTemplates = {
      technical: [
        'developed and deployed scalable applications serving thousands of users',
        'optimized system performance resulting in 40% faster response times',
        'led technical initiatives that reduced infrastructure costs by 30%',
        'implemented automated testing processes improving code quality by 50%'
      ],
      business: [
        'successfully led cross-functional teams to deliver complex business initiatives',
        'improved operational efficiency by 25% through process optimization',
        'managed multi-million pound budgets while consistently reducing costs',
        'implemented strategic plans that drove significant business growth'
      ],
      creative: [
        'created award-winning designs that increased brand engagement by 45%',
        'led creative campaigns that generated 60% more leads',
        'developed visual identity systems for major brand launches',
        'managed creative teams delivering projects 20% ahead of schedule'
      ],
      healthcare: [
        'provided exceptional patient care with 98% satisfaction ratings',
        'implemented care protocols that improved patient outcomes by 30%',
        'led healthcare teams in delivering quality care to diverse populations',
        'contributed to research initiatives advancing medical knowledge'
      ]
    };
    
    const templates = achievementTemplates[roleType] || achievementTemplates.business;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private getCompanyValue(company: string, industry?: string): string {
    const industryValues = {
      technology: 'commitment to innovation and cutting-edge technology solutions',
      healthcare: 'dedication to improving patient outcomes and advancing healthcare',
      finance: 'focus on financial excellence and client-centered solutions',
      education: 'mission to advance learning and educational outcomes',
      manufacturing: 'commitment to quality manufacturing and operational excellence',
      retail: 'dedication to exceptional customer experience and service',
      consulting: 'reputation for delivering strategic value to clients',
      media: 'commitment to creative excellence and impactful storytelling'
    };
    
    if (industry && industryValues[industry]) {
      return industryValues[industry];
    }
    
    // Generic company values
    const genericValues = [
      'commitment to excellence and innovation',
      'focus on delivering exceptional value to customers',
      'dedication to fostering a collaborative and results-driven culture',
      'reputation for industry leadership and innovation',
      'mission to drive sustainable growth and positive impact'
    ];
    
    return genericValues[Math.floor(Math.random() * genericValues.length)];
  }
}