import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCourseStore } from '../../../stores/useCourseStore';
import { WeekDay } from '../../../types/enums';
import { DAY_LABELS_FULL } from '../../../core/constants/defaults';
import { formatTime, timeToMinutes, formatWeeksLabel } from '../../../core/utils/timeUtils';
import { Course } from '../../../types/course';
import AnimatedPressable from '../../shared/components/AnimatedPressable';
import EmptyState from '../../shared/components/EmptyState';
import CategoryTag from '../../shared/components/CategoryTag';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useThemeColors } from '../../../theme/useThemeColors';
import { useCurrentWeek } from '../../timetable/hooks/useCurrentWeek';

function getTodayWeekday(): WeekDay {
  const day = new Date().getDay();
  return day === 0 ? WeekDay.SUNDAY : (day as WeekDay);
}

type TimeSection = '上午' | '下午' | '晚上';
function getTimeSection(time: string): TimeSection {
  const h = parseInt(time.split(':')[0], 10);
  if (h < 12) return '上午';
  if (h < 18) return '下午';
  return '晚上';
}

const SECTION_CONFIG: Record<TimeSection, { color: string; icon: string }> = {
  '上午': { color: '#FFB347', icon: '☀️' },
  '下午': { color: '#FF7F50', icon: '🌤' },
  '晚上': { color: '#7B9EBD', icon: '🌙' },
};

interface CardProps { course: Course; index: number; theme: ReturnType<typeof useThemeColors>; }

