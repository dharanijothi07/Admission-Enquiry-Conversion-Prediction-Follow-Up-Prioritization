import { FollowUpTask, FollowUpStatus, CallDisposition, FollowUpOperationalSummary, PriorityAuditItem } from '../types/followUp';
import { MOCK_FOLLOW_UPS } from '../data/mockData';
import { StorageService, STORAGE_KEYS, delay } from './apiClient';

const GOVERNANCE_DISCLAIMER =
  "Prioritization Engine optimizes counsellor contact queues only. It strictly does NOT automate or influence formal admission/enrollment decisions. No sensitive demographic attributes are utilized.";

export class FollowUpService {
  private static decorateTask(task: FollowUpTask): FollowUpTask {
    const todayStr = new Date().toISOString().split('T')[0];
    const isOverdue = task.status === 'Pending' && task.scheduledDate < todayStr;
    const isDueToday = task.status === 'Pending' && task.scheduledDate === todayStr;
    
    let daysOverdue = 0;
    if (isOverdue) {
      const diffMs = new Date(todayStr).getTime() - new Date(task.scheduledDate).getTime();
      daysOverdue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }

    // Default transparent reasons if not already set
    const reasons = task.priorityReasons || [];
    if (reasons.length === 0) {
      if (isOverdue) {
        reasons.push(`Overdue follow-up (${daysOverdue} days backlog, +28 pts)`);
      } else if (isDueToday) {
        reasons.push('Callback scheduled for today (+22 pts)');
      }
      if (task.conversionProbability && task.conversionProbability >= 75) {
        reasons.push(`High ML conversion propensity (${task.conversionProbability}%, +15 pts)`);
      } else if (task.conversionProbability) {
        reasons.push(`ML conversion propensity (${task.conversionProbability}%, +10 pts)`);
      }
      if (!task.counsellorId) {
        reasons.push('Unassigned lead requiring counsellor allocation (+10 pts)');
      }
    }

    // Deterministic recommended action if not already present
    let action = task.recommendedAction;
    if (!action) {
      if (isOverdue) {
        action = 'Execute overdue follow-up call immediately and record call outcome notes.';
      } else if (task.conversionProbability && task.conversionProbability >= 75) {
        action = 'High propensity lead: arrange personal department tour and faculty consultation.';
      } else {
        action = 'Conduct scheduled touchpoint and verify candidate program interest.';
      }
    }

    return {
      ...task,
      isOverdue,
      isDueToday,
      daysOverdue,
      priorityReasons: reasons,
      recommendedAction: action,
      governanceNotice: GOVERNANCE_DISCLAIMER
    };
  }

  static getTasks(): FollowUpTask[] {
    const raw = StorageService.get<FollowUpTask[]>(STORAGE_KEYS.FOLLOW_UPS, MOCK_FOLLOW_UPS);
    return raw.map(this.decorateTask);
  }

  static async getAllTasks(): Promise<FollowUpTask[]> {
    await delay(120);
    return this.getTasks();
  }

  static async getTasksByCounsellor(counsellorId: string): Promise<FollowUpTask[]> {
    await delay(100);
    const tasks = this.getTasks();
    return tasks.filter((t) => t.counsellorId === counsellorId);
  }

  static async getTasksForEnquiry(enquiryId: string): Promise<FollowUpTask[]> {
    await delay(80);
    const tasks = this.getTasks();
    return tasks.filter((t) => t.enquiryId === enquiryId);
  }

  static async getOperationalSummary(counsellorId?: string): Promise<FollowUpOperationalSummary> {
    await delay(100);
    let tasks = this.getTasks();
    if (counsellorId) {
      tasks = tasks.filter((t) => t.counsellorId === counsellorId);
    }

    const pending = tasks.filter((t) => t.status === 'Pending');
    const overdue = pending.filter((t) => t.isOverdue);
    const dueToday = pending.filter((t) => t.isDueToday);
    const high = pending.filter((t) => t.priority === 'Urgent' || t.priority === 'High' || t.isOverdue);
    const medium = pending.filter((t) => t.priority === 'Medium' && !t.isOverdue);
    const low = pending.filter((t) => t.priority === 'Low' && !t.isOverdue);
    const overridden = tasks.filter((t) => t.isOverridden);

    return {
      totalTasks: tasks.length,
      pendingTasks: pending.length,
      overdueTasks: overdue.length,
      dueTodayTasks: dueToday.length,
      highPriorityTasks: high.length,
      mediumPriorityTasks: medium.length,
      lowPriorityTasks: low.length,
      overriddenTasks: overridden.length,
      governanceNotice: GOVERNANCE_DISCLAIMER
    };
  }

