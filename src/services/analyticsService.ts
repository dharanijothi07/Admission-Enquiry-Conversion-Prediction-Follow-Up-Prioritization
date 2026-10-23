import { EnquiryService } from './enquiryService';
import { FollowUpService } from './followUpService';
import { 
  MOCK_FUNNEL_DATA, 
  MOCK_MONTHLY_TRENDS, 
  MOCK_SOURCE_PERFORMANCE 
} from '../data/mockData';
import { delay } from './apiClient';

export interface DashboardMetrics {
  totalEnquiries: number;
  urgentFollowUps: number;
  predictedHighIntent: number; // probability >= 75%
  avgConversionProbability: number;
  overallConversionRate: number;
  pendingTasksToday: number;
  completedTasksThisWeek: number;
}

export class AnalyticsService {
  static async getExecutiveMetrics(): Promise<DashboardMetrics> {
    await delay(120);
    const enquiries = await EnquiryService.getAllEnquiries();
    const tasks = await FollowUpService.getAllTasks();

    const highIntentCount = enquiries.filter((e) => e.prediction.probabilityPercentage >= 75).length;
    const urgentCount = enquiries.filter((e) => e.priorityTier === 'Urgent').length;
    const convertedCount = enquiries.filter((e) => e.status === 'Converted').length;

    const totalProb = enquiries.reduce((acc, curr) => acc + curr.prediction.probabilityPercentage, 0);
    const avgProb = enquiries.length > 0 ? Math.round(totalProb / enquiries.length) : 0;
    const convRate = enquiries.length > 0 ? Number(((convertedCount / enquiries.length) * 100).toFixed(1)) : 0;

    const todayStr = '2026-10-23'; // sync with prototype demo day
    const pendingToday = tasks.filter((t) => t.status === 'Pending' && t.scheduledDate === todayStr).length;
    const completedTasks = tasks.filter((t) => t.status === 'Completed').length;

    return {
      totalEnquiries: enquiries.length,
      urgentFollowUps: urgentCount,
      predictedHighIntent: highIntentCount,
      avgConversionProbability: avgProb,
      overallConversionRate: convRate,
      pendingTasksToday: pendingToday,
      completedTasksThisWeek: completedTasks
    };
  }

  static async getCounsellorMetrics(counsellorId: string): Promise<DashboardMetrics> {
    await delay(120);
    const allEnquiries = await EnquiryService.getAllEnquiries();
    const allTasks = await FollowUpService.getAllTasks();

    const myEnquiries = allEnquiries.filter((e) => e.counsellorId === counsellorId);
    const myTasks = allTasks.filter((t) => t.counsellorId === counsellorId);

    const highIntentCount = myEnquiries.filter((e) => e.prediction.probabilityPercentage >= 75).length;
    const urgentCount = myEnquiries.filter((e) => e.priorityTier === 'Urgent').length;
    const convertedCount = myEnquiries.filter((e) => e.status === 'Converted').length;

    const totalProb = myEnquiries.reduce((acc, curr) => acc + curr.prediction.probabilityPercentage, 0);
    const avgProb = myEnquiries.length > 0 ? Math.round(totalProb / myEnquiries.length) : 0;
    const convRate = myEnquiries.length > 0 ? Number(((convertedCount / myEnquiries.length) * 100).toFixed(1)) : 0;

    const todayStr = '2026-10-23';
    const pendingToday = myTasks.filter((t) => t.status === 'Pending' && t.scheduledDate === todayStr).length;
    const completedTasks = myTasks.filter((t) => t.status === 'Completed').length;

    return {
      totalEnquiries: myEnquiries.length,
      urgentFollowUps: urgentCount,
      predictedHighIntent: highIntentCount,
      avgConversionProbability: avgProb,
      overallConversionRate: convRate,
      pendingTasksToday: pendingToday,
      completedTasksThisWeek: completedTasks
    };
  }

  static async getFunnelData() {
    await delay(100);
    return MOCK_FUNNEL_DATA;
  }

  static async getMonthlyTrends() {
    await delay(100);
    return MOCK_MONTHLY_TRENDS;
  }

  static async getSourcePerformance() {
    await delay(100);
    return MOCK_SOURCE_PERFORMANCE;
  }
}
