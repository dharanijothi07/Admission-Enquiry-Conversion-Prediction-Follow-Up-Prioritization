export type PriorityTier = 'Urgent' | 'High' | 'Medium' | 'Low';

export interface FeatureImpact {
  featureName: string;
  category: 'academic' | 'engagement' | 'demographic' | 'interaction';
  value: string | number;
  weight: number; // positive or negative value, e.g. +0.28 or -0.15
  impact: 'positive' | 'negative' | 'neutral';
  explanation: string;
}

export interface PredictionResult {
  score: number; // 0.0 to 1.0 (e.g. 0.88 = 88% conversion probability)
  probabilityPercentage: number; // 0 to 100
  priority: PriorityTier;
  confidenceScore: number; // e.g. 0.92 (model certainty)
  modelVersion: string; // e.g. "XGBoost-v2.3 (Demo/College Prototype)"
  predictedAt: string;
  recommendedAction: string;
  topDrivers: FeatureImpact[];
  riskFactors: string[];
}
