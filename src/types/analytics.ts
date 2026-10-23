export interface FunnelStage {
  stage: string;
  count: number;
  conversionRate: number; // percentage from previous stage
}

export interface SourceConversion {
  source: string;
  enquiries: number;
  converted: number;
  rate: number;
}

export interface CounsellorPerformance {
  counsellorId: string;
  name: string;
  assigned: number;
  contacted: number;
  converted: number;
  conversionRate: number;
  avgResponseTimeHours: number;
}

export interface MonthlyTrend {
  month: string;
  enquiries: number;
  conversions: number;
  predictedHighValue: number;
}

export interface ProgramDemand {
  program: string;
  count: number;
  avgScore: number;
  conversionRate: number;
}
