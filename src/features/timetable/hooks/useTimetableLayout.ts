import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSettingsStore } from '../../../stores/useSettingsStore';
import { useCourseStore } from '../../../stores/useCourseStore';
import { useUIStore } from '../../../stores/useUIStore';
import { CourseWithPosition } from '../../../types/course';
import { MIN_COLUMN_WIDTH, TIME_COLUMN_WIDTH, TOTAL_PERIODS_CONST, PERIOD_START_TIMES } from '../../../core/constants/layout';
import { WeekDay } from '../../../types/enums';

function timeToPeriod(time: string): number {
  const [h, m] = time.split(':').map(Number);
  const totalMin = h * 60 + m;
  for (let i = PERIOD_START_TIMES.length - 1; i >= 0; i--) {
    const [ph, pm] = PERIOD_START_TIMES[i];
    if (totalMin >= ph * 60 + pm) return i + 1;
  }
  return 1;
}

/** Calculate current semester week number from semester start date and week offset */
function getSemesterWeek(semesterStartDate: string, activeWeekOffset: number): number | null {
  if (!semesterStartDate) return null;
  const start = new Date(semesterStartDate);
  if (isNaN(start.getTime())) return null;
  const now = new Date();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksSinceStart = Math.floor((now.getTime() - start.getTime()) / msPerWeek);
  return weeksSinceStart + activeWeekOffset + 1;
}

export function useTimetableLayout() {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const { showWeekends, semesterStartDate } = useSettingsStore();
  const { courses, getConflictsForCourse } = useCourseStore();
  const { activeWeekOffset } = useUIStore();

  const periodHeight = Math.max(40, (SCREEN_HEIGHT * 0.65) / 8);
  const visibleDays = showWeekends ? 7 : 5;
  const horizontalPadding = 0;

  const availableWidth = SCREEN_WIDTH - TIME_COLUMN_WIDTH - horizontalPadding * 2;
  const columnWidth = Math.max(MIN_COLUMN_WIDTH, availableWidth / visibleDays);
  const gridWidth = TIME_COLUMN_WIDTH + columnWidth * visibleDays;
  const gridHeight = TOTAL_PERIODS_CONST * periodHeight;

  const semesterWeek = getSemesterWeek(semesterStartDate, activeWeekOffset);

  const coursesWithPosition: CourseWithPosition[] = useMemo(() => {
    return courses
      .filter(c => {
        if (!showWeekends && (c.weekday === WeekDay.SATURDAY || c.weekday === WeekDay.SUNDAY)) {
          return false;
        }
        // Filter by semester week
        if (semesterWeek !== null && c.weeks.length > 0 && !c.weeks.includes(semesterWeek)) {
          return false;
        }
        return true;
      })
      .map(course => {
        const dayIndex = course.weekday - 1;
        const startPeriod = timeToPeriod(course.startTime);
        const endPeriod = timeToPeriod(course.endTime);
        const top = (startPeriod - 1) * periodHeight;
        const height = Math.max(20, (endPeriod - startPeriod + 1) * periodHeight - 2);
        const left = dayIndex * columnWidth;
        const conflicts = getConflictsForCourse(course);

        return {
          ...course,
          gridPosition: { top, left, width: columnWidth - 2, height },
          conflicts,
        };
      });
  }, [courses, showWeekends, semesterWeek, periodHeight, columnWidth, getConflictsForCourse]);

  return { periodHeight, columnWidth, gridWidth, gridHeight, visibleDays, horizontalPadding, coursesWithPosition };
}
