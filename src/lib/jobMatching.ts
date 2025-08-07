// src/lib/jobMatching.ts

// --- Environment Variables ---
const ADZUNA_APP_ID = import.meta.env.VITE_ADZUNA_APP_ID;
const ADZUNA_APP_KEY = import.meta.env.VITE_ADZUNA_APP_KEY;

// --- !! NEW DEBUGGING LINE !! ---
console.log("Adzuna Keys Loaded:", { ADZUNA_APP_ID, ADZUNA_APP_KEY });
// --- !! NEW DEBUGGING LINE !! ---


// --- Interfaces ---
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
}

// --- Main Job Matching Engine Class ---
export class JobMatchingEngine {
  // --- CV Analysis (No changes here) ---
  private roleKeywords = {
    'Software Engineer': ['software', 'engineer', 'developer', 'programming', 'coding', 'javascript', 'python', 'java', 'react', 'node'],
    'Frontend Developer': ['frontend', 'front-end', 'react', 'vue', 'angular', 'html', 'css', 'javascript', 'ui', 'ux'],
    'Backend Developer': ['backend', 'back-end', 'api', 'server', 'database', 'node.js', 'python', 'java', 'sql', 'microservices'],
    'Full Stack Developer': ['full stack', 'fullstack', 'full-stack', 'frontend', 'backend', 'react', 'node', 'javascript'],
    'Data Scientist': ['data science', 'machine learning', 'python', 'r', 'statistics', 'analytics', 'ai', 'tensorflow'],
    'DevOps Engineer': ['devops', 'aws', 'docker', 'kubernetes', 'ci/cd', 'jenkins', 'terraform', 'cloud'],
    'Product Manager': ['product manager', 'product', 'roadmap', 'strategy', 'stakeholder', 'agile', 'scrum'],
    'UI/UX Designer': ['ui', 'ux', 'design', 'figma', 'sketch', 'adobe', 'user experience', 'user interface'],
    'QA Engineer': ['qa', 'quality assurance', 'testing', 'automation', 'selenium', 'cypress', 'test'],
    'Mobile Developer': ['mobile', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin']
  };

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
    const commonSkills = [
      'javascript', 'python', 'java', 'react', 'node.js', 'angular', 'vue',
      'html', 'css', 'sql', 'mongodb', 'postgresql', 'aws', 'docker',
      'kubernetes', 'git', 'agile', 'scrum', 'figma', 'sketch', 'photoshop'
    ];
    
    return commonSkills.filter(skill => text.includes(skill.toLowerCase()));
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
          score += keyword.length > 5 ? 2 : 1;
        }
      });
      skills.forEach(skill => {
        if (keywords.some(keyword => keyword.includes(skill) || skill.includes(keyword))) {
          score += 3;
        }
      });
      if (score > 0) roleScores[role] = score;
    });
    
    return Object.entries(roleScores)
      .sort(([,a], [,b]) => b - a)
      .map(([role]) => role);
  }

  private identifyIndustries(text: string): string[] {
    const industries = ['fintech', 'healthcare', 'e-commerce', 'saas', 'gaming', 'education', 'media'];
    return industries.filter(industry => text.includes(industry));
  }

  private determineSeniority(experience: number, text: string): 'entry' | 'mid' | 'senior' | 'lead' {
    if (text.includes('lead') || text.includes('principal') || text.includes('architect')) return 'lead';
    if (experience >= 7 || text.includes('senior')) return 'senior';
    if (experience >= 3 || text.includes('mid')) return 'mid';
    return 'entry';
  }

  private extractKeywords(text: string): string[] {
    const words = text.split(/\s+/);
    const technicalWords = words.filter(word => 
      word.length > 3 && 
      /^[a-zA-Z]+$/.test(word) &&
      !['with', 'have', 'been', 'work', 'team', 'project'].includes(word)
    );
    return [...new Set(technicalWords)].slice(0, 2);
  }

  // --- Real Job Fetching Logic ---
  private async fetchJobsFromAdzuna(cvAnalysis: CVAnalysis, filters: any): Promise<JobOpportunity[]> {
    if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
      console.error("Adzuna API credentials are not configured.");
      return [];
    }

    const searchKeywords = [cvAnalysis.primaryRole, ...cvAnalysis.skills.slice(0, 3)].join(' ');
    const searchLocation = filters.location && filters.location !== 'all' ? filters.location : 'United Kingdom';

    const params = new URLSearchParams({
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_APP_KEY,
      results_per_page: '20',
      what: searchKeywords,
      where: searchLocation,
      content_type: 'application/json'
    });

    try {
      const response = await fetch(`https://api.adzuna.com/v1/api/jobs/gb/search/1?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Adzuna API request failed with status ${response.status}`);
      }
      const data = await response.json();

      // Map API response to our JobOpportunity interface
      return data.results.map((job: any): JobOpportunity => ({
        id: job.id,
        title: job.title,
        company: job.company.display_name,
        location: job.location.display_name,
        salary: job.salary_min ? `$${job.salary_min}` : 'Not specified',
        type: job.contract_time || 'Full-time',
        posted: new Date(job.created).toLocaleDateString(),
        match: 0, // Will be calculated later
        description: job.description,
        requirements: [job.category.label], // Adzuna provides category, not a list of requirements
        logo: '🏢', // Default logo
        role: job.category.label,
        industry: job.category.tag,
        seniority: this.determineSeniorityFromTitle(job.title),
        url: job.redirect_url,
      }));
    } catch (error) {
      console.error("Error fetching jobs from Adzuna:", error);
      return [];
    }
  }

  async findMatchingJobs(cvAnalysis: CVAnalysis, filters: any = {}): Promise<JobOpportunity[]> {
    const fetchedJobs = await this.fetchJobsFromAdzuna(cvAnalysis, filters);

    if (!fetchedJobs.length) {
      return [];
    }
    
    // Calculate match scores and sort
    const scoredJobs = fetchedJobs.map(job => ({
      ...job,
      match: this.calculateMatchScore(job, cvAnalysis)
    })).sort((a, b) => b.match - a.match);
    
    return scoredJobs;
  }

  private calculateMatchScore(job: JobOpportunity, cvAnalysis: CVAnalysis): number {
    let score = 0;
    const jobTitleLower = job.title.toLowerCase();
    
    // Role match (40% weight)
    if (jobTitleLower.includes(cvAnalysis.primaryRole.toLowerCase())) {
      score += 40;
    } else if (cvAnalysis.secondaryRoles.some(role => jobTitleLower.includes(role.toLowerCase()))) {
      score += 25;
    }
    
    // Skills match (30% weight) - Check against job description
    const skillMatches = cvAnalysis.skills.filter(skill => 
      job.description.toLowerCase().includes(skill.toLowerCase())
    ).length;
    score += Math.min(skillMatches * 5, 30);
    
    // Seniority match (20% weight)
    const jobSeniority = this.determineSeniorityFromTitle(job.title);
    if (jobSeniority === cvAnalysis.seniority) {
      score += 20;
    } else if (this.isSeniorityCompatible(jobSeniority, cvAnalysis.seniority)) {
      score += 10;
    }
    
    // Industry match (10% weight)
    if (cvAnalysis.industries.some(industry => job.industry.toLowerCase().includes(industry))) {
      score += 10;
    }
    
    return Math.min(Math.floor(score * (Math.random() * 0.2 + 0.9)), 99); // Add a little randomness and cap at 99
  }
  
  private determineSeniorityFromTitle(title: string): 'entry' | 'mid' | 'senior' | 'lead' {
      const lowerTitle = title.toLowerCase();
      if (lowerTitle.includes('lead') || lowerTitle.includes('principal') || lowerTitle.includes('staff') || lowerTitle.includes('architect')) return 'lead';
      if (lowerTitle.includes('senior') || lowerTitle.includes('sr.')) return 'senior';
      if (lowerTitle.includes('junior') || lowerTitle.includes('entry') || lowerTitle.includes('graduate')) return 'entry';
      return 'mid';
  }

  private isSeniorityCompatible(jobSeniority: string, userSeniority: string): boolean {
    const hierarchy = ['entry', 'mid', 'senior', 'lead'];
    const jobIndex = hierarchy.indexOf(jobSeniority);
    const userIndex = hierarchy.indexOf(userSeniority);
    
    return Math.abs(jobIndex - userIndex) <= 1;
  }
}

