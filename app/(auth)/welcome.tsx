// Welcome Screen — First impression of Active Aging

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { Colors } from '../../src/constants/colors';
import { FontSize, FontWeight } from '../../src/constants/typography';
import { Spacing, BorderRadius } from '../../src/constants/spacing';
import { Button } from '../../src/components/ui/Button';

const { width, height } = Dimensions.get('window');

const FEATURES = [
  { icon: '🤝', label: 'Meet people with similar interests' },
  { icon: '🎯', label: 'Discover activities near you' },
  { icon: '🏘️', label: 'Join local communities' },
];

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Background Image with Overlay */}
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80' }}
        style={styles.bgImage}
        contentFit="cover"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.85)']}
        style={styles.overlay}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Logo / Tagline */}
        <View style={styles.topSection}>
          <View style={styles.logoChip}>
            <Text style={styles.logoText}>Active Aging</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.headline}>Enjoy life.{'\n'}Together.</Text>
          <Text style={styles.subtitle}>
            Meet people who share your interests, discover activities nearby, and build meaningful connections.
          </Text>

          <View style={styles.features}>
            {FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={styles.featureLabel}>{feature.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <Button
              title="Get Started"
              onPress={() => router.push('/(auth)/login')}
              variant="secondary"
              size="lg"
            />
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Already have an account? Sign In"
            >
              <Text style={styles.signInText}>Already have an account? </Text>
              <Text style={styles.signInTextBold}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  bgImage: {
    position: 'absolute',
    width,
    height,
  },
  overlay: {
    position: 'absolute',
    width,
    height,
  },
  safeArea: {
    flex: 1,
  },
  topSection: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  logoChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  logoText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semiBold,
    color: Colors.textInverse,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  headline: {
    fontSize: 42,
    fontWeight: FontWeight.extraBold,
    color: Colors.textInverse,
    lineHeight: 50,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.bodyLg,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: FontSize.bodyLg * 1.6,
    marginBottom: Spacing.xl,
  },
  features: {
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureIcon: {
    fontSize: 22,
  },
  featureLabel: {
    fontSize: FontSize.body,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: FontWeight.medium,
  },
  actions: {
    gap: Spacing.md,
  },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    minHeight: 48,
  },
  signInText: {
    fontSize: FontSize.body,
    color: 'rgba(255,255,255,0.8)',
  },
  signInTextBold: {
    fontSize: FontSize.body,
    color: Colors.textInverse,
    fontWeight: FontWeight.bold,
  },
});
