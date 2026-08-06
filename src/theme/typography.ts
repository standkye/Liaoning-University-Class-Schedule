import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  xs: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 16,
  },
  sm: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  base: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  lg: {
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
  },
  xl: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  '2xl': {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  '3xl': {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
} as const;
