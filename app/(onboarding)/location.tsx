// Location Selection Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { FontSize, FontWeight } from '../../src/constants/typography';
import { Spacing, BorderRadius, TouchTarget } from '../../src/constants/spacing';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { validateCity } from '../../src/utils/validation';

const POPULAR_CITIES = ['Jaipur', 'Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Kolkata', 'Pune'];
const JAIPUR_AREAS = ['Vaishali Nagar', 'Malviya Nagar', 'C-Scheme', 'Mansarovar', 'Tonk Road', 'Adarsh Nagar'];

export default function LocationScreen() {
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function handleContinue() {
    const cityErr = validateCity(city);
    if (cityErr) {
      setErrors({ city: cityErr });
      return;
    }
    setErrors({});
    // In real app: save location to user profile
    router.replace('/(tabs)');
  }

  function selectCity(c: string) {
    setCity(c);
    setErrors({});
    setArea('');
  }

  function selectArea(a: string) {
    setArea(a);
  }

  const progress = 3 / 3;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.step}>Step 3 of 3</Text>
          <Text style={styles.title}>Find activities near you</Text>
          <Text style={styles.subtitle}>
            We use your location to show activities and communities near you.
          </Text>

          {/* Use current location option */}
          <TouchableOpacity
            style={styles.gpsBtn}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Use my current location"
          >
            <Ionicons name="location" size={22} color={Colors.primary} />
            <View style={styles.gpsBtnText}>
              <Text style={styles.gpsBtnTitle}>Use my current location</Text>
              <Text style={styles.gpsBtnSub}>Auto-detect your area</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or enter manually</Text>
            <View style={styles.dividerLine} />
          </View>

          <Input
            label="City *"
            placeholder="e.g. Jaipur"
            value={city}
            onChangeText={text => { setCity(text); setErrors({}); }}
            error={errors.city}
            autoCapitalize="words"
          />

          {/* Popular cities */}
          <View style={styles.suggestionsSection}>
            <Text style={styles.suggestionsLabel}>Popular cities:</Text>
            <View style={styles.suggestions}>
              {POPULAR_CITIES.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.suggestionChip, city === c ? styles.suggestionSelected : undefined]}
                  onPress={() => selectCity(c)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.suggestionText, city === c ? styles.suggestionTextSelected : undefined]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Input
            label="Area / Locality (Optional)"
            placeholder="e.g. Vaishali Nagar"
            value={area}
            onChangeText={setArea}
            autoCapitalize="words"
          />

          {/* Jaipur areas shortcut */}
          {city === 'Jaipur' && (
            <View style={styles.suggestionsSection}>
              <Text style={styles.suggestionsLabel}>Areas in Jaipur:</Text>
              <View style={styles.suggestions}>
                {JAIPUR_AREAS.map(a => (
                  <TouchableOpacity
                    key={a}
                    style={[styles.suggestionChip, area === a ? styles.suggestionSelected : undefined]}
                    onPress={() => selectArea(a)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.suggestionText, area === a ? styles.suggestionTextSelected : undefined]}>
                      {a}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.privacyNote}>
            <Ionicons name="lock-closed-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.privacyText}>
              Your exact location is never shared with other users. Only your city and area are visible.
            </Text>
          </View>

          <Button
            title="Let's Go! 🎉"
            onPress={handleContinue}
            loading={loading}
            size="lg"
            style={styles.continueBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginBottom: Spacing.xl,
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    gap: Spacing.md,
    minHeight: TouchTarget.comfortable,
  },
  gpsBtnText: { flex: 1 },
  gpsBtnTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semiBold,
    color: Colors.primary,
  },
  gpsBtnSub: {
    fontSize: FontSize.bodySm,
    color: Colors.primaryMid,
    marginTop: 2,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: FontSize.bodySm,
    color: Colors.textMuted,
  },
  suggestionsSection: {
    marginBottom: Spacing.lg,
    marginTop: -Spacing.xs,
  },
  suggestionsLabel: {
    fontSize: FontSize.bodySm,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  suggestionChip: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundAlt,
    minHeight: TouchTarget.min,
    justifyContent: 'center',
  },
  suggestionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  suggestionText: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  suggestionTextSelected: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  privacyText: {
    flex: 1,
    fontSize: FontSize.bodySm,
    color: Colors.textMuted,
    lineHeight: FontSize.bodySm * 1.5,
  },
  continueBtn: {},
});
