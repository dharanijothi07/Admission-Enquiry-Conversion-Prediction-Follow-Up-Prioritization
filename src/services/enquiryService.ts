import { AdmissionEnquiry, EnquiryFilterState, InteractionLog } from '../types/enquiry';
import { MOCK_ENQUIRIES } from '../data/mockData';
import { MLService } from './mlService';
import { StorageService, STORAGE_KEYS, delay } from './apiClient';

export class EnquiryService {
  private static getStoredEnquiries(): AdmissionEnquiry[] {
    return StorageService.get<AdmissionEnquiry[]>(STORAGE_KEYS.ENQUIRIES, MOCK_ENQUIRIES);
  }

  static async getAllEnquiries(): Promise<AdmissionEnquiry[]> {
    await delay(160);
    return this.getStoredEnquiries();
  }

  static async getEnquiryById(id: string): Promise<AdmissionEnquiry | null> {
    await delay(120);
    const enquiries = this.getStoredEnquiries();
    return enquiries.find((e) => e.id === id || e.applicationNo === id) || null;
  }

  static async createEnquiry(
    formData: Omit<AdmissionEnquiry, 'id' | 'applicationNo' | 'prediction' | 'priorityTier' | 'interactions' | 'followUpTasks' | 'createdAt' | 'updatedAt'>
  ): Promise<AdmissionEnquiry> {
    await delay(250);
    const enquiries = this.getStoredEnquiries();
    
    // Auto-predict ML score and explainability factors
    const prediction = MLService.predictConversion(formData);

    const now = new Date().toISOString();
    const count = enquiries.length + 89;
    const newEnquiry: AdmissionEnquiry = {
      ...formData,
      id: `ENQ-2026-${String(count).padStart(3, '0')}`,
      applicationNo: `APP-2026-${String(count).padStart(4, '0')}`,
      prediction,
      priorityTier: prediction.priority,
      interactions: [
        {
          id: `int-${Date.now()}`,
          timestamp: new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          counsellorName: formData.counsellorName,
          type: 'System Note',
          notes: `Enquiry registered via ${formData.leadSource}. Initial AI conversion score evaluated at ${prediction.probabilityPercentage}%.`
        }
      ],
      followUpTasks: [],
      createdAt: now,
      updatedAt: now
    };

    enquiries.unshift(newEnquiry);
    StorageService.set(STORAGE_KEYS.ENQUIRIES, enquiries);
    return newEnquiry;
  }

  static async updateEnquiry(
    id: string,
    updates: Partial<AdmissionEnquiry>
  ): Promise<AdmissionEnquiry | null> {
    await delay(200);
    const enquiries = this.getStoredEnquiries();
    const index = enquiries.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const existing = enquiries[index];
    const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };

    // Re-run ML model when features change
    const newPrediction = MLService.predictConversion(merged);
    merged.prediction = newPrediction;
    merged.priorityTier = newPrediction.priority;

    enquiries[index] = merged;
    StorageService.set(STORAGE_KEYS.ENQUIRIES, enquiries);
    return merged;
  }

  static async addInteraction(
    enquiryId: string,
    interaction: Omit<InteractionLog, 'id' | 'timestamp'>
  ): Promise<AdmissionEnquiry | null> {
    await delay(150);
    const enquiries = this.getStoredEnquiries();
    const index = enquiries.findIndex((e) => e.id === enquiryId);
    if (index === -1) return null;

    const newLog: InteractionLog = {
      id: `int-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      ...interaction
    };

    enquiries[index].interactions.unshift(newLog);
    enquiries[index].lastContactedDate = new Date().toISOString().split('T')[0];
    enquiries[index].updatedAt = new Date().toISOString();

    // Interaction can increase engagement score
    enquiries[index].engagementScore = Math.min(100, (enquiries[index].engagementScore || 50) + 8);
    const updatedPrediction = MLService.predictConversion(enquiries[index]);
    enquiries[index].prediction = updatedPrediction;
    enquiries[index].priorityTier = updatedPrediction.priority;

    StorageService.set(STORAGE_KEYS.ENQUIRIES, enquiries);
    return enquiries[index];
  }

  static async deleteEnquiry(id: string): Promise<boolean> {
    await delay(150);
    const enquiries = this.getStoredEnquiries();
    const filtered = enquiries.filter((e) => e.id !== id);
    if (filtered.length === enquiries.length) return false;
    StorageService.set(STORAGE_KEYS.ENQUIRIES, filtered);
    return true;
  }

  static filterEnquiries(enquiries: AdmissionEnquiry[], filters: EnquiryFilterState): AdmissionEnquiry[] {
    return enquiries.filter((item) => {
      // Search text
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesText =
          item.studentName.toLowerCase().includes(query) ||
          item.email.toLowerCase().includes(query) ||
          item.phone.includes(query) ||
          item.applicationNo.toLowerCase().includes(query) ||
          item.city.toLowerCase().includes(query);
        if (!matchesText) return false;
      }

      // Program
      if (filters.program && item.program !== filters.program) {
        return false;
      }

      // Status
      if (filters.status && item.status !== filters.status) {
        return false;
      }

      // Priority Tier
      if (filters.priority && item.priorityTier !== filters.priority) {
        return false;
      }

      // Lead Source
      if (filters.leadSource && item.leadSource !== filters.leadSource) {
        return false;
      }

      // Counsellor
      if (filters.counsellorId && item.counsellorId !== filters.counsellorId) {
        return false;
      }

      // Min Probability
      if (filters.minProbability && item.prediction.probabilityPercentage < filters.minProbability) {
        return false;
      }

      return true;
    });
  }

  static resetToDemoData(): void {
    StorageService.reset(STORAGE_KEYS.ENQUIRIES, MOCK_ENQUIRIES);
  }
}