function ScheduleCourseCard({ course, index, theme }: CardProps) {
  const timeString = `${formatTime(course.startTime)} - ${formatTime(course.endTime)}`;
  const weeksLabel = formatWeeksLabel(course.weeks);
  const subtitle = [course.courseType, course.examType].filter(Boolean).join(' · ');

  const isNow = useMemo(() => {
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const startMin = timeToMinutes(course.startTime);
    const endMin = timeToMinutes(course.endTime);
    return currentMin >= startMin && currentMin <= endMin;
  }, [course.startTime, course.endTime]);

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify().damping(15)}>
      <AnimatedPressable style={[s2.container, { backgroundColor: theme.bgCard, borderColor: theme.border }, isNow && s2.activeContainer]}>
        <View style={[s2.colorBar, { backgroundColor: course.color }]} />
        <View style={s2.content}>
          <View style={s2.topRow}>
            <Text style={[s2.name, { color: theme.textPrimary }]}>{course.name}</Text>
            <View style={[s2.timePill, { backgroundColor: theme.fgRgba06 }, isNow && { backgroundColor: `${theme.accent}30` }]}>
              <Text style={[s2.timeText, { color: isNow ? theme.accent : theme.textSecondary }]}>{timeString}</Text>
            </View>
          </View>
          <View style={s2.metaRow}>
            {course.courseCode ? <Text style={[s2.code, { color: theme.textTertiary }]}>{course.courseCode}</Text> : null}
            {course.credits > 0 ? <Text style={s2.credits}>{course.credits}学分</Text> : null}
            {subtitle ? <Text style={s2.type}>{subtitle}</Text> : null}
            {isNow && <View style={s2.liveBadge}><Text style={s2.liveText}>进行中</Text></View>}
          </View>
          {course.location ? <Text style={[s2.location, { color: theme.textSecondary }]}>{course.location}</Text> : null}
          <View style={s2.bottomRow}>
            <CategoryTag category={course.category} color={course.color} />
            {course.instructor ? <Text style={[s2.instructor, { color: theme.textTertiary }]}>{course.instructor}</Text> : null}
            <Text style={[s2.weeks, { color: theme.textTertiary }]}>{weeksLabel}</Text>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const { courses } = useCourseStore();
  const { weekNumber } = useCurrentWeek();
  const todayWeekday = getTodayWeekday();
  const todayLabel = DAY_LABELS_FULL[todayWeekday];

  const todayCourses = useMemo(() => {
    return courses
      .filter(c => {
        if (c.weekday !== todayWeekday) return false;
        // Filter by semester week: show if weeks is empty (every week) or includes current week
        if (c.weeks.length > 0 && !c.weeks.includes(weekNumber)) return false;
        return true;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [courses, todayWeekday, weekNumber]);

  // Stats
  const stats = useMemo(() => {
    const allSlots = courses.filter(c => c.weeks.length === 0 || c.weeks.includes(weekNumber));
    const uniqueCodes = new Set(allSlots.map(c => c.courseCode));
    const creditMap = new Map<string, number>();
    allSlots.forEach(c => creditMap.set(c.courseCode, c.credits));
    const totalCredits = Array.from(creditMap.values()).reduce((s, v) => s + v, 0);
    const totalSlots = allSlots.length;
    const cats: Record<string, number> = {};
    allSlots.forEach(c => { cats[c.category] = (cats[c.category] || 0) + 1; });
    const topEntry = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
    const topCat = topEntry?.[0] ?? '-';
    return { courseCount: uniqueCodes.size, totalCredits, totalSlots, topCat };
  }, [courses, weekNumber]);

  const grouped = useMemo(() => {
    const groups: Record<TimeSection, Course[]> = { '上午': [], '下午': [], '晚上': [] };
    for (const c of todayCourses) groups[getTimeSection(c.startTime)].push(c);
    return Object.entries(groups).filter(([_, courses]) => courses.length > 0) as [TimeSection, Course[]][];
  }, [todayCourses]);

  const now = new Date();
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

  return (
    <View style={[{ flex: 1, backgroundColor: theme.bgPrimary, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: theme.headerBorder }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>今日日程</Text>
          <Text style={[styles.headerDate, { color: theme.textTertiary }]}>{dateStr} · {todayLabel}</Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: theme.accentBg, borderColor: `${theme.accent}30` }]}>
          <Text style={[styles.countText, { color: theme.accent }]}>{todayCourses.length}门课</Text>
        </View>
      </View>

      {/* Stats bar */}
      <View style={[st2.statsBar, { backgroundColor: theme.fgRgba04, borderColor: theme.border }]}>
        <View style={st2.statItem}>
          <Text style={[st2.statNum, { color: theme.accent }]}>{stats.courseCount}</Text>
          <Text style={[st2.statLabel, { color: theme.textTertiary }]}>门课程</Text>
        </View>
        <View style={[st2.statDiv, { backgroundColor: theme.divider }]} />
        <View style={st2.statItem}>
          <Text style={[st2.statNum, { color: theme.accent }]}>{stats.totalCredits}</Text>
          <Text style={[st2.statLabel, { color: theme.textTertiary }]}>总学分</Text>
        </View>
        <View style={[st2.statDiv, { backgroundColor: theme.divider }]} />
        <View style={st2.statItem}>
          <Text style={[st2.statNum, { color: theme.accent }]}>{stats.totalSlots}</Text>
          <Text style={[st2.statLabel, { color: theme.textTertiary }]}>节课/周</Text>
        </View>
        <View style={[st2.statDiv, { backgroundColor: theme.divider }]} />
        <View style={st2.statItem}>
          <Text style={[st2.statNum, { color: theme.accent }]} numberOfLines={1} ellipsizeMode="tail">{stats.topCat}</Text>
          <Text style={[st2.statLabel, { color: theme.textTertiary }]}>最多</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scrollContent, todayCourses.length === 0 && { flex: 1 }]} showsVerticalScrollIndicator={false}>
        {todayCourses.length === 0 ? (
          <EmptyState icon="sunny-outline" title="今天没有课程" subtitle={`${todayLabel}没有排课，享受轻松的一天 ✨`} />
        ) : (
          grouped.map(([section, sectionCourses], groupIdx) => {
            const config = SECTION_CONFIG[section];
            const globalIdx = grouped.slice(0, groupIdx).reduce((sum, g) => sum + g[1].length, 0);
            return (
              <View key={section} style={{ marginBottom: 20 }}>
                <Animated.View entering={FadeIn.delay(100)} style={[styles.sectionHeader, { paddingHorizontal: 4, marginBottom: 10 }]}>
                  <View style={[s2.sectionDot, { backgroundColor: config.color }]} />
                  <Text style={[s2.sectionLabel, { color: config.color, flex: 1 }]}>{config.icon} {section}</Text>
                  <Text style={{ color: theme.textTertiary, fontSize: 11, fontWeight: '500' }}>{sectionCourses.length}节</Text>
                </Animated.View>
                {sectionCourses.map((course, idx) => (
                  <ScheduleCourseCard key={course.id} course={course} index={globalIdx + idx} theme={theme} />
                ))}
              </View>
            );
          })
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 26, fontWeight: '700', letterSpacing: 0.3 },
  headerDate: { fontSize: 13, fontWeight: '500', marginTop: 4 },
  countBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  countText: { fontSize: 12, fontWeight: '600' },
  scrollContent: { paddingTop: 12, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});

const st2 = StyleSheet.create({
  statsBar: { flexDirection: 'row', marginHorizontal: 16, marginTop: 12, borderRadius: 14, borderWidth: 1, paddingVertical: 12, paddingHorizontal: 4 },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statNum: { fontSize: 17, fontWeight: '700' },
  statLabel: { fontSize: 10, fontWeight: '600' },
  statDiv: { width: 1, alignSelf: 'stretch' },
});

const s2 = StyleSheet.create({
  container: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, marginBottom: 8, overflow: 'hidden', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 }, android: { elevation: 2 } }) },
  activeContainer: { borderColor: 'rgba(74,144,217,0.3)', backgroundColor: 'rgba(74,144,217,0.06)' },
  colorBar: { width: 4, marginVertical: 14, marginLeft: 14, borderRadius: 2 },
  content: { flex: 1, padding: 14, gap: 4 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 10, letterSpacing: 0.2, flexShrink: 1 },
  timePill: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  timeText: { fontSize: 12, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  code: { fontSize: 11, fontWeight: '500' },
  credits: { color: '#E8A838', fontSize: 11, fontWeight: '600' },
  type: { color: '#808080', fontSize: 11 },
  liveBadge: { backgroundColor: 'rgba(80,200,120,0.15)', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1 },
  liveText: { color: '#50C878', fontSize: 10, fontWeight: '700' },
  location: { fontSize: 12, flexShrink: 1 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  instructor: { fontSize: 12 },
  weeks: { fontSize: 11 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionLabel: { fontSize: 14, fontWeight: '700' },
});
