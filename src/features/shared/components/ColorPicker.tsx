import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AnimatedPressable from './AnimatedPressable';
import { courseColorPresets } from '../../../theme/palette';

interface ColorPickerProps {
  selectedColor: string;
  onSelect: (color: string) => void;
  disabled?: boolean;
}

export default function ColorPicker({ selectedColor, onSelect, disabled }: ColorPickerProps) {
  return (
    <View style={styles.grid}>
      {courseColorPresets.map((color) => {
        const isSelected = color === selectedColor;
        return (
          <AnimatedPressable
            key={color}
            onPress={disabled ? undefined : () => onSelect(color)}
            style={[
              styles.swatch,
              { backgroundColor: color },
              isSelected && styles.selectedSwatch,
            ]}
          >
            {isSelected && (
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            )}
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedSwatch: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});
