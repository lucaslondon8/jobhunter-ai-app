// src/lib/jobMatching.ts

// For a production-ready application, you would integrate a more
// sophisticated NLP library here.
// Example: import nlp from 'compromise';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface CVAnalysis {
  primaryRole: string;
  secondaryRoles: string[];
  skills: string[];
  experience: number;
  seniority: 'entry' | 'mid' | 'senior' | 'lead';
  industries: string[];
  keywords: string[];
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
  
  private roleKeywords = {
    'Operations Manager': ['operations', 'operational', 'process', 'efficiency', 'workflow', 'logistics', 'supply chain', 'procurement', 'vendor', 'cost reduction', 'lean', 'six sigma', 'project management', 'team leadership', 'kpi', 'metrics', 'continuous improvement'],
    'Business Analyst': ['business analyst', 'business analysis', 'requirements', 'stakeholder', 'process improvement', 'data analysis', 'reporting', 'documentation', 'workflow', 'business process', 'gap analysis', 'solution design'],
    'Project Manager': ['project manager', 'project management', 'pmp', 'agile', 'scrum', 'waterfall', 'gantt', 'risk management', 'stakeholder management', 'budget', 'timeline', 'deliverables', 'coordination'],
    'Supply Chain Manager': ['supply chain', 'logistics', 'procurement', 'vendor management', 'inventory', 'distribution', 'warehousing', 'transportation', 'sourcing', 'supplier', 'demand planning'],
    'Process Improvement Specialist': ['process improvement', 'lean', 'six sigma', 'kaizen', 'continuous improvement', 'efficiency', 'optimization', 'workflow', 'standard operating procedures', 'sop', 'quality'],
    'Business Development Manager': ['business development', 'sales', 'partnerships', 'revenue growth', 'market expansion', 'client acquisition', 'relationship management', 'strategic planning', 'negotiation'],
    'Operations Analyst': ['operations analyst', 'data analysis', 'reporting', 'metrics', 'kpi', 'dashboard', 'excel', 'sql', 'process analysis', 'performance measurement', 'operational efficiency'],
    'Quality Manager': ['quality management', 'quality assurance', 'iso', 'compliance', 'audit', 'quality control', 'standards', 'certification', 'inspection', 'corrective action'],
    'Logistics Coordinator': ['logistics', 'coordination', 'shipping', 'transportation', 'freight', 'customs', 'documentation', 'tracking', 'delivery', 'warehouse'],
    'Administrative Manager': ['administration', 'administrative', 'office management', 'coordination', 'scheduling', 'documentation', 'compliance', 'policies', 'procedures', 'support']
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
    
    // API direct (for future integration with job board APIs)
    // This would be determined by partnerships or API availability
    // For now, we'll leave this as a placeholder
    
    // Default to unknown for unclassified URLs
    return 'unknown';
  }

  analyzeCV(cvData: any): CVAnalysis {
    const text = this.extractTextFromCV(cvData);
    const skills = this.extractSkills(text);
    const experience = this.calculateExperience(text);
    const roles = this.identifyRoles(text, skills);
    const industries = this.identifyIndustries(text);
    
    return {
      primaryRole: roles[0] || 'Software Engineer',
      secondaryRoles: roles.slice(1, 4),
      skills,
      experience,
      seniority: this.determineSeniority(experience, text),
      industries,
      keywords: this.extractKeywords(text)
    };
  }

  private extractTextFromCV(cvData: any): string {
    if (typeof cvData === 'string') return cvData.toLowerCase();
    if (cvData?.content) return cvData.content.toLowerCase();
    if (cvData?.skills) return cvData.skills.join(' ').toLowerCase();
    return '';
  }

  private extractSkills(text: string): string[] {
    const businessOperationsSkills = [
      'project management', 'process improvement', 'lean', 'six sigma', 'agile', 'scrum',
      'supply chain', 'logistics', 'procurement', 'vendor management', 'inventory management',
      'data analysis', 'excel', 'sql', 'reporting', 'dashboard', 'kpi', 'metrics',
      'quality management', 'iso', 'compliance', 'audit', 'risk management',
      'stakeholder management', 'team leadership', 'coordination', 'planning',
      'budgeting', 'cost reduction', 'efficiency', 'optimization', 'workflow',
      'documentation', 'sop', 'policies', 'procedures', 'training',
      'customer service', 'relationship management', 'negotiation', 'communication'
    ];
    
    return businessOperationsSkills.filter(skill => text.includes(skill.toLowerCase()));
  }

  private calculateExperience(text: string): number {
    const experienceMatches = text.match(/(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/gi);
    if (experienceMatches) {
      const years = experienceMatches.map(match => parseInt(match.match(/\d+/)?.[0] || '0'));
      return Math.max(...years);
    }
    const jobIndicators = (text.match(/(?:worked|employed|position|role|job)/gi) || []).length;
    return Math.min(jobIndicators * 2, 10);
  }

  private identifyRoles(text: string, skills: string[]): string[] {
    const roleScores: { [key: string]: number } = {};
    
    Object.entries(this.roleKeywords).forEach(([role, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          // Higher scoring for exact matches and longer, more specific keywords
          score += keyword.length > 10 ? 5 : keyword.length > 5 ? 3 : 1;
        }
      });
      skills.forEach(skill => {
        if (keywords.some(keyword => keyword.includes(skill) || skill.includes(keyword))) {
          score += 5; // Increased weight for skill matches
        }
      });
      if (score > 0) roleScores[role] = score;
    });
    
    return Object.entries(roleScores)
      .sort(([,a], [,b]) => b - a)
      .map(([role]) => role);
  }

  private identifyIndustries(text: string): string[] {
    const industries = [
      'manufacturing', 'automotive', 'aerospace', 'defense', 'energy', 'oil', 'gas',
      'logistics', 'transportation', 'supply chain', 'retail', 'e-commerce',
      'healthcare', 'pharmaceutical', 'medical device', 'biotechnology',
      'financial services', 'banking', 'insurance', 'consulting',
      'technology', 'software', 'telecommunications', 'media',
      'construction', 'real estate', 'hospitality', 'food', 'beverage'
    ];
    return industries.filter(industry => text.includes(industry));
  }

  private determineSeniority(experience: number, text: string): 'entry' | 'mid' | 'senior' | 'lead' {
    // Check for leadership indicators
    if (text.includes('director') || text.includes('head of') || text.includes('vp') || 
        text.includes('vice president') || text.includes('chief') || text.includes('lead')) return 'lead';
    
    // Check for senior level indicators
    if (experience >= 8 || text.includes('senior') || text.includes('principal') || 
        text.includes('specialist') || text.includes('expert')) return 'senior';
    
    // Check for mid-level indicators
    if (experience >= 4 || text.includes('coordinator') || text.includes('supervisor') || 
        text.includes('analyst') || text.includes('associate')) return 'mid';
    
    return 'entry';
  }

  private extractKeywords(text: string): string[] {
    // Enhanced keyword extraction for business/operations roles
    const words = text.toLowerCase().split(/\s+/);
    
    // Business and operations specific keywords
    const businessKeywords = [
      'operations', 'management', 'leadership', 'strategy', 'planning', 'coordination',
      'efficiency', 'optimization', 'improvement', 'analysis', 'reporting', 'metrics',
      'budget', 'cost', 'revenue', 'profit', 'roi', 'kpi', 'dashboard', 'excel',
      'project', 'process', 'workflow', 'procedure', 'policy', 'compliance',
      'team', 'staff', 'training', 'development', 'performance', 'quality',
      'customer', 'client', 'vendor', 'supplier', 'stakeholder', 'communication',
      'negotiation', 'contract', 'procurement', 'sourcing', 'inventory', 'logistics'
    ];
    
    const relevantWords = words.filter(word => 
      word.length > 3 && 
      /^[a-zA-Z]+$/.test(word) &&
      !['with', 'have', 'been', 'work', 'will', 'also', 'this', 'that', 'they', 'them', 'their', 'from', 'into', 'over', 'under', 'about', 'after', 'before'].includes(word) &&
      (businessKeywords.includes(word) || word.length > 6)
    );
    
    return [...new Set(relevantWords)].slice(0, 25);
  }

  private async fetchJobsViaProxy(cvAnalysis: CVAnalysis, filters: any, authToken: string): Promise<JobOpportunity[]> {
    if (!SUPABASE_URL) {
      console.error("Supabase URL is not configured in the frontend.");
      return [];
    }

    const searchKeywords = cvAnalysis.primaryRole;
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
        salary: job.salary_min ? `£${job.salary_min.toLocaleString()}` : 'Not specified',
        type: job.contract_time || 'Full-time',
        posted: new Date(job.created).toLocaleDateString(),
        match: 0,
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
      match: this.calculateMatchScore(job, cvAnalysis)
    })).sort((a, b) => b.match - a.match);
    
    return scoredJobs;
  }

  private calculateMatchScore(job: JobOpportunity, cvAnalysis: CVAnalysis): number {
    let score = 0;
    const jobTitleLower = job.title.toLowerCase();
    const jobDescLower = job.description.toLowerCase();
    
    // Primary role matching (higher weight)
    if (jobTitleLower.includes(cvAnalysis.primaryRole.toLowerCase())) {
      score += 50;
    } else if (cvAnalysis.secondaryRoles.some(role => jobTitleLower.includes(role.toLowerCase()))) {
      score += 35;
    }
    
    // Enhanced skill matching with weighted scoring
    const skillMatches = cvAnalysis.skills.filter(skill => 
      jobDescLower.includes(skill.toLowerCase()) || jobTitleLower.includes(skill.toLowerCase())
    );
    
    // Weight skills by importance and specificity
    skillMatches.forEach(skill => {
      const skillWeight = skill.length > 10 ? 8 : skill.length > 5 ? 5 : 3;
      score += skillWeight;
    });
    score = Math.min(score, score + Math.min(skillMatches.length * 3, 25));
    
    // Seniority matching with more nuanced scoring
    const jobSeniority = this.determineSeniorityFromTitle(job.title);
    if (jobSeniority === cvAnalysis.seniority) {
      score += 25;
    } else if (this.isSeniorityCompatible(jobSeniority, cvAnalysis.seniority)) {
      score += 15;
    } else {
      // Penalty for significant seniority mismatch
      score -= 10;
    }
    
    // Industry matching
    if (cvAnalysis.industries.some(industry => job.industry.toLowerCase().includes(industry))) {
      score += 15;
    }
    
    // Keyword density analysis
    const keywordMatches = cvAnalysis.keywords.filter(keyword => 
      jobDescLower.includes(keyword.toLowerCase())
    ).length;
    score += Math.min(keywordMatches * 2, 15);
    
    // Location preference bonus (if remote or major city)
    if (job.location.toLowerCase().includes('remote') || 
        job.location.toLowerCase().includes('london') ||
        job.location.toLowerCase().includes('manchester')) {
      score += 5;
    }
    
    // Ensure score is within reasonable bounds
    score = Math.max(0, Math.min(score, 100));
    
    // Add small random variation to prevent identical scores
    return Math.min(Math.floor(score * (Math.random() * 0.1 + 0.95)), 99);
  }
  
  private determineSeniorityFromTitle(title: string): 'entry' | 'mid' | 'senior' | 'lead' {
      const lowerTitle = title.toLowerCase();
      
      // Leadership roles
      if (lowerTitle.includes('director') || lowerTitle.includes('head of') || 
          lowerTitle.includes('vp') || lowerTitle.includes('vice president') || 
          lowerTitle.includes('chief') || lowerTitle.includes('lead') || 
          lowerTitle.includes('principal') || lowerTitle.includes('manager')) return 'lead';
      
      // Senior roles
      if (lowerTitle.includes('senior') || lowerTitle.includes('sr.') || 
          lowerTitle.includes('specialist') || lowerTitle.includes('expert') ||
          lowerTitle.includes('supervisor')) return 'senior';
      
      // Entry level roles
      if (lowerTitle.includes('junior') || lowerTitle.includes('entry') || 
          lowerTitle.includes('graduate') || lowerTitle.includes('trainee') ||
          lowerTitle.includes('assistant')) return 'entry';
      
      return 'mid';
  }

  private isSeniorityCompatible(jobSeniority: string, userSeniority: string): boolean {
    const hierarchy = ['entry', 'mid', 'senior', 'lead'];
    const jobIndex = hierarchy.indexOf(jobSeniority);
    const userIndex = hierarchy.indexOf(userSeniority);
    
    return Math.abs(jobIndex - userIndex) <= 1;
  }
}

