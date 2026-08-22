import type {
  CandidateProfile,
  FitAssessment,
  InterviewAssessment,
  InterviewQuestion,
  PracticeSession,
  PracticeResponse,
  Job,
  Notification,
  InterviewRecommendation,
} from '@/types'

// ========================
// Candidate Profile
// ========================
export const mockCandidateProfile: CandidateProfile = {
  id: 'cp-001',
  userId: 'mock-user-001',
  headline: 'Full-Stack Engineer | React, Node.js, TypeScript',
  location: 'San Francisco, CA',
  experienceYears: 5,
  targetSeniority: 'Senior',
  resumeUrl: '/mock-resume.pdf',
  resumeParsedData: {
    extractedSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'GraphQL', 'AWS', 'Docker', 'Git', 'Agile', 'REST APIs'],
    extractedExperience: [
      { title: 'Software Engineer II', company: 'TechCorp Inc.', duration: '2022–Present', description: 'Led front-end architecture migration to React 18 with TypeScript.' },
      { title: 'Software Engineer', company: 'StartupXYZ', duration: '2020–2022', description: 'Built RESTful APIs and microservices using Node.js and PostgreSQL.' },
    ],
    extractedEducation: [
      { degree: 'B.S. Computer Science', institution: 'UC Berkeley', year: '2019' },
    ],
    confidence: 92,
  },
  skills: [
    { name: 'React', category: 'technical', proficiency: 'expert' },
    { name: 'TypeScript', category: 'technical', proficiency: 'advanced' },
    { name: 'Node.js', category: 'technical', proficiency: 'advanced' },
    { name: 'PostgreSQL', category: 'technical', proficiency: 'intermediate' },
    { name: 'GraphQL', category: 'technical', proficiency: 'intermediate' },
    { name: 'AWS', category: 'tool', proficiency: 'intermediate' },
    { name: 'Docker', category: 'tool', proficiency: 'intermediate' },
    { name: 'Agile', category: 'soft', proficiency: 'advanced' },
    { name: 'Team Leadership', category: 'soft', proficiency: 'intermediate' },
    { name: 'Problem Solving', category: 'soft', proficiency: 'expert' },
  ],
  experience: [
    {
      id: 'exp-1',
      title: 'Software Engineer II',
      company: 'TechCorp Inc.',
      startDate: '2022-03-01',
      isCurrent: true,
      description: 'Led front-end architecture migration to React 18 with TypeScript. Improved page load performance by 40%. Mentored 2 junior developers.',
    },
    {
      id: 'exp-2',
      title: 'Software Engineer',
      company: 'StartupXYZ',
      startDate: '2020-06-01',
      endDate: '2022-02-28',
      isCurrent: false,
      description: 'Built RESTful APIs and microservices using Node.js and PostgreSQL. Implemented CI/CD pipelines. Reduced API response time by 60%.',
    },
    {
      id: 'exp-3',
      title: 'Junior Developer',
      company: 'WebAgency',
      startDate: '2019-07-01',
      endDate: '2020-05-31',
      isCurrent: false,
      description: 'Developed responsive web applications using React and CSS. Participated in code reviews and pair programming sessions.',
    },
  ],
  education: [
    { id: 'edu-1', degree: 'Bachelor of Science', institution: 'UC Berkeley', year: '2019', field: 'Computer Science' },
  ],
  certifications: [
    { id: 'cert-1', name: 'AWS Solutions Architect Associate', issuer: 'Amazon Web Services', year: '2023' },
  ],
  preferences: {
    industries: ['Technology', 'Fintech', 'SaaS'],
    workType: ['remote', 'hybrid'],
    roleTypes: ['Full-Stack Engineer', 'Frontend Engineer', 'Software Architect'],
    salaryMin: 150000,
    salaryMax: 200000,
    locations: ['San Francisco, CA', 'Remote'],
  },
  profileCompleteness: 85,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-06-20T14:30:00Z',
}

