// Home Screen — The most important screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { FontSize, FontWeight } from '../../src/constants/typography';
import { Spacing, BorderRadius } from '../../src/constants/spacing';
import { useAuth } from '../../src/context/AuthContext';
import { ActivityCard } from '../../src/components/activity/ActivityCard';
import { CommunityCard } from '../../src/components/community/CommunityCard';
import { PeopleCard } from '../../src/components/people/PeopleCard';
import { activityService } from '../../src/services/activityService';
import { communityService } from '../../src/services/communityService';
import { userService } from '../../src/services/userService';
import { notificationService } from '../../src/services/notificationService';
import { Activity } from '../../src/types/activity';
import { Community } from '../../src/types/community';
import { UserProfile } from '../../src/types/user';
import { getGreeting } from '../../src/utils/date';
import { CURRENT_USER_ID } from '../../src/data/mockUsers';

export default function HomeScreen() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [nearbyActivities, setNearbyActivities] = useState<Activity[]>([]);
  const [people, setPeople] = useState<UserProfile[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [acts, comms, similarPeople, joined] = await Promise.all([
      activityService.getActivities(),
      communityService.getUserCommunities(CURRENT_USER_ID),
      userService.getPeopleWithSimilarInterests(CURRENT_USER_ID),
      activityService.getJoinedActivityIds(),
    ]);
    setActivities(acts.slice(0, 2));
    setNearbyActivities(acts.slice(2, 5));
    setUserCommunities(comms.slice(0, 5));
    setPeople(similarPeople.slice(0, 3));
    setJoinedIds(new Set(joined));
    setUnreadCount(notificationService.getUnreadCount());
  }

  async function handleJoinActivity(activityId: string) {
    const result = await activityService.joinActivity(activityId, CURRENT_USER_ID);
    if (result.success) {
      setJoinedIds(prev => new Set([...prev, activityId]));
    }
  }

  const greeting = getGreeting();
  const firstName = user?.name?.split(' ')[0] ?? 'Friend';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting}, {firstName} 👋</Text>
            <Text style={styles.subGreeting}>How would you like to spend your day?</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push('/notifications')}
            accessibilityRole="button"
            accessibilityLabel={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          >
            <Ionicons name="notifications-outline" size={26} color={Colors.text} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Daily Inspiration Card */}
        <View style={styles.inspirationContainer}>
          <LinearGradient
            colors={['#EAE6E1', '#E2DCD5']}
            style={styles.inspirationCard}
          >
            <View style={styles.inspirationHeader}>
              <Ionicons name="sunny" size={20} color={Colors.secondary} />
              <Text style={styles.inspirationTitle}>Daily Thought</Text>
            </View>
            <Text style={styles.inspirationQuote}>
              "Beautiful things happen when you distance yourself from negativity. Stay active, stay connected, and enjoy this beautiful day!"
            </Text>
          </LinearGradient>
        </View>

        {/* Recommended for you */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended for you</Text>
          {activities.map(activity => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              isJoined={joinedIds.has(activity.id)}
              onPress={() => router.push(`/activities/${activity.id}`)}
              onJoin={() => handleJoinActivity(activity.id)}
            />
          ))}
        </View>

        {/* Your Communities */}
        {userCommunities.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your communities</Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/communities')}
                accessibilityRole="button"
                accessibilityLabel="See all communities"
              >
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={userCommunities}
              keyExtractor={c => c.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <CommunityCard
                  community={item}
                  isJoined
                  onPress={() => router.push(`/communities/${item.id}`)}
                  compact
                />
              )}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Upcoming activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming activities</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/activities')}
              accessibilityRole="button"
              accessibilityLabel="See all activities"
            >
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={nearbyActivities}
            keyExtractor={a => a.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <ActivityCard
                activity={item}
                isJoined={joinedIds.has(item.id)}
                onPress={() => router.push(`/activities/${item.id}`)}
                onJoin={() => handleJoinActivity(item.id)}
                compact
              />
            )}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Daily Health & Safety Tip */}
        <View style={styles.section}>
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Ionicons name="heart-circle" size={24} color={Colors.error} />
              <Text style={styles.tipTitle}>Daily Wellness Tip</Text>
            </View>
            <Text style={styles.tipBody}>
              Jaipur is warm and sunny today. Remember to drink at least 3-4 glasses of water before heading out for your walk! A quick 5-minute stretch will prepare your muscles.
            </Text>
          </View>
        </View>

        {/* People with similar interests */}
        {people.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>People like you</Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/people')}
                accessibilityRole="button"
                accessibilityLabel="See all people"
              >
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {people.map(p => (
              <PeopleCard
                key={p.id}
                user={p}
                onPress={() => router.push(`/people/${p.id}`)}
              />
            ))}
          </View>
        )}

        {/* Local Notice Board */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Local notice board</Text>
          <Text style={styles.sectionSubtitle}>Updates and announcements from your Jaipur community</Text>
          
          <View style={styles.noticeBoard}>
            <View style={styles.noticeItem}>
              <View style={styles.noticeIconBadge}>
                <Text style={styles.noticeEmoji}>📢</Text>
              </View>
              <View style={styles.noticeContent}>
                <Text style={styles.noticeTitle}>Free Health Check-up</Text>
                <Text style={styles.noticeBody}>This Sunday, Central Park will host a free wellness and blood pressure check-up camp for seniors from 08:00 AM to 11:30 AM.</Text>
              </View>
            </View>

            <View style={styles.noticeDivider} />

            <View style={styles.noticeItem}>
              <View style={styles.noticeIconBadge}>
                <Text style={styles.noticeEmoji}>🌟</Text>
              </View>
              <View style={styles.noticeContent}>
                <Text style={styles.noticeTitle}>Member Spotlight</Text>
                <Text style={styles.noticeBody}>Kudos to Meena Gupta (61) for organizing three morning walks this week! Tap to say congratulations.</Text>
              </View>
            </View>

            <View style={styles.noticeDivider} />

            <View style={styles.noticeItem}>
              <View style={styles.noticeIconBadge}>
                <Text style={styles.noticeEmoji}>🌧️</Text>
              </View>
              <View style={styles.noticeContent}>
                <Text style={styles.noticeTitle}>Weather Update</Text>
                <Text style={styles.noticeBody}>Mild rain is forecast for tomorrow evening. If you are joining the Photography Walk, please remember to carry an umbrella.</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerLeft: { flex: 1 },
  greeting: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
  },
  notifBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.error,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  seeAll: {
    fontSize: FontSize.body,
    color: Colors.primary,
    fontWeight: FontWeight.semiBold,
    marginBottom: Spacing.md,
  },
  horizontalList: {
    paddingRight: Spacing.xl,
  },
  inspirationContainer: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  inspirationCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inspirationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  inspirationTitle: {
    fontSize: FontSize.bodySm,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inspirationQuote: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    fontStyle: 'italic',
    lineHeight: FontSize.body * 1.5,
  },
  tipCard: {
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  tipBody: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    lineHeight: FontSize.bodySm * 1.5,
  },
  sectionSubtitle: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    marginTop: -8,
    marginBottom: Spacing.md,
  },
  noticeBoard: {
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  noticeItem: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  noticeIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeEmoji: {
    fontSize: 20,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  noticeBody: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    lineHeight: FontSize.bodySm * 1.5,
  },
  noticeDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 2,
  },
});
