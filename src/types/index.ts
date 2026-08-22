// ========================
// User & Auth Types
// ========================
export type UserRole = 'candidate' | 'recruiter' | 'hiring_manager' | 'hr' | 'admin'

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  organizationId?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Session {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

// ========================
// Organization Types
// ========================
export interface Organization {
  id: string
  name: string
  industry?: string
  size?: string
  website?: string
  logoUrl?: string
  description?: string
  createdAt: string
}

// ========================
// Candidate Types
// ========================
export interface CandidateProfile {
  id: string
  userId: string
  headline?: string
  location?: string
  experienceYears?: number
  targetSeniority?: string
  resumeUrl?: string
  resumeParsedData?: ResumeParsedData
  skills: Skill[]
  experience: Experience[]
  education: Education[]
  certifications: Certification[]
  preferences: CandidatePreferences
  profileCompleteness: number
  createdAt: string
  updatedAt: string
}

export interface ResumeParsedData {
  extractedSkills: string[]
  extractedExperience: ParsedExperience[]
  extractedEducation: ParsedEducation[]
  rawText?: string
  confidence: number
}

export interface ParsedExperience {
  title: string
  company: string
  duration: string
  description: string
}

export interface ParsedEducation {
  degree: string
  institution: string
  year: string
}

export interface Skill {
  name: string
  category: 'technical' | 'soft' | 'domain' | 'tool'
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

export interface Experience {
  id: string
  title: string
  company: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  description: string
}

export interface Education {
  id: string
  degree: string
  institution: string
  year: string
  field?: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  year: string
}

export interface CandidatePreferences {
  industries?: string[]
  workType?: ('remote' | 'hybrid' | 'onsite')[]
  roleTypes?: string[]
  salaryMin?: number
  salaryMax?: number
  locations?: string[]
}

// ========================
// Job Types
// ========================
export interface Job {
  id: string
  organizationId: string
  createdBy: string
  title: string
  department?: string
  description: string
  requirements: JobRequirements
  requiredSkills: string[]
  preferredSkills: string[]
  seniority?: string
  location?: string
  workType?: 'remote' | 'hybrid' | 'onsite'
  status: 'draft' | 'active' | 'closed'
  companyName?: string
  companyLogo?: string
  parsedData?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface JobRequirements {
  experienceYears?: number
  education?: string
  responsibilities?: string[]
}

// ========================
// Fit Assessment Types
// ========================
export interface FitAssessment {
  id: string
  candidateId: string
  jobId: string
  jobTitle: string
  companyName?: string
  overallScore: number
  technicalScore: number
  experienceScore: number
  educationScore: number
  roleAlignmentScore: number
  culturalScore: number
  recommendation: 'strong' | 'good' | 'moderate' | 'low'
  matchingSkills: string[]
  skillGaps: SkillGap[]
  explanation: string
  factors: AssessmentFactor[]
  confidence: number
  status: 'pending' | 'complete' | 'error'
  createdAt: string
}

export interface SkillGap {
  skill: string
  importance: 'high' | 'medium' | 'low'
  suggestion?: string
}

export interface AssessmentFactor {
  name: string
  direction: 'positive' | 'negative'
  weight: number
  description: string
}

// ========================
// Interview Assessment Types
// ========================
export interface InterviewAssessment {
  id: string
  candidateId: string
  jobId: string
  jobTitle: string
  fitAssessmentId: string
  readinessScore: number
  technicalScore: number
  roleUnderstandingScore: number
  communicationScore: number
  experienceRelevanceScore: number
  behavioralScore: number
  recommendations: InterviewRecommendation[]
  status: 'pending' | 'complete'
  createdAt: string
}

export interface InterviewRecommendation {
  id: string
  text: string
  priority: 'high' | 'medium' | 'low'
  category: string
}

// ========================
// Interview Question Types
// ========================
export interface InterviewQuestion {
  id: string
  assessmentId: string
  jobId: string
  questionText: string
  category: 'technical' | 'behavioral' | 'role-specific' | 'situational'
  difficulty: 'easy' | 'medium' | 'hard'
  whatToLookFor: string
  createdAt: string
}

// ========================
// Practice Session Types
// ========================
export interface PracticeSession {
  id: string
  candidateId: string
  assessmentId: string
  jobTitle: string
  status: 'in_progress' | 'completed'
  overallScore?: number
  questionsAnswered: number
  totalQuestions: number
  createdAt: string
  completedAt?: string
}

export interface PracticeResponse {
  id: string
  sessionId: string
  questionId: string
  questionText: string
  responseText: string
  relevanceScore: number
  completenessScore: number
  clarityScore: number
  technicalAccuracyScore: number
  structureScore: number
  overallScore: number
  feedback: string
  suggestedAnswer: string
  createdAt: string
}

// ========================
// Notification Types
// ========================
export interface Notification {
  id: string
  userId: string
  type: 'assessment_complete' | 'high_risk_alert' | 'new_candidate' | 'score_update' | 'system'
  title: string
  body: string
  isRead: boolean
  metadata?: Record<string, unknown>
  createdAt: string
}

// ========================
// UI Types
// ========================
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen'

export interface NavItem {
  label: string
  href: string
  icon: string
  badge?: number
  children?: NavItem[]
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface StepperStep {
  label: string
  description?: string
}
