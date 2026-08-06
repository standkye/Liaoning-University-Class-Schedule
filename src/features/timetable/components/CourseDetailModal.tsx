import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '../../../types/course';
import { DAY_LABELS_FULL } from '../../../core/constants/defaults';
import { formatTime } from '../../../core/utils/timeUtils';
import AnimatedPressable from '../../shared/components/AnimatedPressable';
import CategoryTag from '../../shared/components/CategoryTag';
import { useThemeColors } from '../../../theme/useThemeColors';

interface Props {
  visible: boolean;
  course: Course | null;
  allSlots: Course[];
  onClose: () => void;
  onEdit: (courseId: string) => void;
  onDelete: (courseId: string) => void;
}

function formatWeeksLabel(weeks: number[]): string {
  if (!weeks || weeks.length === 0) return '每周';
  if (weeks.length === 1) return `第${weeks[0]}周`;
  const allEven = weeks.every(w => w % 2 === 0);
  const allOdd = weeks.every(w => w % 2 === 1);
  if (allEven) return `${weeks[0]}-${weeks[weeks.length - 1]}周(双)`;
  if (allOdd) return `${weeks[0]}-${weeks[weeks.length - 1]}周(单)`;
  return `${weeks[0]}-${weeks[weeks.length - 1]}周`;
}

