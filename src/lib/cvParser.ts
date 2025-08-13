// src/lib/cvParser.ts (Corrected & Final)

// Type definitions for the CV analysis object returned by the backend
export interface CVAnalysis {
  skills: string[];
  roles: string[];
  summary: string;
  // You can expand this with more detailed analysis fields later
  personalInfo?: PersonalInfo;
  experience?: ExperienceEntry[];
  seniorityLevel?: string;
  keyAchievements?: string[];
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
