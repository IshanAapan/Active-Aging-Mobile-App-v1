// Activity Details Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import * as Calendar from 'expo-calendar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors } from '../../src/constants/colors';
import { FontSize, FontWeight } from '../../src/constants/typography';
import { Spacing, BorderRadius, TouchTarget } from '../../src/constants/spacing';
import { Button } from '../../src/components/ui/Button';
import { Avatar } from '../../src/components/ui/Avatar';
import { activityService } from '../../src/services/activityService';
import { userService } from '../../src/services/userService';
import { notificationService } from '../../src/services/notificationService';
import { communityService } from '../../src/services/communityService';
import { Activity } from '../../src/types/activity';
import { User } from '../../src/types/user';
import { Community } from '../../src/types/community';
import { formatDate } from '../../src/utils/date';
import { CURRENT_USER_ID, mockUsers } from '../../src/data/mockUsers';

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [organizer, setOrganizer] = useState<User | null>(null);
  const [participants, setParticipants] = useState<User[]>([]);
  const [associatedCommunity, setAssociatedCommunity] = useState<Community | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    if (!id) return;
    setError(null);
    try {
      const [act, joined] = await Promise.all([
        activityService.getActivityById(id),
        activityService.isJoined(id),
      ]);
      if (!act) {
        setError('Something went wrong. This activity is unavailable or has been cancelled.');
        return;
      }
      setActivity(act);
      setIsJoined(joined);

      const [org, comms] = await Promise.all([
        userService.getUserById(act.organizerId),
        communityService.getCommunities(),
      ]);
      setOrganizer(org);

      const associatedComm = comms.find(c => c.upcomingActivityIds.includes(act.id)) || null;
      setAssociatedCommunity(associatedComm);

      const parts = mockUsers.filter(u => act.participantIds.includes(u.id));
      setParticipants(parts);
    } catch {
      setError('Something went wrong. Please check your internet connection and try again.');
    }
  }

  async function handleJoin() {
    if (!activity) return;
    setLoading(true);
    try {
      if (isJoined) {
        Alert.alert(
          'Leave Activity',
          'Are you sure you want to leave this activity?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Leave',
              style: 'destructive',
              onPress: async () => {
                await activityService.leaveActivity(activity.id, CURRENT_USER_ID);
                setIsJoined(false);
                loadData();
              },
            },
          ]
        );
      } else {
        const result = await activityService.joinActivity(activity.id, CURRENT_USER_ID);
        if (result.success) {
          setIsJoined(true);
          notificationService.addLocalNotification({
            type: 'activity_joined',
            title: `You joined ${activity.title}! 🎉`,
            body: `See you on ${formatDate(activity.date)} at ${activity.startTime}.`,
            activityId: activity.id,
          });
          loadData();
          Alert.alert('You\'re joining! 🎉', `See you on ${formatDate(activity.date)} at ${activity.startTime}.`);
        } else {
          Alert.alert('Unable to Join', result.message);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToCalendar() {
    if (!activity) return;
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow calendar access in your phone settings to add activities to your schedule.'
        );
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar =
        Platform.OS === 'ios'
          ? calendars.find(cal => cal.source && cal.source.name === 'Default') || calendars[0]
          : calendars.find(cal => cal.isPrimary) || calendars[0];

      if (!defaultCalendar) {
        Alert.alert('Calendar Error', 'Could not find a default calendar on your device.');
        return;
      }

      const [year, month, day] = activity.date.split('-').map(Number);
      const startDate = new Date(year, month - 1, day);

      let hours = 8;
      let minutes = 0;
      if (activity.startTime) {
        const match = activity.startTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (match) {
          hours = parseInt(match[1], 10);
          minutes = parseInt(match[2], 10);
          if (match[3]) {
            if (match[3].toUpperCase() === 'PM' && hours < 12) hours += 12;
            if (match[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
          }
        }
      }
      startDate.setHours(hours, minutes, 0, 0);

      let endHours = hours + 1;
      let endMinutes = minutes;
      if (activity.endTime) {
        const endMatch = activity.endTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (endMatch) {
          endHours = parseInt(endMatch[1], 10);
          endMinutes = parseInt(endMatch[2], 10);
          if (endMatch[3]) {
            if (endMatch[3].toUpperCase() === 'PM' && endHours < 12) endHours += 12;
            if (endMatch[3].toUpperCase() === 'AM' && endHours === 12) endHours = 0;
          }
        }
      }
      const endDate = new Date(year, month - 1, day, endHours, endMinutes, 0, 0);

      await Calendar.createEventAsync(defaultCalendar.id, {
        title: `Active Aging: ${activity.title}`,
        startDate,
        endDate,
        location: `${activity.location}, ${activity.city || 'Jaipur'}`,
        notes: `${activity.description}\n\nOrganized via Active Aging Community`,
        alarms: [{ relativeOffset: -30 }],
      });

      Alert.alert(
        'Added to Calendar! 📅',
        `"${activity.title}" has been added to your calendar with a reminder 30 minutes before.`
      );
    } catch (e) {
      console.warn('Native calendar sync error, falling back to alert:', e);
      Alert.alert('Added to Calendar! 📅', `"${activity.title}" has been added to your calendar.`);
    }
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
            style={styles.errorBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!activity) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading activity...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isFull = activity.participantIds.length >= activity.maxParticipants;
  const spotsLeft = activity.maxParticipants - activity.participantIds.length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: activity.image }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={Colors.textInverse} />
          </TouchableOpacity>
          {activity.isFree && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>FREE</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Category */}
          <Text style={styles.category}>{activity.category.toUpperCase()}</Text>
          <Text style={styles.title}>{activity.title}</Text>

          {/* Key info */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
              <View>
                <Text style={styles.infoLabel}>Date & Time</Text>
                <Text style={styles.infoValue}>
                  {formatDate(activity.date)} · {activity.startTime} – {activity.endTime}
                </Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={Colors.primary} />
              <View>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{activity.location}</Text>
                {activity.distance && (
                  <Text style={styles.infoSub}>{activity.distance} km from you</Text>
                )}
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={20} color={Colors.primary} />
              <View>
                <Text style={styles.infoLabel}>Participants</Text>
                <Text style={styles.infoValue}>
                  {activity.participantIds.length} / {activity.maxParticipants} joining
                  {isFull ? ' · Full' : spotsLeft <= 5 ? ` · ${spotsLeft} spots left` : ''}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this activity</Text>
            <Text style={styles.description}>{activity.description}</Text>
          </View>

          {/* What to bring */}
          {activity.whatToBring && activity.whatToBring.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What to bring</Text>
              {activity.whatToBring.map((item, index) => (
                <View key={index} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Safety */}
          {activity.safetyInfo && (
            <View style={styles.safetyCard}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.success} />
              <Text style={styles.safetyText}>{activity.safetyInfo}</Text>
            </View>
          )}

          {/* Organizer */}
          {organizer && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Organised by</Text>
              <TouchableOpacity
                style={styles.organizerRow}
                onPress={() => router.push(`/people/${organizer.id}`)}
                activeOpacity={0.8}
              >
                <Avatar uri={organizer.photo} name={organizer.name} size={48} />
                <View style={styles.organizerInfo}>
                  <Text style={styles.organizerName}>{organizer.name}</Text>
                  <Text style={styles.organizerSub}>{organizer.area}, {organizer.city}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {/* Participants */}
          {participants.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Who's joining ({participants.length})</Text>
              <View style={styles.participantsRow}>
                {participants.slice(0, 6).map(p => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => router.push(`/people/${p.id}`)}
                    style={styles.participantAvatar}
                  >
                    <Avatar uri={p.photo} name={p.name} size={44} />
                    <Text style={styles.participantName} numberOfLines={1}>{p.name.split(' ')[0]}</Text>
                  </TouchableOpacity>
                ))}
                {participants.length > 6 && (
                  <View style={styles.moreParticipants}>
                    <Text style={styles.moreText}>+{participants.length - 6}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Join / Actions */}
          <View style={styles.actions}>
            {isJoined && (
              <View style={styles.joinedActionsGroup}>
                <Button
                  title="📅 Add to Calendar"
                  onPress={handleAddToCalendar}
                  variant="outline"
                  size="lg"
                  style={styles.actionBtn}
                />
                {associatedCommunity && (
                  <Button
                    title="💬 Open Group Chat"
                    onPress={() => router.push(`/communities/${associatedCommunity.id}/chat`)}
                    variant="secondary"
                    size="lg"
                    style={styles.actionBtn}
                  />
                )}
              </View>
            )}
            <Button
              title={isJoined ? 'You\'re joining ✓' : isFull ? 'Activity is Full' : 'Join Activity'}
              onPress={handleJoin}
              loading={loading}
              disabled={isFull && !isJoined}
              variant={isJoined ? 'outline' : 'primary'}
              size="lg"
            />
            {isFull && !isJoined && (
              <Button
                title="Join Waitlist"
                onPress={() => Alert.alert('Waitlist', 'You have been added to the waitlist. We will notify you if a spot opens up.')}
                variant="outline"
                size="lg"
                style={styles.secondaryBtn}
              />
            )}
            {isJoined && (
              <Button
                title="Leave Activity"
                onPress={handleJoin}
                variant="ghost"
                size="md"
                style={styles.leaveBtn}
                textStyle={{ color: Colors.error }}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: FontSize.body, color: Colors.textSecondary },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 280 },
  backBtn: {
    position: 'absolute',
    top: Spacing.xl,
    left: Spacing.lg,
    width: TouchTarget.comfortable,
    height: TouchTarget.comfortable,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: TouchTarget.comfortable / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freeBadge: {
    position: 'absolute',
    top: Spacing.xl,
    right: Spacing.lg,
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.full,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
  },
  freeBadgeText: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
    letterSpacing: 0.5,
  },
  content: {
    padding: Spacing.xl,
  },
  category: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSize.h1,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    lineHeight: FontSize.h1 * 1.3,
    marginBottom: Spacing.lg,
  },
  infoCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.primary + '20',
    marginVertical: Spacing.md,
  },
  infoLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semiBold,
    color: Colors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  infoSub: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: FontSize.bodyLg,
    color: Colors.textSecondary,
    lineHeight: FontSize.bodyLg * 1.6,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  bullet: {
    fontSize: FontSize.bodyLg,
    color: Colors.primary,
    lineHeight: FontSize.bodyLg * 1.5,
  },
  bulletText: {
    flex: 1,
    fontSize: FontSize.bodyLg,
    color: Colors.textSecondary,
    lineHeight: FontSize.bodyLg * 1.5,
  },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.successLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
  },
  safetyText: {
    flex: 1,
    fontSize: FontSize.body,
    color: Colors.text,
    lineHeight: FontSize.body * 1.5,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  organizerInfo: { flex: 1 },
  organizerName: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  organizerSub: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
  },
  participantsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  participantAvatar: {
    alignItems: 'center',
    gap: 4,
    width: 56,
  },
  participantName: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  moreParticipants: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.skeleton,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  moreText: {
    fontSize: FontSize.bodySm,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
  },
  actions: {
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  secondaryBtn: {
    marginTop: 0,
  },
  leaveBtn: {
    marginTop: 0,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: FontSize.bodyLg,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSize.bodyLg * 1.5,
    marginBottom: Spacing.xl,
  },
  errorBtn: {
    width: 200,
  },
  joinedActionsGroup: {
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  actionBtn: {
    marginTop: 0,
  },
});
