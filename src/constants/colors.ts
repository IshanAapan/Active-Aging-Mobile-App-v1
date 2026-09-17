// Active Aging App — Centralized Color System
// Warm, trustworthy, energetic palette for 55+ users

export const Colors = {
  // Primary — Warm Teal/Green (trust, health, vitality)
  primary: '#2D7D6F',
  primaryDark: '#1F5C51',
  primaryLight: '#E8F5F2',
  primaryMid: '#4A9E8E',

  // Secondary — Warm Orange/Coral (energy, warmth, community)
  secondary: '#E07B39',
  secondaryDark: '#C45E1E',
  secondaryLight: '#FFF0E6',
  secondaryMid: '#F0944A',

  // Background
  background: '#F7F5F2',
  backgroundAlt: '#FFFFFF',
  backgroundCard: '#FFFFFF',

  // Surface
  surface: '#FFFFFF',
  surfaceAlt: '#F3F1EE',

  // Text
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textMuted: '#9E9E9E',
  textInverse: '#FFFFFF',

  // Borders
  border: '#E0DDD9',
  borderLight: '#F0EDE9',

  // Status
  success: '#27AE60',
  successLight: '#E8F8EF',
  error: '#E74C3C',
  errorLight: '#FDECEA',
  warning: '#F39C12',
  warningLight: '#FEF9E7',
  info: '#2980B9',
  infoLight: '#EAF4FC',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',

  // Skeleton/Loading
  skeleton: '#E8E4E0',
  skeletonHighlight: '#F5F2EE',

  // Tag/Badge
  tagBg: '#E8F5F2',
  tagText: '#2D7D6F',

  // Transparent
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof Colors;
