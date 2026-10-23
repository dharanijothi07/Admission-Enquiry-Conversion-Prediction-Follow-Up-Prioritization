export type FollowUpChannel = 'Phone Call' | 'WhatsApp' | 'Email' | 'Campus Visit' | 'Virtual Counselling';
export type FollowUpStatus = 'Pending' | 'Completed' | 'Overdue' | 'Cancelled';
export type CallDisposition = 
  | 'Interested - Requested Prospectus'
  | 'High Intent - Scheduling Campus Visit'
  | 'Needs Parent Approval'
  | 'Fee Scholarship Discussion'
  | 'Not Reachable'
  | 'Joined Another Institution'
  | 'Follow Up Tomorrow'
  | 'Enrolled / Paid Application Fee';

export interface FollowUpTask {
  id: string;
  enquiryId: string;
  studentName: string;
  courseInterested: string;
  counsellorId: string;
  counsellorName: string;
  scheduledDate: string; // ISO date string 'YYYY-MM-DD'
  scheduledTime: string; // e.g. "10:30 AM"
  channel: FollowUpChannel;
  status: FollowUpStatus;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  notes: string;
  outcome?: CallDisposition;
  completedAt?: string;
  createdAt: string;

  // Prioritization Engine Telemetry
  operationalScore?: number;
  conversionProbability?: number; // Propensity to convert from ML (0 - 100)
  priorityReasons?: string[];
  recommendedAction?: string;
  isOverdue?: boolean;
  isDueToday?: boolean;
  daysOverdue?: number;

  // Counsellor Override Audit
  isOverridden?: boolean;
  overriddenPriority?: string;
  overrideReason?: string;
  overriddenByName?: string;
  overriddenAt?: string;

  // Audit Metadata
  modelVersion?: string;
  predictionTimestamp?: string;
  governanceNotice?: string;
}

export interface PriorityOverridePayload {
  newPriority: 'Urgent' | 'High' | 'Medium' | 'Low';
  overrideReason: string;
}

export interface PriorityAuditItem {
  id: string;
  followupId: string;
  enquiryId: string;
  action: string;
  previousPriority?: string;
  newPriority: string;
  operationalScore?: number;
  modelVersion?: string;
  predictionTimestamp?: string;
  overrideReason?: string;
  reasons?: string[];
  changedByName?: string;
  createdAt: string;
}

export interface FollowUpOperationalSummary {
  totalTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  dueTodayTasks: number;
  highPriorityTasks: number;
  mediumPriorityTasks: number;
  lowPriorityTasks: number;
  overriddenTasks: number;
  governanceNotice: string;
}
