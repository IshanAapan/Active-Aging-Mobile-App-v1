// Auth Service — Mock implementation
// Replace mock logic with real API calls when backend is ready

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants/config';
import { AuthUser } from '../types/user';

const STORAGE_KEY_USER = '@activeaging/user';
const STORAGE_KEY_TOKEN = '@activeaging/token';

// Simulated OTP store
const pendingOtps: Record<string, string> = {};

export const authService = {
  async sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
    if (Config.USE_MOCK_DATA) {
      // In mock mode, always succeed
      pendingOtps[phone] = Config.MOCK_OTP;
      return { success: true, message: 'OTP sent successfully' };
    }
    // TODO: Replace with real API call
    const response = await fetch(`${Config.API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    return response.json();
  },

  async verifyOtp(phone: string, otp: string): Promise<{ success: boolean; isNewUser: boolean; token?: string }> {
    if (Config.USE_MOCK_DATA) {
      if (otp === Config.MOCK_OTP) {
        const token = `mock-token-${phone}`;
        try {
          await AsyncStorage.setItem(STORAGE_KEY_TOKEN, token);
        } catch (e) {
          console.warn('AsyncStorage setItem storage token failed:', e);
        }
        return { success: true, isNewUser: true, token };
      }
      return { success: false, isNewUser: false };
    }
    // TODO: Replace with real API call
    const response = await fetch(`${Config.API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    });
    return response.json();
  },

  async getStoredUser(): Promise<AuthUser | null> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY_USER);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  },

  async saveUser(user: AuthUser): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  },

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([STORAGE_KEY_USER, STORAGE_KEY_TOKEN]);
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);
    return !!token;
  },
};