// --- Cover Letter Generator (No changes here) ---
export class CoverLetterGenerator {
  generateCoverLetter(cvAnalysis: CVAnalysis, job: JobOpportunity, userProfile: any): string {
    const template = this.selectTemplate(job.role);
    
    return template
      .replace('{COMPANY}', job.company)
      .replace('{POSITION}', job.title)
      .replace('{USER_NAME}', userProfile.name || 'Candidate')
      .replace('{PRIMARY_SKILL}', cvAnalysis.skills[0] || 'programming')
      .replace('{EXPERIENCE}', cvAnalysis.experience.toString())
      .replace('{RELEVANT_SKILLS}', this.getRelevantSkills(cvAnalysis, job))
      .replace('{SPECIFIC_ACHIEVEMENT}', this.generateAchievement(cvAnalysis, job))
      .replace('{COMPANY_VALUE}', this.getCompanyValue(job.company));
  }

  private selectTemplate(role: string): string {
    const templates = {
      'Software Engineer': `Dear Hiring Manager,

I am writing to express my strong interest in the {POSITION} position at {COMPANY}. With {EXPERIENCE} years of experience in software development and expertise in {PRIMARY_SKILL}, I am excited about the opportunity to contribute to your innovative team.

In my previous roles, I have {SPECIFIC_ACHIEVEMENT}. My technical skills in {RELEVANT_SKILLS} align perfectly with your requirements, and I am particularly drawn to {COMPANY_VALUE}.

I would welcome the opportunity to discuss how my background in software engineering and passion for creating robust, scalable solutions can benefit your team.

Best regards,
{USER_NAME}`,

      // Add other templates if needed...
    };

    return templates['Software Engineer']; // Default template
  }

  private getRelevantSkills(cvAnalysis: CVAnalysis, job: JobOpportunity): string {
    const matchingSkills = cvAnalysis.skills.filter(skill =>
      job.description.toLowerCase().includes(skill.toLowerCase())
    );
    return matchingSkills.slice(0, 4).join(', ') || cvAnalysis.skills.slice(0, 3).join(', ');
  }

  private generateAchievement(cvAnalysis: CVAnalysis, job: JobOpportunity): string {
    const achievements = [
      'successfully delivered multiple high-impact projects',
      'improved system performance by implementing efficient solutions',
      'collaborated with cross-functional teams to deliver quality software',
      'mentored junior developers and contributed to team growth',
      'implemented best practices that enhanced code quality and maintainability'
    ];
    return achievements[Math.floor(Math.random() * achievements.length)];
  }

  private getCompanyValue(company: string): string {
    const values = [
      'commitment to innovation and technical excellence',
      'focus on creating impactful solutions',
      'dedication to fostering a collaborative work environment',
      'reputation for building cutting-edge technology',
      'mission to solve complex technical challenges'
    ];
    return values[Math.floor(Math.random() * values.length)];
  }
}
