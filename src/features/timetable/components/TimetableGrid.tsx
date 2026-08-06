import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTimetableLayout } from '../hooks/useTimetableLayout';
import { useCurrentWeek } from '../hooks/useCurrentWeek';
import TimeColumn from './TimeColumn';
import DayHeader from './DayHeader';
import CourseBlock from './CourseBlock';
import { TIME_COLUMN_WIDTH, TOTAL_PERIODS_CONST, DAY_HEADER_HEIGHT, SECTION_CONFIG } from '../../../core/constants/layout';
import { useSettingsStore } from '../../../stores/useSettingsStore';
import { periodToTime } from '../../../core/services/tsvParserService';
import { useThemeColors } from '../../../theme/useThemeColors';

interface TimetableGridProps {
  onCoursePress: (courseId: string) => void;
  onCourseLongPress: (courseId: string) => void;
  onEmptySlotPress: (day: number, startTime: string) => void;
}

function getPeriodBg(period: number): string {
  if (period <= 4) return period % 2 === 0 ? 'transparent' : 'rgba(255, 200, 100, 0.02)';
  if (period <= 8) return period % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)';
  return period % 2 === 0 ? 'transparent' : 'rgba(100, 180, 255, 0.02)';
}

export default function TimetableGrid({ onCoursePress, onCourseLongPress, onEmptySlotPress }: TimetableGridProps) {
  const theme = useThemeColors();
  const {
    periodHeight,
    columnWidth,
    gridWidth,
    gridHeight,
    visibleDays,
    coursesWithPosition,
  } = useTimetableLayout();

  const { showWeekends } = useSettingsStore();
  const { days, monthLabel } = useCurrentWeek();

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Build occupied positions — memoized
  const occupiedSlots = useMemo(() => {
    const slots = new Set<string>();
    for (const cwp of coursesWithPosition) {
      const startPeriod = Math.floor(cwp.gridPosition.top / periodHeight) + 1;
      const endPeriod = Math.ceil((cwp.gridPosition.top + cwp.gridPosition.height) / periodHeight);
      for (let p = startPeriod; p <= endPeriod; p++) {
        slots.add(`${cwp.weekday}-${p}`);
      }
    }
    return slots;
  }, [coursesWithPosition, periodHeight]);

  const handleSlotTap = useCallback((weekday: number, period: number) => {
    const slotKey = `${weekday}-${period + 1}`;
    if (selectedSlot === slotKey) {
      setSelectedSlot(null);
      const startTime = periodToTime(period + 1);
      onEmptySlotPress(weekday, startTime);
    } else {
      setSelectedSlot(slotKey);
    }
  }, [selectedSlot, onEmptySlotPress]);

  const today = new Date().getDay();
  const todayCol = today === 0 ? 6 : today - 1;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.verticalScroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Single view: no horizontal scroll, 7 days fill screen */}
        <View style={{ width: gridWidth }}>
          {/* Header */}
          <View style={[styles.headerRow, { height: DAY_HEADER_HEIGHT, borderBottomColor: theme.gridLineBold, marginTop: 4 }]}>
            <View style={[styles.monthCell, { width: TIME_COLUMN_WIDTH, height: DAY_HEADER_HEIGHT }]}>
              <Text style={[styles.monthText, { color: theme.textTertiary }]}>{monthLabel}</Text>
            </View>
            <DayHeader days={days} columnWidth={columnWidth} showWeekends={showWeekends} />
          </View>

          {/* Body */}
          <View style={styles.bodyRow}>
            <View style={{ width: TIME_COLUMN_WIDTH }}>
              <TimeColumn periodHeight={periodHeight} width={TIME_COLUMN_WIDTH} />
            </View>

            <View style={[styles.dayGrid, { width: visibleDays * columnWidth, height: gridHeight }]}>
              {/* Period row backgrounds */}
              {Array.from({ length: TOTAL_PERIODS_CONST }, (_, period) => (
                <View
                  key={`bg-${period}`}
                  style={{
                    position: 'absolute', top: period * periodHeight, left: 0,
                    width: '100%' as any, height: periodHeight,
                    backgroundColor: getPeriodBg(period + 1),
                  }}
                />
              ))}

              {/* Section dividers */}
              {SECTION_CONFIG.map(section => (
                <View
                  key={`sec-${section.period}`}
                  style={[styles.sectionDivider, { top: (section.period - 1) * periodHeight, width: '100%' as any, backgroundColor: theme.divider }]}
                />
              ))}

              {/* Period lines */}
              {Array.from({ length: TOTAL_PERIODS_CONST + 1 }, (_, i) => (
                <View
                  key={`h-${i}`}
                  style={[
                    styles.hLine, { top: i * periodHeight, backgroundColor: i % 2 === 0 ? theme.gridLineBold : theme.gridLine },
                    i % 2 === 0 && styles.bigPeriodLine,
                    (i === 4 || i === 8) && { backgroundColor: theme.gridLineBold },
                  ]}
                />
              ))}

              {/* Vertical dividers */}
              {Array.from({ length: visibleDays + 1 }, (_, i) => (
                <View key={`v-${i}`} style={[styles.vLine, { left: i * columnWidth, backgroundColor: theme.gridLine }]} />
              ))}

              {/* Today column highlight */}
              {todayCol < visibleDays && (
                <View
                  style={{
                    position: 'absolute', top: 0, left: todayCol * columnWidth,
                    width: columnWidth, height: '100%' as any,
                    backgroundColor: 'rgba(74, 144, 216, 0.04)',
                    borderLeftWidth: 0.5,
                    borderRightWidth: 0.5,
                    borderColor: 'rgba(74, 144, 216, 0.08)',
                  }}
                />
              )}

              {/* Empty slot zones */}
              {Array.from({ length: visibleDays }, (_, dayCol) => {
                const weekday = dayCol + 1;
                return Array.from({ length: TOTAL_PERIODS_CONST }, (_, period) => {
                  const slotKey = `${weekday}-${period + 1}`;
                  if (occupiedSlots.has(slotKey)) return null;
                  const isSelected = selectedSlot === slotKey;
                  return (
                    <Pressable
                      key={`empty-${slotKey}`}
                      style={({ pressed }) => ({
                        position: 'absolute',
                        top: period * periodHeight + 1, left: dayCol * columnWidth + 1,
                        width: columnWidth - 2, height: periodHeight - 2,
                        borderRadius: 4,
                        backgroundColor: isSelected
                          ? 'rgba(74, 144, 217, 0.10)'
                          : pressed
                          ? 'rgba(255, 255, 255, 0.04)'
                          : 'transparent',
                        borderWidth: isSelected ? 1 : 0,
                        borderColor: 'rgba(74, 144, 217, 0.25)',
                        justifyContent: 'center',
                        alignItems: 'center',
                      })}
                      onPress={() => handleSlotTap(weekday, period)}
                    >
                      {isSelected && (
                        <Ionicons name="add-circle" size={22} color="rgba(74, 144, 217, 0.6)" />
                      )}
                    </Pressable>
                  );
                });
              })}

              {/* Course blocks */}
              {coursesWithPosition.map((course, index) => (
                <CourseBlock
                  key={course.id}
                  course={course}
                  onPress={onCoursePress}
                  onLongPress={onCourseLongPress}
                  index={index}
                />
              ))}
            </View>
          </View>
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  verticalScroll: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  monthCell: { justifyContent: 'center', alignItems: 'center' },
  monthText: { color: '#707070', fontSize: 11, fontWeight: '500' },
  bodyRow: { flexDirection: 'row' },
  dayGrid: { position: 'relative' },
  hLine: {
    position: 'absolute', height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  bigPeriodLine: { height: 1 },
  sectionLine: { height: 1.5 },
  sectionDivider: { position: 'absolute', height: 2 },
  vLine: {
    position: 'absolute', width: StyleSheet.hairlineWidth,
    height: '100%',
  },
});
