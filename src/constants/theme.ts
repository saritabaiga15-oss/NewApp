import '@/global.css';

import { Platform } from 'react-native';

export const Palette = {
  iceWhite: '#000000',
  oceanTeal: '#FFFFFF',
  turquoise: '#8FD3FF',
  deepTeal: '#FFFFFF',
  mintMist: '#202020',

  pureWhite: '#171717',
  surfaceCard: '#171717',
  surfaceElevated: '#202020',
  textOnPrimary: '#000000',
  borderSubtle: '#303030',
  borderActive: 'rgba(143, 211, 255, 0.55)',

  textPrimary: '#FFFFFF',
  textSecondary: '#A3A3A3',
  textMuted: '#737373',

  oceanTealSoft: 'rgba(255, 255, 255, 0.08)',
  turquoiseSoft: 'rgba(143, 211, 255, 0.15)',
  mintMistAura: 'rgba(32, 32, 32, 0.85)',
  oceanTealDark: '#202020',

  accentAmber: '#FFF09A',
  accentGold: '#FFB899',
  accentCyan: '#8FD3FF',
  accentRose: '#FF9ECF',
  accentEmerald: '#8FF0C6',
  accentSky: '#8FD3FF',
  accentPurple: '#C4A7FF',
  accentLavender: '#C4A7FF',
  accentLilac: '#D8B4FE',
  accentCoral: '#FF8F91',
  accentPeach: '#FFB899',
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
  return Palette.accentSky;
}

export const Colors = {
  light: {
    background: '#000000',
    text: '#FFFFFF',
    textSecondary: '#A3A3A3',
    backgroundElement: '#171717',
    backgroundSelected: '#202020',
    primary: '#FFFFFF',
    secondary: '#8FD3FF',
    accent: '#8FD3FF',
    border: '#303030',
  },
  dark: {
    background: '#000000',
    text: '#FFFFFF',
    textSecondary: '#A3A3A3',
    backgroundElement: '#171717',
    backgroundSelected: '#202020',
    primary: '#FFFFFF',
    secondary: '#8FD3FF',
    accent: '#8FD3FF',
    border: '#303030',
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
