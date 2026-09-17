// Active Aging App — Spacing System
// Generous spacing for 55+ users — large touch targets

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  massive: 64,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

// Minimum touch target for accessibility (44pt iOS standard, 48dp Android)
export const TouchTarget = {
  min: 48,
  comfortable: 56,
  large: 64,
} as const;

export const IconSize = {
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  xxl: 40,
} as const;
