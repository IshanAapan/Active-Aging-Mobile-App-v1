// Profile Tab Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { FontSize, FontWeight } from '../../src/constants/typography';
import { Spacing, BorderRadius, TouchTarget } from '../../src/constants/spacing';
import { Avatar } from '../../src/components/ui/Avatar';
import { Tag } from '../../src/components/ui/Tag';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuth } from '../../src/context/AuthContext';
import { activityService } from '../../src/services/activityService';
import { communityService } from '../../src/services/communityService';
import { mockInterests } from '../../src/data/mockInterests';
import { CURRENT_USER_ID } from '../../src/data/mockUsers';
import { Community } from '../../src/types/community';
import { Activity } from '../../src/types/activity';
import { CommunityCard } from '../../src/components/community/CommunityCard';
import { ActivityCard } from '../../src/components/activity/ActivityCard';

interface SettingRowProps {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

function SettingRow({ icon, label, onPress, danger = false }: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.settingIcon}>{icon}</Text>
      <Text style={[styles.settingLabel, danger ? styles.dangerText : undefined]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={danger ? Colors.error : Colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout, completeOnboarding } = useAuth();

  async function handlePickPhoto() {
    Alert.alert(
      'Update Profile Photo',
      'Choose how you would like to update your photo:',
      [
        {
          text: '📷 Take Photo',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Required', 'Camera access is needed to take a photo.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets[0]) {
              await completeOnboarding({ photo: result.assets[0].uri });
              Alert.alert('Success 🎉', 'Your profile photo has been updated!');
            }
          },
        },
        {
          text: '🖼️ Choose from Gallery',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Required', 'Photo library access is needed to choose a photo.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets[0]) {
              await completeOnboarding({ photo: result.assets[0].uri });
              Alert.alert('Success 🎉', 'Your profile photo has been updated!');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }
  const [joinedCount, setJoinedCount] = useState(0);
  const [commCount, setCommCount] = useState(0);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [upcomingActivities, setUpcomingActivities] = useState<Activity[]>([]);
  const [pastActivities, setPastActivities] = useState<Activity[]>([]);

  // Edit Profile States
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editInterests, setEditInterests] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  function openEditModal() {
    if (user) {
      setEditName(user.name ?? '');
      setEditAge(user.age ? String(user.age) : '');
      setEditCity(user.city ?? 'Jaipur');
      setEditArea(user.area ?? '');
      setEditBio(user.bio ?? '');
      setEditInterests(new Set(user.interests ?? []));
    }
    setIsEditModalVisible(true);
  }

  function toggleEditInterest(id: string) {
    setEditInterests(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size <= 3) {
          Alert.alert('Notice', 'Please keep at least 3 interests selected.');
          return prev;
        }
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleSaveProfile() {
    if (!editName.trim()) {
      Alert.alert('Validation', 'Name cannot be empty.');
      return;
    }
    const ageNum = parseInt(editAge, 10);
    if (isNaN(ageNum) || ageNum < 50 || ageNum > 120) {
      Alert.alert('Validation', 'Please enter a valid age (50+).');
      return;
    }
    setSaving(true);
    try {
      await completeOnboarding({
        name: editName.trim(),
        age: ageNum,
        city: editCity.trim(),
        area: editArea.trim(),
        bio: editBio.trim(),
        interests: Array.from(editInterests),
      });
      setIsEditModalVisible(false);
      Alert.alert('Success 🎉', 'Your profile has been updated successfully!');
    } catch {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const [joinedIds, comms] = await Promise.all([
      activityService.getJoinedActivityIds(),
      communityService.getUserCommunities(CURRENT_USER_ID),
    ]);
    setJoinedCount(joinedIds.length);
    setCommCount(comms.length);
    setUserCommunities(comms);

    // Fetch details for joined activities
    const allActivities = await activityService.getActivities();
    const joinedActivities = allActivities.filter(a => joinedIds.includes(a.id));
    
    // Split into upcoming
    const upcoming = joinedActivities.filter(a => a.status === 'upcoming');
    setUpcomingActivities(upcoming);

    // Mock past activities
    const past: Activity[] = [
      {
        id: 'past-1',
        title: 'Morning Yoga in C-Scheme',
        description: 'A gentle morning yoga session followed by warm herbal tea.',
        category: 'yoga',
        date: '2026-08-10',
        startTime: '07:30 AM',
        endTime: '08:30 AM',
        location: 'Community Park, C-Scheme',
        area: 'C-Scheme',
        city: 'Jaipur',
        latitude: 26.9124,
        longitude: 75.7873,
        organizerId: 'user-2',
        participantIds: ['user-1', 'user-4'],
        maxParticipants: 15,
        status: 'completed',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
        isFree: true,
        createdAt: '2026-08-01T10:00:00Z',
      },
      {
        id: 'past-2',
        title: 'Classic Board Games Afternoon',
        description: 'Fun social afternoon playing chess, checkers, and carrom.',
        category: 'games',
        date: '2026-08-15',
        startTime: '04:00 PM',
        endTime: '06:00 PM',
        location: 'Active Seniors Lounge, Vaishali Nagar',
        area: 'Vaishali Nagar',
        city: 'Jaipur',
        latitude: 26.9124,
        longitude: 75.7873,
        organizerId: 'user-3',
        participantIds: ['user-1', 'user-6'],
        maxParticipants: 10,
        status: 'completed',
        image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&q=80',
        isFree: true,
        createdAt: '2026-08-05T12:00:00Z',
      }
    ];
    setPastActivities(past);
  }

  function handleLogout() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  }

  const userInterests = mockInterests.filter(i => user?.interests.includes(i.id)) ?? [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Avatar
              uri={user?.photo}
              name={user?.name ?? 'You'}
              size={96}
            />
            <TouchableOpacity
              style={styles.editAvatarBtn}
              activeOpacity={0.8}
              onPress={handlePickPhoto}
              accessibilityRole="button"
              accessibilityLabel="Edit profile photo"
            >
              <Ionicons name="camera-outline" size={18} color={Colors.textInverse} />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{user?.name ?? 'Your Name'}</Text>
          <Text style={styles.location}>
            {user?.area && `${user.area}, `}{user?.city ?? 'Jaipur'}
            {user?.age ? ` · ${user.age} years` : ''}
          </Text>
          {user?.bio && (
            <Text style={styles.bio}>{user.bio}</Text>
          )}

          <TouchableOpacity
            style={styles.editProfileBtn}
            activeOpacity={0.8}
            onPress={openEditModal}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <Ionicons name="pencil-outline" size={16} color={Colors.primary} />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{joinedCount}</Text>
            <Text style={styles.statLabel}>Activities</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{commCount}</Text>
            <Text style={styles.statLabel}>Communities</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userInterests.length}</Text>
            <Text style={styles.statLabel}>Interests</Text>
          </View>
        </View>

        {/* Interests */}
        {userInterests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Interests</Text>
            <View style={styles.interestGrid}>
              {userInterests.map(interest => (
                <Tag
                  key={interest.id}
                  label={interest.name}
                  icon={interest.icon}
                />
              ))}
            </View>
          </View>
        )}

        {/* Joined Communities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Communities</Text>
          {userCommunities.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No communities joined yet.</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {userCommunities.map(comm => (
                <CommunityCard
                  key={comm.id}
                  community={comm}
                  onPress={() => router.push(`/communities/${comm.id}`)}
                  compact
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Upcoming Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Upcoming Activities</Text>
          {upcomingActivities.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>You haven't joined any activities yet.</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {upcomingActivities.map(act => (
                <ActivityCard
                  key={act.id}
                  activity={act}
                  onPress={() => router.push(`/activities/${act.id}`)}
                  compact
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Past Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past Activities</Text>
          {pastActivities.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No past activities recorded.</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {pastActivities.map(act => (
                <ActivityCard
                  key={act.id}
                  activity={act}
                  onPress={() => router.push(`/activities/${act.id}`)}
                  compact
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingCard}>
            <SettingRow
              icon="✏️"
              label="Edit Profile & Interests"
              onPress={openEditModal}
            />
            <View style={styles.rowDivider} />
            <SettingRow
              icon="🔔"
              label="Notification Preferences"
              onPress={() => {}}
            />
            <View style={styles.rowDivider} />
            <SettingRow
              icon="🔒"
              label="Privacy Settings"
              onPress={() => {}}
            />
            <View style={styles.rowDivider} />
            <SettingRow
              icon="🙋"
              label="Help & Support"
              onPress={() => {}}
            />
            <View style={styles.rowDivider} />
            <SettingRow
              icon="📋"
              label="Terms & Privacy Policy"
              onPress={() => {}}
            />
            <View style={styles.rowDivider} />
            <SettingRow
              icon="🚪"
              label="Sign Out"
              onPress={handleLogout}
              danger
            />
          </View>
        </View>

        <Text style={styles.version}>Active Aging · v1.0.0</Text>
        <Text style={styles.tagline}>Meet. Move. Live.</Text>
        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Close edit profile"
              >
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Photo Section */}
              <View style={styles.modalAvatarSection}>
                <Avatar uri={user?.photo} name={editName || 'You'} size={88} />
                <TouchableOpacity
                  style={styles.modalChangePhotoBtn}
                  onPress={handlePickPhoto}
                  activeOpacity={0.8}
                >
                  <Ionicons name="camera" size={16} color={Colors.primary} />
                  <Text style={styles.modalChangePhotoText}>Change Photo</Text>
                </TouchableOpacity>
              </View>

              {/* Form Inputs */}
              <Input
                label="Full Name *"
                placeholder="e.g. Rajesh Sharma"
                value={editName}
                onChangeText={setEditName}
              />

              <Input
                label="Age *"
                placeholder="e.g. 64"
                value={editAge}
                onChangeText={setEditAge}
                keyboardType="number-pad"
                maxLength={3}
              />

              <Input
                label="City *"
                placeholder="e.g. Jaipur"
                value={editCity}
                onChangeText={setEditCity}
              />

              <Input
                label="Area / Neighborhood"
                placeholder="e.g. Vaishali Nagar, C-Scheme"
                value={editArea}
                onChangeText={setEditArea}
              />

              <Input
                label="About You (Bio)"
                placeholder="Share a few words about what you enjoy..."
                value={editBio}
                onChangeText={setEditBio}
                multiline
                numberOfLines={3}
                style={{ height: 80, textAlignVertical: 'top' }}
              />

              {/* Interests Editor */}
              <View style={styles.interestsEditSection}>
                <Text style={styles.interestsEditTitle}>My Interests</Text>
                <Text style={styles.interestsEditSubtitle}>
                  Tap to add or remove activities (minimum 3):
                </Text>
                <View style={styles.editInterestGrid}>
                  {mockInterests.map(interest => {
                    const isSelected = editInterests.has(interest.id);
                    return (
                      <TouchableOpacity
                        key={interest.id}
                        style={[
                          styles.editChip,
                          isSelected ? styles.editChipSelected : undefined,
                        ]}
                        onPress={() => toggleEditInterest(interest.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.editChipIcon}>{interest.icon}</Text>
                        <Text
                          style={[
                            styles.editChipLabel,
                            isSelected ? styles.editChipLabelSelected : undefined,
                          ]}
                        >
                          {interest.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Save & Cancel Buttons */}
              <View style={styles.modalActions}>
                <Button
                  title="Save Changes"
                  onPress={handleSaveProfile}
                  loading={saving}
                  variant="primary"
                  size="lg"
                />
                <Button
                  title="Cancel"
                  onPress={() => setIsEditModalVisible(false)}
                  variant="outline"
                  size="lg"
                  style={{ marginTop: Spacing.sm }}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.backgroundAlt,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.secondary,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.backgroundAlt,
  },
  name: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  location: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  bio: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSize.body * 1.5,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    minHeight: TouchTarget.min,
  },
  editProfileText: {
    fontSize: FontSize.body,
    color: Colors.primary,
    fontWeight: FontWeight.semiBold,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundAlt,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    marginBottom: Spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
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
  settingCard: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: TouchTarget.comfortable,
    gap: Spacing.md,
  },
  settingIcon: { fontSize: 20 },
  settingLabel: {
    flex: 1,
    fontSize: FontSize.bodyLg,
    color: Colors.text,
    fontWeight: FontWeight.medium,
  },
  dangerText: { color: Colors.error },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: Spacing.xl + 20 + Spacing.md,
  },
  version: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 4,
  },
  tagline: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  horizontalList: {
    paddingRight: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyCard: {
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FontSize.body,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  closeBtn: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  modalAvatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  modalChangePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
  },
  modalChangePhotoText: {
    fontSize: FontSize.bodySm,
    fontWeight: FontWeight.semiBold,
    color: Colors.primary,
  },
  interestsEditSection: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  interestsEditTitle: {
    fontSize: FontSize.bodyLg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  interestsEditSubtitle: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  editInterestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  editChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundAlt,
    minHeight: TouchTarget.min,
  },
  editChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  editChipIcon: {
    fontSize: 18,
  },
  editChipLabel: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  editChipLabelSelected: {
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  modalActions: {
    marginTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
});
