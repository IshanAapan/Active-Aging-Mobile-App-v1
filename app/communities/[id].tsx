// Community Details Screen

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
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors } from '../../src/constants/colors';
import { FontSize, FontWeight } from '../../src/constants/typography';
import { Spacing, BorderRadius, TouchTarget } from '../../src/constants/spacing';
import { Button } from '../../src/components/ui/Button';
import { Avatar } from '../../src/components/ui/Avatar';
import { Tag } from '../../src/components/ui/Tag';
import { ActivityCard } from '../../src/components/activity/ActivityCard';
import { communityService } from '../../src/services/communityService';
import { activityService } from '../../src/services/activityService';
import { Community } from '../../src/types/community';
import { Activity } from '../../src/types/activity';
import { User } from '../../src/types/user';
import { mockInterests } from '../../src/data/mockInterests';
import { mockUsers, CURRENT_USER_ID } from '../../src/data/mockUsers';

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [community, setCommunity] = useState<Community | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    if (!id) return;
    const [comm, joined] = await Promise.all([
      communityService.getCommunityById(id),
      communityService.isJoined(id),
    ]);
    if (!comm) return;
    setCommunity(comm);
    setIsJoined(joined);

    const acts = await Promise.all(
      comm.upcomingActivityIds.map(aid => activityService.getActivityById(aid))
    );
    setActivities(acts.filter(Boolean) as Activity[]);

    const mems = mockUsers.filter(u => comm.memberIds.includes(u.id));
    setMembers(mems);
  }

  async function handleJoin() {
    if (!community) return;
    setLoading(true);
    if (isJoined) {
      await communityService.leaveCommunity(community.id, CURRENT_USER_ID);
      setIsJoined(false);
    } else {
      await communityService.joinCommunity(community.id, CURRENT_USER_ID);
      setIsJoined(true);
    }
    loadData();
    setLoading(false);
  }

  if (!community) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading community...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const interests = mockInterests.filter(i => community.interests.includes(i.id));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: community.image }}
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
          {isJoined && (
            <View style={styles.joinedBadge}>
              <Text style={styles.joinedBadgeText}>Member ✓</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Name & Meta */}
          <Text style={styles.name}>{community.name}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="people-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{community.memberIds.length} members</Text>
            <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{community.area}, {community.city}</Text>
          </View>

          {/* Interest tags */}
          {interests.length > 0 && (
            <View style={styles.tagRow}>
              {interests.map(i => (
                <Tag key={i.id} label={i.name} icon={i.icon} />
              ))}
            </View>
          )}

          {/* Description */}
          <Text style={styles.description}>{community.description}</Text>

          {/* Action buttons */}
          <View style={styles.actions}>
            <Button
              title={isJoined ? 'Joined ✓' : 'Join Community'}
              onPress={handleJoin}
              loading={loading}
              variant={isJoined ? 'outline' : 'primary'}
              size="lg"
            />
            {isJoined && (
              <Button
                title="💬 Open Chat"
                onPress={() => router.push(`/communities/${community.id}/chat`)}
                variant="secondary"
                size="lg"
              />
            )}
          </View>

          {/* Recent Discussion preview */}
          {isJoined && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent discussion</Text>
              <TouchableOpacity
                style={styles.discussionCard}
                onPress={() => router.push(`/communities/${community.id}/chat`)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Open discussion chat"
              >
                <View style={styles.discussionHeader}>
                  <Ionicons name="chatbubbles-outline" size={22} color={Colors.primary} />
                  <Text style={styles.discussionTime}>Recent Activity</Text>
                </View>
                <View style={styles.discussionBody}>
                  <Text style={styles.discussionMessage} numberOfLines={2}>
                    <Text style={styles.discussionSender}>Meena Gupta: </Text>
                    "Looking forward to seeing everyone this Saturday! Don't forget to bring your walking shoes and a water bottle."
                  </Text>
                </View>
                <View style={styles.discussionFooter}>
                  <Text style={styles.discussionLink}>Open discussion</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Upcoming activities */}
          {activities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Upcoming activities</Text>
              {activities.map(activity => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onPress={() => router.push(`/activities/${activity.id}`)}
                />
              ))}
            </View>
          )}

          {/* Members */}
          {members.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Members ({members.length})</Text>
              <View style={styles.membersGrid}>
                {members.map(member => (
                  <TouchableOpacity
                    key={member.id}
                    style={styles.memberItem}
                    onPress={() => router.push(`/people/${member.id}`)}
                    activeOpacity={0.8}
                  >
                    <Avatar uri={member.photo} name={member.name} size={52} />
                    <Text style={styles.memberName} numberOfLines={1}>
                      {member.name.split(' ')[0]}
                    </Text>
                    <Text style={styles.memberAge}>{member.age}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: FontSize.body, color: Colors.textSecondary },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 240 },
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
  joinedBadge: {
    position: 'absolute',
    top: Spacing.xl,
    right: Spacing.lg,
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.full,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
  },
  joinedBadgeText: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
  content: { padding: Spacing.xl },
  name: {
    fontSize: FontSize.h1,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  description: {
    fontSize: FontSize.bodyLg,
    color: Colors.textSecondary,
    lineHeight: FontSize.bodyLg * 1.6,
    marginBottom: Spacing.xl,
  },
  actions: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  section: { marginBottom: Spacing.xl },
  sectionTitle: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  memberItem: {
    alignItems: 'center',
    width: 64,
    gap: 4,
  },
  memberName: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    textAlign: 'center',
  },
  memberAge: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
  discussionCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  discussionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  discussionTime: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  discussionBody: {
    marginBottom: Spacing.sm,
  },
  discussionMessage: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    lineHeight: FontSize.body * 1.5,
    fontStyle: 'italic',
  },
  discussionSender: {
    fontWeight: FontWeight.bold,
    color: Colors.text,
    fontStyle: 'normal',
  },
  discussionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  discussionLink: {
    fontSize: FontSize.bodySm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
});
