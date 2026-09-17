// Community Card Component

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
import { Community } from '../../types/community';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight } from '../../constants/typography';
import { BorderRadius, Spacing, TouchTarget } from '../../constants/spacing';

interface CommunityCardProps {
  community: Community;
  isJoined?: boolean;
  onPress: () => void;
  onJoin?: () => void;
  style?: ViewStyle;
  compact?: boolean;
}

export function CommunityCard({
  community,
  isJoined = false,
  onPress,
  onJoin,
  style,
  compact = false,
}: CommunityCardProps) {
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
      accessibilityLabel={`${community.name} community`}
    >
      <Image
        source={{ uri: community.image }}
        style={compact ? styles.imageCompact : styles.image}
        contentFit="cover"
        transition={300}
      />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {community.name}
        </Text>

        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{community.memberIds.length} members</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{community.area}, {community.city}</Text>
        </View>

        {!compact && (
          <Text style={styles.description} numberOfLines={2}>
            {community.description}
          </Text>
        )}

        {onJoin && (
          <Pressable
            onPress={onJoin}
            style={({ pressed }) => [
              styles.joinBtn,
              isJoined ? styles.joinedBtn : undefined,
              pressed ? { opacity: 0.8 } : undefined,
            ]}
            accessibilityRole="button"
            accessibilityLabel={isJoined ? 'Joined community' : 'Join community'}
          >
            <Text style={[styles.joinText, isJoined ? styles.joinedText : undefined]}>
              {isJoined ? 'Joined ✓' : 'Join'}
            </Text>
          </Pressable>
        )}
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
    width: 200,
    marginRight: Spacing.md,
    marginBottom: 0,
  },
  image: {
    width: '100%',
    height: 140,
  },
  imageCompact: {
    width: '100%',
    height: 100,
  },
  body: {
    padding: Spacing.md,
  },
  name: {
    fontSize: FontSize.sectionHeading,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
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
  },
  description: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    lineHeight: FontSize.bodySm * 1.5,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  joinBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TouchTarget.min,
  },
  joinedBtn: {
    backgroundColor: Colors.primaryLight,
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
