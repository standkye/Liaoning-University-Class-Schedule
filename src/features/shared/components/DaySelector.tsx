import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AnimatedPressable from './AnimatedPressable';
import { WeekDay } from '../../../types/enums';
import { DAY_LABELS } from '../../../core/constants/defaults';

interface DaySelectorProps {
  selectedDay: WeekDay;
  onSelect: (day: WeekDay) => void;
  showWeekends?: boolean;
  disabled?: boolean;
}

const WEEKDAYS = [
  WeekDay.MONDAY,
  WeekDay.TUESDAY,
  WeekDay.WEDNESDAY,
  WeekDay.THURSDAY,
  WeekDay.FRIDAY,
];

const WEEKENDS = [WeekDay.SATURDAY, WeekDay.SUNDAY];

export default function DaySelector({ selectedDay, onSelect, showWeekends = false, disabled }: DaySelectorProps) {
  const days = showWeekends ? [...WEEKDAYS, ...WEEKENDS] : WEEKDAYS;

  return (
    <View style={styles.container}>
      {days.map((day) => {
        const isSelected = day === selectedDay;
        return (
          <AnimatedPressable
            key={day}
            onPress={disabled ? undefined : () => onSelect(day)}
            style={[styles.pill, isSelected && styles.selectedPill]}
          >
            <Text style={[styles.text, isSelected && styles.selectedText]}>
              {DAY_LABELS[day]}
            </Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  selectedPill: {
    backgroundColor: 'rgba(74, 144, 217, 0.2)',
    borderColor: 'rgba(74, 144, 217, 0.4)',
  },
  text: {
    color: '#A0A0A0',
    fontSize: 13,
    fontWeight: '500',
  },
  selectedText: {
    color: '#4A90D9',
  },
});
