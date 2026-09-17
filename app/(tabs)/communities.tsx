// Communities Screen

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
import { CommunityCard } from '../../src/components/community/CommunityCard';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { communityService } from '../../src/services/communityService';
import { Community, CommunityCategory } from '../../src/types/community';
import { CURRENT_USER_ID } from '../../src/data/mockUsers';

const CATEGORIES: { id: CommunityCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '✨' },
  { id: 'walking', label: 'Walking', icon: '🚶' },
  { id: 'fitness', label: 'Fitness', icon: '💪' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'games', label: 'Games', icon: '♟️' },
  { id: 'books', label: 'Books', icon: '📚' },
  { id: 'gardening', label: 'Gardening', icon: '🌱' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
];

export default function CommunitiesScreen() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [filtered, setFiltered] = useState<Community[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CommunityCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCommunities();
  }, [communities, selectedCategory, search]);

  useEffect(() => {
    // Scroll list back to top when filtered items update to maintain consistent layout
    if (filtered.length > 0) {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  }, [filtered]);

  async function loadData() {
    setLoading(true);
    const comms = await communityService.getCommunities();
    const userComms = await communityService.getUserCommunities(CURRENT_USER_ID);
    setCommunities(comms);
    setJoinedIds(new Set(userComms.map(c => c.id)));
    setLoading(false);
  }

  function filterCommunities() {
    let result = [...communities];
    if (selectedCategory !== 'all') {
      result = result.filter(c => c.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }

  async function handleJoin(communityId: string) {
    const isJoined = joinedIds.has(communityId);
    if (isJoined) {
      await communityService.leaveCommunity(communityId, CURRENT_USER_ID);
      setJoinedIds(prev => { const next = new Set(prev); next.delete(communityId); return next; });
    } else {
      await communityService.joinCommunity(communityId, CURRENT_USER_ID);
      setJoinedIds(prev => new Set([...prev, communityId]));
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.title}>Communities</Text>
        <Text style={styles.subtitle}>Find people who enjoy the same things.</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search communities..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            accessibilityLabel="Search communities"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

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
            >
              <Text style={styles.categoryIcon}>{item.icon}</Text>
              <Text style={[styles.categoryLabel, selectedCategory === item.id ? styles.categoryLabelSelected : undefined]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        ref={listRef}
        data={filtered}
        keyExtractor={c => c.id}
        renderItem={({ item }) => (
          <CommunityCard
            community={item}
            isJoined={joinedIds.has(item.id)}
            onPress={() => router.push(`/communities/${item.id}`)}
            onJoin={() => handleJoin(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="🏘️"
              title="No communities yet"
              message="Find people who share your interests. New communities are created regularly!"
              actionLabel="Discover Activities"
              onAction={() => router.push('/(tabs)/activities')}
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
    height: 58,
    marginBottom: Spacing.md,
  },
  categoryList: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 2,
    paddingBottom: 8,
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
    minHeight: TouchTarget.min,
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
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxxl,
  },
});
