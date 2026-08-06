import React from 'react';
import { Text, StyleSheet, ViewStyle } from 'react-native';
import { hexToRgba } from '../../../core/utils/colorUtils';

interface CategoryTagProps {
  category: string;
  color: string;
  compact?: boolean;
  style?: ViewStyle;
}

export default function CategoryTag({ category, color, compact = false, style }: CategoryTagProps) {
  return (
    <Text
      style={[
        styles.tag,
        {
          backgroundColor: hexToRgba(color, 0.15),
          color: color,
        },
        compact && styles.compact,
        style,
      ]}
    >
      {category}
    </Text>
  );
}

const styles = StyleSheet.create({
  tag: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  compact: {
    fontSize: 9,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
