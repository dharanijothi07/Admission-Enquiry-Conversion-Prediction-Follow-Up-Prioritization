import { PredictionResult, PriorityTier } from './prediction';
import { FollowUpTask } from './followUp';

export type EnquiryStatus = 
  | 'New'
  | 'Contacted'
  | 'In Discussion'
  | 'Campus Visit Scheduled'
  | 'Application Submitted'
  | 'Converted'
  | 'Lost';

export type LeadSource = 
  | 'Website Form'
  | 'Walk-in / Campus Visit'
  | 'Education Fair / Expo'
  | 'Social Media (Instagram/LinkedIn)'
  | 'Google Search Ads'
  | 'Alumni Referral'
  | 'School Outreach Program';

export type AcademicProgram = 
  | 'B.Tech Computer Science & Engineering'
  | 'B.Tech Artificial Intelligence & Data Science'
  | 'B.Tech Electronics & Communication'
  | 'B.Tech Information Technology'
  | 'B.Tech Mechanical Engineering'
  | 'B.Sc Data Science & AI'
  | 'MBA - Technology Management'
  | 'MCA - Cloud Computing';

export interface InteractionLog {
  id: string;
  timestamp: string;
  counsellorName: string;
  type: 'Call' | 'WhatsApp' | 'Email' | 'Campus Visit' | 'System Note';
  notes: string;
  outcome?: string;
}

export interface AdmissionEnquiry {
  id: string;
  applicationNo: string;
  studentName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  program: AcademicProgram;
  leadSource: LeadSource;
  status: EnquiryStatus;
  counsellorId: string;
  counsellorName: string;
  
  // Academic & Qualification details (crucial features for ML)
  qualifyingExam: '12th Standard / HSC' | 'Diploma' | 'Undergraduate Degree';
  percentageScore: number; // e.g. 88.5%
  mathsPhysicsScore?: number; // e.g. 91%
  entranceExamPercentile?: number; // e.g. 89.2 percentile
  category: 'General' | 'OBC' | 'SC/ST' | 'Management Quota';
  budgetRange: 'Under ₹1.5L / year' | '₹1.5L - ₹2.5L / year' | 'Above ₹2.5L / year' | 'Seeking Scholarship';
  hostelRequired: boolean;
  busTransportRequired: boolean;
  
  // Engagement telemetry
  enquiryDate: string; // ISO date
  lastContactedDate?: string;
  engagementScore: number; // 0 to 100 based on website clicks / brochure downloads / response speed
  brochureDownloaded: boolean;
  campusVisitAttended: boolean;
  parentAccompanied: boolean;
  
  // ML Prediction
  prediction: PredictionResult;
  priorityTier: PriorityTier;
  
  // Interaction history
  interactions: InteractionLog[];
  followUpTasks: FollowUpTask[];
  
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryFilterState {
  searchQuery: string;
  program: string;
  status: string;
  priority: string;
  leadSource: string;
  counsellorId: string;
  minProbability: number;
}