export class CoverLetterGenerator {
  generateCoverLetter(cvAnalysis: CVAnalysis, job: JobOpportunity, userProfile: any): string {
    const template = this.selectTemplate(job.role);
    
    return template
      .replace('{COMPANY}', job.company)
      .replace('{POSITION}', job.title)
      .replace('{USER_NAME}', userProfile.name || 'Candidate')
      .replace('{PRIMARY_SKILL}', cvAnalysis.skills[0] || 'operations management')
      .replace('{EXPERIENCE}', cvAnalysis.experience.toString())
      .replace('{RELEVANT_SKILLS}', this.getRelevantSkills(cvAnalysis, job))
      .replace('{SPECIFIC_ACHIEVEMENT}', this.generateAchievement(cvAnalysis, job))
      .replace('{COMPANY_VALUE}', this.getCompanyValue(job.company));
  }

  private selectTemplate(role: string): string {
    const templates = {
      'Operations Manager': `Dear Hiring Manager,

I am writing to express my strong interest in the {POSITION} position at {COMPANY}. With {EXPERIENCE} years of experience in operations and business management, and expertise in {PRIMARY_SKILL}, I am excited about the opportunity to contribute to your organization's operational excellence.

In my previous roles, I have {SPECIFIC_ACHIEVEMENT}. My operational expertise in {RELEVANT_SKILLS} aligns perfectly with your requirements, and I am particularly drawn to {COMPANY_VALUE}.

I would welcome the opportunity to discuss how my background in operations management and passion for driving efficiency and process improvement can benefit your organization.

Best regards,
{USER_NAME}`,
    };

    return templates['Operations Manager'];
  }

