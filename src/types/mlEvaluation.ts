export interface ConfusionMatrixData {
  truePositive: number;
  falsePositive: number;
  trueNegative: number;
  falseNegative: number;
}

export interface ModelComparison {
  name: string;
  type: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  inferenceLatencyMs: number;
  isCurrentChampion: boolean;
}

export interface FeatureImportance {
  feature: string;
  category: string;
  importance: number; // 0 to 1
  description: string;
}

export interface MLEvaluationReport {
  isSyntheticDemo: true;
  disclaimer: string;
  modelVersion: string;
  trainedDate: string;
  datasetSize: {
    totalRecords: number;
    trainingRecords: number;
    testRecords: number;
    splitRatio: string;
  };
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    rocAuc: number;
    prAuc: number;
  };
  confusionMatrix: ConfusionMatrixData;
  featureImportances: FeatureImportance[];
  modelComparisons: ModelComparison[];
  calibrationCurve: Array<{ bin: string; predictedProb: number; trueFraction: number }>;
}
