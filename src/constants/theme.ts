/**
 * Design System: Royal Crimson — Warm, Regal, Timeless, Honoured
 *
 * Cream White   — #FFF8F0: Warm canvas, soft & inviting background
 * Deep Crimson  — #54000E: Primary brand color, hero action buttons & primary links
 * Rich Crimson  — #9E2A2B: Secondary accents, active highlights, badges & pins
 * Golden Amber  — #EC8F3E: Accent / CTA highlights, warm glow
 * Warm Taupe    — #B1A7A6: Borders, muted text & dividers
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Palette = {
  // Core Brand Tokens
  iceWhite: '#FFF8F0',       // Warm cream background canvas & reading surfaces
  oceanTeal: '#54000E',      // Deep Crimson — primary buttons, hero CTAs & links
  turquoise: '#EC8F3E',      // Golden Amber — vibrant accents, pins, sparkles & badges
  deepTeal: '#54000E',       // Deep Crimson — headings, rich text & bottom navigation
  mintMist: '#FCEEE4',       // Soft warm cream — panels, reflections & tags

  // Surface & Paper Tokens
  pureWhite: '#FFFFFF',
  surfaceCard: '#FFFFFF',
  borderSubtle: 'rgba(177, 167, 166, 0.35)',
  borderActive: 'rgba(236, 143, 62, 0.45)',

  // Typography Hierarchy
  textPrimary: '#54000E',    // Deep Crimson for crisp readable headings & body
  textSecondary: '#7A4040',  // Muted warm rose for subtitles
  textMuted: '#B1A7A6',      // Warm taupe for captions & placeholders

  // Accent Helpers
  oceanTealSoft: 'rgba(84, 0, 14, 0.10)',
  turquoiseSoft: 'rgba(236, 143, 62, 0.15)',
  mintMistAura: 'rgba(252, 238, 228, 0.85)',
  oceanTealDark: '#3A0009',   // Darker crimson for pressed states
} as const;

export const Colors = {
  light: {
    background: Palette.iceWhite,
    text: Palette.deepTeal,
    textSecondary: Palette.textSecondary,
    backgroundElement: Palette.pureWhite,
    backgroundSelected: Palette.mintMist,
    primary: Palette.oceanTeal,
    secondary: Palette.turquoise,
    accent: Palette.turquoise,
    border: Palette.borderSubtle,
  },
  dark: {
    background: '#1A0005',
    text: '#FFF8F0',
    textSecondary: '#C49090',
    backgroundElement: '#2D0010',
    backgroundSelected: '#3D0018',
    primary: '#EC8F3E',
    secondary: '#9E2A2B',
    accent: '#EC8F3E',
    border: 'rgba(252, 238, 228, 0.15)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
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
