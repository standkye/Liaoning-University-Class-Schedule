export const darkPalette = {
  bgPrimary: '#0A0A0A',
  bgSecondary: '#141414',
  bgTertiary: '#1C1C1E',
  glassBg: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassElevated: 'rgba(255, 255, 255, 0.08)',
  textPrimary: '#F5F5F5',
  textSecondary: '#A0A0A0',
  textTertiary: '#606060',
  accent: '#4A90D9',
  accentSecondary: '#9B59B6',
  accentLight: '#6DB3F0',
  success: '#50C878',
  error: '#E74C3C',
  warning: '#E8A838',
  gridLine: 'rgba(255, 255, 255, 0.04)',
} as const;

export const lightPalette = {
  bgPrimary: '#F8F9FA',
  bgSecondary: '#FFFFFF',
  bgTertiary: '#F0F0F2',
  glassBg: 'rgba(255, 255, 255, 0.70)',
  glassBorder: 'rgba(0, 0, 0, 0.06)',
  glassElevated: 'rgba(255, 255, 255, 0.85)',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textTertiary: '#A0A0A0',
  accent: '#4A90D9',
  accentSecondary: '#9B59B6',
  accentLight: '#6DB3F0',
  success: '#50C878',
  error: '#E74C3C',
  warning: '#E8A838',
  gridLine: 'rgba(0, 0, 0, 0.06)',
} as const;

export type Palette = typeof darkPalette;

export const courseColorPresets = [
  '#4A90D9', // Blue
  '#50C878', // Emerald
  '#E8A838', // Amber
  '#9B59B6', // Purple
  '#E74C3C', // Coral
  '#1ABC9C', // Teal
  '#F39C12', // Orange
  '#3498DB', // Sky
  '#E91E63', // Rose
  '#2ECC71', // Green
  '#8E44AD', // Violet
  '#7F8C8D', // Slate
] as const;

export const courseCategoryDefaults = [
  'Lecture',
  'Lab',
  'Tutorial',
  'Seminar',
  'Workshop',
  'Exam',
] as const;
