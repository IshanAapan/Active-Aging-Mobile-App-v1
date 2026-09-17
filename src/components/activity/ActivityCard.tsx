// Activity Card Component — Reusable card for activity listings

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Activity } from '../../types/activity';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight } from '../../constants/typography';
import { BorderRadius, Spacing, TouchTarget } from '../../constants/spacing';
import { formatDate } from '../../utils/date';

const CATEGORY_ICONS: Record<string, string> = {
  walking: '🚶',
  yoga: '🧘',
  music: '🎵',
  games: '♟️',
  travel: '✈️',
  learning: '📚',
  gardening: '🌱',
  reading: '📖',
  cooking: '🍳',
  art: '🎨',
  cycling: '🚴',
  meditation: '🙏',
  volunteering: '🤝',
  fitness: '💪',
  social: '🤗',
};

interface ActivityCardProps {
  activity: Activity;
  isJoined?: boolean;
  onPress: () => void;
  onJoin?: () => void;
  style?: ViewStyle;
  compact?: boolean;
}

export function ActivityCard({
  activity,
  isJoined = false,
  onPress,
  onJoin,
  style,
  compact = false,
}: ActivityCardProps) {
  const isFull = activity.participantIds.length >= activity.maxParticipants;
  const spotsLeft = activity.maxParticipants - activity.participantIds.length;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        compact ? styles.compact : undefined,
        style,
        pressed ? { opacity: 0.8 } : undefined,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${activity.title}, ${formatDate(activity.date)}`}
    >
      <Image
        source={{ uri: activity.image }}
        style={compact ? styles.imageCompact : styles.image}
        contentFit="cover"
        transition={300}
      />
      <View style={styles.body}>
        <View style={styles.categoryRow}>
          <Text style={styles.categoryIcon}>
            {CATEGORY_ICONS[activity.category] ?? '🎯'}
          </Text>
          <Text style={styles.category}>{activity.category.toUpperCase()}</Text>
          {activity.isFree && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeText}>FREE</Text>
            </View>
          )}
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {activity.title}
        </Text>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.infoText}>
            {formatDate(activity.date)} · {activity.startTime}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.infoText} numberOfLines={1}>
            {activity.location}
            {activity.distance ? ` · ${activity.distance} km` : ''}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.participants}>
            <Ionicons name="people-outline" size={14} color={Colors.primary} />
            <Text style={styles.participantText}>
              {activity.participantIds.length} joining
              {isFull ? ' · Full' : spotsLeft <= 3 ? ` · ${spotsLeft} spots left` : ''}
            </Text>
          </View>

          {onJoin && (
            <Pressable
              onPress={onJoin}
              style={({ pressed }) => [
                styles.joinBtn,
                isJoined ? styles.joinedBtn : undefined,
                isFull && !isJoined ? styles.fullBtn : undefined,
                pressed ? { opacity: 0.8 } : undefined,
              ]}
              accessibilityRole="button"
              accessibilityLabel={isJoined ? 'Joined' : 'Join activity'}
            >
              <Text style={[styles.joinText, isJoined ? styles.joinedText : undefined]}>
                {isJoined ? 'Joined ✓' : isFull ? 'Full' : 'Join'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: Spacing.md,
  },
  compact: {
    width: 260,
    marginRight: Spacing.md,
    marginBottom: 0,
  },
  image: {
    width: '100%',
    height: 160,
  },
  imageCompact: {
    width: '100%',
    height: 120,
  },
  body: {
    padding: Spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  categoryIcon: {
    fontSize: 14,
  },
  category: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    flex: 1,
  },
  freeBadge: {
    backgroundColor: Colors.successLight,
    borderRadius: BorderRadius.full,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  freeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.success,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: FontSize.sectionHeading,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
    lineHeight: FontSize.sectionHeading * 1.3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  infoText: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  participants: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  participantText: {
    fontSize: FontSize.bodySm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  joinBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    minHeight: TouchTarget.min,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 64,
  },
  joinedBtn: {
    backgroundColor: Colors.primaryLight,
  },
  fullBtn: {
    backgroundColor: Colors.skeleton,
  },
  joinText: {
    fontSize: FontSize.bodySm,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
  joinedText: {
    color: Colors.primary,
  },
});