  private getRelevantSkills(cvAnalysis: CVAnalysis, job: JobOpportunity): string {
    const matchingSkills = cvAnalysis.skills.filter(skill =>
      job.description.toLowerCase().includes(skill.toLowerCase())
    );
    return matchingSkills.slice(0, 4).join(', ') || cvAnalysis.skills.slice(0, 3).join(', ');
  }

  private generateAchievement(cvAnalysis: CVAnalysis, job: JobOpportunity): string {
    const achievements = [
      'successfully led cross-functional teams to deliver complex operational initiatives',
      'improved operational efficiency by 25% through process optimization and lean methodologies',
      'managed multi-million pound budgets while consistently reducing costs by 15-20%',
      'implemented quality management systems that enhanced compliance and reduced errors',
      'developed and executed strategic plans that drove significant business growth',
      'streamlined supply chain operations resulting in improved delivery times and cost savings',
      'led digital transformation initiatives that modernized business processes'
    ];
    return achievements[Math.floor(Math.random() * achievements.length)];
  }

  private getCompanyValue(company: string): string {
    const values = [
      'commitment to operational excellence and continuous improvement',
      'focus on delivering exceptional customer value and satisfaction',
      'dedication to fostering a collaborative and results-driven culture',
      'reputation for innovation and industry leadership',
      'mission to drive sustainable business growth and operational efficiency',
      'commitment to quality, compliance, and best-in-class processes'
    ];
    return values[Math.floor(Math.random() * values.length)];
  }
}
