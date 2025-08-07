// Advanced job matching algorithm with role-based prioritization
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

export class JobMatchingEngine {
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
    // In a real implementation, this would parse PDF/DOC files
    // For now, we'll use mock data or any text fields available
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
    
    // Fallback: count job positions mentioned
    const jobIndicators = (text.match(/(?:worked|employed|position|role|job)/gi) || []).length;
    return Math.min(jobIndicators * 2, 10);
  }

  private identifyRoles(text: string, skills: string[]): string[] {
    const roleScores: { [key: string]: number } = {};
    
    Object.entries(this.roleKeywords).forEach(([role, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          score += keyword.length > 5 ? 2 : 1; // Longer keywords get higher weight
        }
      });
      
      // Bonus for skill matches
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
    
    return [...new Set(technicalWords)].slice(0, 20);
  }

  async findMatchingJobs(cvAnalysis: CVAnalysis, filters: any = {}): Promise<JobOpportunity[]> {
    // Generate jobs based on primary role first, then secondary roles
    const primaryJobs = await this.generateJobsForRole(cvAnalysis.primaryRole, cvAnalysis, 8);
    const secondaryJobs = await this.generateJobsForRoles(cvAnalysis.secondaryRoles, cvAnalysis, 4);
    
    let allJobs = [...primaryJobs, ...secondaryJobs];
    
    // Apply filters
    allJobs = this.applyFilters(allJobs, filters);
    
    // Calculate match scores and sort
    allJobs = allJobs.map(job => ({
      ...job,
      match: this.calculateMatchScore(job, cvAnalysis)
    })).sort((a, b) => b.match - a.match);
    
    return allJobs.slice(0, 20); // Return top 20 matches
  }

  private async generateJobsForRole(role: string, cvAnalysis: CVAnalysis, count: number): Promise<JobOpportunity[]> {
    const jobs: JobOpportunity[] = [];
    const companies = ['TechCorp Inc.', 'DataFlow Solutions', 'CloudTech Systems', 'InnovateLab', 'NextGen Software'];
    const locations = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Remote', 'Boston, MA'];
    
    for (let i = 0; i < count; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const seniority = this.adjustSeniorityForRole(cvAnalysis.seniority);
      
      jobs.push({
        id: Date.now() + Math.random(),
        title: `${seniority} ${role}`,
        company,
        location,
        salary: this.generateSalaryRange(cvAnalysis.seniority),
        type: 'Full-time',
        posted: this.generatePostedTime(),
        match: 0, // Will be calculated later
        description: this.generateJobDescription(role, cvAnalysis),
        requirements: this.generateRequirements(role, cvAnalysis),
        logo: this.getCompanyLogo(company),
        role,
        industry: cvAnalysis.industries[0] || 'Technology',
        seniority: cvAnalysis.seniority,
        url: `https://example.com/jobs/${Date.now()}`
      });
    }
    
    return jobs;
  }

  private async generateJobsForRoles(roles: string[], cvAnalysis: CVAnalysis, totalCount: number): Promise<JobOpportunity[]> {
    const jobs: JobOpportunity[] = [];
    const jobsPerRole = Math.ceil(totalCount / Math.max(roles.length, 1));
    
    for (const role of roles) {
      const roleJobs = await this.generateJobsForRole(role, cvAnalysis, jobsPerRole);
      jobs.push(...roleJobs);
    }
    
    return jobs.slice(0, totalCount);
  }

  private applyFilters(jobs: JobOpportunity[], filters: any): JobOpportunity[] {
    return jobs.filter(job => {
      // Salary filter
      if (filters.salary) {
        const jobSalary = this.extractSalaryNumber(job.salary);
        const [min, max] = this.parseSalaryFilter(filters.salary);
        if (jobSalary < min || jobSalary > max) return false;
      }
      
      // Location filter
      if (filters.location && filters.location !== 'all') {
        if (filters.location === 'remote' && !job.location.toLowerCase().includes('remote')) return false;
        if (filters.location !== 'remote' && !job.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      }
      
      // Job type filter
      if (filters.jobType && filters.jobType !== 'all') {
        if (!job.type.toLowerCase().includes(filters.jobType.toLowerCase())) return false;
      }
      
      // Experience filter
      if (filters.experience && filters.experience !== 'all') {
        const jobSeniority = job.title.toLowerCase();
        if (filters.experience === 'entry' && !jobSeniority.includes('junior') && !jobSeniority.includes('entry')) return false;
        if (filters.experience === 'mid' && !jobSeniority.includes('mid') && !jobSeniority.includes('intermediate')) return false;
        if (filters.experience === 'senior' && !jobSeniority.includes('senior')) return false;
        if (filters.experience === 'lead' && !jobSeniority.includes('lead') && !jobSeniority.includes('principal')) return false;
      }
      
      return true;
    });
  }

  private calculateMatchScore(job: JobOpportunity, cvAnalysis: CVAnalysis): number {
    let score = 0;
    
    // Role match (40% weight)
    if (job.role === cvAnalysis.primaryRole) score += 40;
    else if (cvAnalysis.secondaryRoles.includes(job.role)) score += 25;
    
    // Skills match (30% weight)
    const skillMatches = job.requirements.filter(req => 
      cvAnalysis.skills.some(skill => 
        skill.toLowerCase().includes(req.toLowerCase()) || 
        req.toLowerCase().includes(skill.toLowerCase())
      )
    ).length;
    score += Math.min(skillMatches * 5, 30);
    
    // Seniority match (20% weight)
    if (job.seniority === cvAnalysis.seniority) score += 20;
    else if (this.isSeniorityCompatible(job.seniority, cvAnalysis.seniority)) score += 10;
    
    // Industry match (10% weight)
    if (cvAnalysis.industries.includes(job.industry.toLowerCase())) score += 10;
    
    return Math.min(score, 100);
  }

  private adjustSeniorityForRole(seniority: string): string {
    const variations = {
      'entry': ['Junior', 'Entry Level', ''],
      'mid': ['Mid Level', 'Intermediate', ''],
      'senior': ['Senior', 'Sr.', ''],
      'lead': ['Lead', 'Principal', 'Staff']
    };
    
    const options = variations[seniority as keyof typeof variations] || [''];
    return options[Math.floor(Math.random() * options.length)];
  }

  private generateSalaryRange(seniority: string): string {
    const ranges = {
      'entry': ['$60k - $80k', '$50k - $70k', '$65k - $85k'],
      'mid': ['$80k - $120k', '$90k - $130k', '$85k - $115k'],
      'senior': ['$120k - $160k', '$130k - $170k', '$140k - $180k'],
      'lead': ['$160k - $220k', '$180k - $250k', '$170k - $230k']
    };
    
    const options = ranges[seniority as keyof typeof ranges] || ranges.mid;
    return options[Math.floor(Math.random() * options.length)];
  }

  private generatePostedTime(): string {
    const times = ['2 hours ago', '1 day ago', '2 days ago', '3 days ago', '1 week ago', '2 weeks ago'];
    return times[Math.floor(Math.random() * times.length)];
  }

  private generateJobDescription(role: string, cvAnalysis: CVAnalysis): string {
    const descriptions = {
      'Software Engineer': `Join our innovative team building next-generation applications using ${cvAnalysis.skills.slice(0, 3).join(', ')}. Work on challenging problems and scale our platform to millions of users.`,
      'Frontend Developer': `Create beautiful, responsive user interfaces using modern frameworks. Collaborate with designers and backend engineers to deliver exceptional user experiences.`,
      'Backend Developer': `Build robust APIs and scalable microservices architecture. Work with databases, cloud services, and ensure high performance and reliability.`,
      'Full Stack Developer': `Work across the entire technology stack, from user interfaces to backend services. Take ownership of features from conception to deployment.`,
      'Data Scientist': `Analyze large datasets to extract meaningful insights and build predictive models. Work with machine learning algorithms and statistical methods.`
    };
    
    return descriptions[role as keyof typeof descriptions] || 'Exciting opportunity to work with cutting-edge technology and make a real impact.';
  }

  private generateRequirements(role: string, cvAnalysis: CVAnalysis): string[] {
    const baseRequirements = {
      'Software Engineer': ['JavaScript', 'Python', 'Git', 'Agile'],
      'Frontend Developer': ['React', 'HTML/CSS', 'JavaScript', 'Responsive Design'],
      'Backend Developer': ['Node.js', 'SQL', 'API Design', 'Cloud Services'],
      'Full Stack Developer': ['React', 'Node.js', 'Database Design', 'RESTful APIs'],
      'Data Scientist': ['Python', 'SQL', 'Machine Learning', 'Statistics']
    };
    
    const requirements = baseRequirements[role as keyof typeof baseRequirements] || ['Programming', 'Problem Solving'];
    
    // Add user's skills that match
    const matchingSkills = cvAnalysis.skills.filter(skill => 
      !requirements.some(req => req.toLowerCase().includes(skill.toLowerCase()))
    ).slice(0, 2);
    
    return [...requirements, ...matchingSkills];
  }

  private getCompanyLogo(company: string): string {
    const logos: { [key: string]: string } = {
      'TechCorp Inc.': '🚀',
      'DataFlow Solutions': '💻',
      'CloudTech Systems': '☁️',
      'InnovateLab': '🔬',
      'NextGen Software': '⚡'
    };
    
    return logos[company] || '🏢';
  }

  private extractSalaryNumber(salary: string): number {
    const match = salary.match(/\$(\d+)k/);
    return match ? parseInt(match[1]) * 1000 : 0;
  }

  private parseSalaryFilter(filter: string): [number, number] {
    const ranges: { [key: string]: [number, number] } = {
      '0-50k': [0, 50000],
      '50k-100k': [50000, 100000],
      '100k-150k': [100000, 150000],
      '150k+': [150000, 1000000]
    };
    
    return ranges[filter] || [0, 1000000];
  }

  private isSeniorityCompatible(jobSeniority: string, userSeniority: string): boolean {
    const hierarchy = ['entry', 'mid', 'senior', 'lead'];
    const jobIndex = hierarchy.indexOf(jobSeniority);
    const userIndex = hierarchy.indexOf(userSeniority);
    
    return Math.abs(jobIndex - userIndex) <= 1;
  }
}

