// src/lib/cvParser.ts

// Type definitions for the CV analysis object returned by the backend
export interface CVAnalysis {
  skills: string[];
  roles: string[];
  summary: string;
  // Add other fields as your backend analysis becomes more sophisticated
  // personalInfo?: PersonalInfo;
  // experience?: ExperienceEntry[];
  // seniorityLevel?: string;
  // keyAchievements?: string[];
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

// The CVContentParser class is no longer needed on the client-side
// for parsing, but you might keep it for other utility functions
// or simply remove it.
