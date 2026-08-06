import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '../../../types/course';
import { DAY_LABELS_FULL } from '../../../core/constants/defaults';
import { formatTime, formatWeeksLabel } from '../../../core/utils/timeUtils';
import CategoryTag from '../../shared/components/CategoryTag';
import AnimatedPressable from '../../shared/components/AnimatedPressable';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ThemeColors } from '../../../theme/themes';

interface CourseCardProps {
  course: Course;
  allSlots: Course[];
  onPress: (courseId: string) => void;
  hasConflict: boolean;
  index?: number;
  theme: ThemeColors;
}

export default function CourseCard({ course, allSlots, onPress, hasConflict, index = 0, theme }: CourseCardProps) {
  const subtitle = [course.courseType, course.examType].filter(Boolean).join(' · ');

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify().damping(15)}>
      <AnimatedPressable
        style={[styles.container, { backgroundColor: theme.fgRgba04, borderColor: theme.border }, hasConflict && { borderColor: 'rgba(232,168,56,0.3)', backgroundColor: 'rgba(232,168,56,0.04)' }]}
        onPress={() => onPress(course.id)}
      >
        <View style={[styles.accentBar, { backgroundColor: course.color }]} />
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={[styles.name, { color: theme.textPrimary }]}>{course.name}</Text>
            {hasConflict && <Ionicons name="warning" size={15} color="#E8A838" />}
          </View>
          <View style={styles.metaRow}>
            {course.courseCode ? <Text style={[styles.code, { color: theme.textTertiary }]}>{course.courseCode}</Text> : null}
            {course.credits > 0 ? <Text style={styles.credits}>{course.credits}学分</Text> : null}
            {subtitle ? <Text style={[styles.type, { color: theme.textTertiary }]}>{subtitle}</Text> : null}
          </View>
          <View style={[styles.slotsBox, { backgroundColor: theme.fgRgba02 }]}>
            {allSlots.map((slot) => (
              <View key={slot.id} style={styles.slotRow}>
                <View style={[styles.slotDot, { backgroundColor: course.color }]} />
                <Text style={[styles.slotTime, { color: theme.textSecondary }]}>
                  {DAY_LABELS_FULL[slot.weekday]} {formatTime(slot.startTime)}-{formatTime(slot.endTime)}
                </Text>
                {slot.location ? <Text style={[styles.slotLoc, { color: theme.textTertiary }]} numberOfLines={2}>{slot.location}</Text> : null}
                <Text style={[styles.slotWeeks, { color: theme.textTertiary }]}>{formatWeeksLabel(slot.weeks)}</Text>
              </View>
            ))}
          </View>
          <View style={styles.tagRow}>
            <CategoryTag category={course.category} color={course.color} />
            {course.instructor ? <Text style={[styles.instructor, { color: theme.textTertiary }]}>{course.instructor}</Text> : null}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={15} color={theme.textTertiary} style={styles.chevron} />
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, marginHorizontal: 16, marginVertical: 5, overflow: 'hidden', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 }, android: { elevation: 2 } }) },
  accentBar: { width: 3, marginVertical: 12, marginLeft: 12, borderRadius: 2 },
  content: { flex: 1, padding: 14, gap: 5 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 15, fontWeight: '700', flex: 1, letterSpacing: 0.2, flexShrink: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  code: { fontSize: 11, fontWeight: '500' },
  credits: { color: '#E8A838', fontSize: 11, fontWeight: '600' },
  type: { fontSize: 11 },
  slotsBox: { borderRadius: 10, padding: 10, gap: 5 },
  slotRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  slotDot: { width: 5, height: 5, borderRadius: 3, marginTop: 5 },
  slotTime: { fontSize: 12, fontWeight: '600' },
  slotLoc: { fontSize: 11, flex: 1, lineHeight: 15, flexShrink: 1 },
  slotWeeks: { fontSize: 10, fontWeight: '500' },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  instructor: { fontSize: 12 },
  chevron: { alignSelf: 'center', marginRight: 8 },
});
