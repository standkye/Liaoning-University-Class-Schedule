import { ViewStyle } from 'react-native';
import { darkPalette } from './palette';
import { borderRadius } from './spacing';
import { shadows } from './shadows';

export const glassSurface: ViewStyle = {
  backgroundColor: darkPalette.glassBg,
  borderRadius: borderRadius.glass,
  borderWidth: 1,
  borderColor: darkPalette.glassBorder,
};

export const glassElevated: ViewStyle = {
  ...glassSurface,
  backgroundColor: darkPalette.glassElevated,
  borderColor: 'rgba(255, 255, 255, 0.12)',
};

export const glassWithShadow: ViewStyle = {
  ...glassSurface,
  ...shadows.glass,
};

export const glassElevatedWithShadow: ViewStyle = {
  ...glassElevated,
  ...shadows.glass,
};
