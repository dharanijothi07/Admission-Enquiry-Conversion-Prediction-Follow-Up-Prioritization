import { User } from '../types/auth';
import { MOCK_USERS } from '../data/mockData';
import { StorageService, STORAGE_KEYS, delay } from './apiClient';

export class AuthService {
  private static getUsers(): User[] {
    return StorageService.get<User[]>(STORAGE_KEYS.USERS, MOCK_USERS);
  }

  static async getAllUsers(): Promise<User[]> {
    await delay(120);
    return this.getUsers();
  }

  static async getCurrentUser(): Promise<User> {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    // Default to Counsellor Priya for immediate follow-up testing, or Admin
    const defaultUser = this.getUsers()[0]; // Dr. S. Rangarajan (Admin)
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(defaultUser));
    return defaultUser;
  }

  static async login(email: string): Promise<User | null> {
    await delay(200);
    const users = this.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(found));
      return found;
    }
    return null;
  }

  static async switchUser(userId: string): Promise<User | null> {
    await delay(150);
    const users = this.getUsers();
    const found = users.find((u) => u.id === userId);
    if (found) {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(found));
      return found;
    }
    return null;
  }

  static async createUser(userData: Omit<User, 'id'>): Promise<User> {
    await delay(200);
    const users = this.getUsers();
    const newUser: User = {
      ...userData,
      id: `user-${Date.now().toString().slice(-4)}`
    };
    users.push(newUser);
    StorageService.set(STORAGE_KEYS.USERS, users);
    return newUser;
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    await delay(180);
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;

    users[idx] = { ...users[idx], ...updates };
    StorageService.set(STORAGE_KEYS.USERS, users);
    return users[idx];
  }

  static logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }
}