export default function CourseDetailModal({ visible, course, allSlots, onClose, onEdit, onDelete }: Props) {
  const theme = useThemeColors();
  const [showDelete, setShowDelete] = useState(false);

  if (!course) return null;

  const sortedSlots = [...allSlots].sort((a, b) => a.weekday - b.weekday || a.startTime.localeCompare(b.startTime));
  const subtitle = [course.courseType, course.examType].filter(Boolean).join(' · ');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Backdrop — tap to close */}
      <View style={styles.backdrop}>
        <View style={styles.touchBg} onTouchEnd={onClose} />

        {/* Glass card */}
        <View style={styles.cardWrap}>
          <BlurView intensity={60} tint={theme.isDark ? 'dark' : 'light'} style={styles.blur}>
            <View style={[styles.card, { backgroundColor: theme.isDark ? 'rgba(28,28,32,0.75)' : 'rgba(255,255,255,0.75)', borderColor: theme.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)' }]}>
              {/* Header */}
              <View style={[styles.header, { borderBottomColor: theme.divider }]}>
                <View style={[styles.colorDot, { backgroundColor: course.color }]} />
                <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={2}>{course.name}</Text>
                <View style={styles.closeWrap}>
                  <AnimatedPressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.fgRgba06 }]}>
                    <Ionicons name="close" size={18} color={theme.textSecondary} />
                  </AnimatedPressable>
                </View>
              </View>

              {/* Body */}
              <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                {/* Meta row */}
                <View style={styles.metaRow}>
                  {course.courseCode ? <Text style={[styles.code, { color: theme.textSecondary }]}>{course.courseCode}</Text> : null}
                  {course.credits > 0 ? <Text style={styles.credits}>{course.credits}学分</Text> : null}
                  {subtitle ? <Text style={[styles.metaText, { color: theme.textTertiary }]}>{subtitle}</Text> : null}
                </View>

                {/* Time slots */}
                <View style={[styles.section, { backgroundColor: theme.fgRgba04, borderColor: theme.border }]}>
                  <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>上课时间</Text>
                  {sortedSlots.map(s => (
                    <View key={s.id} style={styles.slotRow}>
                      <View style={[styles.slotDot2, { backgroundColor: course.color }]} />
                      <Text style={[styles.slotTime, { color: theme.textPrimary }]}>
                        {DAY_LABELS_FULL[s.weekday]} {formatTime(s.startTime)} - {formatTime(s.endTime)}
                      </Text>
                      {s.location ? (
                        <Text style={[styles.slotLoc, { color: theme.textSecondary }]} numberOfLines={2}>{s.location}</Text>
                      ) : null}
                      <Text style={[styles.slotWeeks, { color: theme.textTertiary }]}>{formatWeeksLabel(s.weeks)}</Text>
                    </View>
                  ))}
                </View>

                {/* Info */}
                <View style={[styles.section, { backgroundColor: theme.fgRgba04, borderColor: theme.border }]}>
                  {course.instructor ? (
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>教师</Text>
                      <Text style={[styles.infoValue, { color: theme.textPrimary }]}>{course.instructor}</Text>
                    </View>
                  ) : null}
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>分类</Text>
                    <CategoryTag category={course.category} color={course.color} />
                  </View>
                  {course.notes ? (
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>备注</Text>
                      <Text style={[styles.infoValue, { color: theme.textSecondary }]}>{course.notes}</Text>
                    </View>
                  ) : null}
                </View>
              </ScrollView>

              {/* Footer buttons */}
              <View style={[styles.footer, { borderTopColor: theme.divider }]}>
                <AnimatedPressable
                  style={[styles.editBtn, { backgroundColor: theme.accent }]}
                  onPress={() => onEdit(course.id)}
                >
                  <View style={styles.editBtnInner}>
                    <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.editText}>修改课程</Text>
                  </View>
                </AnimatedPressable>
                <AnimatedPressable
                  style={[styles.delBtn, { borderColor: theme.border }]}
                  onPress={() => setShowDelete(true)}
                >
                  <Ionicons name="trash-outline" size={17} color={theme.error} />
                  <Text style={[styles.delText, { color: theme.error }]}>删除</Text>
                </AnimatedPressable>
              </View>
            </View>
          </BlurView>
        </View>
      </View>

      {/* Delete confirm */}
      {showDelete && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setShowDelete(false)}>
          <View style={styles.backdrop}>
            <View style={styles.touchBg} onTouchEnd={() => setShowDelete(false)} />
            <View style={[styles.confirmCard, { backgroundColor: theme.bgPrimary, borderColor: theme.border }]}>
              <Text style={[styles.confirmTitle, { color: theme.textPrimary }]}>删除课程</Text>
              <Text style={[styles.confirmMsg, { color: theme.textSecondary }]}>确定删除「{course.name}」吗？此操作不可撤销。</Text>
              <View style={styles.confirmRow}>
                <AnimatedPressable style={[styles.confirmCancel, { backgroundColor: theme.fgRgba06 }]} onPress={() => setShowDelete(false)}>
                  <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>取消</Text>
                </AnimatedPressable>
                <AnimatedPressable style={styles.confirmDel} onPress={() => { setShowDelete(false); onDelete(course.id); }}>
                  <Text style={{ color: '#FFF', fontWeight: '600' }}>删除</Text>
                </AnimatedPressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)' },
  touchBg: { ...StyleSheet.absoluteFillObject as any },
  cardWrap: { width: '88%', maxWidth: 400, maxHeight: '78%', borderRadius: 24, overflow: 'hidden' },
  blur: { borderRadius: 24, overflow: 'hidden' },
  card: { borderWidth: 1, borderRadius: 24 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 18, paddingBottom: 12, borderBottomWidth: 1, gap: 10 },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  title: { flex: 1, fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
  closeWrap: {},
  closeBtn: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  body: { paddingHorizontal: 18, maxHeight: 340 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: 12, marginBottom: 6 },
  code: { fontSize: 12, fontWeight: '600' },
  credits: { color: '#E8A838', fontSize: 12, fontWeight: '600' },
  metaText: { fontSize: 12 },
  section: { borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 10, gap: 6 },
  sectionTitle: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  slotRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' },
  slotDot2: { width: 5, height: 5, borderRadius: 3, marginTop: 5 },
  slotTime: { fontSize: 13, fontWeight: '600' },
  slotLoc: { fontSize: 12, flex: 1, lineHeight: 16 },
  slotWeeks: { fontSize: 11, fontWeight: '500' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 2 },
  infoLabel: { fontSize: 12, fontWeight: '600', width: 36 },
  infoValue: { fontSize: 13, flex: 1 },
  footer: { padding: 16, gap: 10, borderTopWidth: 1, marginTop: 4 },
  editBtn: {
    borderRadius: 14, paddingVertical: 14,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 }, android: { elevation: 6 } }),
  },
  editBtnInner: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  editText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  delBtn: {
    borderRadius: 14, paddingVertical: 11, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6,
    borderWidth: 1.5, backgroundColor: 'transparent',
  },
  delText: { fontSize: 13, fontWeight: '600' },
  confirmCard: { width: '80%', maxWidth: 340, borderRadius: 20, borderWidth: 1, padding: 22 },
  confirmTitle: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  confirmMsg: { fontSize: 14, lineHeight: 20, marginBottom: 20 },
  confirmRow: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  confirmCancel: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  confirmDel: { backgroundColor: '#E74C3C', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
});
