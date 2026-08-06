import { useMemo } from 'react';
import { startOfWeek, addWeeks, differenceInWeeks } from 'date-fns';
import { useUIStore } from '../../../stores/useUIStore';
import { useSettingsStore } from '../../../stores/useSettingsStore';
import { WeekDay } from '../../../types/enums';

const MONTHS_ZH = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export function useCurrentWeek() {
  const { activeWeekOffset, setWeekOffset } = useUIStore();
  const { firstDayOfWeek, semesterStartDate } = useSettingsStore();

  const currentDate = new Date();
  const weekStart = useMemo(() => {
    const base = startOfWeek(currentDate, { weekStartsOn: firstDayOfWeek === WeekDay.SUNDAY ? 0 : 1 });
    return addWeeks(base, activeWeekOffset);
  }, [currentDate, activeWeekOffset, firstDayOfWeek]);

  // Calculate semester week from the semester start date + week offset
  const weekNumber = useMemo(() => {
    if (!semesterStartDate) return 1;
    const semStart = new Date(semesterStartDate);
    if (isNaN(semStart.getTime())) return 1;
    const baseWeek = startOfWeek(currentDate, { weekStartsOn: firstDayOfWeek === WeekDay.SUNDAY ? 0 : 1 });
    const semStartWeek = startOfWeek(semStart, { weekStartsOn: firstDayOfWeek === WeekDay.SUNDAY ? 0 : 1 });
    const weekDiff = differenceInWeeks(baseWeek, semStartWeek);
    return weekDiff + activeWeekOffset + 1;
  }, [semesterStartDate, activeWeekOffset, firstDayOfWeek, currentDate]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      return date;
    });
  }, [weekStart]);

  const fullDateLabel = `${weekStart.getFullYear()}年${MONTHS_ZH[weekStart.getMonth()]}${weekStart.getDate()}日`;
  const weekLabel = `第${weekNumber}周`;
  const monthLabel = MONTHS_ZH[weekStart.getMonth()];

  const goToNextWeek = () => setWeekOffset(activeWeekOffset + 1);
  const goToPrevWeek = () => setWeekOffset(activeWeekOffset - 1);
  const goToCurrentWeek = () => setWeekOffset(0);

  return {
    weekStart,
    weekNumber,
    days,
    weekLabel,
    fullDateLabel,
    monthLabel,
    activeWeekOffset,
    goToNextWeek,
    goToPrevWeek,
    goToCurrentWeek,
  };
}
