import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useCourseForm } from '../hooks/useCourseForm';
import { WeekDay } from '../../../types/enums';
import { Course } from '../../../types/course';
import GlassSurface from '../../shared/components/GlassSurface';
import ColorPicker from '../../shared/components/ColorPicker';
import DaySelector from '../../shared/components/DaySelector';
import AnimatedPressable from '../../shared/components/AnimatedPressable';
import WeekSelector from '../../shared/components/WeekSelector';
import { courseCategoryDefaults } from '../../../theme/palette';
import { CATEGORY_LABELS } from '../../../core/constants/defaults';
import { PERIOD_START_TIMES } from '../../../core/constants/layout';
import { formatTime } from '../../../core/utils/timeUtils';
import { periodToTime, periodToEndTime, TOTAL_PERIODS } from '../../../core/services/tsvParserService';
import { useThemeColors } from '../../../theme/useThemeColors';

/** Convert "HH:mm" time string to period number (1-12) */
function timeToPeriodNumber(time: string): number {
  const [h, m] = time.split(':').map(Number);
  const totalMin = h * 60 + m;
  let bestPeriod = 1;
  for (let i = 0; i < PERIOD_START_TIMES.length; i++) {
    const [ph, pm] = PERIOD_START_TIMES[i];
    if (totalMin >= ph * 60 + pm) {
      bestPeriod = i + 1;
    } else {
      break;
    }
  }
  return bestPeriod;
}

interface CourseFormProps {
  existingCourse?: Course;
  prefillDay?: WeekDay;
  prefillStartTime?: string;
  startEditing?: boolean;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export default function CourseForm({
  existingCourse,
  prefillDay,
  prefillStartTime,
  startEditing = false,
  onSave,
  onCancel,
  onDelete,
}: CourseFormProps) {
  const {
    name, setName,
    instructor, setInstructor,
    location, setLocation,
    color, setColor,
    category, setCategory,
    weekday, setWeekday,
    startTime, setStartTime,
    endTime, setEndTime,
    notes, setNotes,
    weeks, setWeeks,
    errors,
    conflictIds,
    isEdit,
    checkConflicts,
    save,
    getFieldError,
  } = useCourseForm({ existingCourse, prefillDay, prefillStartTime });

  const theme = useThemeColors();

  // View mode: when editing an existing course, start in read-only mode
  const [isEditing, setIsEditing] = useState(startEditing);
  const isViewMode = isEdit && !isEditing;

  const handleSave = () => {
    const result = save();
    if (result) {
      onSave();
    }
  };

  const hasConflicts = conflictIds.length > 0;
  const nameError = getFieldError('name');
  const timeError = getFieldError('startTime') || getFieldError('endTime');
  const dayError = getFieldError('weekday');

  const currentStartPeriod = timeToPeriodNumber(startTime);
  const currentEndPeriod = timeToPeriodNumber(endTime);

  const adjustStartTime = (delta: number) => {
    const newPeriod = currentStartPeriod + delta;
    if (newPeriod >= 1 && newPeriod <= TOTAL_PERIODS) {
      setStartTime(periodToTime(newPeriod));
    }
  };

  const adjustEndTime = (delta: number) => {
    const newPeriod = currentEndPeriod + delta;
    if (newPeriod >= 1 && newPeriod <= TOTAL_PERIODS) {
      setEndTime(periodToEndTime(newPeriod));
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <GlassSurface variant="elevated" padding>
        <Text style={[styles.label, { color: theme.textSecondary }]}>课程名称 *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.fgRgba04, borderColor: theme.border, color: theme.textPrimary }, nameError && styles.inputError]}
          value={name}
          onChangeText={setName}
          placeholder="例如：高等数学"
          placeholderTextColor={theme.textTertiary}
          editable={!isViewMode}
        />
        {nameError && <Text style={styles.errorText}>{nameError}</Text>}