// ========================
// Jobs
// ========================
export const mockJobs: Job[] = [
  {
    id: 'job-001',
    organizationId: 'org-001',
    createdBy: 'user-r-001',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    description: 'We are looking for a Senior Frontend Engineer to lead our React-based platform development. You will work closely with product and design teams to build intuitive user experiences.',
    requirements: { experienceYears: 5, education: "Bachelor's in CS or related", responsibilities: ['Lead frontend architecture', 'Mentor junior devs', 'Code reviews'] },
    requiredSkills: ['React', 'TypeScript', 'CSS', 'Redux', 'Testing (Jest/RTL)'],
    preferredSkills: ['GraphQL', 'Next.js', 'Figma', 'CI/CD'],
    seniority: 'Senior',
    location: 'San Francisco, CA',
    workType: 'hybrid',
    status: 'active',
    companyName: 'InnovateTech',
    createdAt: '2024-06-01T09:00:00Z',
    updatedAt: '2024-06-01T09:00:00Z',
  },
  {
    id: 'job-002',
    organizationId: 'org-002',
    createdBy: 'user-r-002',
    title: 'Full-Stack Software Engineer',
    department: 'Product',
    description: 'Join our product team to build and scale our SaaS platform. You will work across the stack with React, Node.js, and PostgreSQL.',
    requirements: { experienceYears: 3, education: "Bachelor's degree", responsibilities: ['Build features end-to-end', 'API development', 'Database design'] },
    requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'REST APIs'],
    preferredSkills: ['Docker', 'AWS', 'GraphQL', 'Agile'],
    seniority: 'Mid-Senior',
    location: 'Remote',
    workType: 'remote',
    status: 'active',
    companyName: 'CloudScale',
    createdAt: '2024-06-05T11:00:00Z',
    updatedAt: '2024-06-05T11:00:00Z',
  },
  {
    id: 'job-003',
    organizationId: 'org-003',
    createdBy: 'user-r-003',
    title: 'Lead Software Architect',
    department: 'Engineering',
    description: 'Define and implement the technical vision for our next-gen fintech platform. Requires deep experience with distributed systems and cloud architecture.',
    requirements: { experienceYears: 8, education: "Bachelor's or Master's in CS", responsibilities: ['System design', 'Tech strategy', 'Cross-team coordination'] },
    requiredSkills: ['System Design', 'AWS', 'Kubernetes', 'Microservices', 'Java/Go'],
    preferredSkills: ['Terraform', 'Event-Driven Architecture', 'gRPC'],
    seniority: 'Lead',
    location: 'New York, NY',
    workType: 'hybrid',
    status: 'active',
    companyName: 'FinTech Global',
    createdAt: '2024-06-10T08:00:00Z',
    updatedAt: '2024-06-10T08:00:00Z',
  },
  {
    id: 'job-004',
    organizationId: 'org-004',
    createdBy: 'user-r-004',
    title: 'Frontend Developer',
    department: 'Web Team',
    description: 'Build beautiful, responsive web applications for our e-commerce platform using modern frontend technologies.',
    requirements: { experienceYears: 2, education: "Bachelor's degree preferred", responsibilities: ['UI development', 'Cross-browser testing', 'Performance optimization'] },
    requiredSkills: ['React', 'CSS/Tailwind', 'JavaScript', 'HTML5'],
    preferredSkills: ['TypeScript', 'Next.js', 'Storybook'],
    seniority: 'Mid',
    location: 'Austin, TX',
    workType: 'onsite',
    status: 'active',
    companyName: 'ShopWave',
    createdAt: '2024-06-12T10:00:00Z',
    updatedAt: '2024-06-12T10:00:00Z',
  },
  {
    id: 'job-005',
    organizationId: 'org-005',
    createdBy: 'user-r-005',
    title: 'Backend Engineer (Node.js)',
    department: 'Platform',
    description: 'Design and build scalable backend services for our data analytics platform. Focus on API design, data pipelines, and performance.',
    requirements: { experienceYears: 4, education: "Bachelor's in CS", responsibilities: ['API design', 'Data pipelines', 'Service reliability'] },
    requiredSkills: ['Node.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Docker'],
    preferredSkills: ['Kafka', 'Elasticsearch', 'Kubernetes', 'Python'],
    seniority: 'Senior',
    location: 'Remote',
    workType: 'remote',
    status: 'active',
    companyName: 'DataVista',
    createdAt: '2024-06-15T09:00:00Z',
    updatedAt: '2024-06-15T09:00:00Z',
  },
]