// Cover letter generation service
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

      'Frontend Developer': `Dear Hiring Manager,

I am excited to apply for the {POSITION} role at {COMPANY}. As a frontend developer with {EXPERIENCE} years of experience specializing in {PRIMARY_SKILL}, I am passionate about creating exceptional user experiences.

My expertise includes {RELEVANT_SKILLS}, and I have {SPECIFIC_ACHIEVEMENT}. I am particularly impressed by {COMPANY_VALUE} and would love to contribute to your user-focused initiatives.

I look forward to discussing how my frontend development skills and eye for design can help enhance your digital products.

Sincerely,
{USER_NAME}`,

      'Backend Developer': `Dear Hiring Manager,

I am writing to apply for the {POSITION} position at {COMPANY}. With {EXPERIENCE} years of backend development experience and strong skills in {PRIMARY_SKILL}, I am excited about building scalable systems for your platform.

My technical background includes {RELEVANT_SKILLS}, and I have successfully {SPECIFIC_ACHIEVEMENT}. Your company's focus on {COMPANY_VALUE} resonates with my passion for building robust, efficient backend solutions.

I would appreciate the opportunity to discuss how my backend expertise can contribute to your technical infrastructure.

Best regards,
{USER_NAME}`
    };

    return templates[role as keyof typeof templates] || templates['Software Engineer'];
  }

  private getRelevantSkills(cvAnalysis: CVAnalysis, job: JobOpportunity): string {
    const matchingSkills = cvAnalysis.skills.filter(skill =>
      job.requirements.some(req => 
        req.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(req.toLowerCase())
      )
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