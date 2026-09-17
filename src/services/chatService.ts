// Chat Service — Mock implementation

import { Config } from '../constants/config';
import { mockMessages } from '../data/mockMessages';
import { Message } from '../types/message';

// In-memory messages (initialized from mock data)
const messagesStore: Record<string, Message[]> = { ...mockMessages };

export const chatService = {
  async getMessages(communityId: string): Promise<Message[]> {
    if (Config.USE_MOCK_DATA) {
      return messagesStore[communityId] ?? [];
    }
    const response = await fetch(`${Config.API_BASE_URL}/communities/${communityId}/messages`);
    return response.json();
  },

  async sendMessage(communityId: string, senderId: string, senderName: string, senderPhoto: string, text: string): Promise<Message> {
    if (Config.USE_MOCK_DATA) {
      const message: Message = {
        id: `msg-${Date.now()}`,
        communityId,
        senderId,
        senderName,
        senderPhoto,
        text,
        createdAt: new Date().toISOString(),
      };
      if (!messagesStore[communityId]) {
        messagesStore[communityId] = [];
      }
      messagesStore[communityId].push(message);
      return message;
    }
    const response = await fetch(`${Config.API_BASE_URL}/communities/${communityId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId, text }),
    });
    return response.json();
  },

  async reportMessage(messageId: string): Promise<{ success: boolean }> {
    if (Config.USE_MOCK_DATA) {
      return { success: true };
    }
    const response = await fetch(`${Config.API_BASE_URL}/messages/${messageId}/report`, { method: 'POST' });
    return response.json();
  },
};
