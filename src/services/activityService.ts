// Activity Service — Mock implementation

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants/config';
import { mockActivities } from '../data/mockActivities';
import { Activity, ActivityCategory } from '../types/activity';

const STORAGE_KEY_JOINED = '@activeaging/joinedActivities';

// In-memory joined activities (will be persisted to AsyncStorage)
let joinedActivityIds: Set<string> = new Set(['act-1', 'act-3']);

async function loadJoinedActivities() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY_JOINED);
    if (data) {
      joinedActivityIds = new Set(JSON.parse(data));
    }
  } catch {}
}

async function saveJoinedActivities() {
  await AsyncStorage.setItem(STORAGE_KEY_JOINED, JSON.stringify([...joinedActivityIds]));
}

// Initialize on first use
loadJoinedActivities();

export const activityService = {
  async getActivities(category?: ActivityCategory): Promise<Activity[]> {
    if (Config.USE_MOCK_DATA) {
      let acts = [...mockActivities];
      if (category) {
        acts = acts.filter(a => a.category === category);
      }
      return acts.map(a => ({
        ...a,
        participantIds: a.participantIds.map(id => id),
      }));
    }
    const url = category
      ? `${Config.API_BASE_URL}/activities?category=${category}`
      : `${Config.API_BASE_URL}/activities`;
    const response = await fetch(url);
    return response.json();
  },

  async getActivityById(id: string): Promise<Activity | null> {
    if (Config.USE_MOCK_DATA) {
      return mockActivities.find(a => a.id === id) ?? null;
    }
    const response = await fetch(`${Config.API_BASE_URL}/activities/${id}`);
    return response.json();
  },

  async joinActivity(activityId: string, userId: string): Promise<{ success: boolean; message: string }> {
    if (Config.USE_MOCK_DATA) {
      const activity = mockActivities.find(a => a.id === activityId);
      if (!activity) return { success: false, message: 'Activity not found.' };
      if (activity.status === 'cancelled') return { success: false, message: 'This activity has been cancelled.' };
      if (activity.participantIds.length >= activity.maxParticipants) {
        return { success: false, message: 'This activity is full. You can join the waitlist.' };
      }
      if (!activity.participantIds.includes(userId)) {
        activity.participantIds.push(userId);
      }
      joinedActivityIds.add(activityId);
      await saveJoinedActivities();
      return { success: true, message: 'You have successfully joined!' };
    }
    const response = await fetch(`${Config.API_BASE_URL}/activities/${activityId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return response.json();
  },

  async leaveActivity(activityId: string, userId: string): Promise<{ success: boolean }> {
    if (Config.USE_MOCK_DATA) {
      const activity = mockActivities.find(a => a.id === activityId);
      if (activity) {
        activity.participantIds = activity.participantIds.filter(id => id !== userId);
      }
      joinedActivityIds.delete(activityId);
      await saveJoinedActivities();
      return { success: true };
    }
    const response = await fetch(`${Config.API_BASE_URL}/activities/${activityId}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return response.json();
  },

  async isJoined(activityId: string): Promise<boolean> {
    await loadJoinedActivities();
    return joinedActivityIds.has(activityId);
  },

  async getJoinedActivityIds(): Promise<string[]> {
    await loadJoinedActivities();
    return [...joinedActivityIds];
  },

  async getRecommendedActivities(userInterests: string[]): Promise<Activity[]> {
    if (Config.USE_MOCK_DATA) {
      return mockActivities
        .filter(a => userInterests.includes(a.category))
        .slice(0, 4);
    }
    const response = await fetch(`${Config.API_BASE_URL}/activities/recommended`);
    return response.json();
  },
};
