// User Profile Detail Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { FontSize, FontWeight } from '../../src/constants/typography';
import { Spacing, BorderRadius, TouchTarget } from '../../src/constants/spacing';
import { Avatar } from '../../src/components/ui/Avatar';
import { Tag } from '../../src/components/ui/Tag';
import { userService } from '../../src/services/userService';
import { User } from '../../src/types/user';
import { mockInterests } from '../../src/data/mockInterests';
import { CURRENT_USER_ID, mockUsers } from '../../src/data/mockUsers';
import { analyticsService } from '../../src/services/analyticsService';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [commonInterests, setCommonInterests] = useState<string[]>([]);

  useEffect(() => {
    loadUser();
  }, [id]);

  async function loadUser() {
    if (!id) return;
    const u = await userService.getUserById(id);
    setUser(u);
    analyticsService.track('profile_viewed', { profileId: id });

    // Find common interests with current user
    const currentUser = mockUsers.find(u => u.id === CURRENT_USER_ID);
    if (currentUser && u) {
      const common = u.interests.filter(i => currentUser.interests.includes(i));
      setCommonInterests(common);
    }
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const interests = mockInterests.filter(i => user.interests.includes(i.id));
  const isCurrentUser = user.id === CURRENT_USER_ID;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
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
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: TouchTarget.comfortable }} />
        </View>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <Avatar uri={user.photo} name={user.name} size={100} />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.age}>{user.age} years old</Text>
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />{' '}
            {user.area}, {user.city}
          </Text>
          {user.bio && (
            <Text style={styles.bio}>{user.bio}</Text>
          )}
        </View>

        {/* Common interests banner */}
        {commonInterests.length > 0 && !isCurrentUser && (
          <View style={styles.commonBanner}>
            <Text style={styles.commonBannerText}>
              🤝 {commonInterests.length} interest{commonInterests.length > 1 ? 's' : ''} in common
            </Text>
          </View>
        )}

        {/* Interests */}
        {interests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.interestGrid}>
              {interests.map(interest => (
                <Tag
                  key={interest.id}
                  label={interest.name}
                  icon={interest.icon}
                  bgColor={commonInterests.includes(interest.id) ? Colors.primaryLight : undefined}
                  color={commonInterests.includes(interest.id) ? Colors.primary : undefined}
                />
              ))}
            </View>
          </View>
        )}

        {/* Message / Connect note */}
        {!isCurrentUser && (
          <View style={styles.section}>
            <View style={styles.connectCard}>
              <Text style={styles.connectIcon}>🌟</Text>
              <View style={styles.connectText}>
                <Text style={styles.connectTitle}>Meet {user.name.split(' ')[0]}</Text>
                <Text style={styles.connectSub}>
                  Join the same activity or community to connect in person.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: FontSize.body, color: Colors.textSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: TouchTarget.comfortable,
    height: TouchTarget.comfortable,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  profileCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.backgroundAlt,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  name: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: 4,
  },
  age: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  location: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  bio: {
    fontSize: FontSize.bodyLg,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSize.bodyLg * 1.5,
    paddingHorizontal: Spacing.md,
  },
  commonBanner: {
    margin: Spacing.xl,
    marginBottom: 0,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.primary + '40',
    alignItems: 'center',
  },
  commonBannerText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semiBold,
    color: Colors.primary,
  },
  section: {
    padding: Spacing.xl,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  interestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  connectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.secondaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.secondary + '60',
  },
  connectIcon: { fontSize: 32 },
  connectText: { flex: 1 },
  connectTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  connectSub: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    lineHeight: FontSize.bodySm * 1.5,
  },
});
