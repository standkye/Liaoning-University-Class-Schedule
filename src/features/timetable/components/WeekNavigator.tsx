import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AnimatedPressable from '../../shared/components/AnimatedPressable';
import { useThemeColors } from '../../../theme/useThemeColors';

interface WeekNavigatorProps {
  weekLabel: string;
  fullDateLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  activeWeekOffset: number;
}

export default function WeekNavigator({ weekLabel, fullDateLabel, onPrev, onNext, onToday, activeWeekOffset }: WeekNavigatorProps) {
  const theme = useThemeColors();
  const isCurrentWeek = activeWeekOffset === 0;
  return (
    <View style={styles.container}>
      <AnimatedPressable onPress={onPrev} style={[styles.arrowBtn, { backgroundColor: theme.fgRgba04, borderColor: theme.border }]}>
        <Ionicons name="chevron-back" size={18} color={theme.textSecondary} />
      </AnimatedPressable>

      <AnimatedPressable onPress={onToday} style={styles.center}>
        <Text style={[styles.dateSub, { color: theme.textTertiary }]}>{fullDateLabel}</Text>
        <View style={styles.titleRow}>
          <Text style={[styles.weekTitle, { color: theme.textPrimary }]}>{weekLabel}</Text>
          {!isCurrentWeek && (
            <View style={[styles.backBadge, { backgroundColor: theme.accentBg }]}>
              <Text style={[styles.backBadgeText, { color: theme.accent }]}>回到本周</Text>
            </View>
          )}
        </View>
      </AnimatedPressable>

      <AnimatedPressable onPress={onNext} style={[styles.arrowBtn, { backgroundColor: theme.fgRgba04, borderColor: theme.border }]}>
        <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  arrowBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  dateSub: {
    color: '#606060',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  weekTitle: {
    color: '#F5F5F5',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  backBadge: {
    backgroundColor: 'rgba(74, 144, 217, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  backBadgeText: {
    color: '#4A90D9',
    fontSize: 10,
    fontWeight: '600',
  },
});
