import '@/global.css';

import { Platform } from 'react-native';

/**
 * Typography Scale — unified across all screens
 * 
 * Consistent font family across the entire app for a clean, modern aesthetic.
 */
export const AppFonts = {
  /** Section headings, hero titles, cards */
  displaySans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'sans-serif',
  }),
  /** Display / Quotes (now unified with the app's clean primary font family) */
  displaySerif: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'sans-serif',
  }),
  /** Body, labels, badges, secondary info */
  body: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'sans-serif',
  }),
} as const;

/**
 * Shared typography style presets — import + spread these in StyleSheet.create
 * to keep all screens consistent.
 */
export const AppTypography = {
  heroTitle: {
    fontFamily: AppFonts.displaySans,
    fontSize: 30,
    fontWeight: '800' as const,
    letterSpacing: -0.6,
    color: '#FFF8F3',
  },
  heroTitleItalic: {
    fontFamily: AppFonts.displaySans,
    fontSize: 30,
    fontStyle: 'italic' as const,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    color: '#EFA25B',
  },
  sectionTitle: {
    fontFamily: AppFonts.displaySans,
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    color: '#FFF8F3',
  },
  cardTitle: {
    fontFamily: AppFonts.displaySans,
    fontSize: 17,
    fontWeight: '800' as const,
    letterSpacing: -0.2,
    color: '#FFF8F3',
  },
  body: {
    fontFamily: AppFonts.body,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 21,
    color: '#B89E99',
  },
  bodySmall: {
    fontFamily: AppFonts.body,
    fontSize: 12.5,
    fontWeight: '400' as const,
    lineHeight: 18,
    color: '#B89E99',
  },
  label: {
    fontFamily: AppFonts.body,
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    color: '#B89E99',
  },
  caption: {
    fontFamily: AppFonts.body,
    fontSize: 10.5,
    fontWeight: '500' as const,
    color: '#8C7570',
  },
  buttonPrimary: {
    fontFamily: AppFonts.body,
    fontSize: 16,
    fontWeight: '800' as const,
    letterSpacing: 0.2,
  },
  quoteSerif: {
    fontFamily: AppFonts.displaySans,
    fontSize: 22,
    fontWeight: '700' as const,
    fontStyle: 'italic' as const,
    letterSpacing: -0.2,
    color: '#FFF8F3',
  },
  nameSerif: {
    fontFamily: AppFonts.displaySans,
    fontSize: 20,
    fontWeight: '700' as const,
    fontStyle: 'italic' as const,
    color: '#FFF8F3',
  },
} as const;

export const Palette = {
  // Figma Spec: Deep wine, Maroon, Rose, Amber, Cream/Ink
  wineDark: '#3A0010',
  wineLight: '#6E0C1E',
  maroon: '#8E2A33',
  rose: '#C0675F',
  amber: '#EFA25B',
  amberBtn: '#F0A35C',
  ink: '#3B0B14',
  muted: '#8C7570',
  cream: '#FBF4EE',

  // Core Surface & Canvas
  iceWhite: '#000000',
  pureWhite: '#171717',
  surfaceCard: '#171717',
  surfaceElevated: '#202020',
  /** Use ONLY on amber/light CTA buttons — NOT on dark card text */
  textOnPrimary: '#3B0B14',
  /** Use for text ON DARK backgrounds (amber CTA button label) */
  textOnAmber: '#3B0B14',
  /** White for arrow icons inside dark circles */
  textOnDark: '#FFFFFF',
  borderSubtle: '#2C1018',
  borderActive: 'rgba(239, 162, 91, 0.55)',

  // Typography Hierarchy (dark-background defaults)
  textPrimary: '#FFF8F3',
  textSecondary: '#B89E99',
  textMuted: '#8C7570',

  // Brand Accents
  oceanTeal: '#EFA25B',
  turquoise: '#EFA25B',
  deepTeal: '#FFF8F3',
  mintMist: '#2A0B12',

  oceanTealSoft: 'rgba(239, 162, 91, 0.12)',
  turquoiseSoft: 'rgba(239, 162, 91, 0.18)',
  mintMistAura: 'rgba(42, 11, 18, 0.85)',
  oceanTealDark: '#3A0010',

  accentAmber: '#EFA25B',
  accentGold: '#F0A35C',
  accentCyan: '#8FD3FF',
  accentRose: '#C0675F',
  accentEmerald: '#8FF0C6',
  accentSky: '#8FD3FF',
  accentPurple: '#C4A7FF',
  accentLavender: '#D8B4FE',
  accentLilac: '#D8B4FE',
  accentCoral: '#C0675F',
  accentPeach: '#F0A35C',
  accentMint: '#8FF0C6',
  accentPink: '#FF9ECF',
} as const;

export function getCategoryAccent(category: string): string {
  const normalized = category.toLowerCase();
  if (normalized.includes('parent')) return Palette.accentPink;
  if (normalized.includes('coach')) return Palette.accentMint;
  if (normalized.includes('friend')) return Palette.accentPeach;
  if (normalized.includes('leader')) return Palette.accentAmber;
  if (normalized.includes('memory')) return Palette.accentLavender;
  if (normalized.includes('quote') || normalized.includes('tribute')) return Palette.accentCoral;
  if (normalized.includes('saved')) return Palette.accentMint;
  return Palette.accentAmber;
}

export const Colors = {
  light: {
    background: '#000000',
    text: '#FFF8F3',
    textSecondary: '#B89E99',
    backgroundElement: '#171717',
    backgroundSelected: '#202020',
    primary: '#EFA25B',
    secondary: '#C0675F',
    accent: '#EFA25B',
    border: '#2C1018',
  },
  dark: {
    background: '#000000',
    text: '#FFF8F3',
    textSecondary: '#B89E99',
    backgroundElement: '#171717',
    backgroundSelected: '#202020',
    primary: '#EFA25B',
    secondary: '#C0675F',
    accent: '#EFA25B',
    border: '#2C1018',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// Legacy alias so existing code still compiles
export const Fonts = Platform.select({
  ios: {
    sans: AppFonts.displaySans,
    serif: AppFonts.displaySerif,
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: AppFonts.body,
    serif: AppFonts.displaySerif,
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
