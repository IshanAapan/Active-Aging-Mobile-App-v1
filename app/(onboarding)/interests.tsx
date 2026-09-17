// Interest Selection Screen — One of the most important onboarding screens

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../src/constants/colors';
import { FontSize, FontWeight } from '../../src/constants/typography';
import { Spacing, BorderRadius, TouchTarget } from '../../src/constants/spacing';
import { Button } from '../../src/components/ui/Button';
import { mockInterests } from '../../src/data/mockInterests';
import { Config } from '../../src/constants/config';

export default function InterestsScreen() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  function toggleInterest(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    if (error) setError('');
  }

  function handleContinue() {
    if (selected.size < Config.MIN_INTERESTS) {
      setError(`Please choose at least ${Config.MIN_INTERESTS} interests.`);
      return;
    }
    router.push('/(onboarding)/location');
  }

  const progress = 2 / 3;
  const remaining = Math.max(0, Config.MIN_INTERESTS - selected.size);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      {/* Progress */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.step}>Step 2 of 3</Text>
        <Text style={styles.title}>What do you enjoy?</Text>
        <Text style={styles.subtitle}>
          Choose at least {Config.MIN_INTERESTS} interests so we can find activities and people you'll love.
        </Text>

        {selected.size > 0 && remaining === 0 && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✨ Great choices! You can add more if you'd like.</Text>
          </View>
        )}
        {remaining > 0 && selected.size > 0 && (
          <View style={styles.hintBanner}>
            <Text style={styles.hintText}>Pick {remaining} more to continue</Text>
          </View>
        )}
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.grid}>
          {mockInterests.map(interest => {
            const isSelected = selected.has(interest.id);
            return (
              <TouchableOpacity
                key={interest.id}
                style={[styles.chip, isSelected ? styles.chipSelected : undefined]}
                onPress={() => toggleInterest(interest.id)}
                activeOpacity={0.7}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`${interest.name} interest`}
              >
                <Text style={styles.chipIcon}>{interest.icon}</Text>
                <Text style={[styles.chipLabel, isSelected ? styles.chipLabelSelected : undefined]}>
                  {interest.name}
                </Text>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title={`Continue${selected.size > 0 ? ` (${selected.size} selected)` : ''}`}
          onPress={handleContinue}
          disabled={selected.size < Config.MIN_INTERESTS}
          size="lg"
          style={styles.continueBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  progressBar: { height: 4, backgroundColor: Colors.border },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  step: {
    fontSize: FontSize.bodySm,
    fontWeight: FontWeight.semiBold,
    color: Colors.primary,
    letterSpacing: 0.5,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSize.h1,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.bodyLg,
    color: Colors.textSecondary,
    lineHeight: FontSize.bodyLg * 1.5,
    marginBottom: Spacing.lg,
  },
  successBanner: {
    backgroundColor: Colors.successLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
  },
  successText: {
    fontSize: FontSize.body,
    color: Colors.success,
    fontWeight: FontWeight.medium,
  },
  hintBanner: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  hintText: {
    fontSize: FontSize.body,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  errorText: {
    fontSize: FontSize.body,
    color: Colors.error,
    fontWeight: FontWeight.medium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundAlt,
    minHeight: TouchTarget.min,
  },
  chipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  chipIcon: {
    fontSize: 20,
  },
  chipLabel: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  chipLabelSelected: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  checkmark: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  continueBtn: {
    marginTop: Spacing.md,
  },
});
