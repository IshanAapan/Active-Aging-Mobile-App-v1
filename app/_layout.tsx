// Root Layout — provides AuthProvider and sets up Expo Router navigation

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import { ErrorBoundary } from '../src/components/ui/ErrorBoundary';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
          <StatusBar style="auto" />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="activities/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="communities/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="communities/[id]/chat" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="people/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="notifications" options={{ headerShown: false, animation: 'slide_from_right' }} />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
