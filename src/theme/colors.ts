import { ThemeMode } from '../types';

export interface ThemeColors {
  background: string;
  card: string;
  cardSecondary: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string; // WeChat green accent
  primaryLight: string;
  accent: string;  // Tech blue
  danger: string;
  warning: string;
  success: string;
  capsuleBg: string;
  capsuleBorder: string;
  surface: string;
}

export const THEMES: Record<ThemeMode, ThemeColors> = {
  dark: {
    background: '#0B0F19',
    card: '#151E2E',
    cardSecondary: '#1C283C',
    border: '#243247',
    borderSubtle: '#1A2434',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    primary: '#07C160', // WeChat Green
    primaryLight: 'rgba(7, 193, 96, 0.15)',
    accent: '#3B82F6',
    danger: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    capsuleBg: 'rgba(21, 30, 46, 0.85)',
    capsuleBorder: 'rgba(255, 255, 255, 0.12)',
    surface: '#111827',
  },
  oled: {
    background: '#000000',
    card: '#121212',
    cardSecondary: '#1A1A1A',
    border: '#282828',
    borderSubtle: '#1C1C1C',
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    primary: '#07C160',
    primaryLight: 'rgba(7, 193, 96, 0.2)',
    accent: '#60A5FA',
    danger: '#F87171',
    warning: '#FBBF24',
    success: '#34D399',
    capsuleBg: 'rgba(20, 20, 20, 0.9)',
    capsuleBorder: 'rgba(255, 255, 255, 0.15)',
    surface: '#0A0A0A',
  },
  light: {
    background: '#F4F6F9',
    card: '#FFFFFF',
    cardSecondary: '#F8FAFC',
    border: '#E2E8F0',
    borderSubtle: '#EDF2F7',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    primary: '#06AD56',
    primaryLight: 'rgba(6, 173, 86, 0.1)',
    accent: '#2563EB',
    danger: '#DC2626',
    warning: '#D97706',
    success: '#059669',
    capsuleBg: 'rgba(255, 255, 255, 0.9)',
    capsuleBorder: 'rgba(0, 0, 0, 0.08)',
    surface: '#FFFFFF',
  },
  sage: {
    background: '#1a1a1a',
    card: '#262626',
    cardSecondary: '#2f2f2f',
    border: '#3f3f3f',
    borderSubtle: '#333333',
    textPrimary: '#f3f4f6',
    textSecondary: '#a3a3a3',
    textMuted: '#737373',
    primary: '#4a7c59', // Htz Verde Sage
    primaryLight: 'rgba(74, 124, 89, 0.2)',
    accent: '#3d6470',
    danger: '#ffb4ab',
    warning: '#e5a93d',
    success: '#4a7c59',
    capsuleBg: 'rgba(47, 47, 47, 0.85)',
    capsuleBorder: 'rgba(255, 255, 255, 0.08)',
    surface: '#2f2f2f',
  },
};
