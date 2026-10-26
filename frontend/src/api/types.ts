import type { CHANNELS, FEE_LEVELS, SOURCES, STATUSES } from "./options";

export type Source = (typeof SOURCES)[number];
export type FeeLevel = (typeof FEE_LEVELS)[number];
export type Status = (typeof STATUSES)[number];
export type Channel = (typeof CHANNELS)[number];
export type PriorityLabel = "High" | "Medium" | "Low" | "Closed";

/** Fields the user can edit. Sent to POST/PUT /api/enquiries. */
export interface EnquiryInput {
  student_name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  course_interest: string;
  source: Source;
  previous_score: number | null;
  fee_affordability: FeeLevel;
  enquiry_date: string;
  last_contact_date: string | null;
  next_followup_date: string | null;
  followup_count: number;
  response_time_hours: number;
  campus_visited: boolean;
  scholarship_requested: boolean;
  status: Status;
  notes: string | null;
}

export interface Enquiry extends EnquiryInput {
  id: number;
  conversion_probability: number | null;
  priority_score: number;
  priority_label: PriorityLabel;
  recommended_action: string;
  created_at: string;
  updated_at: string;
}

export interface EnquiryPage {
  items: Enquiry[];
  total: number;
  page: number;
  page_size: number;
}

export interface FollowUp {
  id: number;
  enquiry_id: number;
  channel: Channel;
  notes: string | null;
  next_followup_date: string | null;
  created_at: string;
}

export interface FollowUpInput {
  channel: Channel;
  notes: string | null;
  next_followup_date: string | null;
  new_status: Status | null;
}

export interface PredictInput {
  course_interest: string;
  source: Source;
  fee_affordability: FeeLevel;
  previous_score: number | null;
  followup_count: number;
  response_time_hours: number;
  campus_visited: boolean;
  scholarship_requested: boolean;
}

export interface Factor {
  feature: string;
  impact: number;
  direction: "up" | "down";
}

export interface PredictResult {
  probability: number;
  band: "High" | "Medium" | "Low";
  factors: Factor[];
}

export interface ModelInfo {
  algorithm: string;
  data_source: string;
  n_samples: number;
  conversion_rate_in_training_data: number;
  trained_at: string;
  metrics: { accuracy: number; precision: number; recall: number; roc_auc: number };
}

export interface SourceStat {
  source: string;
  total: number;
  admitted: number;
  lost: number;
  conversion_rate: number | null;
}

export interface DashboardSummary {
  total_enquiries: number;
  open_enquiries: number;
  admitted: number;
  lost: number;
  conversion_rate: number | null;
  expected_admissions: number;
  high_priority: number;
  followups_due: number;
  by_status: Record<string, number>;
  by_source: SourceStat[];
  probability_buckets: Record<string, number>;
}

export interface HealthResponse {
  status: string;
  service: string;
  database: string;
}
