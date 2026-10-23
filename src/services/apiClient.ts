/**
 * Frontend API Service Layer
 * Simulates RESTful asynchronous calls with localStorage persistence
 * and configurable network latency to demonstrate real-world loading states.
 */

const STORAGE_KEYS = {
  ENQUIRIES: 'edupredict_enquiries_v1',
  FOLLOW_UPS: 'edupredict_followups_v1',
  USERS: 'edupredict_users_v1',
  AUTH: 'edupredict_auth_v1',
};

export const delay = (ms: number = 180): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export class StorageService {
  static get<T>(key: string, defaultVal: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        localStorage.setItem(key, JSON.stringify(defaultVal));
        return defaultVal;
      }
      return JSON.parse(item) as T;
    } catch {
      return defaultVal;
    }
  }

  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Error saving to localStorage key "${key}":`, err);
    }
  }

  static reset(key: string, defaultVal: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(defaultVal));
    } catch (err) {
      console.error(`Error resetting key "${key}":`, err);
    }
  }
}

export { STORAGE_KEYS };
