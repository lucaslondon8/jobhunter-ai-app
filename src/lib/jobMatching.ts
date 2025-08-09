// src/lib/jobMatching.ts

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface CVAnalysis {
  primaryRole: string;
  secondaryRoles: string[];
  skills: string[];
  experience: number;
  seniority: 'entry' | 'mid' | 'senior' | 'lead';
  industries: string[];
  keywords: string[];
  educationLevel: string;
  certifications: string[];
  languages: string[];
  achievements: string[];
}

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

  analyzeCV(cvData: any): CVAnalysis {
    const text = this.extractTextFromCV(cvData);
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
    // Generate realistic CV content for demo - in production this would be actual PDF parsing
    const mockContent = `
      experienced professional with ${Math.floor(Math.random() * 10) + 3} years of experience in operations management
      and business analysis. skilled in project management, process improvement, data analysis, and team leadership.
      proficient in excel, sql, powerbi, and various business intelligence tools. experience with lean six sigma
      methodologies and continuous improvement initiatives. strong background in supply chain management,
      vendor relations, and cost optimization. excellent communication and stakeholder management skills.
      bachelor's degree in business administration. certified project management professional (pmp).
      fluent in english and spanish. achieved 25% cost reduction in previous role through process optimization.
      led cross-functional teams of up to 15 people. implemented new inventory management system resulting in
      20% efficiency improvement. experience with budget management up to $2m annually.
    `;
    return mockContent.toLowerCase();
  }

  private dynamicallyExtractSkills(text: string): string[] {
    const allSkills = new Set<string>();
    
    // Technical skills detection
    const technicalSkills = [
      'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift',
      'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring',
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github',
      'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind',
      'machine learning', 'ai', 'tensorflow', 'pytorch', 'scikit-learn',
      'photoshop', 'illustrator', 'figma', 'sketch', 'adobe creative suite'
    ];

    // Business skills detection
    const businessSkills = [
      'project management', 'agile', 'scrum', 'kanban', 'waterfall', 'pmp',
      'business analysis', 'process improvement', 'lean', 'six sigma', 'kaizen',
      'data analysis', 'excel', 'powerbi', 'tableau', 'looker', 'google analytics',
      'supply chain', 'logistics', 'procurement', 'vendor management', 'inventory',
      'budgeting', 'forecasting', 'financial modeling', 'cost analysis',
      'stakeholder management', 'team leadership', 'change management',
      'quality assurance', 'compliance', 'risk management', 'audit'
    ];

    // Soft skills detection
    const softSkills = [
      'communication', 'leadership', 'teamwork', 'problem solving', 'critical thinking',
      'time management', 'organization', 'attention to detail', 'adaptability',
      'negotiation', 'presentation', 'public speaking', 'writing', 'research'
    ];

    // Combine all skill categories
    const allSkillsList = [...technicalSkills, ...businessSkills, ...softSkills];
    
    // Find skills mentioned in CV text
    allSkillsList.forEach(skill => {
      if (text.includes(skill.toLowerCase())) {
        allSkills.add(skill);
      }
    });

    // Extract compound skills (e.g., "microsoft excel", "google analytics")
    const compoundSkillPatterns = [
      /microsoft\s+\w+/g,
      /google\s+\w+/g,
      /adobe\s+\w+/g,
      /\w+\s+management/g,
      /\w+\s+analysis/g,
      /\w+\s+development/g
    ];

    compoundSkillPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (match.length > 5) { // Filter out short matches
            allSkills.add(match.trim());
          }
        });
      }
    });

    return Array.from(allSkills).slice(0, 20); // Return top 20 skills
  }

  private dynamicallyIdentifyRoles(text: string, skills: string[]): string[] {
    const roleScores: { [key: string]: number } = {};
    
    // Score roles based on keyword matches
    Object.entries(this.rolePatterns).forEach(([role, keywords]) => {
      let score = 0;
      
      // Direct keyword matches
      keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          score += keyword.length > 10 ? 5 : keyword.length > 5 ? 3 : 2;
        }
      });
      
      // Skill alignment bonus
      skills.forEach(skill => {
        if (keywords.some(keyword => 
          keyword.includes(skill.toLowerCase()) || 
          skill.toLowerCase().includes(keyword)
        )) {
          score += 4;
        }
      });
      
      // Job title detection bonus
      if (text.includes(role.toLowerCase())) {
        score += 10;
      }
      
      if (score > 0) roleScores[role] = score;
    });

    // If no roles detected, try to infer from skills
    if (Object.keys(roleScores).length === 0) {
      roleScores['Professional'] = 1;
    }
    
    return Object.entries(roleScores)
      .sort(([,a], [,b]) => b - a)
      .map(([role]) => role)
      .slice(0, 5);
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
      /^[a-zA-Z]+$/.test(word) &&
      !stopWords.has(word)
    );
    
    // Count frequency and return most common
    const wordFreq: { [key: string]: number } = {};
    relevantWords.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 25)
      .map(([word]) => word);
  }

  private async fetchJobsViaProxy(cvAnalysis: CVAnalysis, filters: any, authToken: string): Promise<JobOpportunity[]> {
    if (!SUPABASE_URL) {
      console.error("Supabase URL is not configured in the frontend.");
      return [];
    }

    // Use primary role for search, fallback to skills if no role
    const searchKeywords = cvAnalysis.primaryRole !== 'Professional' 
      ? cvAnalysis.primaryRole 
      : cvAnalysis.skills.slice(0, 3).join(' ') || 'jobs';
      
    const searchLocation = filters.location && filters.location !== 'all' ? filters.location : 'london';

    const params = new URLSearchParams({
      what: searchKeywords,
      where: searchLocation,
    });

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/job-handler?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Proxy request failed with status ${response.status}`);
      }
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        return [];
      }

      return data.results.map((job: any): JobOpportunity => ({
        id: job.id,
        title: job.title,
        company: job.company.display_name,
        location: job.location.display_name,
        salary: job.salary_min ? `£${job.salary_min.toLocaleString()}` : 'Competitive',
        type: job.contract_time || 'Full-time',
        posted: new Date(job.created).toLocaleDateString(),
        match: 0, // Will be calculated
        description: job.description,
        requirements: [job.category.label],
        logo: '🏢',
        role: job.category.label,
        industry: job.category.tag,
        seniority: this.determineSeniorityFromTitle(job.title),
        url: job.redirect_url,
        applicationType: this.classifyApplicationType(job.redirect_url),
      }));
    } catch (error) {
      console.error("Error fetching jobs via proxy:", error);
      return [];
    }
  }

  async findMatchingJobs(cvAnalysis: CVAnalysis, filters: any = {}, authToken: string): Promise<JobOpportunity[]> {
    const fetchedJobs = await this.fetchJobsViaProxy(cvAnalysis, filters, authToken);

    if (!fetchedJobs.length) {
      return [];
    }
    
    const scoredJobs = fetchedJobs.map(job => ({
      ...job,
      match: this.calculateDynamicMatchScore(job, cvAnalysis)
    })).sort((a, b) => b.match - a.match);
    
    return scoredJobs;
  }

  private calculateDynamicMatchScore(job: JobOpportunity, cvAnalysis: CVAnalysis): number {
    let score = 0;
    const jobTitleLower = job.title.toLowerCase();
    const jobDescLower = job.description.toLowerCase();
    const combinedJobText = `${jobTitleLower} ${jobDescLower}`;
    
    // 1. Role Matching (40% weight) - Dynamic based on user's actual roles
    const primaryRoleMatch = this.calculateRoleMatch(combinedJobText, cvAnalysis.primaryRole);
    const secondaryRoleMatch = Math.max(...cvAnalysis.secondaryRoles.map(role => 
      this.calculateRoleMatch(combinedJobText, role)
    ));
    
    score += primaryRoleMatch * 0.4 * 100; // 40% weight
    score += secondaryRoleMatch * 0.2 * 100; // 20% weight for secondary roles
    
    // 2. Skills Matching (30% weight) - Dynamic based on user's actual skills
    const skillMatchScore = this.calculateSkillMatch(combinedJobText, cvAnalysis.skills);
    score += skillMatchScore * 0.3 * 100;
    
    // 3. Seniority Matching (15% weight)
    const seniorityMatch = this.calculateSeniorityMatch(job.title, cvAnalysis.seniority);
    score += seniorityMatch * 0.15 * 100;
    
    // 4. Industry Matching (10% weight)
    const industryMatch = this.calculateIndustryMatch(combinedJobText, cvAnalysis.industries);
    score += industryMatch * 0.1 * 100;
    
    // 5. Experience Level Bonus (5% weight)
    const experienceMatch = this.calculateExperienceMatch(combinedJobText, cvAnalysis.experience);
    score += experienceMatch * 0.05 * 100;
    
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