import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, isToday } from 'date-fns';

interface DayHeaderProps {
  days: Date[];
  columnWidth: number;
  showWeekends: boolean;
}

const WEEKDAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export default function DayHeader({ days, columnWidth, showWeekends }: DayHeaderProps) {
  const visibleDays = showWeekends ? days : days.slice(0, 5);

  return (
    <View style={styles.container}>
      {visibleDays.map((date, i) => {
        const today = isToday(date);
        const dayOfWeek = date.getDay();
        const dayName = WEEKDAY_NAMES[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
        return (
          <View key={i} style={[styles.dayCell, { width: columnWidth }]}>
            {today ? (
              <View style={styles.todayPill}>
                <Text style={styles.todayName}>{dayName}</Text>
                <Text style={styles.todayDate}>{format(date, 'M/d')}</Text>
              </View>
            ) : (
              <>
                <Text style={styles.dayName}>{dayName}</Text>
                <Text style={styles.dateText}>{format(date, 'M/d')}</Text>
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  dayCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayName: {
    color: '#808080',
    fontSize: 11,
    fontWeight: '500',
  },
  dateText: {
    color: '#999',
    fontSize: 10,
    marginTop: 2,
  },
  todayPill: {
    backgroundColor: 'rgba(74, 144, 217, 0.18)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 217, 0.3)',
  },
  todayName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  todayDate: {
    color: '#4A90D9',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
});
