// Advanced CV Content Parser and Analyzer
export class CVContentParser {
  
  // Extract text content from uploaded file
  async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          
          if (file.type === 'application/pdf') {
            // For PDF files - in a real implementation, you'd use pdf-parse or similar
            // For now, we'll simulate PDF text extraction
            const text = await this.simulatePDFExtraction(file.name, arrayBuffer);
            resolve(text);
          } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
            // For Word documents - in real implementation, use mammoth.js or similar
            const text = await this.simulateWordExtraction(file.name, arrayBuffer);
            resolve(text);
          } else {
            // For text files
            const text = new TextDecoder().decode(arrayBuffer);
            resolve(text);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  // Simulate PDF text extraction (in real app, use pdf-parse library)
  private async simulatePDFExtraction(fileName: string, buffer: ArrayBuffer): Promise<string> {
    // Simulate realistic CV content based on common patterns
    // In production, this would use actual PDF parsing libraries
    
    const sampleCVs = {
      operations: `
        LUCAS RIZZO
        Operations Manager | Business Analyst
        
        PROFESSIONAL EXPERIENCE
        
        Senior Operations Manager - TechCorp Ltd (2020-2024)
        • Led cross-functional teams of 15+ members to optimize supply chain operations
        • Implemented Lean Six Sigma methodologies, reducing operational costs by 25%
        • Managed vendor relationships and procurement processes for $2M+ annual budget
        • Developed KPI dashboards and performance metrics for executive reporting
        • Streamlined warehouse operations, improving efficiency by 30%
        
        Business Operations Analyst - GlobalTech Inc (2018-2020)
        • Conducted business process analysis and identified improvement opportunities
        • Created financial models and cost-benefit analyses for strategic initiatives
        • Collaborated with stakeholders across finance, IT, and operations departments
        • Implemented ERP system optimization, reducing processing time by 40%
        
        SKILLS
        Operations Management, Supply Chain Optimization, Lean Six Sigma, Process Improvement,
        Vendor Management, Cost Analysis, Budget Planning, Stakeholder Management,
        ERP Systems, Data Analysis, Excel Advanced, PowerBI, Project Management,
        Team Leadership, Performance Metrics, Warehouse Management
        
        EDUCATION
        MBA in Operations Management - London Business School
        BSc Business Administration - University of Manchester
        
        CERTIFICATIONS
        Lean Six Sigma Black Belt
        Project Management Professional (PMP)
        Supply Chain Operations Reference (SCOR)
      `,
      
      software: `
        JOHN SMITH
        Senior Software Engineer | Full Stack Developer
        
        PROFESSIONAL EXPERIENCE
        
        Senior Software Engineer - TechStartup (2021-2024)
        • Developed scalable web applications using React, Node.js, and TypeScript
        • Built microservices architecture handling 1M+ daily requests
        • Implemented CI/CD pipelines using Docker, Kubernetes, and AWS
        • Led code reviews and mentored junior developers
        • Optimized database queries, improving performance by 60%
        
        Full Stack Developer - WebCorp (2019-2021)
        • Created responsive web applications using JavaScript, HTML5, CSS3
        • Developed RESTful APIs and integrated third-party services
        • Worked with PostgreSQL, MongoDB, and Redis databases
        • Implemented automated testing with Jest and Cypress
        
        SKILLS
        JavaScript, TypeScript, React, Node.js, Python, Java, HTML5, CSS3,
        AWS, Docker, Kubernetes, PostgreSQL, MongoDB, Redis, Git,
        Jest, Cypress, Agile, Scrum, REST APIs, GraphQL, Microservices
        
        EDUCATION
        BSc Computer Science - Imperial College London
        
        CERTIFICATIONS
        AWS Certified Solutions Architect
        Google Cloud Professional Developer
      `,
      
      marketing: `
        SARAH JOHNSON
        Digital Marketing Manager | Growth Specialist
        
        PROFESSIONAL EXPERIENCE
        
        Digital Marketing Manager - GrowthCorp (2020-2024)
        • Managed multi-channel marketing campaigns with $500K+ annual budget
        • Increased organic traffic by 150% through SEO optimization strategies
        • Led social media marketing across LinkedIn, Twitter, and Instagram
        • Implemented marketing automation workflows, improving lead conversion by 40%
        • Analyzed campaign performance using Google Analytics and HubSpot
        
        Marketing Specialist - StartupXYZ (2018-2020)
        • Created content marketing strategies and managed blog with 50K+ monthly visitors
        • Executed email marketing campaigns with 25% open rates
        • Managed Google Ads and Facebook Ads with ROAS of 4:1
        • Collaborated with design team on brand identity and creative assets
        
        SKILLS
        Digital Marketing, SEO, SEM, Google Analytics, Google Ads, Facebook Ads,
        Content Marketing, Email Marketing, Social Media Marketing, HubSpot,
        Marketing Automation, A/B Testing, Conversion Optimization, Brand Management,
        Adobe Creative Suite, Canva, Hootsuite, Mailchimp
        
        EDUCATION
        BA Marketing - University of Edinburgh
        
        CERTIFICATIONS
        Google Analytics Certified
        Google Ads Certified
        HubSpot Content Marketing Certified
      `
    };

    // Determine CV type based on filename or content patterns
    const lowerFileName = fileName.toLowerCase();
    
    if (lowerFileName.includes('operations') || lowerFileName.includes('business')) {
      return sampleCVs.operations;
    } else if (lowerFileName.includes('software') || lowerFileName.includes('developer') || lowerFileName.includes('engineer')) {
      return sampleCVs.software;
    } else if (lowerFileName.includes('marketing') || lowerFileName.includes('growth')) {
      return sampleCVs.marketing;
    }
    
    // Default to operations for this demo
    return sampleCVs.operations;
  }

  // Simulate Word document extraction
  private async simulateWordExtraction(fileName: string, buffer: ArrayBuffer): Promise<string> {
    // Similar to PDF extraction but for Word docs
    return this.simulatePDFExtraction(fileName, buffer);
  }

  // Parse and analyze CV content
  analyzeCV(cvText: string): CVAnalysis {
    const analysis: CVAnalysis = {
      personalInfo: this.extractPersonalInfo(cvText),
      experience: this.extractExperience(cvText),
      skills: this.extractSkills(cvText),
      education: this.extractEducation(cvText),
      certifications: this.extractCertifications(cvText),
      roles: this.identifyRoles(cvText),
      industries: this.identifyIndustries(cvText),
      seniorityLevel: this.determineSeniorityLevel(cvText),
      keyAchievements: this.extractAchievements(cvText),
      summary: this.generateSummary(cvText)
    };

    return analysis;
  }

  private extractPersonalInfo(text: string): PersonalInfo {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex = /(\+?[\d\s\-\(\)]{10,})/;
    
    return {
      name: lines[0] || 'Unknown',
      email: text.match(emailRegex)?.[0] || '',
      phone: text.match(phoneRegex)?.[0] || '',
      location: this.extractLocation(text)
    };
  }

  private extractLocation(text: string): string {
    const locationKeywords = ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Bristol', 'Leeds', 'Liverpool', 'UK', 'United Kingdom'];
    for (const location of locationKeywords) {
      if (text.includes(location)) {
        return location;
      }
    }
    return '';
  }

  private extractExperience(text: string): ExperienceEntry[] {
    const experiences: ExperienceEntry[] = [];
    const sections = text.split(/PROFESSIONAL EXPERIENCE|WORK EXPERIENCE|EXPERIENCE/i);
    
    if (sections.length > 1) {
      const experienceSection = sections[1].split(/SKILLS|EDUCATION/i)[0];
      const jobEntries = experienceSection.split(/\n\s*\n/).filter(entry => entry.trim());
      
      jobEntries.forEach(entry => {
        const lines = entry.split('\n').map(line => line.trim()).filter(line => line);
        if (lines.length > 0) {
          const titleCompany = lines[0];
          const yearMatch = titleCompany.match(/\((\d{4})-(\d{4}|\w+)\)/);
          
          experiences.push({
            title: titleCompany.split(' - ')[0] || titleCompany,
            company: titleCompany.split(' - ')[1]?.split(' (')[0] || '',
            duration: yearMatch ? `${yearMatch[1]}-${yearMatch[2]}` : '',
            description: lines.slice(1).join(' ')
          });
        }
      });
    }
    
    return experiences;
  }

  private extractSkills(text: string): string[] {
    const skillsSection = text.split(/SKILLS/i)[1]?.split(/EDUCATION|CERTIFICATIONS/i)[0] || '';
    
    if (!skillsSection) return [];
    
    // Extract skills from comma-separated list
    const skillsText = skillsSection.replace(/\n/g, ' ').trim();
    const skills = skillsText.split(',').map(skill => skill.trim()).filter(skill => skill);
    
    // Also extract skills from experience descriptions
    const experienceSkills = this.extractSkillsFromExperience(text);
    
    // Combine and deduplicate
    const allSkills = [...new Set([...skills, ...experienceSkills])];
    
    return allSkills.slice(0, 20); // Limit to top 20 skills
  }

  private extractSkillsFromExperience(text: string): string[] {
    const skillKeywords = [
      // Technical Skills
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'AWS', 'Docker', 'Kubernetes',
      'PostgreSQL', 'MongoDB', 'Redis', 'Git', 'HTML5', 'CSS3', 'REST APIs', 'GraphQL',
      
      // Business Skills
      'Operations Management', 'Supply Chain', 'Lean Six Sigma', 'Process Improvement',
      'Vendor Management', 'Cost Analysis', 'Budget Planning', 'Stakeholder Management',
      'ERP Systems', 'Data Analysis', 'Excel', 'PowerBI', 'Project Management',
      
      // Marketing Skills
      'Digital Marketing', 'SEO', 'SEM', 'Google Analytics', 'Google Ads', 'Facebook Ads',
      'Content Marketing', 'Email Marketing', 'Social Media Marketing', 'HubSpot',
      'Marketing Automation', 'A/B Testing', 'Adobe Creative Suite'
    ];
    
    const foundSkills: string[] = [];
    
    skillKeywords.forEach(skill => {
      if (text.toLowerCase().includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    });
    
    return foundSkills;
  }

  private extractEducation(text: string): EducationEntry[] {
    const education: EducationEntry[] = [];
    const sections = text.split(/EDUCATION/i);
    
    if (sections.length > 1) {
      const educationSection = sections[1].split(/CERTIFICATIONS|SKILLS/i)[0];
      const entries = educationSection.split('\n').map(line => line.trim()).filter(line => line);
      
      entries.forEach(entry => {
        if (entry.includes('University') || entry.includes('College') || entry.includes('School')) {
          const parts = entry.split(' - ');
          education.push({
            degree: parts[0] || entry,
            institution: parts[1] || '',
            year: ''
          });
        }
      });
    }
    
    return education;
  }

  private extractCertifications(text: string): string[] {
    const certifications: string[] = [];
    const sections = text.split(/CERTIFICATIONS/i);
    
    if (sections.length > 1) {
      const certSection = sections[1];
      const certs = certSection.split('\n').map(line => line.trim()).filter(line => line);
      certifications.push(...certs);
    }
    
    return certifications;
  }

  private identifyRoles(text: string): string[] {
    const roleKeywords = {
      'Operations Manager': ['operations manager', 'ops manager', 'operational'],
      'Business Analyst': ['business analyst', 'business analysis'],
      'Software Engineer': ['software engineer', 'developer', 'programmer'],
      'Marketing Manager': ['marketing manager', 'digital marketing', 'growth'],
      'Project Manager': ['project manager', 'program manager'],
      'Data Analyst': ['data analyst', 'data scientist'],
      'Product Manager': ['product manager', 'product owner'],
      'Sales Manager': ['sales manager', 'account manager'],
      'HR Manager': ['hr manager', 'human resources'],
      'Finance Manager': ['finance manager', 'financial analyst']
    };
    
    const identifiedRoles: string[] = [];
    const lowerText = text.toLowerCase();
    
    Object.entries(roleKeywords).forEach(([role, keywords]) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        identifiedRoles.push(role);
      }
    });
    
    return identifiedRoles;
  }

  private identifyIndustries(text: string): string[] {
    const industryKeywords = {
      'Technology': ['tech', 'software', 'IT', 'startup', 'saas'],
      'Finance': ['finance', 'banking', 'investment', 'fintech'],
      'Healthcare': ['healthcare', 'medical', 'hospital', 'pharma'],
      'Manufacturing': ['manufacturing', 'production', 'supply chain'],
      'Retail': ['retail', 'e-commerce', 'consumer'],
      'Consulting': ['consulting', 'advisory', 'strategy'],
      'Education': ['education', 'university', 'school', 'training']
    };
    
    const identifiedIndustries: string[] = [];
    const lowerText = text.toLowerCase();
    
    Object.entries(industryKeywords).forEach(([industry, keywords]) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        identifiedIndustries.push(industry);
      }
    });
    
    return identifiedIndustries;
  }

  private determineSeniorityLevel(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('senior') || lowerText.includes('lead') || lowerText.includes('principal')) {
      return 'Senior';
    } else if (lowerText.includes('manager') || lowerText.includes('director')) {
      return 'Management';
    } else if (lowerText.includes('junior') || lowerText.includes('entry')) {
      return 'Junior';
    } else {
      return 'Mid-level';
    }
  }

  private extractAchievements(text: string): string[] {
    const achievements: string[] = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      // Look for lines with bullet points and quantifiable results
      if (line.includes('•') && (line.includes('%') || line.includes('$') || line.includes('increased') || line.includes('reduced'))) {
        achievements.push(line.replace('•', '').trim());
      }
    });
    
    return achievements.slice(0, 5); // Top 5 achievements
  }

  private generateSummary(text: string): string {
    const roles = this.identifyRoles(text);
    const industries = this.identifyIndustries(text);
    const seniority = this.determineSeniorityLevel(text);
    
    const primaryRole = roles[0] || 'Professional';
    const primaryIndustry = industries[0] || 'various industries';
    
    return `${seniority} ${primaryRole} with experience in ${primaryIndustry}`;
  }
}

// Type definitions
export interface CVAnalysis {
  personalInfo: PersonalInfo;
  experience: ExperienceEntry[];
  skills: string[];
  education: EducationEntry[];
  certifications: string[];
  roles: string[];
  industries: string[];
  seniorityLevel: string;
  keyAchievements: string[];
  summary: string;
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  year: string;
}