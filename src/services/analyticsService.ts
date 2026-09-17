// Analytics Service — Stub for tracking user behavior
// Replace with real analytics provider (Mixpanel, Firebase, Amplitude) later

export type AnalyticsEvent =
  | 'app_opened'
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'interest_selected'
  | 'activity_viewed'
  | 'activity_joined'
  | 'activity_left'
  | 'community_viewed'
  | 'community_joined'
  | 'chat_opened'
  | 'message_sent'
  | 'profile_viewed'
  | 'notification_opened'
  | 'activity_attended';

export const analyticsService = {
  track(event: AnalyticsEvent, properties?: Record<string, unknown>): void {
    // In mock mode, just log to console
    if (__DEV__) {
      console.log(`[Analytics] ${event}`, properties ?? {});
    }
    // TODO: Replace with real analytics call
    // analytics.track(event, properties);
  },

  identify(userId: string, traits?: Record<string, unknown>): void {
    if (__DEV__) {
      console.log(`[Analytics] identify: ${userId}`, traits ?? {});
    }
  },

  screen(screenName: string, properties?: Record<string, unknown>): void {
    if (__DEV__) {
      console.log(`[Analytics] screen: ${screenName}`, properties ?? {});
    }
  },
};
