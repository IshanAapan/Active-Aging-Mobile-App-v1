// Notifications Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/colors';
import { FontSize, FontWeight } from '../src/constants/typography';
import { Spacing, BorderRadius, TouchTarget } from '../src/constants/spacing';
import { EmptyState } from '../src/components/ui/EmptyState';
import { notificationService } from '../src/services/notificationService';
import { Notification, NotificationType } from '../src/types/notification';
import { timeAgo } from '../src/utils/date';
import { analyticsService } from '../src/services/analyticsService';

const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  activity_reminder: '🔔',
  activity_joined: '🎉',
  activity_updated: '📝',
  activity_cancelled: '❌',
  community_message: '💬',
  new_activity: '✨',
  community_joined: '🏘️',
  participant_update: '👥',
};

interface NotifCardProps {
  notification: Notification;
  onPress: () => void;
}

function NotifCard({ notification, onPress }: NotifCardProps) {
  return (
    <TouchableOpacity
      style={[styles.notifCard, !notification.read ? styles.unreadCard : undefined]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={notification.title}
    >
      <View style={styles.notifIconContainer}>
        <Text style={styles.notifIcon}>
          {NOTIFICATION_ICONS[notification.type]}
        </Text>
      </View>
      <View style={styles.notifContent}>
        <Text style={[styles.notifTitle, !notification.read ? styles.unreadTitle : undefined]}>
          {notification.title}
        </Text>
        <Text style={styles.notifBody} numberOfLines={2}>
          {notification.body}
        </Text>
        <Text style={styles.notifTime}>{timeAgo(notification.createdAt)}</Text>
      </View>
      {!notification.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
    analyticsService.screen('Notifications');
  }, []);

  async function loadNotifications() {
    const notifs = await notificationService.getNotifications();
    setNotifications(notifs);
  }

  async function handleNotifPress(notif: Notification) {
    await notificationService.markAsRead(notif.id);
    analyticsService.track('notification_opened', { type: notif.type });
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));

    if (notif.activityId) {
      router.push(`/activities/${notif.activityId}`);
    } else if (notif.communityId) {
      router.push(`/communities/${notif.communityId}`);
    }
  }

  async function handleMarkAllRead() {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            style={styles.markAllBtn}
            accessibilityRole="button"
            accessibilityLabel="Mark all as read"
          >
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadBannerText}>
            {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={n => n.id}
        renderItem={({ item }) => (
          <NotifCard notification={item} onPress={() => handleNotifPress(item)} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="🔔"
            title="No notifications yet"
            message="You'll see activity reminders, community updates, and recommendations here."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.backgroundAlt,
  },
  backBtn: {
    width: TouchTarget.comfortable,
    height: TouchTarget.comfortable,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  markAllBtn: {
    minHeight: TouchTarget.min,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  markAllText: {
    fontSize: FontSize.bodySm,
    color: Colors.primary,
    fontWeight: FontWeight.semiBold,
  },
  unreadBanner: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  unreadBannerText: {
    fontSize: FontSize.bodySm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  listContent: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  unreadCard: {
    borderColor: Colors.primary + '40',
    backgroundColor: Colors.primaryLight + '80',
  },
  notifIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifIcon: { fontSize: 22 },
  notifContent: { flex: 1 },
  notifTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    marginBottom: 4,
    lineHeight: FontSize.body * 1.4,
  },
  unreadTitle: {
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  notifBody: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    lineHeight: FontSize.bodySm * 1.5,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
});