        <Text style={[styles.label, { color: theme.textSecondary }]}>授课教师</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.fgRgba04, borderColor: theme.border, color: theme.textPrimary }]}
          value={instructor}
          onChangeText={setInstructor}
          placeholder="例如：张教授"
          placeholderTextColor={theme.textTertiary}
          editable={!isViewMode}
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>上课地点</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.fgRgba04, borderColor: theme.border, color: theme.textPrimary }]}
          value={location}
          onChangeText={setLocation}
          placeholder="例如：教学楼 201"
          placeholderTextColor={theme.textTertiary}
          editable={!isViewMode}
        />
      </GlassSurface>

      <View style={styles.spacer} />

      <GlassSurface variant="elevated" padding>
        <Text style={[styles.label, { color: theme.textSecondary }]}>星期 *</Text>
        <DaySelector selectedDay={weekday} onSelect={setWeekday} disabled={isViewMode} showWeekends />
        {dayError && <Text style={styles.errorText}>{dayError}</Text>}

        <Text style={[styles.label, { color: theme.textSecondary, marginTop: 16 }]}>时间</Text>
        {timeError && <Text style={styles.errorText}>{timeError}</Text>}

        <View style={styles.timeRow}>
          {/* Start time */}
          <View style={styles.timeColumn}>
            <Text style={[styles.subLabel, { color: theme.textTertiary }]}>第{currentStartPeriod}节起</Text>
            <View style={styles.timeAdjustRow}>
              {!isViewMode && (
                <AnimatedPressable style={[styles.timeAdjustBtn, { backgroundColor: theme.fgRgba04, borderColor: theme.border }]} onPress={() => adjustStartTime(-1)}>
                  <Text style={[styles.timeAdjustText, { color: theme.accent }]}>−</Text>
                </AnimatedPressable>
              )}
              <View style={[styles.timeDisplay, { backgroundColor: theme.accentBg, borderColor: `${theme.accent}40` }]}>
                <Text style={[styles.timeText, { color: theme.textPrimary }]}>{formatTime(startTime)}</Text>
              </View>
              {!isViewMode && (
                <AnimatedPressable style={[styles.timeAdjustBtn, { backgroundColor: theme.fgRgba04, borderColor: theme.border }]} onPress={() => adjustStartTime(1)}>
                  <Text style={[styles.timeAdjustText, { color: theme.accent }]}>+</Text>
                </AnimatedPressable>
              )}
            </View>
          </View>

          <Text style={[styles.timeSeparator, { color: theme.textTertiary }]}>—</Text>

          {/* End time */}
          <View style={styles.timeColumn}>
            <Text style={[styles.subLabel, { color: theme.textTertiary }]}>第{currentEndPeriod}节止</Text>
            <View style={styles.timeAdjustRow}>
              {!isViewMode && (
                <AnimatedPressable style={[styles.timeAdjustBtn, { backgroundColor: theme.fgRgba04, borderColor: theme.border }]} onPress={() => adjustEndTime(-1)}>
                  <Text style={[styles.timeAdjustText, { color: theme.accent }]}>−</Text>
                </AnimatedPressable>
              )}
              <View style={[styles.timeDisplay, { backgroundColor: theme.accentBg, borderColor: `${theme.accent}40` }]}>
                <Text style={[styles.timeText, { color: theme.textPrimary }]}>{formatTime(endTime)}</Text>
              </View>
              {!isViewMode && (
                <AnimatedPressable style={[styles.timeAdjustBtn, { backgroundColor: theme.fgRgba04, borderColor: theme.border }]} onPress={() => adjustEndTime(1)}>
                  <Text style={[styles.timeAdjustText, { color: theme.accent }]}>+</Text>
                </AnimatedPressable>
              )}
            </View>
          </View>
        </View>
      </GlassSurface>

      <View style={styles.spacer} />

      <GlassSurface variant="elevated" padding>
        <Text style={[styles.label, { color: theme.textSecondary }]}>上课周次</Text>
        <WeekSelector weeks={weeks} onChange={setWeeks} disabled={isViewMode} />

        <Text style={[styles.label, { color: theme.textSecondary, marginTop: 16 }]}>颜色</Text>
        <ColorPicker selectedColor={color} onSelect={setColor} disabled={isViewMode} />

        <Text style={[styles.label, { color: theme.textSecondary, marginTop: 16 }]}>分类</Text>
        <View style={styles.categoryRow}>
          <TextInput
            style={[styles.input, styles.categoryInput, { backgroundColor: theme.fgRgba04, borderColor: theme.border, color: theme.textPrimary }]}
            value={category}
            onChangeText={setCategory}
            placeholder="讲座"
            placeholderTextColor={theme.textTertiary}
            editable={!isViewMode}
          />
        </View>
        {!isViewMode && (
        <View style={styles.categorySuggestions}>
          {courseCategoryDefaults.map((cat) => (
            <AnimatedPressable
              key={cat}
              style={[styles.categoryChip, { backgroundColor: theme.fgRgba04, borderColor: theme.border }]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.categoryChipText, { color: cat === category ? theme.accent : theme.textSecondary }]}>
                {CATEGORY_LABELS[cat] || cat}
              </Text>
            </AnimatedPressable>
          ))}
        </View>
        )}

        <Text style={[styles.label, { color: theme.textSecondary, marginTop: 16 }]}>备注</Text>
        <TextInput
          style={[styles.input, styles.notesInput, { backgroundColor: theme.fgRgba04, borderColor: theme.border, color: theme.textPrimary }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="可选备注..."
          placeholderTextColor={theme.textTertiary}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          editable={!isViewMode}
        />
      </GlassSurface>

      {hasConflicts && (
        <View style={styles.conflictBanner}>
          <Text style={styles.conflictIcon}>⚠</Text>
          <Text style={styles.conflictText}>
            与 {conflictIds.length} 门课程时间冲突
          </Text>
        </View>
      )}

      <View style={styles.spacer} />

      <GlassSurface variant="elevated" padding>
        {isViewMode ? (
          <AnimatedPressable style={[styles.saveButton, { backgroundColor: theme.accent }]} onPress={() => setIsEditing(true)}>
            <Text style={styles.saveButtonText}>修改课程</Text>
          </AnimatedPressable>
        ) : (
          <>
            <AnimatedPressable style={[styles.saveButton, { backgroundColor: theme.accent }]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {isEdit ? '保存修改' : '添加课程'}
              </Text>
            </AnimatedPressable>
          </>
        )}

        {isEdit && !isViewMode && onDelete && (
          <AnimatedPressable style={styles.deleteButton} onPress={onDelete}>
            <Text style={styles.deleteButtonText}>删除课程</Text>
          </AnimatedPressable>
        )}
      </GlassSurface>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  spacer: {
    height: 14,
  },
  label: {
    color: '#B0B0B0',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 6,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  subLabel: {
    color: '#707070',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 13 : 11,
    color: '#F5F5F5',
    fontSize: 15,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  notesInput: {
    minHeight: 80,
    paddingTop: 14,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  timeColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timeSeparator: {
    fontSize: 14,
    marginTop: 28,
    fontWeight: '300',
    paddingHorizontal: 2,
  },
  timeAdjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  timeAdjustBtn: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
  },
  timeAdjustText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeDisplay: {
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  time24Text: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryInput: {
    flex: 1,
  },
  categorySuggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  categoryChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  conflictBanner: {
    marginTop: 12,
    backgroundColor: 'rgba(232, 168, 56, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(232, 168, 56, 0.2)',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conflictIcon: {
    fontSize: 18,
  },
  conflictText: {
    color: '#E8A838',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#4A90D9',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#4A90D9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  deleteButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.2)',
  },
  deleteButtonText: {
    color: '#E74C3C',
    fontSize: 16,
    fontWeight: '600',
  },
});
