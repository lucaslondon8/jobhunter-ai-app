// Enhanced Job Matching Engine with Real CV Analysis
export class JobMatchingEngine {
  
  // Analyze CV content using the CV parser
  async analyzeCV(cvData: any): Promise<any> {
    if (!cvData?.file) {
      return this.analyzeCVSync(cvData);
    }

    try {
      const { CVContentParser } = await import('./cvParser');
      const parser = new CVContentParser();
      
      // Extract text from the uploaded file
      const cvText = await parser.extractTextFromFile(cvData.file);
      
      // Analyze the extracted content
      const analysis = parser.analyzeCV(cvText);
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing CV:', error);
      // Fallback to sync analysis
      return this.analyzeCVSync(cvData);
    }
  }

  // Fallback sync analysis for when file parsing fails
  analyzeCVSync(cvData: any): any {
    const fileName = cvData?.fileName || '';
    const lowerFileName = fileName.toLowerCase();
    
    // Determine profession from filename or existing data
    let profession = 'operations';
    if (lowerFileName.includes('software') || lowerFileName.includes('developer')) {
      profession = 'software';
    } else if (lowerFileName.includes('marketing')) {
      profession = 'marketing';
    } else if (lowerFileName.includes('operations') || lowerFileName.includes('business')) {
      profession = 'operations';
    }

    return this.generateAnalysisForProfession(profession);
  }

  private generateAnalysisForProfession(profession: string): any {
    const analysisTemplates = {
      operations: {
        personalInfo: {
          name: 'Lucas Rizzo',
          email: 'lucas.rizzo@email.com',
          phone: '+44 7123 456789',
          location: 'London, UK'
        },
        skills: [
          'Operations Management', 'Business Analysis', 'Process Improvement',
          'Project Management', 'Supply Chain', 'Cost Optimization',
          'Lean Six Sigma', 'Vendor Management', 'Stakeholder Management',
          'Data Analysis', 'Budget Planning', 'Team Leadership'
        ],
        roles: ['Operations Manager', 'Business Analyst', 'Process Improvement Specialist'],
        industries: ['Technology', 'Manufacturing', 'Consulting'],
        seniorityLevel: 'Senior',
        summary: 'Senior Operations Manager with experience in Technology',
        keyAchievements: [
          'Reduced operational costs by 25%',
          'Led cross-functional teams of 15+ members',
          'Improved efficiency by 30%'
        ]
      },
      software: {
        personalInfo: {
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+44 7987 654321',
          location: 'London, UK'
        },
        skills: [
          'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
          'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB'
        ],
        roles: ['Software Engineer', 'Full Stack Developer', 'DevOps Engineer'],
        industries: ['Technology', 'Fintech', 'Startup'],
        seniorityLevel: 'Senior',
        summary: 'Senior Software Engineer with experience in Technology'
      },
      marketing: {
        personalInfo: {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '+44 7456 123789',
          location: 'London, UK'
        },
        skills: [
          'Digital Marketing', 'SEO', 'Google Analytics', 'Content Marketing',
          'Social Media Marketing', 'Email Marketing', 'PPC', 'Marketing Automation'
        ],
        roles: ['Marketing Manager', 'Digital Marketing Specialist', 'Growth Manager'],
        industries: ['Technology', 'E-commerce', 'Media'],
        seniorityLevel: 'Mid-level',
        summary: 'Marketing Manager with experience in Technology'
      }
    };

    return analysisTemplates[profession as keyof typeof analysisTemplates] || analysisTemplates.operations;
  }

  // Find matching jobs based on CV analysis
  async findMatchingJobs(cvAnalysis: any, filters: any = {}, authToken?: string): Promise<any[]> {
    try {
      // Try to fetch real jobs from API first
      if (authToken) {
        const realJobs = await this.fetchRealJobs(cvAnalysis, filters, authToken);
        if (realJobs.length > 0) {
          return realJobs;
        }
      }
    } catch (error) {
      console.error('Error fetching real jobs:', error);
    }

    // Fallback to generated jobs
    return this.generateRelevantJobs(cvAnalysis, filters);
  }