  static async createTask(taskData: Omit<FollowUpTask, 'id' | 'createdAt'>): Promise<FollowUpTask> {
    await delay(150);
    const tasks = this.getTasks();
    const newTask: FollowUpTask = this.decorateTask({
      ...taskData,
      id: `TASK-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString()
    });
    tasks.unshift(newTask);
    StorageService.set(STORAGE_KEYS.FOLLOW_UPS, tasks);
    return newTask;
  }

  static async overrideTaskPriority(
    taskId: string,
    newPriority: 'Urgent' | 'High' | 'Medium' | 'Low',
    overrideReason: string,
    counsellorName: string = 'Current Counsellor'
  ): Promise<FollowUpTask | null> {
    await delay(150);
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return null;

    const existing = tasks[idx];
    const prevPriority = existing.priority;
    const nowIso = new Date().toISOString();

    const overrideNote = `MANUAL OVERRIDE: Counsellor set priority to ${newPriority} (Reason: ${overrideReason})`;
    const updatedReasons = [overrideNote, ...(existing.priorityReasons || []).filter(r => !r.startsWith('MANUAL OVERRIDE'))];

    tasks[idx] = {
      ...existing,
      priority: newPriority,
      isOverridden: true,
      overriddenPriority: newPriority,
      overrideReason,
      overriddenByName: counsellorName,
      overriddenAt: nowIso,
      priorityReasons: updatedReasons
    };

    // Store audit trail entry
    const auditKey = 'edupredict_priority_audits';
    const audits = StorageService.get<PriorityAuditItem[]>(auditKey, []);
    audits.unshift({
      id: `AUDIT-${Date.now()}`,
      followupId: taskId,
      enquiryId: existing.enquiryId,
      action: 'PRIORITY_OVERRIDE',
      previousPriority: prevPriority,
      newPriority,
      operationalScore: existing.operationalScore || 50,
      modelVersion: existing.modelVersion || 'admission_model_v1.0.0',
      predictionTimestamp: existing.predictionTimestamp || nowIso,
      overrideReason,
      reasons: updatedReasons,
      changedByName: counsellorName,
      createdAt: nowIso
    });
    StorageService.set(auditKey, audits);

    StorageService.set(STORAGE_KEYS.FOLLOW_UPS, tasks);
    return tasks[idx];
  }

  static async getTaskAuditTrail(taskId: string): Promise<PriorityAuditItem[]> {
    await delay(80);
    const auditKey = 'edupredict_priority_audits';
    const audits = StorageService.get<PriorityAuditItem[]>(auditKey, []);
    return audits.filter(a => a.followupId === taskId);
  }

  static async updateTaskStatus(
    taskId: string, 
    status: FollowUpStatus, 
    outcome?: CallDisposition, 
    notes?: string
  ): Promise<FollowUpTask | null> {
    await delay(120);
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return null;

    tasks[idx] = {
      ...tasks[idx],
      status,
      outcome: outcome || tasks[idx].outcome,
      notes: notes ? `${tasks[idx].notes} | Note: ${notes}` : tasks[idx].notes,
      completedAt: status === 'Completed' ? new Date().toISOString() : undefined
    };

    StorageService.set(STORAGE_KEYS.FOLLOW_UPS, tasks);
    return tasks[idx];
  }

  static async rescheduleTask(taskId: string, newDate: string, newTime: string, notes?: string): Promise<FollowUpTask | null> {
    await delay(120);
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return null;

    tasks[idx] = this.decorateTask({
      ...tasks[idx],
      scheduledDate: newDate,
      scheduledTime: newTime,
      status: 'Pending',
      notes: notes ? `${tasks[idx].notes} | Rescheduled: ${notes}` : tasks[idx].notes
    });

    StorageService.set(STORAGE_KEYS.FOLLOW_UPS, tasks);
    return tasks[idx];
  }

  static resetToDemoData(): void {
    StorageService.reset(STORAGE_KEYS.FOLLOW_UPS, MOCK_FOLLOW_UPS);
  }
}