// ========================
// Fit Assessments
// ========================
export const mockFitAssessments: FitAssessment[] = [
  {
    id: 'fa-001',
    candidateId: 'cp-001',
    jobId: 'job-001',
    jobTitle: 'Senior Frontend Engineer',
    companyName: 'InnovateTech',
    overallScore: 87,
    technicalScore: 92,
    experienceScore: 85,
    educationScore: 88,
    roleAlignmentScore: 83,
    culturalScore: 80,
    recommendation: 'strong',
    matchingSkills: ['React', 'TypeScript', 'CSS', 'Team Leadership', 'Code Reviews'],
    skillGaps: [
      { skill: 'Redux', importance: 'high', suggestion: 'Consider taking an advanced Redux course with Redux Toolkit' },
      { skill: 'Testing (Jest/RTL)', importance: 'high', suggestion: 'Practice writing unit and integration tests' },
      { skill: 'Next.js', importance: 'medium', suggestion: 'Build a project with Next.js App Router' },
    ],
    explanation: 'Alex demonstrates strong alignment with this Senior Frontend Engineer role at InnovateTech. With 5 years of experience, including leading a React 18 migration, the candidate shows excellent technical depth in the core required technologies. The main gaps are in state management (Redux) and testing frameworks, which are addressable through targeted upskilling.',
    factors: [
      { name: 'React expertise', direction: 'positive', weight: 0.25, description: 'Expert-level React skills with demonstrated architecture experience' },
      { name: 'TypeScript proficiency', direction: 'positive', weight: 0.2, description: 'Advanced TypeScript usage in production applications' },
      { name: 'Leadership experience', direction: 'positive', weight: 0.15, description: 'Mentored junior developers, aligning with senior role expectations' },
      { name: 'Redux gap', direction: 'negative', weight: 0.15, description: 'No demonstrated Redux experience; role requires Redux/RTK proficiency' },
      { name: 'Testing gap', direction: 'negative', weight: 0.1, description: 'Limited evidence of testing practices; role emphasizes test-driven development' },
    ],
    confidence: 89,
    status: 'complete',
    createdAt: '2024-06-18T14:30:00Z',
  },
  {
    id: 'fa-002',
    candidateId: 'cp-001',
    jobId: 'job-002',
    jobTitle: 'Full-Stack Software Engineer',
    companyName: 'CloudScale',
    overallScore: 91,
    technicalScore: 95,
    experienceScore: 88,
    educationScore: 85,
    roleAlignmentScore: 93,
    culturalScore: 90,
    recommendation: 'strong',
    matchingSkills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'REST APIs', 'Docker', 'AWS'],
    skillGaps: [
      { skill: 'GraphQL (advanced)', importance: 'low', suggestion: 'Deepen GraphQL schema design skills' },
    ],
    explanation: 'Excellent fit for this Full-Stack role. Alex\'s combined frontend and backend experience directly matches the requirements. Strong overlap in all required technologies with minimal gaps.',
    factors: [
      { name: 'Full-stack experience', direction: 'positive', weight: 0.3, description: 'Demonstrated ability to work across React frontend and Node.js backend' },
      { name: 'Technology match', direction: 'positive', weight: 0.25, description: 'All 5 required skills matched at intermediate or above' },
      { name: 'Remote work preference', direction: 'positive', weight: 0.1, description: 'Candidate prefers remote work, matching job offering' },
    ],
    confidence: 93,
    status: 'complete',
    createdAt: '2024-06-20T10:15:00Z',
  },
  {
    id: 'fa-003',
    candidateId: 'cp-001',
    jobId: 'job-003',
    jobTitle: 'Lead Software Architect',
    companyName: 'FinTech Global',
    overallScore: 52,
    technicalScore: 45,
    experienceScore: 50,
    educationScore: 75,
    roleAlignmentScore: 48,
    culturalScore: 65,
    recommendation: 'moderate',
    matchingSkills: ['AWS'],
    skillGaps: [
      { skill: 'System Design', importance: 'high', suggestion: 'Study distributed systems design patterns' },
      { skill: 'Kubernetes', importance: 'high', suggestion: 'Get hands-on with Kubernetes orchestration' },
      { skill: 'Microservices', importance: 'high', suggestion: 'Build microservices architecture projects' },
      { skill: 'Java/Go', importance: 'high', suggestion: 'Learn Go or Java for backend systems' },
    ],
    explanation: 'This Lead Architect role requires significantly more experience (8+ years) and expertise in system design, distributed systems, and infrastructure technologies that Alex has not yet developed. While AWS knowledge is a starting point, the core requirements are substantially beyond current capabilities.',
    factors: [
      { name: 'Experience gap', direction: 'negative', weight: 0.3, description: 'Role requires 8+ years; candidate has 5 years' },
      { name: 'Architecture skills gap', direction: 'negative', weight: 0.25, description: 'No demonstrated system design or architecture leadership experience' },
      { name: 'Language mismatch', direction: 'negative', weight: 0.2, description: 'Role requires Java/Go; candidate specializes in JavaScript/TypeScript' },
    ],
    confidence: 85,
    status: 'complete',
    createdAt: '2024-06-15T16:45:00Z',
  },
]

