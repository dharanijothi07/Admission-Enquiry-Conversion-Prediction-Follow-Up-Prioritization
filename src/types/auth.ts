export type UserRole = 'admin' | 'counsellor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
  phone: string;
  activeEnquiriesCount: number;
  conversionRate: number; // in percentage e.g. 42.5
  status: 'active' | 'on-leave' | 'inactive';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