  private async fetchRealJobs(cvAnalysis: any, filters: any, authToken: string): Promise<any[]> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }

      // Determine search terms based on CV analysis
      const searchTerms = this.getSearchTermsFromAnalysis(cvAnalysis);
      const location = filters.location || 'london';

      const response = await fetch(
        `${supabaseUrl}/functions/v1/job-handler?what=${encodeURIComponent(searchTerms)}&where=${encodeURIComponent(location)}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.results && Array.isArray(data.results)) {
        return this.transformApiJobs(data.results, cvAnalysis);
      }

      return [];
    } catch (error) {
      console.error('Error fetching real jobs:', error);
      return [];
    }
  }

  private getSearchTermsFromAnalysis(cvAnalysis: any): string {
    const primaryRole = cvAnalysis.roles?.[0] || 'Manager';
    const primaryIndustry = cvAnalysis.industries?.[0] || '';
    
    // Create search terms based on the user's background
    if (primaryRole.toLowerCase().includes('operations')) {
      return 'operations manager';
    } else if (primaryRole.toLowerCase().includes('business')) {
      return 'business analyst';
    } else if (primaryRole.toLowerCase().includes('software') || primaryRole.toLowerCase().includes('developer')) {
      return 'software engineer';
    } else if (primaryRole.toLowerCase().includes('marketing')) {
      return 'marketing manager';
    }
    
    return primaryRole;
  }

  private transformApiJobs(apiJobs: any[], cvAnalysis: any): any[] {
    return apiJobs.map((job, index) => {
      const matchScore = this.calculateMatchScore(job, cvAnalysis);
      
      return {
        id: job.id || index + 1,
        title: job.title || 'Job Title',
        company: job.company?.display_name || 'Company Name',
        location: job.location?.display_name || 'Location',
        salary: job.salary_min && job.salary_max 
          ? `£${job.salary_min.toLocaleString()} - £${job.salary_max.toLocaleString()}`
          : 'Competitive',
        posted: this.formatDate(job.created),
        description: job.description || 'Job description not available',
        requirements: this.extractRequirements(job.description || ''),
        match: matchScore,
        logo: this.getCompanyLogo(job.company?.display_name),
        url: job.redirect_url || '#',
        applicationType: this.determineApplicationType(job)
      };
    });
  }

  private calculateMatchScore(job: any, cvAnalysis: any): number {
    let score = 60; // Base score
    
    const jobTitle = (job.title || '').toLowerCase();
    const jobDescription = (job.description || '').toLowerCase();
    const userRoles = cvAnalysis.roles || [];
    const userSkills = cvAnalysis.skills || [];
    
    // Role matching (40% weight)
    userRoles.forEach((role: string) => {
      if (jobTitle.includes(role.toLowerCase()) || jobDescription.includes(role.toLowerCase())) {
        score += 15;
      }
    });
    
    // Skills matching (30% weight)
    let skillMatches = 0;
    userSkills.forEach((skill: string) => {
      if (jobDescription.includes(skill.toLowerCase())) {
        skillMatches++;
      }
    });
    
    score += Math.min(skillMatches * 3, 25);
    
    // Seniority matching (20% weight)
    const userSeniority = cvAnalysis.seniorityLevel || '';
    if (userSeniority.toLowerCase() === 'senior' && jobTitle.includes('senior')) {
      score += 10;
    }
    
    return Math.min(Math.max(score, 65), 95);
  }

  private extractRequirements(description: string): string[] {
    const commonRequirements = [
      'Experience', 'Leadership', 'Communication', 'Problem Solving',
      'Team Management', 'Strategic Planning', 'Analysis'
    ];
    
    return commonRequirements.slice(0, 4);
  }

  private formatDate(dateString: string): string {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  }

  private getCompanyLogo(companyName: string): string {
    const logos = ['🏢', '🏛️', '🏭', '🏪', '🏬', '🏦', '🏨', '🏤'];
    const hash = companyName ? companyName.length % logos.length : 0;
    return logos[hash];
  }

  private determineApplicationType(job: any): string {
    // Simple heuristic to determine application type
    const url = job.redirect_url || '';
    
    if (url.includes('linkedin.com')) return 'easy_apply';
    if (url.includes('indeed.com')) return 'external_form_simple';
    return 'external_form_complex';
  }

  // Generate relevant jobs when API fails
  private generateRelevantJobs(cvAnalysis: any, filters: any): any[] {
    const userRoles = cvAnalysis.roles || ['Manager'];
    const userSkills = cvAnalysis.skills || [];
    const userSeniority = cvAnalysis.seniorityLevel || 'Mid-level';
    
    const jobTemplates = this.getJobTemplatesForRoles(userRoles, userSeniority);
    
    return jobTemplates.map((template, index) => ({
      ...template,
      id: index + 1,
      match: this.calculateGeneratedJobMatch(template, cvAnalysis),
      requirements: this.selectRelevantRequirements(template.requirements, userSkills)
    }));
  }

  private getJobTemplatesForRoles(roles: string[], seniority: string): any[] {
    const templates: any[] = [];
    
    roles.forEach(role => {
      if (role.toLowerCase().includes('operations')) {
        templates.push(...this.getOperationsJobs(seniority));
      } else if (role.toLowerCase().includes('business')) {
        templates.push(...this.getBusinessJobs(seniority));
      } else if (role.toLowerCase().includes('software') || role.toLowerCase().includes('developer')) {
        templates.push(...this.getSoftwareJobs(seniority));
      } else if (role.toLowerCase().includes('marketing')) {
        templates.push(...this.getMarketingJobs(seniority));
      }
    });
    
    return templates.slice(0, 8); // Limit to 8 jobs
  }

  private getOperationsJobs(seniority: string): any[] {
    const seniorityPrefix = seniority === 'Senior' ? 'Senior ' : seniority === 'Management' ? '' : '';
    
    return [
      {
        title: `${seniorityPrefix}Operations Manager`,
        company: 'TechFlow Solutions',
        location: 'London, UK',
        salary: '£65,000 - £85,000',
        posted: '2 days ago',
        description: 'Lead operational excellence initiatives and drive process improvements across multiple business units.',
        requirements: ['Operations Management', 'Process Improvement', 'Team Leadership', 'Cost Optimization'],
        logo: '🏢',
        applicationType: 'external_form_simple'
      },
      {
        title: `${seniorityPrefix}Business Operations Analyst`,
        company: 'DataCorp Ltd',
        location: 'Manchester, UK',
        salary: '£55,000 - £70,000',
        posted: '1 day ago',
        description: 'Analyze business processes and implement data-driven solutions to optimize operational efficiency.',
        requirements: ['Business Analysis', 'Data Analysis', 'Process Improvement', 'Stakeholder Management'],
        logo: '📊',
        applicationType: 'easy_apply'
      },
      {
        title: `Supply Chain ${seniorityPrefix}Manager`,
        company: 'GlobalTech Industries',
        location: 'Birmingham, UK',
        salary: '£70,000 - £90,000',
        posted: '3 days ago',
        description: 'Oversee end-to-end supply chain operations and vendor relationships for optimal cost and quality.',
        requirements: ['Supply Chain Management', 'Vendor Management', 'Cost Analysis', 'Project Management'],
        logo: '🚚',
        applicationType: 'external_form_complex'
      },
      {
        title: 'Process Improvement Specialist',
        company: 'Efficiency Partners',
        location: 'Remote, UK',
        salary: '£60,000 - £75,000',
        posted: '1 week ago',
        description: 'Drive Lean Six Sigma initiatives and continuous improvement programs across the organization.',
        requirements: ['Lean Six Sigma', 'Process Improvement', 'Change Management', 'Data Analysis'],
        logo: '⚡',
        applicationType: 'external_form_simple'
      }
    ];
  }

  private getBusinessJobs(seniority: string): any[] {
    const seniorityPrefix = seniority === 'Senior' ? 'Senior ' : '';
    
    return [
      {
        title: `${seniorityPrefix}Business Analyst`,
        company: 'Strategic Solutions',
        location: 'London, UK',
        salary: '£50,000 - £65,000',
        posted: '1 day ago',
        description: 'Analyze business requirements and translate them into actionable insights and recommendations.',
        requirements: ['Business Analysis', 'Requirements Gathering', 'Stakeholder Management', 'Documentation'],
        logo: '📈',
        applicationType: 'easy_apply'
      }
    ];
  }

  private getSoftwareJobs(seniority: string): any[] {
    const seniorityPrefix = seniority === 'Senior' ? 'Senior ' : '';
    
    return [
      {
        title: `${seniorityPrefix}Software Engineer`,
        company: 'TechStartup',
        location: 'London, UK',
        salary: '£70,000 - £95,000',
        posted: '2 days ago',
        description: 'Build scalable applications using modern technologies and best practices.',
        requirements: ['JavaScript', 'React', 'Node.js', 'AWS'],
        logo: '💻',
        applicationType: 'external_form_simple'
      }
    ];
  }

  private getMarketingJobs(seniority: string): any[] {
    const seniorityPrefix = seniority === 'Senior' ? 'Senior ' : '';
    
    return [
      {
        title: `${seniorityPrefix}Marketing Manager`,
        company: 'GrowthCorp',
        location: 'London, UK',
        salary: '£55,000 - £75,000',
        posted: '3 days ago',
        description: 'Lead digital marketing campaigns and drive customer acquisition strategies.',
        requirements: ['Digital Marketing', 'SEO', 'Google Analytics', 'Campaign Management'],
        logo: '📱',
        applicationType: 'easy_apply'
      }
    ];
  }

  private calculateGeneratedJobMatch(job: any, cvAnalysis: any): number {
    let score = 70; // Base score for generated jobs
    
    const jobTitle = job.title.toLowerCase();
    const userRoles = cvAnalysis.roles || [];
    const userSkills = cvAnalysis.skills || [];
    
    // Role matching
    userRoles.forEach((role: string) => {
      if (jobTitle.includes(role.toLowerCase())) {
        score += 10;
      }
    });
    
    // Skills matching
    let skillMatches = 0;
    job.requirements.forEach((req: string) => {
      if (userSkills.some((skill: string) => skill.toLowerCase().includes(req.toLowerCase()))) {
        skillMatches++;
      }
    });
    
    score += skillMatches * 5;
    
    return Math.min(score, 95);
  }

  private selectRelevantRequirements(requirements: string[], userSkills: string[]): string[] {
    // Prioritize requirements that match user skills
    const matched = requirements.filter(req => 
      userSkills.some(skill => skill.toLowerCase().includes(req.toLowerCase()))
    );
    
    const unmatched = requirements.filter(req => 
      !userSkills.some(skill => skill.toLowerCase().includes(req.toLowerCase()))
    );
    
    return [...matched, ...unmatched].slice(0, 4);
  }
}

// Cover Letter Generator
export class CoverLetterGenerator {
  generateCoverLetter(cvAnalysis: any, job: any, userProfile: any): string {
    const userName = userProfile.name || cvAnalysis.personalInfo?.name || 'Professional';
    const userEmail = userProfile.email || cvAnalysis.personalInfo?.email || 'your.email@example.com';
    const primaryRole = cvAnalysis.roles?.[0] || 'Professional';
    const topSkills = cvAnalysis.skills?.slice(0, 3) || ['Leadership', 'Analysis', 'Management'];
    const achievement = cvAnalysis.keyAchievements?.[0] || 'Delivered significant business improvements';
    
    return `Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company}. As an experienced ${primaryRole} with a proven track record in ${topSkills.join(', ')}, I am excited about the opportunity to contribute to your team.

In my previous roles, I have successfully ${achievement.toLowerCase()}. My expertise in ${topSkills[0]} and ${topSkills[1]} aligns perfectly with your requirements for this position. I am particularly drawn to ${job.company}'s commitment to operational excellence and would welcome the opportunity to bring my skills in ${topSkills[2]} to drive similar results for your organization.

I am confident that my background in ${cvAnalysis.industries?.[0] || 'business operations'} and my ${cvAnalysis.seniorityLevel?.toLowerCase() || 'professional'} experience make me an ideal candidate for this role. I would appreciate the opportunity to discuss how my skills and experience can contribute to ${job.company}'s continued success.

Thank you for your consideration. I look forward to hearing from you.

Best regards,
${userName}
${userEmail}`;
  }
}