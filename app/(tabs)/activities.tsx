// Activities Screen

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { FontSize, FontWeight } from '../../src/constants/typography';
import { Spacing, BorderRadius, TouchTarget } from '../../src/constants/spacing';
import { ActivityCard } from '../../src/components/activity/ActivityCard';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { activityService } from '../../src/services/activityService';
import { Activity, ActivityCategory } from '../../src/types/activity';
import { CURRENT_USER_ID } from '../../src/data/mockUsers';

const CATEGORIES: { id: ActivityCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '✨' },
  { id: 'walking', label: 'Walking', icon: '🚶' },
  { id: 'yoga', label: 'Yoga', icon: '🧘' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'games', label: 'Games', icon: '♟️' },
  { id: 'reading', label: 'Reading', icon: '📚' },
  { id: 'gardening', label: 'Gardening', icon: '🌱' },
  { id: 'art', label: 'Art', icon: '🎨' },
];

export default function ActivitiesScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filtered, setFiltered] = useState<Activity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, selectedCategory, search]);

  useEffect(() => {
    // Scroll list back to top when filtered items update to maintain consistent layout
    if (filtered.length > 0) {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  }, [filtered]);

  async function loadData() {
    setLoading(true);
    const [acts, joined] = await Promise.all([
      activityService.getActivities(),
      activityService.getJoinedActivityIds(),
    ]);
    setActivities(acts);
    setJoinedIds(new Set(joined));
    setLoading(false);
  }

  function filterActivities() {
    let result = [...activities];
    if (selectedCategory !== 'all') {
      result = result.filter(a => a.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }

  async function handleJoin(activityId: string) {
    const result = await activityService.joinActivity(activityId, CURRENT_USER_ID);
    if (result.success) {
      setJoinedIds(prev => new Set([...prev, activityId]));
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Activities near you</Text>
        <Text style={styles.subtitle}>Discover things to do around Jaipur</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search activities..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            accessibilityLabel="Search activities"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category filters */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={CATEGORIES}
          keyExtractor={c => c.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryChip, selectedCategory === item.id ? styles.categorySelected : undefined]}
              onPress={() => setSelectedCategory(item.id)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedCategory === item.id }}
              accessibilityLabel={`Filter by ${item.label}`}
            >
              <Text style={styles.categoryIcon}>{item.icon}</Text>
              <Text style={[styles.categoryLabel, selectedCategory === item.id ? styles.categoryLabelSelected : undefined]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Results count */}
      {!loading && (
        <View style={styles.resultsRow}>
          <Text style={styles.resultsText}>
            {filtered.length} {filtered.length === 1 ? 'activity' : 'activities'} found
          </Text>
        </View>
      )}

      {/* Activity list */}
      <FlatList
        ref={listRef}
        data={filtered}
        keyExtractor={a => a.id}
        renderItem={({ item }) => (
          <ActivityCard
            activity={item}
            isJoined={joinedIds.has(item.id)}
            onPress={() => router.push(`/activities/${item.id}`)}
            onJoin={() => handleJoin(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="🎯"
              title="Nothing nearby yet"
              message="New activities are added regularly. Check back soon or explore communities!"
              actionLabel="Explore Communities"
              onAction={() => router.push('/(tabs)/communities')}
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  searchRow: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    height: TouchTarget.comfortable,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.body,
    color: Colors.text,
  },
  categoryContainer: {
    height: TouchTarget.min + Spacing.md,
  },
  categoryList: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundAlt,
    height: TouchTarget.min,
    marginRight: Spacing.xs,
  },
  categorySelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  categoryIcon: { fontSize: 16, lineHeight: 20 },
  categoryLabel: {
    fontSize: FontSize.bodySm,
    lineHeight: 20,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  categoryLabelSelected: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  resultsRow: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xs,
  },
  resultsText: {
    fontSize: FontSize.bodySm,
    color: Colors.textMuted,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxxl,
  },
});
