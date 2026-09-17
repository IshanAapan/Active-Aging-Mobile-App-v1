// Active Aging App — Typography System
// Optimized for 55+ users: large, clear, readable

export const FontFamily = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
} as const;

export const FontSize = {
  // Display — Hero text
  display: 32,
  displaySm: 28,

  // Headings
  h1: 26,
  h2: 22,
  h3: 20,

  // Section headings
  sectionHeading: 18,

  // Body text
  bodyLg: 17,
  body: 16,
  bodySm: 15,

  // Secondary / labels
  label: 14,
  caption: 13,

  // CTA buttons
  button: 17,
  buttonSm: 15,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

export const LineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
} as const;

export const LetterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
} as const;
