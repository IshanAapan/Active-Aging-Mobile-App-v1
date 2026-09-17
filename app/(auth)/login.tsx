// Login Screen — Mobile OTP authentication

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { useAuth } from '../../src/context/AuthContext';
import { validatePhone, formatPhone } from '../../src/utils/validation';

export default function LoginScreen() {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    const validationError = validatePhone(phone);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await login(phone);
      if (result.success) {
        router.push({
          pathname: '/(auth)/verify-otp',
          params: { phone: formatPhone(phone) },
        });
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>👋</Text>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Enter your mobile number to continue. We'll send you a verification code.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.phoneRow}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
              </View>
              <View style={styles.phoneInput}>
                <Input
                  placeholder="98765 43210"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={text => {
                    setPhone(text);
                    if (error) setError('');
                  }}
                  error={error}
                  maxLength={10}
                  returnKeyType="done"
                  onSubmitEditing={handleContinue}
                  style={styles.inputStyle}
                />
              </View>
            </View>

            <Button
              title="Continue"
              onPress={handleContinue}
              loading={loading}
              size="lg"
              style={styles.continueBtn}
            />
          </View>

          {/* Legal */}
          <Text style={styles.legal}>
            By continuing, you agree to our{' '}
            <Text style={styles.legalLink}>Terms of Service</Text> and{' '}
            <Text style={styles.legalLink}>Privacy Policy</Text>.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    flexGrow: 1,
  },
  backBtn: {
    width: TouchTarget.comfortable,
    height: TouchTarget.comfortable,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -Spacing.sm,
    marginBottom: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xxl,
  },
  emoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
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
  },
  form: {
    marginBottom: Spacing.xl,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  countryCode: {
    height: TouchTarget.comfortable,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: FontSize.bodyLg,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  phoneInput: {
    flex: 1,
  },
  inputStyle: {
    fontSize: FontSize.bodyLg,
  },
  continueBtn: {
    marginTop: Spacing.xs,
  },
  legal: {
    fontSize: FontSize.bodySm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: FontSize.bodySm * 1.6,
  },
  legalLink: {
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
});
