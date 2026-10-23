import { AdmissionEnquiry } from '../types/enquiry';
import { PredictionResult, FeatureImpact, PriorityTier } from '../types/prediction';
import { MLEvaluationReport } from '../types/mlEvaluation';
import { MOCK_ML_EVALUATION } from '../data/mockData';
import { delay } from './apiClient';

/**
 * ML Prediction & Feature Attribution Engine (Academic Prototype)
 * Simulates inference from an XGBoost ensemble trained on historical admissions data.
 * Computes individual feature contribution weights (proxy for TreeSHAP values).
 */
export class MLService {
  /**
   * Generates real-time conversion probability and explainable factors
   * based on academic score, lead source, engagement telemetry, and visit history.
   */
  static predictConversion(enquiry: Partial<AdmissionEnquiry>): PredictionResult {
    let baseScore = 0.40; // baseline prior probability in college historical baseline
    const drivers: FeatureImpact[] = [];
    const risks: string[] = [];

    // 1. Qualifying Exam Percentage
    const pct = Number(enquiry.percentageScore) || 70;
    if (pct >= 90) {
      baseScore += 0.28;
      drivers.push({
        featureName: 'High 12th Board Marks / Cutoff',
        category: 'academic',
        value: `${pct}%`,
        weight: 0.28,
        impact: 'positive',
        explanation: 'Merit eligibility qualifies student for top branch allotment and institutional scholarship.'
      });
    } else if (pct >= 80) {
      baseScore += 0.16;
      drivers.push({
        featureName: 'Solid Board Performance',
        category: 'academic',
        value: `${pct}%`,
        weight: 0.16,
        impact: 'positive',
        explanation: 'Fulfills all prime engineering & management accreditation criteria.'
      });
    } else if (pct < 65) {
      baseScore -= 0.18;
      drivers.push({
        featureName: 'Borderline Qualifying Marks',
        category: 'academic',
        value: `${pct}%`,
        weight: -0.18,
        impact: 'negative',
        explanation: 'Stricter branch eligibility thresholds may require counselling re-evaluation.'
      });
      risks.push('Academic cutoff constraints might restrict branch selection');
    }

    // 2. Campus Visit with Parents
    if (enquiry.campusVisitAttended && enquiry.parentAccompanied) {
      baseScore += 0.25;
      drivers.push({
        featureName: 'Campus Visit with Parent Accompaniment',
        category: 'interaction',
        value: 'Attended with Parent',
        weight: 0.25,
        impact: 'positive',
        explanation: 'In-person physical tour with decision makers yields 3.9x higher final deposit rate.'
      });
    } else if (enquiry.campusVisitAttended) {
      baseScore += 0.14;
      drivers.push({
        featureName: 'Campus Visit Walk-in',
        category: 'interaction',
        value: 'Student Visited',
        weight: 0.14,
        impact: 'positive',
        explanation: 'Direct physical interaction shows proactive institutional consideration.'
      });
    } else {
      baseScore -= 0.10;
      drivers.push({
        featureName: 'Campus Visit Not Yet Scheduled',
        category: 'interaction',
        value: 'Not Visited',
        weight: -0.10,
        impact: 'negative',
        explanation: 'Students who only inquire online without visiting have higher dropout rates.'
      });
      risks.push('Has not visited physical campus or labs yet');
    }

    // 3. Lead Source Weighting
    const source = enquiry.leadSource || 'Website Form';
    if (source === 'Alumni Referral') {
      baseScore += 0.22;
      drivers.push({
        featureName: 'Alumni Referral Trust Factor',
        category: 'interaction',
        value: source,
        weight: 0.22,
        impact: 'positive',
        explanation: 'Peer endorsements from verified alumni have the highest conversion ratio.'
      });
    } else if (source === 'Walk-in / Campus Visit') {
      baseScore += 0.18;
      drivers.push({
        featureName: 'Direct Walk-in Intent',
        category: 'interaction',
        value: source,
        weight: 0.18,
        impact: 'positive',
        explanation: 'Self-initiated campus visit signals active admission readiness.'
      });
    } else if (source === 'Social Media (Instagram/LinkedIn)') {
      baseScore -= 0.08;
      drivers.push({
        featureName: 'Broad Social Lead Funnel',
        category: 'interaction',
        value: source,
        weight: -0.08,
        impact: 'negative',
        explanation: 'Social ad impressions often encompass exploratory inquiries needing warm qualification.'
      });
      risks.push('Originates from social campaign; high risk of non-response if delayed');
    }

    // 4. Engagement Score Telemetry
    const eng = Number(enquiry.engagementScore) || 50;
    if (eng >= 80) {
      baseScore += 0.12;
      drivers.push({
        featureName: 'High Digital Engagement Telemetry',
        category: 'engagement',
        value: `${eng}/100 Score`,
        weight: 0.12,
        impact: 'positive',
        explanation: 'Frequent prospectus viewing and responsive WhatsApp interactions.'
      });
    } else if (eng < 45) {
      baseScore -= 0.12;
      drivers.push({
        featureName: 'Low Engagement Signal',
        category: 'engagement',
        value: `${eng}/100 Score`,
        weight: -0.12,
        impact: 'negative',
        explanation: 'Few touchpoints recorded since initial enquiry.'
      });
    }

    // 5. Status Stage progression
    if (enquiry.status === 'Application Submitted') {
      baseScore += 0.15;
    } else if (enquiry.status === 'Converted') {
      baseScore = 0.98;
    }

    // Clamp between 0.05 and 0.98
    const finalScore = Math.min(0.98, Math.max(0.08, baseScore));
    const probabilityPercentage = Math.round(finalScore * 100);

    // Determine Priority Tier
    let priority: PriorityTier = 'Medium';
    let recommendedAction = 'Standard follow-up call with course brochure';

    if (finalScore >= 0.85) {
      priority = 'Urgent';
      recommendedAction = 'High conversion potential! Schedule senior faculty/HOD call within 24 hours & extend provisional seat offer.';
    } else if (finalScore >= 0.70) {
      priority = 'High';
      recommendedAction = 'Send personalized campus tour invitation and invite parents for fee & scholarship briefing.';
    } else if (finalScore >= 0.45) {
      priority = 'Medium';
      recommendedAction = 'Follow up via WhatsApp with department placement highlights and virtual tour video link.';
    } else {
      priority = 'Low';
      recommendedAction = 'Add to automated email drip campaign & quarterly open-house webinar list.';
    }

    return {
      score: Number(finalScore.toFixed(2)),
      probabilityPercentage,
      priority,
      confidenceScore: 0.91,
      modelVersion: 'XGBoost-Ensemble-v2.3 (Demo/College Prototype)',
      predictedAt: new Date().toISOString(),
      recommendedAction,
      topDrivers: drivers.slice(0, 4),
      riskFactors: risks
    };
  }

  /**
   * Retrieves model evaluation metrics (synthetic test dataset benchmarks)
   */
  static async getEvaluationReport(): Promise<MLEvaluationReport> {
    await delay(120);
    return MOCK_ML_EVALUATION;
  }
}
