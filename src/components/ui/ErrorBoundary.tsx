// Global Error Boundary — Catches runtime errors gracefully for senior accessibility

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight } from '../../constants/typography';
import { Spacing, BorderRadius, TouchTarget } from '../../constants/spacing';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled Application Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.iconCircle}>
              <Ionicons name="refresh-circle" size={64} color={Colors.primary} />
            </View>

            <Text style={styles.title}>Something unexpected happened</Text>
            <Text style={styles.subtitle}>
              Don't worry — your account and information are completely safe. Let's get you back on track!
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={this.handleReset}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Restart Application"
            >
              <Text style={styles.buttonText}>Restart Application</Text>
            </TouchableOpacity>

            {__DEV__ && this.state.error && (
              <View style={styles.devCard}>
                <Text style={styles.devTitle}>Technical Details (Debug Mode):</Text>
                <Text style={styles.devError}>{this.state.error.toString()}</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.bodyLg,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSize.bodyLg * 1.5,
    marginBottom: Spacing.xxl,
    maxWidth: 320,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.full,
    minHeight: TouchTarget.comfortable,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 280,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FontSize.button,
    fontWeight: FontWeight.bold,
  },
  devCard: {
    marginTop: Spacing.xxl,
    padding: Spacing.md,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
  },
  devTitle: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  devError: {
    fontSize: FontSize.caption,
    color: Colors.error,
    fontFamily: 'monospace',
  },
});
