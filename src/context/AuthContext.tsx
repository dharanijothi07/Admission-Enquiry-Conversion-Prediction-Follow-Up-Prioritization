import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/auth';
import { AuthService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAdmin: boolean;
  isCounsellor: boolean;
  isLoading: boolean;
  allUsers: User[];
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [currentUser, users] = await Promise.all([
        AuthService.getCurrentUser(),
        AuthService.getAllUsers()
      ]);
      setUser(currentUser);
      setAllUsers(users);
    } catch (err) {
      console.error('Failed to initialize auth state', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const login = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    const loggedIn = await AuthService.login(email);
    setIsLoading(false);
    if (loggedIn) {
      setUser(loggedIn);
      return true;
    }
    return false;
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const switchRole = async (targetRole: UserRole) => {
    const target = allUsers.find((u) => u.role === targetRole);
    if (target) {
      await switchUser(target.id);
    }
  };

  const switchUser = async (userId: string) => {
    setIsLoading(true);
    const switched = await AuthService.switchUser(userId);
    if (switched) {
      setUser(switched);
    }
    setIsLoading(false);
  };

  const refreshUsers = async () => {
    const users = await AuthService.getAllUsers();
    setAllUsers(users);
  };

  const role = user?.role || 'counsellor';
  const isAdmin = role === 'admin';
  const isCounsellor = role === 'counsellor';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isCounsellor,
        isLoading,
        allUsers,
        login,
        logout,
        switchRole,
        switchUser,
        refreshUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
