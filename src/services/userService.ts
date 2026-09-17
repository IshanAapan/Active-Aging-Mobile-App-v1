// User Service — Mock implementation

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants/config';
import { mockUsers, CURRENT_USER_ID } from '../data/mockUsers';
import { User, UserProfile } from '../types/user';
import { mockInterests } from '../data/mockInterests';

const STORAGE_KEY_JOINED = '@activeaging/joinedActivities';

export const userService = {
  async getCurrentUser(): Promise<User | null> {
    if (Config.USE_MOCK_DATA) {
      return mockUsers.find(u => u.id === CURRENT_USER_ID) ?? null;
    }
    // TODO: Replace with real API
    const response = await fetch(`${Config.API_BASE_URL}/users/me`);
    return response.json();
  },

  async getUserById(id: string): Promise<User | null> {
    if (Config.USE_MOCK_DATA) {
      return mockUsers.find(u => u.id === id) ?? null;
    }
    const response = await fetch(`${Config.API_BASE_URL}/users/${id}`);
    return response.json();
  },

  async getPeopleWithSimilarInterests(userId: string): Promise<UserProfile[]> {
    if (Config.USE_MOCK_DATA) {
      const currentUser = mockUsers.find(u => u.id === userId);
      if (!currentUser) return [];

      return mockUsers
        .filter(u => u.id !== userId)
        .map(u => {
          const common = u.interests.filter(i => currentUser.interests.includes(i));
          return { ...u, commonInterestsCount: common.length };
        })
        .filter(u => u.commonInterestsCount > 0)
        .sort((a, b) => (b.commonInterestsCount ?? 0) - (a.commonInterestsCount ?? 0));
    }
    const response = await fetch(`${Config.API_BASE_URL}/users/${userId}/similar`);
    return response.json();
  },

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    if (Config.USE_MOCK_DATA) {
      const user = mockUsers.find(u => u.id === userId);
      if (!user) throw new Error('User not found');
      Object.assign(user, data);
      return user;
    }
    const response = await fetch(`${Config.API_BASE_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getInterestById(id: string) {
    return mockInterests.find(i => i.id === id);
  },

  getInterestsByIds(ids: string[]) {
    return mockInterests.filter(i => ids.includes(i.id));
  },
};
