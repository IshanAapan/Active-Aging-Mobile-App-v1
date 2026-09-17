// People Card Component — Shows users with similar interests

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
} from 'react-native';
import { Avatar } from '../ui/Avatar';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight } from '../../constants/typography';
import { BorderRadius, Spacing, TouchTarget } from '../../constants/spacing';
import { UserProfile } from '../../types/user';
import { mockInterests } from '../../data/mockInterests';

interface PeopleCardProps {
  user: UserProfile;
  onPress: () => void;
  style?: ViewStyle;
}

export function PeopleCard({ user, onPress, style }: PeopleCardProps) {
  const userInterests = mockInterests.filter(i => user.interests.includes(i.id)).slice(0, 3);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        style,
        pressed ? { opacity: 0.8 } : undefined,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View profile of ${user.name}`}
    >
      <Avatar uri={user.photo} name={user.name} size={60} />
      <View style={styles.info}>
        <Text style={styles.name}>{user.name}, {user.age}</Text>
        <Text style={styles.location}>{user.area}, {user.city}</Text>
        <View style={styles.interests}>
          {userInterests.map(interest => (
            <View key={interest.id} style={styles.interestChip}>
              <Text style={styles.interestText}>{interest.icon} {interest.name}</Text>
            </View>
          ))}
        </View>
        {(user.commonInterestsCount ?? 0) > 0 && (
          <Text style={styles.common}>
            {user.commonInterestsCount} interest{(user.commonInterestsCount ?? 0) > 1 ? 's' : ''} in common
          </Text>
        )}
      </View>
      <View style={styles.viewBtn}>
        <Text style={styles.viewBtnText}>View Profile</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: Spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: 2,
  },
  location: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  interestChip: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.full,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  interestText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  common: {
    fontSize: FontSize.caption,
    color: Colors.primary,
    fontWeight: FontWeight.semiBold,
  },
  viewBtn: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    minHeight: TouchTarget.min,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewBtnText: {
    fontSize: FontSize.bodySm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
});
