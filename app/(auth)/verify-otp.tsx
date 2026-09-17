// OTP Verification Screen

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { FontSize, FontWeight } from '../../src/constants/typography';
import { Spacing, BorderRadius, TouchTarget } from '../../src/constants/spacing';
import { Button } from '../../src/components/ui/Button';
import { useAuth } from '../../src/context/AuthContext';
import { Config } from '../../src/constants/config';

const OTP_LENGTH = 6;

export default function VerifyOtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { verifyOtp } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState<number>(Config.OTP_RESEND_SECONDS);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 500);
  }, []);

  async function handleVerify() {
    if (otp.length !== OTP_LENGTH) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await verifyOtp(phone ?? '', otp);
      if (result.success) {
        if (result.isNewUser) {
          router.replace('/(onboarding)/profile');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        setError('Invalid OTP. Please check and try again. (Hint: use 123456)');
      }
    } catch (e: any) {
      setError(e?.message || 'Something went wrong. Please check your network connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleResend() {
    setCountdown(Config.OTP_RESEND_SECONDS);
    setOtp('');
    setError('');
    // TODO: call authService.sendOtp again
  }

  // Render OTP box display
  const otpChars = otp.padEnd(OTP_LENGTH, ' ').split('');

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
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.emoji}>📱</Text>
            <Text style={styles.title}>Verify your number</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit code to{'\n'}
              <Text style={styles.phone}>{phone}</Text>
            </Text>
            {Config.USE_MOCK_DATA && (
              <View style={styles.hintBanner}>
                <Text style={styles.hintText}>💡 For testing, use OTP: {Config.MOCK_OTP}</Text>
              </View>
            )}
          </View>

          {/* OTP Display */}
          <TouchableOpacity
            style={styles.otpContainer}
            onPress={() => inputRef.current?.focus()}
            activeOpacity={1}
          >
            {otpChars.map((char, index) => (
              <View
                key={index}
                style={[
                  styles.otpBox,
                  otp.length === index ? styles.otpBoxActive : undefined,
                  otp.length > index ? styles.otpBoxFilled : undefined,
                  error ? styles.otpBoxError : undefined,
                ]}
              >
                <Text style={styles.otpChar}>{char === ' ' ? '' : char}</Text>
              </View>
            ))}
          </TouchableOpacity>

          {/* Hidden real input */}
          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={text => {
              const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
              setOtp(digits);
              if (error) setError('');
            }}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            style={styles.hiddenInput}
            accessibilityLabel="Enter OTP"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title="Verify"
            onPress={handleVerify}
            loading={loading}
            disabled={otp.length !== OTP_LENGTH}
            size="lg"
            style={styles.verifyBtn}
          />

          <View style={styles.resendRow}>
            {countdown > 0 ? (
              <Text style={styles.resendText}>
                Resend code in <Text style={styles.countdown}>{countdown}s</Text>
              </Text>
            ) : (
              <TouchableOpacity
                onPress={handleResend}
                accessibilityRole="button"
                accessibilityLabel="Resend OTP"
              >
                <Text style={styles.resendLink}>Resend code</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.changeNumber}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Change mobile number"
          >
            <Text style={styles.changeNumberText}>Change number</Text>
          </TouchableOpacity>
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
  flex: { flex: 1 },
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
  phone: {
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  hintBanner: {
    backgroundColor: Colors.warningLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  hintText: {
    fontSize: FontSize.bodySm,
    color: Colors.text,
    fontWeight: FontWeight.medium,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  otpBox: {
    flex: 1,
    height: 64,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundAlt,
  },
  otpBoxActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  otpBoxFilled: {
    borderColor: Colors.primaryMid,
    backgroundColor: Colors.backgroundAlt,
  },
  otpBoxError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  otpChar: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  error: {
    fontSize: FontSize.body,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: FontSize.body * 1.5,
  },
  verifyBtn: {
    marginBottom: Spacing.lg,
  },
  resendRow: {
    alignItems: 'center',
    marginBottom: Spacing.md,
    minHeight: TouchTarget.min,
    justifyContent: 'center',
  },
  resendText: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
  },
  countdown: {
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  resendLink: {
    fontSize: FontSize.body,
    color: Colors.primary,
    fontWeight: FontWeight.semiBold,
  },
  changeNumber: {
    alignItems: 'center',
    minHeight: TouchTarget.min,
    justifyContent: 'center',
  },
  changeNumberText: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
