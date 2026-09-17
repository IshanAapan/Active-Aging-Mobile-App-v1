// Root index — handles routing based on auth state and serves as an interactive splash screen

import { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Animated, Pressable, Easing, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { Colors } from '../src/constants/colors';
import { FontSize, FontWeight } from '../src/constants/typography';
import { Spacing, BorderRadius } from '../src/constants/spacing';

const HOOK_LINES = [
  "Your next chapter starts with friends. 🤝",
  "Discover local activities you love. 🎨",
  "Connecting hearts and sharing joy after 55. 🌟",
  "Never too late to laugh, learn, and explore. 🚲"
];

const { width } = Dimensions.get('window');

export default function Index() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const [hookIndex, setHookIndex] = useState(0);
  const [canNavigate, setCanNavigate] = useState(false);

  // Animated values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const hookFadeAnim = useRef(new Animated.Value(0)).current;

  // Background ripple animation on tap
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const [rippleCoords, setCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // 1. Initial entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      })
    ]).start(() => {
      // 2. Start continuous logo pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.08,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ])
      ).start();
    });

    // 3. Cycle hook lines
    animateHookLine(0);
    const hookTimer = setInterval(() => {
      setHookIndex(prev => {
        const next = (prev + 1) % HOOK_LINES.length;
        animateHookLine(next);
        return next;
      });
    }, 3200);

    // 4. Loading delay (allows user to interact/read hooks)
    const navTimer = setTimeout(() => {
      setCanNavigate(true);
    }, 5500);

    return () => {
      clearInterval(hookTimer);
      clearTimeout(navTimer);
    };
  }, []);

  function animateHookLine(index: number) {
    // Fade out, change state, fade in
    Animated.sequence([
      Animated.timing(hookFadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(hookFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }

  // Handle routing when allowed and loaded
  useEffect(() => {
    if (isLoading || !canNavigate) return;
    triggerNavigation();
  }, [isLoading, isAuthenticated, user, canNavigate]);

  function triggerNavigation() {
    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
    } else if (user && !user.isOnboardingComplete) {
      router.replace('/(onboarding)/profile');
    } else {
      router.replace('/(tabs)');
    }
  }

  // Interactive Touch: Tapping speeds up the process and triggers a visual ripple
  function handleScreenTouch(event: any) {
    const { locationX, locationY } = event.nativeEvent;
    setCoords({ x: locationX, y: locationY });

    // Trigger ripple animation
    rippleScale.setValue(0);
    rippleOpacity.setValue(0.6);

    Animated.parallel([
      Animated.timing(rippleScale, {
        toValue: 4,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();

    // Skip directly to next screen on tap once auth is ready
    if (!isLoading) {
      setCanNavigate(true);
    }
  }

  // Combine springs & pulses
  const combinedLogoScale = Animated.multiply(logoScale, pulseScale);

  return (
    <Pressable style={styles.pressable} onPress={handleScreenTouch}>
      <LinearGradient
        colors={[Colors.primary, '#153A33']}
        style={styles.container}
      >
        {/* Interactive Ripple Layer */}
        <Animated.View
          style={[
            styles.ripple,
            {
              top: rippleCoords.y - 50,
              left: rippleCoords.x - 50,
              transform: [{ scale: rippleScale }],
              opacity: rippleOpacity,
            }
          ]}
        />

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Pulsing Logo Circle */}
          <Animated.View style={[styles.iconOuterCircle, { transform: [{ scale: combinedLogoScale }] }]}>
            <LinearGradient
              colors={['#3AA08F', Colors.primary]}
              style={styles.iconCircle}
            >
              <Ionicons name="sparkles" size={56} color="#FFF" />
            </LinearGradient>
          </Animated.View>

          {/* Sliding App Title */}
          <Animated.View style={{ transform: [{ translateY: textTranslateY }] }}>
            <Text style={styles.appName}>Active Aging</Text>
          </Animated.View>

          {/* Cycling Animated Hook Line */}
          <View style={styles.hookWrapper}>
            <Animated.View style={[styles.glassCard, { opacity: hookFadeAnim }]}>
              <Text style={styles.hookText}>{HOOK_LINES[hookIndex]}</Text>
            </Animated.View>
          </View>

          {/* Footer Loader & Interaction Hint */}
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color="#FFF" style={styles.spinner} />
            <Text style={styles.hintText}>Tap anywhere to skip</Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { flex: 1 },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: Spacing.xl,
  },
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    pointerEvents: 'none',
  },
  iconOuterCircle: {
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  appName: {
    fontSize: FontSize.h1 * 1.2,
    fontWeight: FontWeight.bold,
    color: '#FFF',
    letterSpacing: 2,
    marginBottom: Spacing.lg,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  hookWrapper: {
    height: 80,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    width: width - Spacing.xl * 2,
    maxWidth: 400,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  hookText: {
    fontSize: FontSize.body,
    color: '#FFF',
    fontWeight: FontWeight.medium,
    textAlign: 'center',
    lineHeight: FontSize.body * 1.5,
  },
  loaderContainer: {
    marginTop: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  spinner: { marginRight: 2 },
  hintText: {
    fontSize: FontSize.caption,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: FontWeight.medium,
    letterSpacing: 0.5,
  },
});
