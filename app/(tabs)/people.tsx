// People — Similar Interests Tab Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../src/constants/colors';
import { FontSize, FontWeight } from '../../src/constants/typography';
import { Spacing } from '../../src/constants/spacing';
import { PeopleCard } from '../../src/components/people/PeopleCard';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { userService } from '../../src/services/userService';
import { UserProfile } from '../../src/types/user';
import { CURRENT_USER_ID } from '../../src/data/mockUsers';

export default function PeopleScreen() {
  const [people, setPeople] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const similar = await userService.getPeopleWithSimilarInterests(CURRENT_USER_ID);
    setPeople(similar);
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <FlatList
        data={people}
        keyExtractor={p => p.id}
        renderItem={({ item }) => (
          <PeopleCard
            user={item}
            onPress={() => router.push(`/people/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>People with similar interests</Text>
            <Text style={styles.subtitle}>
              Meet people who enjoy the same things as you.
            </Text>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="🤝"
              title="No people found yet"
              message="Add more interests to discover people with similar hobbies in your area."
              actionLabel="Update Interests"
              onAction={() => router.push('/(tabs)/profile')}
            />
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
});
