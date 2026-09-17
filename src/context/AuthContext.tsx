// Auth Context — provides authentication state throughout the app

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { AuthUser } from '../types/user';
import { mockUsers, CURRENT_USER_ID } from '../data/mockUsers';
import { Config } from '../constants/config';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; isNewUser: boolean }>;
  completeOnboarding: (userData: Partial<AuthUser>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      if (Config.USE_MOCK_DATA) {
        // Pre-populate with mock user for development
        const mockUser = mockUsers.find(u => u.id === CURRENT_USER_ID);
        if (mockUser) {
          const authUser: AuthUser = {
            ...mockUser,
            phone: '+91 98765 43210',
            isOnboardingComplete: true,
          };
          setUser(authUser);
        }
      } else {
        const storedUser = await authService.getStoredUser();
        setUser(storedUser);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(phone: string) {
    return authService.sendOtp(phone);
  }

  async function verifyOtp(phone: string, otp: string) {
    try {
      const result = await authService.verifyOtp(phone, otp);
      if (result.success) {
        if (Config.USE_MOCK_DATA) {
          const mockUser = mockUsers[0];
          const authUser: AuthUser = {
            ...mockUser,
            phone,
            isOnboardingComplete: true, // auto complete onboarding to skip profile step in dev testing
          };
          setUser(authUser);
          await authService.saveUser(authUser);
        } else {
          const storedUser = await authService.getStoredUser();
          setUser(storedUser);
        }
      }
      return result;
    } catch (e) {
      console.error('verifyOtp failed:', e);
      throw e;
    }
  }

  async function completeOnboarding(userData: Partial<AuthUser>) {
    if (user) {
      const updatedUser = { ...user, ...userData, isOnboardingComplete: true };
      setUser(updatedUser);
      await authService.saveUser(updatedUser);
    }
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  async function refreshUser() {
    await loadUser();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        verifyOtp,
        completeOnboarding,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
