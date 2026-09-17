// Community Service — Mock implementation

import { Config } from '../constants/config';
import { mockCommunities } from '../data/mockCommunities';
import { Community, CommunityCategory } from '../types/community';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_JOINED = '@activeaging/joinedCommunities';

let joinedCommunityIds: Set<string> = new Set(['comm-1', 'comm-2']);

async function loadJoined() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY_JOINED);
    if (data) joinedCommunityIds = new Set(JSON.parse(data));
  } catch {}
}

async function saveJoined() {
  await AsyncStorage.setItem(STORAGE_KEY_JOINED, JSON.stringify([...joinedCommunityIds]));
}

loadJoined();

export const communityService = {
  async getCommunities(category?: CommunityCategory): Promise<Community[]> {
    if (Config.USE_MOCK_DATA) {
      let comms = [...mockCommunities];
      if (category) comms = comms.filter(c => c.category === category);
      return comms;
    }
    const url = category
      ? `${Config.API_BASE_URL}/communities?category=${category}`
      : `${Config.API_BASE_URL}/communities`;
    const response = await fetch(url);
    return response.json();
  },

  async getCommunityById(id: string): Promise<Community | null> {
    if (Config.USE_MOCK_DATA) {
      return mockCommunities.find(c => c.id === id) ?? null;
    }
    const response = await fetch(`${Config.API_BASE_URL}/communities/${id}`);
    return response.json();
  },

  async joinCommunity(communityId: string, userId: string): Promise<{ success: boolean }> {
    if (Config.USE_MOCK_DATA) {
      const community = mockCommunities.find(c => c.id === communityId);
      if (community && !community.memberIds.includes(userId)) {
        community.memberIds.push(userId);
      }
      joinedCommunityIds.add(communityId);
      await saveJoined();
      return { success: true };
    }
    const response = await fetch(`${Config.API_BASE_URL}/communities/${communityId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return response.json();
  },

  async leaveCommunity(communityId: string, userId: string): Promise<{ success: boolean }> {
    if (Config.USE_MOCK_DATA) {
      const community = mockCommunities.find(c => c.id === communityId);
      if (community) {
        community.memberIds = community.memberIds.filter(id => id !== userId);
      }
      joinedCommunityIds.delete(communityId);
      await saveJoined();
      return { success: true };
    }
    const response = await fetch(`${Config.API_BASE_URL}/communities/${communityId}/leave`, {
      method: 'POST',
    });
    return response.json();
  },

  async isJoined(communityId: string): Promise<boolean> {
    await loadJoined();
    return joinedCommunityIds.has(communityId);
  },

  async getUserCommunities(userId: string): Promise<Community[]> {
    if (Config.USE_MOCK_DATA) {
      return mockCommunities.filter(c => c.memberIds.includes(userId));
    }
    const response = await fetch(`${Config.API_BASE_URL}/users/${userId}/communities`);
    return response.json();
  },
};
