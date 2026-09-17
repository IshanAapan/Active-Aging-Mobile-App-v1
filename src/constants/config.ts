// Active Aging App — Configuration Constants
// Keep secrets in env variables; never hardcode production credentials here

export const Config = {
  // App metadata
  APP_NAME: 'Active Aging',
  APP_TAGLINE: 'Community for life after 55',
  APP_MOTTO: 'Meet. Move. Live.',

  // API (will be replaced with real env variables)
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL ?? 'https://api.activeaging.app/v1',

  // Mock mode — set to false to enable real API calls
  USE_MOCK_DATA: true,

  // OTP mock
  MOCK_OTP: '123456',

  // Limits
  MIN_INTERESTS: 3,
  MIN_AGE: 55,
  MAX_ACTIVITY_PARTICIPANTS_DEFAULT: 20,

  // Timeouts
  OTP_RESEND_SECONDS: 30,
  SPLASH_DURATION_MS: 2000,

  // Pagination
  PAGE_SIZE: 10,
} as const;
