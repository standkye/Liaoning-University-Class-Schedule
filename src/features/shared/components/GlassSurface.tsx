import React from 'react';
import { View, ViewStyle, StyleSheet, Platform } from 'react-native';
import { useThemeColors } from '../../../theme/useThemeColors';

interface GlassSurfaceProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'surface' | 'elevated' | 'premium';
  padding?: boolean;
  noBorder?: boolean;
}

export default function GlassSurface({
  children,
  style,
  variant = 'surface',
  padding = false,
  noBorder = false,
}: GlassSurfaceProps) {
  const theme = useThemeColors();

  const variantStyles = {
    surface: { backgroundColor: theme.fgRgba04 },
    elevated: { backgroundColor: theme.fgRgba06, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8 }, android: { elevation: 3 } }) },
    premium: { backgroundColor: theme.fgRgba08, borderWidth: 1, borderColor: theme.border, ...Platform.select({ ios: { shadowColor: theme.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16 }, android: { elevation: 6 } }) },
  };

  return (
    <View style={[styles.base, variantStyles[variant], !noBorder && { borderWidth: 1, borderColor: theme.border }, padding && styles.padded, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 18, overflow: 'hidden' },
  padded: { padding: 18 },
});