// ========================
// Interview Assessment
// ========================
export const mockInterviewAssessment: InterviewAssessment = {
  id: 'ia-001',
  candidateId: 'cp-001',
  jobId: 'job-001',
  jobTitle: 'Senior Frontend Engineer',
  fitAssessmentId: 'fa-001',
  readinessScore: 74,
  technicalScore: 82,
  roleUnderstandingScore: 70,
  communicationScore: 78,
  experienceRelevanceScore: 85,
  behavioralScore: 60,
  recommendations: [
    { id: 'rec-1', text: 'Practice explaining Redux state management patterns and when to use them', priority: 'high', category: 'Technical' },
    { id: 'rec-2', text: 'Prepare STAR-format responses for leadership and mentoring scenarios', priority: 'high', category: 'Behavioral' },
    { id: 'rec-3', text: 'Review common testing strategies and be ready to discuss TDD approach', priority: 'medium', category: 'Technical' },
    { id: 'rec-4', text: 'Research InnovateTech\'s product and recent technical blog posts', priority: 'medium', category: 'Role Knowledge' },
    { id: 'rec-5', text: 'Practice system design questions focusing on frontend architecture', priority: 'low', category: 'Technical' },
  ] as InterviewRecommendation[],
  status: 'complete',
  createdAt: '2024-06-19T09:00:00Z',
}

// ========================
// Interview Questions
// ========================
export const mockInterviewQuestions: InterviewQuestion[] = [
  { id: 'q-001', assessmentId: 'ia-001', jobId: 'job-001', questionText: 'How would you architect a large-scale React application with multiple teams contributing to the same codebase?', category: 'technical', difficulty: 'hard', whatToLookFor: 'Look for mention of module federation, monorepo strategies, component libraries, and clear code ownership boundaries.', createdAt: '2024-06-19T09:00:00Z' },
  { id: 'q-002', assessmentId: 'ia-001', jobId: 'job-001', questionText: 'Explain the difference between Redux, Context API, and Zustand. When would you choose each?', category: 'technical', difficulty: 'medium', whatToLookFor: 'Understanding of state management trade-offs, performance implications, and practical use cases for each.', createdAt: '2024-06-19T09:00:00Z' },
  { id: 'q-003', assessmentId: 'ia-001', jobId: 'job-001', questionText: 'Describe how you would implement a comprehensive testing strategy for a React component library.', category: 'technical', difficulty: 'medium', whatToLookFor: 'Unit tests, integration tests, visual regression tests, accessibility tests. Mention of Jest, RTL, Storybook, Chromatic.', createdAt: '2024-06-19T09:00:00Z' },
  { id: 'q-004', assessmentId: 'ia-001', jobId: 'job-001', questionText: 'Tell me about a time you had to mentor a struggling team member. What approach did you take and what was the outcome?', category: 'behavioral', difficulty: 'medium', whatToLookFor: 'Empathy, structured mentoring approach, patience, measurable improvement outcome. STAR format.', createdAt: '2024-06-19T09:00:00Z' },
  { id: 'q-005', assessmentId: 'ia-001', jobId: 'job-001', questionText: 'Describe a situation where you had to push back on a product requirement for technical reasons. How did you handle it?', category: 'behavioral', difficulty: 'medium', whatToLookFor: 'Communication skills, ability to explain technical constraints to non-technical stakeholders, compromise-finding.', createdAt: '2024-06-19T09:00:00Z' },
  { id: 'q-006', assessmentId: 'ia-001', jobId: 'job-001', questionText: 'How would you handle migrating a legacy jQuery application to React without disrupting the production experience?', category: 'role-specific', difficulty: 'hard', whatToLookFor: 'Incremental migration strategy, strangler fig pattern, coexistence approach, risk mitigation.', createdAt: '2024-06-19T09:00:00Z' },
  { id: 'q-007', assessmentId: 'ia-001', jobId: 'job-001', questionText: 'What strategies would you use to improve the Core Web Vitals of a React application?', category: 'technical', difficulty: 'medium', whatToLookFor: 'Knowledge of LCP, FID, CLS. Techniques: code splitting, lazy loading, image optimization, SSR/SSG.', createdAt: '2024-06-19T09:00:00Z' },
  { id: 'q-008', assessmentId: 'ia-001', jobId: 'job-001', questionText: 'If you joined the team and found the codebase had no documentation and inconsistent patterns, what would be your first steps?', category: 'situational', difficulty: 'easy', whatToLookFor: 'Prioritization, establishing standards, ADRs, gradual improvement, leading by example.', createdAt: '2024-06-19T09:00:00Z' },
  { id: 'q-009', assessmentId: 'ia-001', jobId: 'job-001', questionText: 'Walk me through how you would design a real-time collaborative editing feature for a web application.', category: 'technical', difficulty: 'hard', whatToLookFor: 'WebSockets, CRDTs or OT, conflict resolution, optimistic updates, offline support.', createdAt: '2024-06-19T09:00:00Z' },
  { id: 'q-010', assessmentId: 'ia-001', jobId: 'job-001', questionText: 'How do you ensure accessibility in your React components? Walk through your process.', category: 'role-specific', difficulty: 'medium', whatToLookFor: 'WCAG guidelines, semantic HTML, ARIA attributes, keyboard navigation, screen reader testing, automated tools.', createdAt: '2024-06-19T09:00:00Z' },
]

