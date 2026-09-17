// Notification Service — Mock implementation

import { Config } from '../constants/config';
import { mockNotifications } from '../data/mockNotifications';
import { Notification } from '../types/notification';

let notifications = [...mockNotifications];

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    if (Config.USE_MOCK_DATA) {
      return [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    const response = await fetch(`${Config.API_BASE_URL}/notifications`);
    return response.json();
  },

  async markAsRead(notificationId: string): Promise<void> {
    if (Config.USE_MOCK_DATA) {
      const notif = notifications.find(n => n.id === notificationId);
      if (notif) notif.read = true;
      return;
    }
    await fetch(`${Config.API_BASE_URL}/notifications/${notificationId}/read`, { method: 'POST' });
  },

  async markAllAsRead(): Promise<void> {
    if (Config.USE_MOCK_DATA) {
      notifications = notifications.map(n => ({ ...n, read: true }));
      return;
    }
    await fetch(`${Config.API_BASE_URL}/notifications/read-all`, { method: 'POST' });
  },

  getUnreadCount(): number {
    return notifications.filter(n => !n.read).length;
  },

  addLocalNotification(notif: Omit<Notification, 'id' | 'createdAt' | 'read'>): void {
    notifications.unshift({
      ...notif,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    });
  },
};