// ========================
// Practice Sessions
// ========================
export const mockPracticeSessions: PracticeSession[] = [
  {
    id: 'ps-001',
    candidateId: 'cp-001',
    assessmentId: 'ia-001',
    jobTitle: 'Senior Frontend Engineer',
    status: 'completed',
    overallScore: 76,
    questionsAnswered: 5,
    totalQuestions: 5,
    createdAt: '2024-06-20T10:00:00Z',
    completedAt: '2024-06-20T11:30:00Z',
  },
  {
    id: 'ps-002',
    candidateId: 'cp-001',
    assessmentId: 'ia-001',
    jobTitle: 'Senior Frontend Engineer',
    status: 'completed',
    overallScore: 82,
    questionsAnswered: 5,
    totalQuestions: 5,
    createdAt: '2024-06-22T14:00:00Z',
    completedAt: '2024-06-22T15:15:00Z',
  },
]

// ========================
// Practice Response (sample)
// ========================
export const mockPracticeResponse: PracticeResponse = {
  id: 'pr-001',
  sessionId: 'ps-001',
  questionId: 'q-001',
  questionText: 'How would you architect a large-scale React application with multiple teams contributing to the same codebase?',
  responseText: 'I would use a monorepo with tools like Turborepo or Nx to manage the codebase. Each team would own specific feature modules, and we would establish a shared component library for UI consistency. Code ownership rules using CODEOWNERS files would ensure proper review processes.',
  relevanceScore: 82,
  completenessScore: 70,
  clarityScore: 85,
  technicalAccuracyScore: 78,
  structureScore: 75,
  overallScore: 78,
  feedback: 'Good foundation covering monorepo strategy and team organization. To strengthen your answer, elaborate on module federation for independent deployments, shared state management patterns across modules, and how you would handle versioning of the shared component library. Also consider mentioning CI/CD pipeline configuration for monorepo setups.',
  suggestedAnswer: 'I would approach this with a modular architecture using a monorepo setup with Nx or Turborepo. Key aspects: 1) Module Federation for independent team deployments, 2) A shared design system package with strict versioning, 3) Clear domain boundaries using a feature-based folder structure, 4) CODEOWNERS for ownership, 5) Shared ESLint/Prettier configs for consistency, 6) A CI pipeline with affected-only testing to keep build times manageable. For state management, I\'d use a combination of server state (React Query) for API data and local component state, avoiding large global stores that become bottlenecks.',
  createdAt: '2024-06-20T10:15:00Z',
}

// ========================
// Notifications
// ========================
export const mockNotifications: Notification[] = [
  { id: 'n-001', userId: 'mock-user-001', type: 'assessment_complete', title: 'Fit Assessment Complete', body: 'Your assessment for Senior Frontend Engineer at InnovateTech is ready. Score: 87%', isRead: false, createdAt: '2024-06-20T14:30:00Z' },
  { id: 'n-002', userId: 'mock-user-001', type: 'score_update', title: 'New Job Recommendation', body: 'We found 3 new jobs matching your profile with 80%+ fit scores.', isRead: false, createdAt: '2024-06-20T10:00:00Z' },
  { id: 'n-003', userId: 'mock-user-001', type: 'system', title: 'Complete Your Profile', body: 'Add certifications and preferences to improve your match accuracy.', isRead: true, createdAt: '2024-06-18T09:00:00Z' },
]
